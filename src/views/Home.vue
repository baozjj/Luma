<template>
  <div class="home">
    <header class="header">
      <h1 class="logo">Luma</h1>
    </header>

    <div class="hero">
      <h2 class="hero-title">创建你的光栅卡</h2>
      <p class="hero-desc">上传视频，定制边框，生成独一无二的动态卡片</p>
      <van-button 
        type="primary" 
        size="large" 
        round 
        class="create-btn"
        @click="goCreate"
      >
        开始制作
      </van-button>
    </div>

    <section class="section">
      <h3 class="section-title">制作流程</h3>
      <div class="steps">
        <div class="step" v-for="(step, index) in steps" :key="index">
          <div class="step-icon">{{ index + 1 }}</div>
          <div class="step-text">{{ step }}</div>
        </div>
      </div>
    </section>

    <section class="section">
      <h3 class="section-title">灵感案例</h3>
      <div class="gallery">
        <div class="gallery-item" v-for="i in 4" :key="i">
          <div class="gallery-placeholder"></div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { Button as VanButton } from 'vant'

const router = useRouter()

const steps = [
  '上传视频',
  '抽帧预览',
  '装饰边框',
  '3D预览'
]

function goCreate() {
  router.push('/create')
}
</script>

<style scoped>
.home {
  padding: 16px;
}

.header {
  padding: 8px 0 24px;
}

.logo {
  font-size: 24px;
  font-weight: 600;
  color: #1A1A1A;
}

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

.section {
  margin-top: 40px;
}

.section-title {
  font-size: 18px;
  font-weight: 500;
  color: #1A1A1A;
  margin-bottom: 16px;
}

.steps {
  display: flex;
  justify-content: space-between;
}

.step {
  flex: 1;
  text-align: center;
}

.step-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #1A1A1A;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 8px;
  font-size: 16px;
  font-weight: 500;
}

.step-text {
  font-size: 12px;
  color: #9CA3AF;
}

.gallery {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.gallery-item {
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
}

.gallery-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #E5E7EB 0%, #D1D5DB 100%);
}
</style>
