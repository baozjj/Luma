<template>
  <div class="preview-3d">
    <van-nav-bar 
      title="3D预览" 
      left-arrow 
      @click-left="goBack"
    />

    <div class="content">
      <div class="preview-container">
        <div 
          class="card-3d"
          :style="cardStyle"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
          @mousedown="handleMouseDown"
        >
          <div 
            class="card-face"
            :style="{ 
              borderColor: borderColor,
              borderWidth: borderWidthPx
            }"
          >
            <div class="card-inner">
              <img 
                :src="currentFrame" 
                alt=""
                class="card-image"
              />
            </div>
            
            <div 
              v-for="sticker in stickers" 
              :key="sticker.id"
              class="sticker"
              :style="getStickerStyle(sticker)"
            >
              {{ sticker.icon }}
            </div>
          </div>
        </div>
      </div>

      <div class="frame-indicator">
        <div class="indicator-bar">
          <div 
            class="indicator-progress" 
            :style="{ width: `${(currentFrameIndex + 1) / frames.length * 100}%` }"
          />
        </div>
        <span class="indicator-text">{{ currentFrameIndex + 1 }} / {{ frames.length }}</span>
      </div>

      <div class="hint">
        <van-icon name="info-o" />
        <span>左右滑动卡片查看光栅效果</span>
      </div>

      <div class="actions">
        <van-button 
          size="small" 
          plain
          :class="{ active: isAutoPlay }"
          @click="toggleAutoPlay"
        >
          {{ isAutoPlay ? '停止播放' : '自动播放' }}
        </van-button>
        <van-button 
          size="small" 
          plain
          @click="toggleView"
        >
          {{ is3D ? '2D视图' : '3D视图' }}
        </van-button>
      </div>
    </div>

    <div class="footer">
      <van-button 
        type="default" 
        size="large"
        class="btn-secondary"
        @click="goBack"
      >
        返回编辑
      </van-button>
      <van-button 
        type="primary" 
        size="large"
        class="btn-primary"
        @click="saveWork"
      >
        保存作品
      </van-button>
    </div>

    <van-action-sheet
      v-model:show="showExport"
      title="导出选项"
      :actions="exportActions"
      @select="handleExport"
      cancel-text="取消"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { NavBar as VanNavBar, Icon as VanIcon, Button as VanButton, ActionSheet as VanActionSheet, showToast, showSuccessToast } from 'vant'
import { useCardStore } from '@/stores/card'

const router = useRouter()
const cardStore = useCardStore()

const frames = computed(() => cardStore.frames)
const stickers = computed(() => cardStore.stickers)
const borderColor = computed(() => cardStore.borderColor)
const borderWidth = computed(() => cardStore.borderWidth)

const borderWidthPx = computed(() => {
  const map = { narrow: '8px', medium: '16px', wide: '24px' }
  return map[borderWidth.value]
})

const currentFrameIndex = ref(0)
const rotateY = ref(0)
const is3D = ref(true)
const isAutoPlay = ref(false)
const showExport = ref(false)

let autoPlayTimer = null
let startX = 0
let lastX = 0

const currentFrame = computed(() => frames.value[currentFrameIndex.value])

const cardStyle = computed(() => {
  if (!is3D.value) {
    return { transform: 'perspective(1000px) rotateY(0deg)' }
  }
  return {
    transform: `perspective(1000px) rotateY(${rotateY.value}deg)`
  }
})

const exportActions = [
  { name: '保存至作品集', value: 'save' },
  { name: '导出预览图', value: 'image' },
  { name: '导出GIF动图', value: 'gif' }
]

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

function updateFrameByRotation() {
  const normalizedRotation = ((rotateY.value % 360) + 360) % 360
  const frameIndex = Math.floor((normalizedRotation / 360) * frames.value.length) % frames.value.length
  currentFrameIndex.value = frameIndex
}

function handleTouchStart(e) {
  startX = e.touches[0].clientX
  lastX = startX
  stopAutoPlay()
}

