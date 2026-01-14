<template>
  <div class="video-cropper">
    <div class="cropper-header">
      <h3 class="title">裁剪视频</h3>
      <div class="header-actions">
        <van-button size="small" @click="handleCancel">取消</van-button>
        <van-button 
          type="primary" 
          size="small"
          :disabled="!isValidRange"
          @click="handleConfirm"
        >
          确认
        </van-button>
      </div>
    </div>

    <div class="video-preview-container">
      <video 
        ref="videoRef"
        :src="videoUrl" 
        class="video-preview"
        @loadedmetadata="handleVideoLoaded"
        @timeupdate="handleTimeUpdate"
      />
      <div class="current-time">{{ formatTime(currentTime) }}</div>
    </div>

    <div class="timeline-container">
      <div class="timeline">
        <div 
          class="timeline-track"
          ref="timelineTrack"
          @mousedown="handleTrackClick"
          @touchstart="handleTrackClick"
        >
          <!-- 最大范围引导线 -->
          <div 
            v-for="guide in guideLines" 
            :key="guide.id"
            class="guide-line"
            :class="{ active: guide.active }"
            :style="{ left: `${guide.percent}%` }"
          >
            <div class="guide-marker"></div>
            <div class="guide-label">{{ guide.label }}</div>
          </div>
          
          <!-- 选中区域 -->
          <div 
            class="selected-range"
            :class="{ 
              valid: isValidRange, 
              warning: duration > 4.5 && duration <= 5,
              invalid: !isValidRange 
            }"
            :style="selectedRangeStyle"
          >
            <div class="range-duration">{{ formatTime(duration) }}</div>
          </div>
          
          <!-- 左侧滑块 -->
          <div 
            class="slider slider-start"
            :class="{ dragging: isDragging && dragType === 'start' }"
            :style="{ left: `${startPercent}%` }"
            @mousedown.stop="startDrag('start', $event)"
            @touchstart.stop="startDrag('start', $event)"
          >
            <div class="slider-line"></div>
            <div class="slider-dot">
              <div class="dot-inner"></div>
            </div>
            <div class="slider-time">{{ formatTime(startTime) }}</div>
          </div>
          
          <!-- 右侧滑块 -->
          <div 
            class="slider slider-end"
            :class="{ dragging: isDragging && dragType === 'end' }"
            :style="{ left: `${endPercent}%` }"
            @mousedown.stop="startDrag('end', $event)"
            @touchstart.stop="startDrag('end', $event)"
          >
            <div class="slider-line"></div>
            <div class="slider-dot">
              <div class="dot-inner"></div>
            </div>
            <div class="slider-time">{{ formatTime(endTime) }}</div>
          </div>
        </div>
      </div>

      <div class="status-hint" :class="statusClass">
        <van-icon :name="statusIcon" />
        <span>{{ statusText }}</span>
      </div>
    </div>

    <div class="controls">
      <van-button 
        size="small"
        plain
        @click="playPreview"
        :icon="isPlaying ? 'pause' : 'play'"
      >
        {{ isPlaying ? '暂停' : '预览' }}
      </van-button>
      <van-button 
        size="small"
        plain
        @click="resetRange"
      >
        重置
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Button as VanButton } from 'vant'

interface Props {
  videoUrl: string
  maxDuration?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxDuration: 5
})

const emit = defineEmits<{
  confirm: [{ startTime: number; endTime: number; duration: number }]
  cancel: []
}>()

const videoRef = ref<HTMLVideoElement | null>(null)
const timelineTrack = ref<HTMLDivElement | null>(null)
const videoDuration = ref(0)
const currentTime = ref(0)
const startTime = ref(0)
const endTime = ref(5)
const isPlaying = ref(false)
const isDragging = ref(false)
const dragType = ref<'start' | 'end' | null>(null)

const duration = computed(() => endTime.value - startTime.value)
const startPercent = computed(() => (startTime.value / videoDuration.value) * 100)
const endPercent = computed(() => (endTime.value / videoDuration.value) * 100)
const selectedRangeStyle = computed(() => ({
  left: `${startPercent.value}%`,
  width: `${endPercent.value - startPercent.value}%`
}))
const isValidRange = computed(() => {
  const d = duration.value
  return d >= 1 && d <= props.maxDuration
})

