<template>
  <transition name="slide-up">
    <div v-if="visible" class="tool-panel sticker-panel">
      <div class="panel-header">
        <span class="panel-title">贴纸库</span>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>
      <div class="panel-body">
        <van-tabs v-model:active="activeCategory" shrink>
          <van-tab v-for="cat in categories" :key="cat.key" :title="cat.name">
            <div class="sticker-grid">
              <div
                v-for="icon in cat.icons"
                :key="icon"
                class="sticker-item"
                draggable="true"
                @dragstart="handleDragStart($event, icon)"
                @click="$emit('add-sticker', icon)"
              >
                {{ icon }}
              </div>
            </div>
          </van-tab>
        </van-tabs>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref } from "vue";
import { Tab as VanTab, Tabs as VanTabs } from "vant";

defineProps({
  visible: Boolean,
});

const emit = defineEmits(["close", "add-sticker", "drag-start"]);

const activeCategory = ref(0);

const categories = [
  {
    key: "emoji",
    name: "表情",
    icons: [
      "😊",
      "😍",
      "🥰",
      "😎",
      "🤩",
      "😇",
      "🥳",
      "😋",
      "🤗",
      "💕",
      "❤️",
      "💖",
      "⭐",
      "✨",
      "🌟",
    ],
  },
  {
    key: "symbol",
    name: "符号",
    icons: [
      "🎵",
      "🎶",
      "⚡",
      "💫",
      "🔥",
      "💎",
      "🎯",
      "🎪",
      "🎨",
      "🎭",
      "🎬",
      "📸",
      "🎤",
      "🎧",
      "🎹",
    ],
  },
  {
    key: "holiday",
    name: "节日",
    icons: [
      "🎄",
      "🎅",
      "🎁",
      "🎊",
      "🎉",
      "🎂",
      "🎈",
      "🧧",
      "🏮",
      "🎃",
      "👻",
      "🐰",
      "🥚",
      "💝",
      "🌹",
    ],
  },
  {
    key: "nature",
    name: "自然",
    icons: [
      "🌸",
      "🌺",
      "🌻",
      "🌷",
      "🌹",
      "🍀",
      "🌿",
      "🍃",
      "☁️",
      "🌈",
      "🌙",
      "⭐",
      "🦋",
      "🐝",
      "🌊",
    ],
  },
  {
    key: "shape",
    name: "几何",
    icons: [
      "⬤",
      "◆",
      "▲",
      "■",
      "●",
      "◇",
      "△",
      "□",
      "○",
      "◈",
      "✦",
      "✧",
      "❖",
      "◉",
      "◎",
    ],
  },
];

function handleDragStart(e, icon) {
  emit("drag-start", icon);
  e.dataTransfer.effectAllowed = "copy";
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
  max-height: 45vh;
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
  padding: 0;
}

.sticker-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  padding: 20px 24px;
}

.sticker-item {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  background: #f9fafb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.sticker-item:active {
  background: #e5e7eb;
  transform: scale(0.95);
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
