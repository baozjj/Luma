<template>
  <div class="video-upload">
    <!-- 裁剪模式 -->
    <van-popup 
      v-model:show="showCropper" 
      position="bottom"
      :style="{ height: '100%' }"
      :close-on-click-overlay="false"
    >
      <VideoCropper 
        v-if="showCropper"
        :video-url="videoUrl"
        @confirm="handleCropConfirm"
        @cancel="handleCropCancel"
      />
    </van-popup>

    <!-- 上传模式 -->
    <van-nav-bar 
      title="上传视频" 
      left-arrow 
      @click-left="goBack"
    />

    <div class="content">
      <div class="upload-area" @click="triggerUpload">
        <template v-if="!videoUrl">
          <van-icon name="video-o" size="48" color="#9CA3AF" />
          <p class="upload-text">点击上传视频</p>
          <p class="upload-hint">支持 MP4、MOV，≤50MB</p>
        </template>
        <template v-else>
          <video 
            ref="videoRef"
            :src="croppedVideoUrl || videoUrl" 
            class="video-preview"
            controls
            playsinline
          />
        </template>
      </div>

      <input 
        ref="fileInput"
        type="file" 
        accept="video/mp4,video/quicktime"
        class="hidden"
        @change="handleFileChange"
      />

      <div v-if="videoUrl" class="video-info">
        <div class="info-item">
          <span class="label">时长</span>
          <span class="value">{{ displayDuration }}秒</span>
        </div>
        <div class="info-item">
          <span class="label">大小</span>
          <span class="value">{{ fileSize }}MB</span>
        </div>
        <van-button 
          v-if="needsCrop"
          size="small"
          type="primary"
          plain
          @click="openCropper"
        >
          裁剪视频
        </van-button>
      </div>

      <div v-if="error" class="error-msg">
        <van-icon name="warning-o" />
        {{ error }}
      </div>

      <div v-if="needsCrop && !isCropped" class="warning-msg">
        <van-icon name="info-o" />
        视频时长超过5秒，请裁剪后继续
      </div>
    </div>

    <div class="footer">
      <van-button 
        v-if="videoUrl"
        type="default" 
        size="large"
        class="btn-secondary"
        @click="reupload"
      >
        重新上传
      </van-button>
      <van-button 
        type="primary" 
        size="large"
        :disabled="!canProceed"
        class="btn-primary"
        @click="nextStep"
      >
        下一步
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { NavBar as VanNavBar, Icon as VanIcon, Button as VanButton, Popup as VanPopup, showToast } from 'vant'
import { useCardStore } from '@/stores/card'
import VideoCropper from './components/VideoCropper/index.vue'

const router = useRouter()
const cardStore = useCardStore()

const fileInput = ref<HTMLInputElement | null>(null)
const videoRef = ref<HTMLVideoElement | null>(null)
const videoUrl = ref('')
const croppedVideoUrl = ref('')
const duration = ref(0)
const croppedDuration = ref(0)
const fileSize = ref(0)
const error = ref('')
const showCropper = ref(false)
const isCropped = ref(false)

const needsCrop = computed(() => duration.value > 5)
const displayDuration = computed(() => isCropped.value ? croppedDuration.value : duration.value)

const canProceed = computed(() => {
  if (!videoUrl.value) return false
  if (needsCrop.value && !isCropped.value) return false
  const d = displayDuration.value
  return d >= 1 && d <= 5 && !error.value
})

const goBack = () => {
  router.back()
}

const triggerUpload = () => {
  fileInput.value?.click()
}

const openCropper = () => {
  showCropper.value = true
}

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  error.value = ''
  
  const sizeMB = file.size / (1024 * 1024)
  if (sizeMB > 50) {
    error.value = '视频大小不能超过50MB'
    return
  }
  fileSize.value = Number(sizeMB.toFixed(1))

  const url = URL.createObjectURL(file)
  videoUrl.value = url

  const video = document.createElement('video')
  video.src = url
  video.onloadedmetadata = () => {
    duration.value = Math.round(video.duration * 10) / 10
    if (video.duration > 5) {
      error.value = '视频时长超过5秒，请裁剪后上传'
    } else if (video.duration < 1) {
      error.value = '视频时长不足1秒'
    }
  }

  cardStore.setVideo(file)
}

const handleCropConfirm = async ({ startTime, endTime, duration: cropDuration }: { startTime: number; endTime: number; duration: number }) => {
  showCropper.value = false
  isCropped.value = true
  croppedDuration.value = Math.round(cropDuration * 10) / 10
  error.value = ''
  
  showToast({
    message: '裁剪成功',
    icon: 'success'
  })
  
  cardStore.cropInfo = { startTime, endTime }
}

const handleCropCancel = () => {
  showCropper.value = false
}

const reupload = () => {
  videoUrl.value = ''
  croppedVideoUrl.value = ''
  duration.value = 0
  croppedDuration.value = 0
  fileSize.value = 0
  error.value = ''
  isCropped.value = false
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const nextStep = () => {
  if (!canProceed.value) return
  router.push('/create/frames')
}
</script>

<style scoped>
.video-upload {
  min-height: 100vh;
  background: #FAFAFA;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  padding: 24px 16px;
}

.upload-area {
  background: #fff;
  border: 2px dashed #E5E7EB;
  border-radius: 12px;
  min-height: 240px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.2s;
}

.upload-area:active {
  border-color: #9CA3AF;
}

.upload-text {
  font-size: 16px;
  color: #1A1A1A;
  margin-top: 16px;
}

.upload-hint {
  font-size: 12px;
  color: #9CA3AF;
  margin-top: 8px;
}

.video-preview {
  width: 100%;
  max-height: 300px;
  border-radius: 10px;
}

.hidden {
  display: none;
}

.video-info {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
  margin-top: 24px;
  flex-wrap: wrap;
}

.info-item {
  text-align: center;
}

.label {
  display: block;
  font-size: 12px;
  color: #9CA3AF;
  margin-bottom: 4px;
}

.value {
  font-size: 16px;
  font-weight: 500;
  color: #1A1A1A;
}

.error-msg {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #EF4444;
  font-size: 14px;
  margin-top: 16px;
}

.warning-msg {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #F59E0B;
  font-size: 14px;
  margin-top: 16px;
  padding: 12px;
  background: #FEF3C7;
  border-radius: 8px;
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