// 引导线：显示从起点开始的最大5秒范围
const guideLines = computed(() => {
  const lines = []
  const maxDuration = props.maxDuration
  
  // 如果视频总时长 <= 5秒，不需要引导线
  if (videoDuration.value <= maxDuration) return []
  
  // 从当前起点计算最大范围
  const maxEndTime = Math.min(startTime.value + maxDuration, videoDuration.value)
  const maxEndPercent = (maxEndTime / videoDuration.value) * 100
  
  // 只在起点滑块被拖动或选择范围接近最大值时显示引导线
  const showGuide = isDragging.value || duration.value > maxDuration - 1
  
  if (showGuide && maxEndTime < videoDuration.value) {
    lines.push({
      id: 'max-range',
      percent: maxEndPercent,
      label: '最大范围',
      active: duration.value > maxDuration - 0.5
    })
  }
  
  return lines
})

// 状态提示
const statusClass = computed(() => {
  if (!isValidRange.value) {
    if (duration.value < 1) return 'status-error'
    if (duration.value > props.maxDuration) return 'status-error'
  }
  if (duration.value > 4.5 && duration.value <= 5) return 'status-warning'
  return 'status-success'
})

const statusIcon = computed(() => {
  const cls = statusClass.value
  if (cls === 'status-error') return 'warning-o'
  if (cls === 'status-warning') return 'info-o'
  return 'success'
})

const statusText = computed(() => {
  const d = duration.value
  if (d < 1) return '时长不足1秒，请继续选择'
  if (d > props.maxDuration) return `时长超过${props.maxDuration}秒，请缩短范围`
  if (d > 4.5) return '已接近最大时长'
  return `已选择 ${formatTime(d)}，可继续调整`
})

const formatTime = (seconds: number) => {
  const s = Math.floor(seconds * 10) / 10
  return `${s.toFixed(1)}s`
}

const handleVideoLoaded = () => {
  if (!videoRef.value) return
  videoDuration.value = videoRef.value.duration
  endTime.value = Math.min(props.maxDuration, videoDuration.value)
}

const handleTimeUpdate = () => {
  if (!videoRef.value) return
  currentTime.value = videoRef.value.currentTime
  
  if (isPlaying.value && currentTime.value >= endTime.value) {
    videoRef.value.pause()
    videoRef.value.currentTime = startTime.value
    isPlaying.value = false
  }
}

const handleTrackClick = (e: MouseEvent | TouchEvent) => {
  if (!timelineTrack.value || !videoRef.value) return
  
  const rect = timelineTrack.value.getBoundingClientRect()
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  const percent = (clientX - rect.left) / rect.width
  const time = percent * videoDuration.value
  
  videoRef.value.currentTime = time
  currentTime.value = time
}

const startDrag = (type: 'start' | 'end', e: MouseEvent | TouchEvent) => {
  isDragging.value = true
  dragType.value = type
  
  const handleMove = (moveE: MouseEvent | TouchEvent) => {
    if (!isDragging.value || !timelineTrack.value) return
    
    const rect = timelineTrack.value.getBoundingClientRect()
    const clientX = 'touches' in moveE ? moveE.touches[0].clientX : moveE.clientX
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const time = percent * videoDuration.value
    
    if (type === 'start') {
      startTime.value = Math.max(0, Math.min(time, endTime.value - 1))
    } else {
      endTime.value = Math.min(videoDuration.value, Math.max(time, startTime.value + 1))
    }
    
    if (videoRef.value) {
      videoRef.value.currentTime = type === 'start' ? startTime.value : endTime.value
    }
  }
  
  const handleEnd = () => {
    isDragging.value = false
    dragType.value = null
    document.removeEventListener('mousemove', handleMove)
    document.removeEventListener('mouseup', handleEnd)
    document.removeEventListener('touchmove', handleMove)
    document.removeEventListener('touchend', handleEnd)
  }
  
  document.addEventListener('mousemove', handleMove)
  document.addEventListener('mouseup', handleEnd)
  document.addEventListener('touchmove', handleMove)
  document.addEventListener('touchend', handleEnd)
}

const playPreview = () => {
  if (!videoRef.value) return
  
  if (isPlaying.value) {
    videoRef.value.pause()
    isPlaying.value = false
  } else {
    videoRef.value.currentTime = startTime.value
    videoRef.value.play()
    isPlaying.value = true
  }
}

const resetRange = () => {
  startTime.value = 0
  endTime.value = Math.min(props.maxDuration, videoDuration.value)
  if (videoRef.value) {
    videoRef.value.currentTime = 0
    videoRef.value.pause()
  }
  isPlaying.value = false
}

const handleConfirm = () => {
  if (!isValidRange.value) return
  emit('confirm', {
    startTime: startTime.value,
    endTime: endTime.value,
    duration: duration.value
  })
}

