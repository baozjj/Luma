<template>
  <div
    class="sticker-wrapper"
    :class="{ active: isActive }"
    :style="wrapperStyle"
  >
    <div
      class="sticker"
      @mousedown="startDrag"
      @touchstart="startDrag"
      @click="$emit('select')"
    >
      <span class="sticker-icon">{{ sticker.icon }}</span>
    </div>

    <template v-if="isActive">
      <div class="sticker-border"></div>

      <button
        class="sticker-control delete"
        @click.stop="$emit('delete')"
        @mousedown.stop
        @touchstart.stop
      >
        <svg
          viewBox="0 0 24 24"
          width="12"
          height="12"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      <button
        class="sticker-control transform"
        @mousedown.stop="startTransform"
        @touchstart.stop="startTransform"
      >
        <svg
          viewBox="0 0 24 24"
          width="12"
          height="12"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M21.5 2.5l-19 19M17 3h5v5M3 17v5h5"></path>
        </svg>
      </button>
    </template>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  sticker: {
    type: Object,
    required: true,
  },
  isActive: Boolean,
});

const emit = defineEmits(["drag-start", "select", "delete", "update"]);

const lastTouchDistance = ref(0);
const initialScale = ref(1);
const isPinching = ref(false);

function startDrag(e) {
  if (e.touches && e.touches.length === 2) {
    e.preventDefault();
    e.stopPropagation();
    startPinchZoom(e);
    return;
  }

  if (e.touches && e.touches.length === 1 && !isPinching.value) {
    emit("drag-start", e);
  } else if (!e.touches) {
    emit("drag-start", e);
  }
}

function startPinchZoom(e) {
  isPinching.value = true;
  const touch1 = e.touches[0];
  const touch2 = e.touches[1];

  lastTouchDistance.value = Math.sqrt(
    Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
  );

  initialScale.value = props.sticker.scale;

  const moveHandler = (moveE) => {
    if (moveE.touches.length !== 2) return;
    moveE.preventDefault();

    const t1 = moveE.touches[0];
    const t2 = moveE.touches[1];

    const currentDistance = Math.sqrt(
      Math.pow(t2.clientX - t1.clientX, 2) +
        Math.pow(t2.clientY - t1.clientY, 2)
    );

    const scaleRatio = currentDistance / lastTouchDistance.value;
    const newScale = Math.max(
      0.3,
      Math.min(4, initialScale.value * scaleRatio)
    );

    emit("update", { scale: newScale });
  };

  const upHandler = () => {
    isPinching.value = false;
    document.removeEventListener("touchmove", moveHandler);
    document.removeEventListener("touchend", upHandler);
    document.removeEventListener("touchcancel", upHandler);
  };

  document.addEventListener("touchmove", moveHandler, { passive: false });
  document.addEventListener("touchend", upHandler);
  document.addEventListener("touchcancel", upHandler);
}

function startTransform(e) {
  e.preventDefault();

  const wrapper = e.target.closest(".sticker-wrapper");
  const rect = wrapper.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const startX = e.touches ? e.touches[0].clientX : e.clientX;
  const startY = e.touches ? e.touches[0].clientY : e.clientY;
  const startAngle =
    (Math.atan2(startY - centerY, startX - centerX) * 180) / Math.PI;
  const startRotation = props.sticker.rotation;

  const moveHandler = (moveE) => {
    const currentX = moveE.touches ? moveE.touches[0].clientX : moveE.clientX;
    const currentY = moveE.touches ? moveE.touches[0].clientY : moveE.clientY;
    const currentAngle =
      (Math.atan2(currentY - centerY, currentX - centerX) * 180) / Math.PI;

    const angleDelta = currentAngle - startAngle;
    const newRotation = (startRotation + angleDelta) % 360;

    emit("update", { rotation: newRotation });
  };

  const upHandler = () => {
    document.removeEventListener("mousemove", moveHandler);
    document.removeEventListener("mouseup", upHandler);
    document.removeEventListener("touchmove", moveHandler);
    document.removeEventListener("touchend", upHandler);
  };

  document.addEventListener("mousemove", moveHandler);
  document.addEventListener("mouseup", upHandler);
  document.addEventListener("touchmove", moveHandler);
  document.addEventListener("touchend", upHandler);
}

const wrapperStyle = computed(() => ({
  left: `${props.sticker.x}%`,
  top: `${props.sticker.y}%`,
  transform: `translate(-50%, -50%) scale(${props.sticker.scale}) rotate(${props.sticker.rotation}deg)`,
}));
</script>

<style scoped>
.sticker-wrapper {
  position: absolute;
  z-index: 10;
  user-select: none;
  touch-action: none;
}

.sticker-wrapper.active {
  z-index: 20;
}

.sticker {
  cursor: move;
  display: inline-block;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.15));
  transition: filter 0.2s;
}

.sticker-wrapper.active .sticker {
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.25));
}

.sticker-icon {
  font-size: 40px;
  display: block;
  line-height: 1;
}

@media (max-width: 400px) {
  .sticker-icon {
    font-size: 11vw;
  }
}

.sticker-border {
  position: absolute;
  top: -8px;
  left: -8px;
  right: -8px;
  bottom: -8px;
  border: 2px dashed #3b82f6;
  border-radius: 8px;
  pointer-events: none;
  opacity: 0.6;
}

.sticker-control {
  position: absolute;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.2s;
  padding: 0;
  color: #fff;
}

.sticker-control.delete {
  top: -12px;
  right: -12px;
  background: #ef4444;
}

.sticker-control.delete:hover {
  background: #dc2626;
  transform: scale(1.1);
}

.sticker-control.delete:active {
  transform: scale(0.95);
}

.sticker-control.transform {
  bottom: -12px;
  right: -12px;
  background: #3b82f6;
  cursor: grab;
}

.sticker-control.transform:active {
  cursor: grabbing;
}

.sticker-control.transform:hover {
  background: #2563eb;
  transform: scale(1.1);
}

.sticker-control.transform:active {
  transform: scale(0.95);
}
</style>
