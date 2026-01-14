<template>
  <section class="section">
    <h3 class="section-title">制作流程</h3>
    <div class="steps">
      <div 
        v-for="(step, index) in steps" 
        :key="index"
        class="step"
      >
        <div class="step-icon">{{ index + 1 }}</div>
        <div class="step-text">{{ step }}</div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Props {
  steps: string[]
}

defineProps<Props>()
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
</style>
