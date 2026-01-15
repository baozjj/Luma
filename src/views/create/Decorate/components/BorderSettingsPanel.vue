<template>
  <transition name="slide-up">
    <div v-if="visible" class="tool-panel">
      <div class="panel-header">
        <span class="panel-title">边框设置</span>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>
      <div class="panel-body">
        <div class="setting-group">
          <div class="setting-label">颜色</div>
          <div class="color-options">
            <div
              v-for="color in colors"
              :key="color"
              class="color-item"
              :class="{ active: modelValue.color === color }"
              :style="{ background: color }"
              @click="updateColor(color)"
            />
          </div>
        </div>
        <div class="setting-group">
          <div class="setting-label">宽度</div>
          <div class="width-options">
            <div
              v-for="w in widths"
              :key="w.value"
              class="width-item"
              :class="{ active: modelValue.width === w.value }"
              @click="updateWidth(w.value)"
            >
              {{ w.label }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
const props = defineProps({
  visible: Boolean,
  modelValue: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["close", "update:modelValue"]);

const colors = [
  "#FFFFFF",
  "#1A1A1A",
  "#F3F4F6",
  "#FEE2E2",
  "#DBEAFE",
  "#D1FAE5",
  "#FEF3C7",
];
const widths = [
  { value: "narrow", label: "窄" },
  { value: "medium", label: "中" },
  { value: "wide", label: "宽" },
];

function updateColor(color) {
  emit("update:modelValue", { ...props.modelValue, color });
}

function updateWidth(width) {
  emit("update:modelValue", { ...props.modelValue, width });
}
</script>

<style scoped>
.tool-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-radius: 24px 24px 0 0;
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.15);
  max-height: 40vh;
  z-index: 998;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f3f4f6;
}

.panel-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f3f4f6;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:active {
  background: #e5e7eb;
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
}

.setting-group {
  margin-bottom: 24px;
}

.setting-group:last-child {
  margin-bottom: 0;
}

.setting-label {
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 12px;
  display: block;
}

.color-options {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.color-item {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 3px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.color-item.active {
  border-color: #1a1a1a;
  transform: scale(1.1);
}

.width-options {
  display: flex;
  gap: 12px;
}

.width-item {
  flex: 1;
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  background: #f3f4f6;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;
}

.width-item.active {
  background: #1a1a1a;
  color: #fff;
  transform: scale(1.05);
}

.slide-up-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter-from {
  transform: translateY(100%);
}

.slide-up-leave-to {
  transform: translateY(100%);
}
</style>
