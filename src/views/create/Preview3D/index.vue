<template>
  <div class="preview-3d">
    <van-nav-bar
      title="3D预览"
      left-arrow
      @click-left="goBack"
      fixed
      placeholder
    />

    <div class="content">
      <div class="preview-container">
        <LenticularCard
          :frames="frames"
          :frame-count="frameCount"
          :stickers="stickers"
          :border-color="borderColor"
          :border-width="borderWidth"
        />
      </div>

      <div class="hint">
        <van-icon name="info-o" />
        <span>移动鼠标或倾斜设备查看光栅卡效果</span>
      </div>
    </div>

    <div class="footer">
      <van-button
        type="default"
        size="large"
        class="btn-secondary"
        @click="goBack"
      >
        返回编辑
      </van-button>
      <van-button
        type="primary"
        size="large"
        class="btn-primary"
        @click="saveWork"
      >
        保存作品
      </van-button>
    </div>

    <van-action-sheet
      v-model:show="showExport"
      title="导出选项"
      :actions="exportActions"
      @select="handleExport"
      cancel-text="取消"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import {
  NavBar as VanNavBar,
  Icon as VanIcon,
  Button as VanButton,
  ActionSheet as VanActionSheet,
  showToast,
  showSuccessToast,
} from "vant";
import { useCardStore } from "@/stores/card";
import LenticularCard from "./components/LenticularCard.vue";

const router = useRouter();
const cardStore = useCardStore();

const frames = computed(() => cardStore.frames);
const frameCount = computed(() => cardStore.frameRate || frames.value.length);
const stickers = computed(() => cardStore.stickers);
const borderColor = computed(() => cardStore.borderColor);
const borderWidth = computed(() => cardStore.borderWidth);

const borderWidthPx = computed(() => {
  const map = { narrow: "8px", medium: "16px", wide: "24px" };
  return map[borderWidth.value];
});

const showExport = ref(false);

const exportActions = [
  { name: "保存至作品集", value: "save" },
  { name: "导出预览图", value: "image" },
  { name: "导出GIF动图", value: "gif" },
];

function goBack() {
  router.back();
}

function saveWork() {
  showExport.value = true;
}

function handleExport(action: any) {
  showExport.value = false;

  if (action.value === "save") {
    cardStore.saveWork();
    showSuccessToast("已保存至作品集");
    setTimeout(() => {
      cardStore.reset();
      router.push("/works");
    }, 1000);
  } else if (action.value === "image") {
    showToast("正在生成预览图...");
  } else if (action.value === "gif") {
    showToast("正在生成GIF...");
  }
}

onMounted(() => {
  if (!cardStore.frames.length) {
    showToast("请先完成制作流程");
    router.push("/create");
  }
});
</script>

<style scoped>
.preview-3d {
  height: 100vh;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content {
  flex: 1;
  padding: 70px 16px;
  padding-bottom: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
}

.preview-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 600px;
  max-height: calc(100vh - 200px);
  perspective: 1000px;
}

.card-3d {
  width: 200px;
  height: 280px;
  transition: transform 0.1s ease-out;
  transform-style: preserve-3d;
  cursor: grab;
}

.card-3d:active {
  cursor: grabbing;
}

.card-face {
  width: 100%;
  height: 100%;
  background: #fff;
  border-radius: 12px;
  border-style: solid;
  position: relative;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  backface-visibility: hidden;
}

.card-inner {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.sticker {
  position: absolute;
  font-size: 24px;
  pointer-events: none;
}

.frame-indicator {
  width: 100%;
  max-width: 200px;
  margin-top: 24px;
  text-align: center;
}

.indicator-bar {
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
}

.indicator-progress {
  height: 100%;
  background: #1a1a1a;
  transition: width 0.1s;
}

.indicator-text {
  display: block;
  font-size: 12px;
  color: #9ca3af;
  margin-top: 8px;
}

.hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #9ca3af;
  margin-top: 16px;
}

.actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.actions .van-button {
  border-color: #e5e7eb;
  color: #1a1a1a;
}

.actions .van-button.active {
  border-color: #1a1a1a;
  background: #1a1a1a;
  color: #fff;
}

.footer {
  padding: 16px;
  display: flex;
  gap: 12px;
  background: #fff;
}

.btn-primary {
  flex: 1;
  background: #1a1a1a !important;
  border-color: #1a1a1a !important;
}

.btn-secondary {
  flex: 1;
  background: #fff !important;
  border-color: #e5e7eb !important;
  color: #1a1a1a !important;
}
</style>