function handleTouchMove(e) {
  const currentX = e.touches[0].clientX
  const deltaX = currentX - lastX
  rotateY.value += deltaX * 0.5
  lastX = currentX
  updateFrameByRotation()
}

function handleTouchEnd() {
  // Animation end
}

function handleMouseDown(e) {
  startX = e.clientX
  lastX = startX
  stopAutoPlay()
  
  const moveHandler = (moveE) => {
    const deltaX = moveE.clientX - lastX
    rotateY.value += deltaX * 0.5
    lastX = moveE.clientX
    updateFrameByRotation()
  }
  
  const upHandler = () => {
    document.removeEventListener('mousemove', moveHandler)
    document.removeEventListener('mouseup', upHandler)
  }
  
  document.addEventListener('mousemove', moveHandler)
  document.addEventListener('mouseup', upHandler)
}

function toggleAutoPlay() {
  if (isAutoPlay.value) {
    stopAutoPlay()
  } else {
    startAutoPlay()
  }
}

function startAutoPlay() {
  isAutoPlay.value = true
  autoPlayTimer = setInterval(() => {
    rotateY.value += 2
    updateFrameByRotation()
  }, 50)
}

function stopAutoPlay() {
  isAutoPlay.value = false
  if (autoPlayTimer) {
    clearInterval(autoPlayTimer)
    autoPlayTimer = null
  }
}

function toggleView() {
  is3D.value = !is3D.value
  if (!is3D.value) {
    rotateY.value = 0
  }
}

function saveWork() {
  showExport.value = true
}

function handleExport(action) {
  showExport.value = false
  
  if (action.value === 'save') {
    cardStore.saveWork()
    showSuccessToast('已保存至作品集')
    setTimeout(() => {
      cardStore.reset()
      router.push('/works')
    }, 1000)
  } else if (action.value === 'image') {
    showToast('正在生成预览图...')
    // TODO: 实现导出图片功能
  } else if (action.value === 'gif') {
    showToast('正在生成GIF...')
    // TODO: 实现导出GIF功能
  }
}

onMounted(() => {
  if (!cardStore.frames.length) {
    showToast('请先完成制作流程')
    router.push('/create')
  }
})

onUnmounted(() => {
  stopAutoPlay()
})
</script>

<style scoped>
.preview-3d {
  min-height: 100vh;
  background: #FAFAFA;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.preview-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  perspective: 1000px;
}

.card-3d {
  width: 200px;
  height: 280px;
  transition: transform 0.1s ease-out;
  transform-style: preserve-3d;
  cursor: grab;
}

.card-3d:active {
  cursor: grabbing;
}

.card-face {
  width: 100%;
  height: 100%;
  background: #fff;
  border-radius: 12px;
  border-style: solid;
  position: relative;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  backface-visibility: hidden;
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
  font-size: 24px;
  pointer-events: none;
}

.frame-indicator {
  width: 100%;
  max-width: 200px;
  margin-top: 24px;
  text-align: center;
}

.indicator-bar {
  height: 4px;
  background: #E5E7EB;
  border-radius: 2px;
  overflow: hidden;
}

.indicator-progress {
  height: 100%;
  background: #1A1A1A;
  transition: width 0.1s;
}

.indicator-text {
  display: block;
  font-size: 12px;
  color: #9CA3AF;
  margin-top: 8px;
}

.hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #9CA3AF;
  margin-top: 16px;
}

.actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.actions .van-button {
  border-color: #E5E7EB;
  color: #1A1A1A;
}

.actions .van-button.active {
  border-color: #1A1A1A;
  background: #1A1A1A;
  color: #fff;
}

.footer {
  padding: 16px;
  display: flex;
  gap: 12px;
  background: #fff;
}

.btn-primary {
  flex: 1;
  background: #1A1A1A !important;
  border-color: #1A1A1A !important;
}

.btn-secondary {
  flex: 1;
  background: #fff !important;
  border-color: #E5E7EB !important;
  color: #1A1A1A !important;
}
</style>