const handleCancel = () => {
  emit('cancel')
}

onMounted(() => {
  if (videoRef.value) {
    videoRef.value.load()
  }
})

onUnmounted(() => {
  if (videoRef.value) {
    videoRef.value.pause()
  }
})
</script>

<style scoped>
.video-cropper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #FAFAFA;
  overflow: hidden;
}

.cropper-header {
  padding: 12px 16px;
  background: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #F3F4F6;
  flex-shrink: 0;
}

.title {
  font-size: 17px;
  font-weight: 500;
  color: #1A1A1A;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.video-preview-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  position: relative;
}

.video-preview {
  max-width: 100%;
  max-height: 100%;
  border-radius: 12px;
  background: #000;
}

.current-time {
  position: absolute;
  top: 24px;
  right: 24px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
}

.timeline-container {
  padding: 24px 16px;
  background: #fff;
}

.timeline {
  position: relative;
  padding: 0 12px;
}

.timeline-track {
  height: 48px;
  background: #F3F4F6;
  border-radius: 8px;
  position: relative;
  cursor: pointer;
}

.guide-line {
  position: absolute;
  top: -8px;
  bottom: -8px;
  width: 2px;
  background: #D1D5DB;
  pointer-events: none;
  transition: all 0.3s ease;
  z-index: 5;
}

.guide-line.active {
  background: #F59E0B;
  width: 3px;
}

.guide-marker {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  background: currentColor;
  border-radius: 50%;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.2);
}

.guide-line.active .guide-marker {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.2);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(245, 158, 11, 0.1);
  }
}

.guide-label {
  position: absolute;
  top: -28px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 11px;
  color: #9CA3AF;
  white-space: nowrap;
  background: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.guide-line.active .guide-label {
  color: #F59E0B;
  font-weight: 500;
}

.selected-range {
  position: absolute;
  top: 0;
  height: 100%;
  background: rgba(26, 26, 26, 0.15);
  border-radius: 8px;
  pointer-events: none;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.selected-range.valid {
  background: rgba(59, 130, 246, 0.2);
}

.selected-range.warning {
  background: rgba(245, 158, 11, 0.25);
}

.selected-range.invalid {
  background: rgba(239, 68, 68, 0.25);
}

.range-duration {
  font-size: 13px;
  font-weight: 600;
  color: #1A1A1A;
  background: rgba(255, 255, 255, 0.95);
  padding: 3px 10px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.slider {
  position: absolute;
  top: 0;
  bottom: 0;
  transform: translateX(-50%);
  cursor: grab;
  z-index: 15;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.slider:active,
.slider.dragging {
  cursor: grabbing;
}

.slider-line {
  width: 3px;
  height: 100%;
  background: #1A1A1A;
  border-radius: 2px;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
  transition: all 0.2s;
  position: relative;
  top: 0;
}

.slider.dragging .slider-line {
  width: 4px;
  background: #3B82F6;
  box-shadow: 0 0 12px rgba(59, 130, 246, 0.4);
}

.slider-dot {
  position: absolute;
  top: -8px;
  width: 20px;
  height: 20px;
  background: #fff;
  border: 3px solid #1A1A1A;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.slider.dragging .slider-dot {
  transform: scale(1.2);
  border-color: #3B82F6;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
}

.dot-inner {
  width: 6px;
  height: 6px;
  background: #1A1A1A;
  border-radius: 50%;
  transition: background 0.2s;
}

.slider.dragging .dot-inner {
  background: #3B82F6;
}

.slider-time {
  position: absolute;
  top: -32px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  font-weight: 500;
  color: #1A1A1A;
  background: #fff;
  padding: 4px 8px;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.2s;
}

.slider.dragging .slider-time,
.slider:hover .slider-time {
  opacity: 1;
}

.time-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  font-size: 12px;
  color: #9CA3AF;
  padding: 0 12px;
}

.duration-label {
  color: #1A1A1A;
  font-weight: 500;
}

.status-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  margin-top: 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.status-success {
  background: rgba(34, 197, 94, 0.1);
  color: #16A34A;
}

.status-warning {
  background: rgba(245, 158, 11, 0.15);
  color: #D97706;
}

.status-error {
  background: rgba(239, 68, 68, 0.15);
  color: #DC2626;
}

.controls {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 16px;
  background: #fff;
  border-top: 1px solid #F3F4F6;
}

.footer {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #fff;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
}

.footer .van-button {
  flex: 1;
}
</style>
