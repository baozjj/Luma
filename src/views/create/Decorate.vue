<template>
  <div class="decorate">
    <van-nav-bar 
      title="边框装饰" 
      left-arrow 
      @click-left="goBack"
    >
      <template #right>
        <van-icon name="delete-o" size="20" @click="clearAll" />
      </template>
    </van-nav-bar>

    <div class="content">
      <div 
        class="card-container"
        ref="cardContainer"
        @drop="handleDrop"
        @dragover.prevent
      >
        <div 
          class="card-preview"
          :style="{ 
            borderColor: borderColor,
            borderWidth: borderWidthPx
          }"
        >
          <div class="card-inner">
            <img 
              v-if="currentFrame" 
              :src="currentFrame" 
              alt=""
              class="card-image"
            />
          </div>
          
          <div 
            v-for="sticker in stickers" 
            :key="sticker.id"
            class="sticker"
            :class="{ active: activeSticker === sticker.id }"
            :style="getStickerStyle(sticker)"
            @mousedown="startDrag($event, sticker)"
            @touchstart="startDrag($event, sticker)"
            @click="selectSticker(sticker.id)"
          >
            <span class="sticker-icon">{{ sticker.icon }}</span>
            <span 
              v-if="activeSticker === sticker.id"
              class="sticker-delete"
              @click.stop="removeSticker(sticker.id)"
            >×</span>
          </div>
        </div>
      </div>

      <div class="controls">
        <div class="control-row">
          <span class="control-label">边框颜色</span>
          <div class="color-options">
            <div 
              v-for="color in colors" 
              :key="color"
              class="color-item"
              :class="{ active: borderColor === color }"
              :style="{ background: color }"
              @click="borderColor = color"
            />
          </div>
        </div>
        <div class="control-row">
          <span class="control-label">边框宽度</span>
          <div class="width-options">
            <span 
              v-for="w in widths" 
              :key="w.value"
              class="width-item"
              :class="{ active: borderWidth === w.value }"
              @click="borderWidth = w.value"
            >{{ w.label }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="sticker-panel" :class="{ expanded: panelExpanded }">
      <div class="panel-header" @click="panelExpanded = !panelExpanded">
        <span>贴纸库</span>
        <van-icon :name="panelExpanded ? 'arrow-down' : 'arrow-up'" />
      </div>
      
      <div class="panel-content" v-show="panelExpanded">
        <van-tabs v-model:active="activeCategory" shrink>
          <van-tab 
            v-for="cat in categories" 
            :key="cat.key" 
            :title="cat.name"
          >
            <div class="sticker-grid">
              <div 
                v-for="icon in cat.icons" 
                :key="icon"
                class="sticker-item"
                draggable="true"
                @dragstart="handleDragStart($event, icon)"
                @click="addStickerToCenter(icon)"
              >
                {{ icon }}
              </div>
            </div>
          </van-tab>
        </van-tabs>
      </div>
    </div>

    <div class="footer">
      <van-button 
        type="primary" 
        size="large"
        class="btn-primary"
        @click="nextStep"
      >
        下一步
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NavBar as VanNavBar, Icon as VanIcon, Button as VanButton, Tab as VanTab, Tabs as VanTabs, showToast } from 'vant'
import { useCardStore } from '@/stores/card'

const router = useRouter()
const cardStore = useCardStore()

const cardContainer = ref(null)
const panelExpanded = ref(true)
const activeCategory = ref(0)
const activeSticker = ref(null)

const borderColor = ref('#FFFFFF')
const borderWidth = ref('medium')

const colors = ['#FFFFFF', '#1A1A1A', '#F3F4F6', '#FEE2E2', '#DBEAFE', '#D1FAE5', '#FEF3C7']
const widths = [
  { value: 'narrow', label: '窄' },
  { value: 'medium', label: '中' },
  { value: 'wide', label: '宽' }
]

const borderWidthPx = computed(() => {
  const map = { narrow: '8px', medium: '16px', wide: '24px' }
  return map[borderWidth.value]
})

const categories = [
  { 
    key: 'emoji', 
    name: '表情',
    icons: ['😊', '😍', '🥰', '😎', '🤩', '😇', '🥳', '😋', '🤗', '💕', '❤️', '💖', '⭐', '✨', '🌟']
  },
  { 
    key: 'symbol', 
    name: '符号',
    icons: ['🎵', '🎶', '⚡', '💫', '🔥', '💎', '🎯', '🎪', '🎨', '🎭', '🎬', '📸', '🎤', '🎧', '🎹']
  },
  { 
    key: 'holiday', 
    name: '节日',
    icons: ['🎄', '🎅', '🎁', '🎊', '🎉', '🎂', '🎈', '🧧', '🏮', '🎃', '👻', '🐰', '🥚', '💝', '🌹']
  },
  { 
    key: 'nature', 
    name: '自然',
    icons: ['🌸', '🌺', '🌻', '🌷', '🌹', '🍀', '🌿', '🍃', '☁️', '🌈', '🌙', '⭐', '🦋', '🐝', '🌊']
  },
  { 
    key: 'shape', 
    name: '几何',
    icons: ['⬤', '◆', '▲', '■', '●', '◇', '△', '□', '○', '◈', '✦', '✧', '❖', '◉', '◎']
  }
]

