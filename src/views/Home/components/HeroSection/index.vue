<template>
  <div class="hero">
    <h2 class="hero-title">创建你的光栅卡</h2>
    <p class="hero-desc">上传视频，定制边框，生成独一无二的动态卡片</p>
    <van-button 
      type="primary" 
      size="large" 
      round 
      class="create-btn"
      @click="handleCreate"
    >
      开始制作
    </van-button>
  </div>
</template>

<script setup lang="ts">
import { Button as VanButton } from 'vant'

const emit = defineEmits<{
  create: []
}>()

const handleCreate = () => {
  emit('create')
}
</script>

<style scoped>
.hero {
  text-align: center;
  padding: 40px 0;
}

.hero-title {
  font-size: 28px;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 12px;
}

.hero-desc {
  font-size: 14px;
  color: #9CA3AF;
  margin-bottom: 32px;
}

.create-btn {
  width: 200px;
  background: #1A1A1A !important;
  border-color: #1A1A1A !important;
  position: relative;
  z-index: 10;
  cursor: pointer;
}
</style>
