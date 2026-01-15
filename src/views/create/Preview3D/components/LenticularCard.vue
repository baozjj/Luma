<template>
  <div ref="containerRef" class="lenticular-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
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
  uniform sampler2D uBorderMask;
  
  uniform float uLenses;
  uniform float uRefraction;
  uniform float uPitch;
  uniform float uFocus;
  uniform float uGlossiness;
  uniform float uSpecularInt;
  uniform vec3 uBorderColor;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec3 vLightDir;

  void main() {
    // 读取边框遮罩，判断当前像素是边框还是内容区域
    vec4 maskColor = texture2D(uBorderMask, vUv);
    float isBorder = maskColor.r; // 1.0 = 边框, 0.0 = 内容区域
    
    // 读取纹理颜色（包含贴纸）
    vec4 tex0 = texture2D(uTexture0, vUv);
    vec4 tex1 = texture2D(uTexture1, vUv);
    vec4 tex2 = texture2D(uTexture2, vUv);
    
    vec3 finalColor;
    vec3 finalNormal = vNormal;
    
    if (isBorder > 0.5) {
      // 边框区域：检查是否有贴纸（颜色与边框颜色不同）
      // 如果纹理颜色与边框颜色差异较大，说明有贴纸，直接显示纹理
      vec3 avgTexColor = (tex0.rgb + tex1.rgb + tex2.rgb) / 3.0;
      float colorDiff = length(avgTexColor - uBorderColor);
      
      if (colorDiff > 0.1) {
        // 有贴纸：直接显示纹理，不应用光栅效果
        finalColor = avgTexColor;
      } else {
        // 纯边框：使用边框颜色，添加边缘高光
        finalColor = uBorderColor;
        
        // 添加边缘高光，让白色边框可见
        float NdotV = max(0.0, dot(vNormal, vViewDir));
        float edgeGlow = pow(1.0 - NdotV, 3.0) * 0.15;
        finalColor += vec3(edgeGlow);
        
        // 添加细微的环境光遮蔽
        float ao = 0.95;
        finalColor *= ao;
      }
    } else {
      // 内容区域：应用光栅效果
      float lensUvX = fract(vUv.x * uLenses); 
      float localX = (lensUvX - 0.5) * 2.0;
      float localZ = sqrt(1.0 - clamp(localX * localX, 0.0, 0.99));
      
      vec3 lensNormalLocal = normalize(vec3(localX * 0.5, 0.0, localZ));
      
      vec3 tangent = normalize(cross(vec3(0.0, 1.0, 0.0), vNormal));
      if (length(tangent) < 0.001) tangent = vec3(1.0, 0.0, 0.0);
      
      finalNormal = normalize(
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

      finalColor = (tex0.rgb * w0) + (tex1.rgb * w1) + (tex2.rgb * w2);

      vec3 halfVec = normalize(vLightDir + vViewDir);
      float NdotH = max(0.0, dot(finalNormal, halfVec));
      float specular = pow(NdotH, uGlossiness) * uSpecularInt;
      
      float NdotV = max(0.0, dot(finalNormal, vViewDir));
      float fresnel = pow(1.0 - NdotV, 4.0) * 0.5;

      finalColor += specular + fresnel;
    }

    gl_FragColor = vec4(finalColor, 1.0);
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

function createBorderMask(): THREE.Texture {
  // 创建边框遮罩纹理：白色=边框，黑色=内容区域
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1434;
  const ctx = canvas.getContext("2d")!;

  // 计算边框宽度（与 cardCompositor.ts 保持一致）
  const borderWidthMap = {
    narrow: canvas.width * (16 / 360),
    medium: canvas.width * (24 / 360),
    wide: canvas.width * (48 / 360),
  };
  const borderPx =
    borderWidthMap[
      (props.borderWidth as "narrow" | "medium" | "wide") || "wide"
    ];

  // 整个画布填充白色（边框）
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 内容区域填充黑色
  ctx.fillStyle = "#000000";
  ctx.fillRect(
    borderPx,
    borderPx,
    canvas.width - borderPx * 2,
    canvas.height - borderPx * 2
  );

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

function hexToRgb(hex: string): THREE.Vector3 {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? new THREE.Vector3(
        parseInt(result[1], 16) / 255,
        parseInt(result[2], 16) / 255,
        parseInt(result[3], 16) / 255
      )
    : new THREE.Vector3(1, 1, 1);
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

  const borderMask = createBorderMask();
  const borderColor = hexToRgb(props.borderColor || "#FFFFFF");

  // 使用 RoundedBoxGeometry 创建有厚度和圆角的卡片
  const cardThickness = 0.08;
  const cornerRadius = 0.15; // 圆角半径
  const smoothness = 8; // 圆角平滑度
  const geometry = new RoundedBoxGeometry(
    4.5,
    6.3,
    cardThickness,
    smoothness,
    cornerRadius
  );

  // 为正面创建光栅材质
  const frontMaterial = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTexture0: { value: textures[0] },
      uTexture1: { value: textures[1] },
      uTexture2: { value: textures[2] },
      uBorderMask: { value: borderMask },
      uBorderColor: { value: borderColor },
      uLenses: { value: 120.0 },
      uRefraction: { value: 3.5 },
      uPitch: { value: 0.5 },
      uFocus: { value: 8.0 },
      uGlossiness: { value: 80.0 },
      uSpecularInt: { value: 1.0 },
    },
  });

  // 背面和侧面使用简单的白色材质
  const sideMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(borderColor.x, borderColor.y, borderColor.z),
    metalness: 0.1,
    roughness: 0.4,
  });

  // 为 Box 的 6 个面分配材质：右、左、上、下、前、后
  const materials = [
    sideMaterial, // 右侧
    sideMaterial, // 左侧
    sideMaterial, // 上侧
    sideMaterial, // 下侧
    frontMaterial, // 正面（光栅效果）
    frontMaterial, // 背面（也应用光栅效果）
  ];

  mesh = new THREE.Mesh(geometry, materials);
  scene.add(mesh);

  // 添加阴影平面增加深度感
  const shadowGeometry = new THREE.PlaneGeometry(5.0, 7.0);
  const shadowMaterial = new THREE.ShadowMaterial({ opacity: 0.2 });
  const shadowMesh = new THREE.Mesh(shadowGeometry, shadowMaterial);
  shadowMesh.position.z = -0.15;
  shadowMesh.receiveShadow = true;
  scene.add(shadowMesh);

  // 启用阴影
  mesh.castShadow = true;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // 配置灯光投射阴影
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 2048;
  keyLight.shadow.mapSize.height = 2048;

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
  if (mesh && Array.isArray(mesh.material)) {
    const textures = await Promise.all([
      createFrameTexture(props.frames[0] || "", 0),
      createFrameTexture(props.frames[1] || props.frames[0] || "", 1),
      createFrameTexture(props.frames[2] || props.frames[0] || "", 2),
    ]);

    const borderMask = createBorderMask();
    const borderColor = hexToRgb(props.borderColor || "#FFFFFF");

    // 更新正面和背面材质（索引 4 和 5）
    const frontMaterial = mesh.material[4] as THREE.ShaderMaterial;
    const backMaterial = mesh.material[5] as THREE.ShaderMaterial;

    if (frontMaterial.uniforms) {
      frontMaterial.uniforms.uTexture0.value = textures[0];
      frontMaterial.uniforms.uTexture1.value = textures[1];
      frontMaterial.uniforms.uTexture2.value = textures[2];
      frontMaterial.uniforms.uBorderMask.value = borderMask;
      frontMaterial.uniforms.uBorderColor.value = borderColor;
    }

    if (backMaterial.uniforms) {
      backMaterial.uniforms.uTexture0.value = textures[0];
      backMaterial.uniforms.uTexture1.value = textures[1];
      backMaterial.uniforms.uTexture2.value = textures[2];
      backMaterial.uniforms.uBorderMask.value = borderMask;
      backMaterial.uniforms.uBorderColor.value = borderColor;
    }

    // 更新侧面材质颜色
    for (let i = 0; i < 4; i++) {
      const sideMat = mesh.material[i] as THREE.MeshStandardMaterial;
      sideMat.color.setRGB(borderColor.x, borderColor.y, borderColor.z);
    }
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
