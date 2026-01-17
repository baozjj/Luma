<template>
  <div class="home">
    <header class="header">
      <h1 class="logo">Luma</h1>
    </header>

    <HeroSection @create="handleCreate" />
    <StepsSection :steps="steps" />
    <GallerySection :count="4" />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import HeroSection from "./components/HeroSection/index.vue";
import StepsSection from "./components/StepsSection/index.vue";
import GallerySection from "./components/GallerySection/index.vue";

const router = useRouter();

const steps = ["选择帧率", "上传图片", "装饰边框", "3D预览"];

const handleCreate = () => {
  router.push("/create");
};
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
</style>
