<template>
  <div class="frame-edit">
    <van-nav-bar title="帧序列预览" left-arrow @click-left="goBack" />

    <div class="content">
      <div class="preview-area">
        <div class="card-preview">
          <img
            v-if="currentFrame"
            :src="currentFrame"
            alt="当前帧"
            class="frame-image"
          />
          <div v-else class="frame-placeholder">
            <van-loading size="24" />
          </div>
        </div>
        <p class="frame-index">{{ currentIndex + 1 }} / {{ frames.length }}</p>
      </div>

      <div class="frames-section">
        <div class="section-header">
          <span class="section-title">帧序列</span>
          <span class="frame-hint">建议 8-12 帧效果最佳</span>
        </div>

        <div class="frames-list">
          <div
            v-for="(frame, index) in frames"
            :key="index"
            class="frame-item"
            :class="{ active: index === currentIndex }"
            @click="selectFrame(index)"
          >
            <img :src="frame" alt="" />
            <span class="frame-num">{{ index + 1 }}</span>
          </div>
        </div>
      </div>

      <div class="actions">
        <span class="action-hint">可返回上一步调整帧率或重新上传</span>
      </div>
    </div>

    <div class="footer">
      <van-button
        type="primary"
        size="large"
        :disabled="frames.length < 2"
        class="btn-primary"
        @click="nextStep"
      >
        下一步
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  NavBar as VanNavBar,
  Button as VanButton,
  Loading as VanLoading,
} from "vant";
import { useCardStore } from "@/stores/card";

const router = useRouter();
const cardStore = useCardStore();

const frames = ref<string[]>([]);
const currentIndex = ref(0);
const currentFrame = computed(() => frames.value[currentIndex.value]);

const goBack = () => {
  router.back();
};

const selectFrame = (index: number) => {
  currentIndex.value = index;
};

const nextStep = () => {
  if (frames.value.length < 2) {
    return;
  }
  cardStore.setFrames(frames.value);
  router.push("/create/decorate");
};

onMounted(() => {
  if (cardStore.frames.length) {
    frames.value = cardStore.frames;
  } else {
    router.push("/create");
  }
});
</script>

<style scoped>
.frame-edit {
  min-height: 100vh;
  background: #fafafa;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  padding: 24px 16px;
}

.preview-area {
  text-align: center;
  margin-bottom: 32px;
}

.card-preview {
  width: 200px;
  height: 280px;
  margin: 0 auto;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.frame-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.frame-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
}

.frame-index {
  font-size: 14px;
  color: #9ca3af;
  margin-top: 12px;
}

.frames-section {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #1a1a1a;
}

.frame-hint {
  font-size: 12px;
  color: #9ca3af;
}

.frames-list {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.frame-item {
  flex-shrink: 0;
  width: 56px;
  height: 72px;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
  border: 2px solid transparent;
  cursor: pointer;
}

.frame-item.active {
  border-color: #1a1a1a;
}

.frame-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.frame-num {
  position: absolute;
  bottom: 2px;
  right: 2px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 10px;
  padding: 1px 4px;
  border-radius: 3px;
}

.actions {
  margin-top: 16px;
  text-align: center;
}

.action-hint {
  font-size: 12px;
  color: #9ca3af;
}

.footer {
  padding: 16px;
  background: #fff;
}

.btn-primary {
  width: 100%;
  background: #1a1a1a !important;
  border-color: #1a1a1a !important;
}
</style>
