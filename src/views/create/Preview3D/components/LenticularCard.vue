<template>
  <div ref="containerRef" class="lenticular-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import * as THREE from "three";
import { createCompositeCardTexture } from "@/utils/cardCompositor";

const props = defineProps<{
  frames: string[];
  stickers?: any[];
  borderColor?: string;
  borderWidth?: string;
}>();

const containerRef = ref<HTMLDivElement | null>(null);
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let mesh: THREE.Mesh;
let animationId: number;
let mouse = { x: 0, y: 0 };

const vertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewDir; 
  varying vec3 vLightDir;
  varying vec3 vPosition;

  void main() {
    vUv = uv;
    
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vPosition = worldPosition.xyz;
    vNormal = normalize(mat3(modelMatrix) * normal);
    vViewDir = normalize(cameraPosition - worldPosition.xyz);
    
    vLightDir = normalize(vec3(0.5, 0.8, 1.0)); 

    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const fragmentShader = `
  uniform sampler2D uTexture0;
  uniform sampler2D uTexture1;
  uniform sampler2D uTexture2;
  
  uniform float uLenses;
  uniform float uRefraction;
  uniform float uPitch;
  uniform float uFocus;
  uniform float uGlossiness;
  uniform float uSpecularInt;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec3 vLightDir;

  void main() {
    // Lenticular effect for complete card (with borders and stickers already composited)
    float lensUvX = fract(vUv.x * uLenses); 
    float localX = (lensUvX - 0.5) * 2.0;
    float localZ = sqrt(1.0 - clamp(localX * localX, 0.0, 0.99));
    
    vec3 lensNormalLocal = normalize(vec3(localX * 0.5, 0.0, localZ));
    
    vec3 tangent = normalize(cross(vec3(0.0, 1.0, 0.0), vNormal));
    if (length(tangent) < 0.001) tangent = vec3(1.0, 0.0, 0.0);
    vec3 bitangent = normalize(cross(vNormal, tangent));
    
    vec3 finalNormal = normalize(
      tangent * lensNormalLocal.x + 
      vNormal * lensNormalLocal.z
    );

    float viewAngle = dot(vViewDir, tangent);
    float compositePhase = (viewAngle * uRefraction) + (vUv.x * uPitch);
    
    float prog = mod(compositePhase, 3.0);
    if(prog < 0.0) prog += 3.0;

    float w0 = max(0.0, 1.0 - abs(prog - 0.0)) + max(0.0, 1.0 - abs(prog - 3.0));
    float w1 = max(0.0, 1.0 - abs(prog - 1.0));
    float w2 = max(0.0, 1.0 - abs(prog - 2.0));
    
    w0 = pow(w0, uFocus);
    w1 = pow(w1, uFocus);
    w2 = pow(w2, uFocus);
    
    float totalW = w0 + w1 + w2;
    w0 /= totalW;
    w1 /= totalW;
    w2 /= totalW;

    vec4 tex0 = texture2D(uTexture0, vUv);
    vec4 tex1 = texture2D(uTexture1, vUv);
    vec4 tex2 = texture2D(uTexture2, vUv);

    vec3 albedo = (tex0.rgb * w0) + (tex1.rgb * w1) + (tex2.rgb * w2);

    vec3 halfVec = normalize(vLightDir + vViewDir);
    float NdotH = max(0.0, dot(finalNormal, halfVec));
    float specular = pow(NdotH, uGlossiness) * uSpecularInt;
    
    float NdotV = max(0.0, dot(finalNormal, vViewDir));
    float fresnel = pow(1.0 - NdotV, 4.0) * 0.5;

    gl_FragColor = vec4(albedo + specular + fresnel, 1.0);
    gl_FragColor.rgb = pow(gl_FragColor.rgb, vec3(1.0/2.2));
  }
`;

async function createFrameTexture(
  imageSrc: string,
  index: number
): Promise<THREE.Texture> {
  const canvas = await createCompositeCardTexture({
    frameImage: imageSrc,
    stickers: props.stickers || [],
    borderColor: props.borderColor || "#FFFFFF",
    borderWidth: (props.borderWidth as "narrow" | "medium" | "wide") || "wide",
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 16;
  return texture;
}

async function init() {
  if (!containerRef.value) return;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  camera = new THREE.PerspectiveCamera(
    35,
    containerRef.value.clientWidth / containerRef.value.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 11);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(
    containerRef.value.clientWidth,
    containerRef.value.clientHeight
  );
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  containerRef.value.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
  keyLight.position.set(5, 5, 10);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0xa0d0ff, 1.0);
  rimLight.position.set(-10, 5, -5);
  scene.add(rimLight);

  const fillLight = new THREE.DirectionalLight(0xffd0a0, 0.5);
  fillLight.position.set(0, -5, 5);
  scene.add(fillLight);

  const textures = await Promise.all([
    createFrameTexture(props.frames[0] || "", 0),
    createFrameTexture(props.frames[1] || props.frames[0] || "", 1),
    createFrameTexture(props.frames[2] || props.frames[0] || "", 2),
  ]);

  const geometry = new THREE.PlaneGeometry(4.5, 6.3, 128, 128);
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTexture0: { value: textures[0] },
      uTexture1: { value: textures[1] },
      uTexture2: { value: textures[2] },
      uLenses: { value: 120.0 },
      uRefraction: { value: 3.5 },
      uPitch: { value: 0.5 },
      uFocus: { value: 8.0 },
      uGlossiness: { value: 80.0 },
      uSpecularInt: { value: 1.0 },
    },
    side: THREE.DoubleSide,
  });

  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // Add shadow plane behind card for depth
  const shadowGeometry = new THREE.PlaneGeometry(4.8, 6.3);
  const shadowMaterial = new THREE.ShadowMaterial({ opacity: 0.3 });
  const shadowMesh = new THREE.Mesh(shadowGeometry, shadowMaterial);
  shadowMesh.position.z = -0.1;
  shadowMesh.receiveShadow = true;
  scene.add(shadowMesh);

  // Enable shadows on the card
  mesh.castShadow = true;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  if (containerRef.value) {
    containerRef.value.addEventListener("mousemove", handleMouseMove);
    containerRef.value.addEventListener("touchmove", handleTouchMove);
  }
  window.addEventListener("deviceorientation", handleOrientation);
  window.addEventListener("resize", handleResize);

  animate();
}

