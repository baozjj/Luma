import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCardStore = defineStore('card', () => {
  const videoFile = ref(null)
  const videoUrl = ref('')
  const frames = ref([])
  const frameRate = ref(8)
  const stickers = ref([])
  const borderColor = ref('#FFFFFF')
  const borderWidth = ref('narrow')
  
  const works = ref([])

  function setVideo(file) {
    videoFile.value = file
    videoUrl.value = URL.createObjectURL(file)
  }

  function setFrames(frameList) {
    frames.value = frameList
  }

  function setFrameRate(rate) {
    frameRate.value = rate
  }

  function addSticker(sticker) {
    stickers.value.push({
      id: Date.now(),
      ...sticker,
      x: 50,
      y: 50,
      scale: 1,
      rotation: 0
    })
  }

  function updateSticker(id, updates) {
    const index = stickers.value.findIndex(s => s.id === id)
    if (index !== -1) {
      stickers.value[index] = { ...stickers.value[index], ...updates }
    }
  }

  function removeSticker(id) {
    stickers.value = stickers.value.filter(s => s.id !== id)
  }

  function clearStickers() {
    stickers.value = []
  }

  function saveWork() {
    const work = {
      id: Date.now(),
      frames: [...frames.value],
      stickers: [...stickers.value],
      borderColor: borderColor.value,
      borderWidth: borderWidth.value,
      createdAt: new Date().toISOString(),
      status: 'completed'
    }
    works.value.unshift(work)
    return work
  }

  function reset() {
    videoFile.value = null
    videoUrl.value = ''
    frames.value = []
    frameRate.value = 8
    stickers.value = []
    borderColor.value = '#FFFFFF'
    borderWidth.value = 'narrow'
  }

  return {
    videoFile,
    videoUrl,
    frames,
    frameRate,
    stickers,
    borderColor,
    borderWidth,
    works,
    setVideo,
    setFrames,
    setFrameRate,
    addSticker,
    updateSticker,
    removeSticker,
    clearStickers,
    saveWork,
    reset
  }
}, {
  persist: true
})
