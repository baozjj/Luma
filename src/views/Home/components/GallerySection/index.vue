<template>
  <section class="section">
    <h3 class="section-title">灵感案例</h3>
    <div class="gallery">
      <div 
        v-for="i in count" 
        :key="i"
        class="gallery-item"
      >
        <div class="gallery-placeholder"></div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Props {
  count?: number
}

withDefaults(defineProps<Props>(), {
  count: 4
})
</script>

<style scoped>
.section {
  margin-top: 40px;
}

.section-title {
  font-size: 18px;
  font-weight: 500;
  color: #1A1A1A;
  margin-bottom: 16px;
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