function handleMouseMove(e: MouseEvent) {
  if (!containerRef.value) return;
  const rect = containerRef.value.getBoundingClientRect();
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
}

function handleTouchMove(e: TouchEvent) {
  if (!containerRef.value || !e.touches[0]) return;
  const rect = containerRef.value.getBoundingClientRect();
  mouse.x = ((e.touches[0].clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((e.touches[0].clientY - rect.top) / rect.height) * 2 + 1;
}

function handleOrientation(e: DeviceOrientationEvent) {
  if (e.gamma != null && e.beta != null) {
    mouse.x = THREE.MathUtils.clamp(e.gamma / 30, -1, 1);
    mouse.y = THREE.MathUtils.clamp((e.beta - 45) / 30, -1, 1);
  }
}

function handleResize() {
  if (!containerRef.value) return;

  camera.aspect =
    containerRef.value.clientWidth / containerRef.value.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(
    containerRef.value.clientWidth,
    containerRef.value.clientHeight
  );
}

function animate() {
  animationId = requestAnimationFrame(animate);

  if (mesh) {
    const maxRotX = 0.3;
    const maxRotY = 0.5;
    const targetRotY = THREE.MathUtils.clamp(mouse.x * 0.5, -maxRotY, maxRotY);
    const targetRotX = THREE.MathUtils.clamp(-mouse.y * 0.3, -maxRotX, maxRotX);

    mesh.rotation.x += (targetRotX - mesh.rotation.x) * 0.1;
    mesh.rotation.y += (targetRotY - mesh.rotation.y) * 0.1;
    mesh.position.y = Math.sin(Date.now() * 0.0008) * 0.05;
  }

  renderer.render(scene, camera);
}

function cleanup() {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }

  if (containerRef.value) {
    containerRef.value.removeEventListener("mousemove", handleMouseMove);
    containerRef.value.removeEventListener("touchmove", handleTouchMove);
  }
  window.removeEventListener("deviceorientation", handleOrientation);
  window.removeEventListener("resize", handleResize);

  if (renderer && containerRef.value) {
    containerRef.value.removeChild(renderer.domElement);
    renderer.dispose();
  }

  if (mesh) {
    mesh.geometry.dispose();
    if (mesh.material instanceof THREE.Material) {
      mesh.material.dispose();
    }
  }
}

async function updateTextures() {
  if (mesh && mesh.material instanceof THREE.ShaderMaterial) {
    const textures = await Promise.all([
      createFrameTexture(props.frames[0] || "", 0),
      createFrameTexture(props.frames[1] || props.frames[0] || "", 1),
      createFrameTexture(props.frames[2] || props.frames[0] || "", 2),
    ]);

    mesh.material.uniforms.uTexture0.value = textures[0];
    mesh.material.uniforms.uTexture1.value = textures[1];
    mesh.material.uniforms.uTexture2.value = textures[2];
  }
}

watch(() => props.frames, updateTextures, { deep: true });
watch(() => props.stickers, updateTextures, { deep: true });
watch(() => props.borderColor, updateTextures);
watch(() => props.borderWidth, updateTextures);

onMounted(() => {
  init();
});

onUnmounted(() => {
  cleanup();
});
</script>

<style scoped>
.lenticular-container {
  width: 100%;
  height: 100%;
  touch-action: none;
}

.lenticular-container :deep(canvas) {
  display: block;
  outline: none;
}
</style>
