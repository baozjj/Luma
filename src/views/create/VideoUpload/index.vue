<template>
  <div class="video-upload">
    <van-nav-bar title="上传图片" left-arrow @click-left="goBack" />

    <div class="content">
      <div class="frame-rate">
        <p class="section-title">选择帧率</p>
        <div class="rate-options">
          <van-button
            v-for="rate in frameRates"
            :key="rate"
            size="small"
            :type="selectedRate === rate ? 'primary' : 'default'"
            class="rate-btn"
            @click="selectRate(rate)"
          >
            {{ rate }} 帧
          </van-button>
        </div>
        <p class="rate-hint">请选择 6/8/10/12 帧，决定需要上传的图片数量</p>
      </div>

      <div class="upload-area" @click="triggerUpload">
        <template v-if="!images.length">
          <van-icon name="photo-o" size="48" color="#9CA3AF" />
          <p class="upload-text">点击上传图片</p>
          <p class="upload-hint">需上传 {{ requiredCount }} 张（JPG/PNG）</p>
        </template>
        <template v-else>
          <div class="thumb-grid">
            <div v-for="(img, index) in images" :key="index" class="thumb">
              <img :src="img" alt="" />
              <span class="thumb-num">{{ index + 1 }}</span>
            </div>
          </div>
        </template>
      </div>

      <input
        ref="fileInput"
        type="file"
        accept="image/jpeg,image/png"
        multiple
        class="hidden"
        @change="handleFileChange"
      />

      <div v-if="images.length" class="video-info">
        <div class="info-item">
          <span class="label">已上传</span>
          <span class="value">{{ images.length }} 张</span>
        </div>
        <div class="info-item">
          <span class="label">目标数量</span>
          <span class="value">{{ requiredCount }} 张</span>
        </div>
      </div>

      <div v-if="error" class="warning-msg">
        <van-icon name="info-o" />
        {{ error }}
      </div>
    </div>

    <div class="footer">
      <van-button
        v-if="images.length"
        type="default"
        size="large"
        class="btn-secondary"
        @click="reupload"
      >
        重新上传
      </van-button>
      <van-button
        type="primary"
        size="large"
        :disabled="!canProceed"
        class="btn-primary"
        @click="nextStep"
      >
        下一步
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import {
  NavBar as VanNavBar,
  Icon as VanIcon,
  Button as VanButton,
} from "vant";
import { useCardStore } from "@/stores/card";

const router = useRouter();
const cardStore = useCardStore();

const frameRates = [6, 8, 10, 12];
const selectedRate = ref<number>(cardStore.frameRate || 8);
const fileInput = ref<HTMLInputElement | null>(null);
const images = ref<string[]>(cardStore.frames || []);
const error = ref("");

const requiredCount = computed(() => selectedRate.value || 0);

const canProceed = computed(() => {
  if (!selectedRate.value) return false;
  if (images.value.length !== requiredCount.value) return false;
  return !error.value;
});

const goBack = () => {
  router.back();
};

const selectRate = (rate: number) => {
  selectedRate.value = rate;
  if (images.value.length && images.value.length !== rate) {
    error.value = `当前已上传 ${images.value.length} 张，请重新上传 ${rate} 张`;
  } else {
    error.value = "";
  }
};

const triggerUpload = () => {
  if (!selectedRate.value) {
    error.value = "请先选择帧率";
    return;
  }
  fileInput.value?.click();
};

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const files = Array.from(target.files || []);
  if (!files.length) return;

  error.value = "";

  if (files.length !== requiredCount.value) {
    error.value = `需要上传 ${requiredCount.value} 张图片`;
  }

  const urls = files.map((file) => URL.createObjectURL(file));
  images.value = urls;
};

const reupload = () => {
  images.value = [];
  error.value = "";
  if (fileInput.value) {
    fileInput.value.value = "";
  }
};

const nextStep = () => {
  if (!canProceed.value) return;
  cardStore.setFrames(images.value);
  cardStore.setFrameRate(selectedRate.value);
  router.push("/create/decorate");
};
</script>

<style scoped>
.video-upload {
  min-height: 100vh;
  background: #fafafa;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  padding: 24px 16px;
}

.frame-rate {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 12px;
}

.rate-options {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.rate-btn {
  min-width: 64px;
}

.rate-hint {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 10px;
}

.upload-area {
  background: #fff;
  border: 2px dashed #e5e7eb;
  border-radius: 12px;
  min-height: 240px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.2s;
}

.upload-area:active {
  border-color: #9ca3af;
}

.upload-text {
  font-size: 16px;
  color: #1a1a1a;
  margin-top: 16px;
}

.upload-hint {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 8px;
}

.video-preview {
  width: 100%;
  max-height: 300px;
  border-radius: 10px;
}

.thumb-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  width: 100%;
}

.thumb {
  position: relative;
  width: 100%;
  padding-top: 120%;
  overflow: hidden;
  border-radius: 8px;
  background: #f3f4f6;
}

.thumb img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumb-num {
  position: absolute;
  right: 6px;
  bottom: 6px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
}

.hidden {
  display: none;
}

.video-info {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
  margin-top: 24px;
  flex-wrap: wrap;
}

.info-item {
  text-align: center;
}

.label {
  display: block;
  font-size: 12px;
  color: #9ca3af;
  margin-bottom: 4px;
}

.value {
  font-size: 16px;
  font-weight: 500;
  color: #1a1a1a;
}

.warning-msg {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #f59e0b;
  font-size: 14px;
  margin-top: 16px;
  padding: 12px;
  background: #fef3c7;
  border-radius: 8px;
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
