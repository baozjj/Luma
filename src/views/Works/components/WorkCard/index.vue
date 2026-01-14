<template>
  <div class="work-card">
    <div class="work-preview">
      <img 
        v-if="work.frames[0]" 
        :src="work.frames[0]" 
        alt="预览"
      />
      <div v-else class="work-placeholder"></div>
    </div>
    <div class="work-info">
      <span class="work-date">{{ formatDate(work.createdAt) }}</span>
      <van-tag type="success" size="small">已完成</van-tag>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Tag as VanTag } from 'vant'
import type { Work } from '@/types'

interface Props {
  work: Work
}

defineProps<Props>()

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}
</script>

<style scoped>
.work-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
}

.work-preview {
  aspect-ratio: 1;
  background: #F3F4F6;
}

.work-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.work-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #E5E7EB 0%, #D1D5DB 100%);
}

.work-info {
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.work-date {
  font-size: 12px;
  color: #9CA3AF;
}
</style>
