<template>
  <div 
    class="sticker"
    :class="{ active: isActive }"
    :style="stickerStyle"
    @mousedown="$emit('drag-start', $event)"
    @touchstart="$emit('drag-start', $event)"
    @click="$emit('select')"
  >
    <span class="sticker-icon">{{ sticker.icon }}</span>
    <span 
      v-if="isActive"
      class="sticker-delete"
      @click.stop="$emit('delete')"
    >×</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  sticker: {
    type: Object,
    required: true
  },
  isActive: Boolean
})

defineEmits(['drag-start', 'select', 'delete'])

const stickerStyle = computed(() => ({
  left: `${props.sticker.x}%`,
  top: `${props.sticker.y}%`,
  transform: `translate(-50%, -50%) scale(${props.sticker.scale}) rotate(${props.sticker.rotation}deg)`
}))
</script>

<style scoped>
.sticker {
  position: absolute;
  cursor: move;
  user-select: none;
  z-index: 10;
  transition: transform 0.1s;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.sticker.active {
  z-index: 20;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

.sticker-icon {
  font-size: 32px;
  display: block;
}

.sticker-delete {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 24px;
  height: 24px;
  background: #EF4444;
  color: #fff;
  border-radius: 50%;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
  transition: all 0.2s;
}

.sticker-delete:active {
  transform: scale(0.9);
}
</style>
