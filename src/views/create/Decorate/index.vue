<template>
  <div class="decorate">
    <van-nav-bar 
      title="边框装饰" 
      left-arrow 
      @click-left="goBack"
      fixed
      placeholder
    />

    <div 
      class="card-container"
      ref="cardContainer"
      @drop="handleDrop"
      @dragover.prevent
    >
      <div 
        class="card-preview"
        :style="cardStyle"
      >
        <div class="card-inner">
          <img 
            v-if="currentFrame" 
            :src="currentFrame" 
            alt=""
            class="card-image"
          />
        </div>
        
        <CardSticker
          v-for="sticker in stickers" 
          :key="sticker.id"
          :sticker="sticker"
          :is-active="activeSticker === sticker.id"
          @drag-start="startStickerDrag($event, sticker)"
          @select="selectSticker(sticker.id)"
          @delete="removeSticker(sticker.id)"
        />
      </div>
    </div>

    <FloatingToolbar
      v-model:expanded="toolbarExpanded"
      v-model:position="fabPosition"
      v-model:menu-position="toolMenuPosition"
      @tool-select="openTool"
      @clear-all="clearAll"
      @complete="nextStep"
    />

    <BorderSettingsPanel
      :visible="activeTool === 'border'"
      v-model="borderSettings"
      @close="activeTool = null"
    />

    <StickerPanel
      :visible="activeTool === 'sticker'"
      @close="activeTool = null"
      @add-sticker="addStickerToCenter"
      @drag-start="draggedIcon = $event"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NavBar as VanNavBar, showToast } from 'vant'
import { useCardStore } from '@/stores/card'
import FloatingToolbar from './components/FloatingToolbar.vue'
import BorderSettingsPanel from './components/BorderSettingsPanel.vue'
import StickerPanel from './components/StickerPanel.vue'
import CardSticker from './components/CardSticker.vue'

const router = useRouter()
const cardStore = useCardStore()

const cardContainer = ref(null)
const activeSticker = ref(null)
const toolbarExpanded = ref(false)
const activeTool = ref(null)
const fabPosition = ref('right')
const toolMenuPosition = ref('top')

const borderSettings = ref({
  color: '#FFFFFF',
  width: 'medium'
})

const stickers = ref([])
const draggedIcon = ref(null)
const draggingSticker = ref(null)

const currentFrame = computed(() => cardStore.frames[0])

const cardStyle = computed(() => ({
  borderColor: borderSettings.value.color,
  borderWidth: borderWidthPx.value
}))

const borderWidthPx = computed(() => {
  const map = { narrow: '8px', medium: '16px', wide: '24px' }
  return map[borderSettings.value.width]
})

function goBack() {
  router.back()
}

function openTool(tool) {
  activeTool.value = tool
  toolbarExpanded.value = false
}

function clearAll() {
  stickers.value = []
  activeSticker.value = null
  toolbarExpanded.value = false
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

function startStickerDrag(e, sticker) {
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
  cardStore.borderColor = borderSettings.value.color
  cardStore.borderWidth = borderSettings.value.width
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
  borderSettings.value.color = cardStore.borderColor
  borderSettings.value.width = cardStore.borderWidth
})
</script>

<style scoped>
.decorate {
  height: 100vh;
  background: #F5F5F7;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.card-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow: hidden;
}

.card-preview {
  width: min(85vw, 360px);
  height: min(85vh, 504px);
  max-height: calc(100vh - 140px);
  background: #fff;
  border-radius: 16px;
  border-style: solid;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  transition: all 0.3s ease;
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
</style>