const stickers = ref([])
const currentFrame = computed(() => cardStore.frames[0])

const draggedIcon = ref(null)
const dragOffset = ref({ x: 0, y: 0 })
const draggingSticker = ref(null)

function goBack() {
  router.back()
}

function getStickerStyle(sticker) {
  return {
    left: `${sticker.x}%`,
    top: `${sticker.y}%`,
    transform: `translate(-50%, -50%) scale(${sticker.scale}) rotate(${sticker.rotation}deg)`
  }
}

function handleDragStart(e, icon) {
  draggedIcon.value = icon
  e.dataTransfer.effectAllowed = 'copy'
}

function handleDrop(e) {
  if (!draggedIcon.value) return
  
  const rect = cardContainer.value.getBoundingClientRect()
  const x = ((e.clientX - rect.left) / rect.width) * 100
  const y = ((e.clientY - rect.top) / rect.height) * 100
  
  addSticker(draggedIcon.value, x, y)
  draggedIcon.value = null
}

function addStickerToCenter(icon) {
  addSticker(icon, 50, 50)
}

function addSticker(icon, x, y) {
  const newSticker = {
    id: Date.now(),
    icon,
    x: Math.max(10, Math.min(90, x)),
    y: Math.max(10, Math.min(90, y)),
    scale: 1,
    rotation: 0
  }
  stickers.value.push(newSticker)
  activeSticker.value = newSticker.id
}

function selectSticker(id) {
  activeSticker.value = activeSticker.value === id ? null : id
}

function removeSticker(id) {
  stickers.value = stickers.value.filter(s => s.id !== id)
  activeSticker.value = null
}

function clearAll() {
  stickers.value = []
  activeSticker.value = null
}

function startDrag(e, sticker) {
  if (e.target.classList.contains('sticker-delete')) return
  
  draggingSticker.value = sticker
  activeSticker.value = sticker.id
  
  const rect = cardContainer.value.getBoundingClientRect()
  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  const clientY = e.touches ? e.touches[0].clientY : e.clientY
  
  const moveHandler = (moveE) => {
    const moveX = moveE.touches ? moveE.touches[0].clientX : moveE.clientX
    const moveY = moveE.touches ? moveE.touches[0].clientY : moveE.clientY
    
    const x = ((moveX - rect.left) / rect.width) * 100
    const y = ((moveY - rect.top) / rect.height) * 100
    
    sticker.x = Math.max(5, Math.min(95, x))
    sticker.y = Math.max(5, Math.min(95, y))
  }
  
  const upHandler = () => {
    draggingSticker.value = null
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

function nextStep() {
  cardStore.stickers = stickers.value
  cardStore.borderColor = borderColor.value
  cardStore.borderWidth = borderWidth.value
  router.push('/create/preview')
}

onMounted(() => {
  if (!cardStore.frames.length) {
    showToast('请先完成抽帧')
    router.push('/create')
  }
  if (cardStore.stickers.length) {
    stickers.value = [...cardStore.stickers]
  }
  borderColor.value = cardStore.borderColor
  borderWidth.value = cardStore.borderWidth
})
</script>

<style scoped>
.decorate {
  min-height: 100vh;
  background: #FAFAFA;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  padding: 16px;
  overflow: hidden;
}

.card-container {
  display: flex;
  justify-content: center;
  padding: 16px 0;
}

.card-preview {
  width: 180px;
  height: 252px;
  background: #fff;
  border-radius: 12px;
  border-style: solid;
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.card-inner {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.sticker {
  position: absolute;
  cursor: move;
  user-select: none;
  z-index: 10;
  transition: transform 0.1s;
}

.sticker.active {
  z-index: 20;
}

.sticker-icon {
  font-size: 24px;
  display: block;
}

.sticker-delete {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 18px;
  height: 18px;
  background: #EF4444;
  color: #fff;
  border-radius: 50%;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.controls {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-top: 16px;
}

.control-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.control-row:last-child {
  margin-bottom: 0;
}

.control-label {
  font-size: 14px;
  color: #1A1A1A;
}

.color-options {
  display: flex;
  gap: 8px;
}

.color-item {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid #E5E7EB;
  cursor: pointer;
}

.color-item.active {
  border-color: #1A1A1A;
}

.width-options {
  display: flex;
  gap: 8px;
}

.width-item {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  color: #9CA3AF;
  background: #F3F4F6;
  cursor: pointer;
}

.width-item.active {
  background: #1A1A1A;
  color: #fff;
}

.sticker-panel {
  background: #fff;
  border-radius: 16px 16px 0 0;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.05);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #1A1A1A;
  cursor: pointer;
}

.panel-content {
  max-height: 200px;
  overflow-y: auto;
}

.sticker-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  padding: 12px 16px;
}

.sticker-item {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  background: #F9FAFB;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.sticker-item:active {
  background: #E5E7EB;
}

.footer {
  padding: 16px;
  background: #fff;
}

.btn-primary {
  width: 100%;
  background: #1A1A1A !important;
  border-color: #1A1A1A !important;
}
</style>
