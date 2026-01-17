<template>
  <div class="home">
    <header class="header">
      <h1 class="logo">Luma</h1>
    </header>

    <div class="hero">
      <h2 class="hero-title">创建你的光栅卡</h2>
      <p class="hero-desc">
        选择帧率并上传图片，定制边框，生成独一无二的动态卡片
      </p>
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
import { useRouter } from "vue-router";
import { Button as VanButton } from "vant";

const router = useRouter();

const steps = ["选择帧率", "上传图片", "装饰边框", "3D预览"];

function goCreate() {
  router.push("/create");
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
  color: #1a1a1a;
}

.hero {
  text-align: center;
  padding: 40px 0;
}

.hero-title {
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 12px;
}

.hero-desc {
  font-size: 14px;
  color: #9ca3af;
  margin-bottom: 32px;
}

.create-btn {
  width: 200px;
  background: #1a1a1a !important;
  border-color: #1a1a1a !important;
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
  color: #1a1a1a;
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
  background: #1a1a1a;
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
  color: #9ca3af;
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
  background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%);
}
</style>
