<template>
  <div 
    class="floating-toolbar" 
    :class="{ 
      left: position === 'left' && !isDragging, 
      right: position === 'right' && !isDragging,
      dragging: isDragging 
    }"
    :style="dragStyle"
  >
    <transition name="fade">
      <div v-if="expanded" class="toolbar-backdrop" @click="$emit('update:expanded', false)" />
    </transition>
    
    <transition name="tool-menu">
      <div v-if="expanded" class="tool-menu" :class="{ left: position === 'left', bottom: menuPosition === 'bottom' }">
        <div class="tool-item" @click="$emit('tool-select', 'border')">
          <div class="tool-icon">🎨</div>
          <span class="tool-label">边框</span>
        </div>
        <div class="tool-item" @click="$emit('tool-select', 'sticker')">
          <div class="tool-icon">😊</div>
          <span class="tool-label">贴纸</span>
        </div>
        <div class="tool-item" @click="$emit('clear-all')">
          <div class="tool-icon">🗑️</div>
          <span class="tool-label">清空</span>
        </div>
        <div class="tool-item" @click="$emit('complete')">
          <div class="tool-icon">✓</div>
          <span class="tool-label">完成</span>
        </div>
      </div>
    </transition>

    <button 
      class="fab-button" 
      :class="{ dragging: isDragging }"
      @click="handleClick"
      @mousedown="startDrag"
      @touchstart="startDrag"
    >
      <transition name="rotate" mode="out-in">
        <span v-if="!expanded" key="edit">✏️</span>
        <span v-else key="close">✕</span>
      </transition>
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  expanded: Boolean,
  position: {
    type: String,
    default: 'right'
  },
  menuPosition: {
    type: String,
    default: 'top'
  }
})

const emit = defineEmits(['update:expanded', 'update:position', 'update:menuPosition', 'tool-select', 'clear-all', 'complete'])

const isDragging = ref(false)
const fabTop = ref(null)
const fabLeft = ref(null)

const dragStyle = computed(() => ({
  top: fabTop.value !== null ? `${fabTop.value}px` : undefined,
  bottom: fabTop.value !== null ? 'auto' : undefined,
  left: fabLeft.value !== null ? `${fabLeft.value}px` : undefined,
  right: fabLeft.value !== null ? 'auto' : undefined
}))

function handleClick() {
  if (!isDragging.value) {
    emit('update:expanded', !props.expanded)
  }
}

function startDrag(e) {
  const fabButton = e.currentTarget
  const rect = fabButton.getBoundingClientRect()
  
  const startX = e.touches ? e.touches[0].clientX : e.clientX
  const startY = e.touches ? e.touches[0].clientY : e.clientY
  const offsetX = startX - rect.left
  const offsetY = startY - rect.top
  
  let hasMoved = false
  const dragThreshold = 5
  
  const moveHandler = (moveE) => {
    const currentX = moveE.touches ? moveE.touches[0].clientX : moveE.clientX
    const currentY = moveE.touches ? moveE.touches[0].clientY : moveE.clientY
    
    const deltaX = Math.abs(currentX - startX)
    const deltaY = Math.abs(currentY - startY)
    
    if (!hasMoved && (deltaX > dragThreshold || deltaY > dragThreshold)) {
      hasMoved = true
      isDragging.value = true
      fabLeft.value = rect.left
      fabTop.value = rect.top
    }
    
    if (hasMoved) {
      moveE.preventDefault()
      const screenWidth = window.innerWidth
      const screenHeight = window.innerHeight
      
      const newLeft = currentX - offsetX
      const newTop = currentY - offsetY
      
      const minLeft = 0
      const maxLeft = screenWidth - 64
      const minTop = 56
      const maxTop = screenHeight - 64
      
      fabLeft.value = Math.max(minLeft, Math.min(maxLeft, newLeft))
      fabTop.value = Math.max(minTop, Math.min(maxTop, newTop))
    }
  }
  
  const upHandler = () => {
    if (hasMoved) {
      isDragging.value = false
      
      const screenWidth = window.innerWidth
      const screenHeight = window.innerHeight
      
      if (fabLeft.value < screenWidth / 2) {
        emit('update:position', 'left')
      } else {
        emit('update:position', 'right')
      }
      
      if (fabTop.value < screenHeight / 2) {
        emit('update:menuPosition', 'bottom')
      } else {
        emit('update:menuPosition', 'top')
      }
      
      fabLeft.value = null
    }
    
    document.removeEventListener('mousemove', moveHandler)
    document.removeEventListener('mouseup', upHandler)
    document.removeEventListener('touchmove', moveHandler)
    document.removeEventListener('touchend', upHandler)
  }
  
  document.addEventListener('mousemove', moveHandler)
  document.addEventListener('mouseup', upHandler)
  document.addEventListener('touchmove', moveHandler)
  document.addEventListener('touchend', upHandler)
}
</script>

<style scoped>
.floating-toolbar {
  position: fixed;
  bottom: 32px;
  z-index: 1000;
  transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
              right 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              top 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.floating-toolbar.dragging {
  transition: none;
}

.floating-toolbar.right {
  right: 24px;
}

.floating-toolbar.left {
  left: 24px;
}

.toolbar-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 999;
}

.fab-button {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #1A1A1A;
  border: none;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  cursor: grab;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 1001;
  touch-action: none;
}

.fab-button.dragging {
  cursor: grabbing;
  transform: scale(1.1);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
}

.fab-button:active:not(.dragging) {
  transform: scale(0.95);
}

.tool-menu {
  position: absolute;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 1000;
}

.tool-menu:not(.bottom) {
  bottom: 80px;
}

.tool-menu.bottom {
  top: 80px;
}

.tool-menu:not(.left) {
  right: 0;
}

.tool-menu.left {
  left: 0;
}

.tool-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  padding: 12px 16px;
  border-radius: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.tool-item:active {
  transform: scale(0.95);
}

.tool-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  background: #F3F4F6;
  border-radius: 50%;
}

.tool-label {
  font-size: 14px;
  font-weight: 500;
  color: #1A1A1A;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.tool-menu-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.tool-menu-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.tool-menu-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.9);
}

.tool-menu-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.95);
}

.rotate-enter-active,
.rotate-leave-active {
  transition: all 0.2s;
}

.rotate-enter-from {
  transform: rotate(-90deg);
  opacity: 0;
}

.rotate-leave-to {
  transform: rotate(90deg);
  opacity: 0;
}
</style>
