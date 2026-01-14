<template>
  <div class="works">
    <header class="header">
      <h1 class="title">我的作品</h1>
    </header>

    <van-tabs v-model:active="activeTab" shrink>
      <van-tab title="已完成">
        <div class="works-list" v-if="completedWorks.length">
          <div 
            class="work-card" 
            v-for="work in completedWorks" 
            :key="work.id"
          >
            <div class="work-preview">
              <img 
                v-if="work.frames[0]" 
                :src="work.frames[0]" 
                alt="预览"
              />
              <div v-else class="work-placeholder"></div>
            </div>
            <div class="work-info">
              <span class="work-date">{{ formatDate(work.createdAt) }}</span>
              <van-tag type="success" size="small">已完成</van-tag>
            </div>
          </div>
        </div>
        <van-empty v-else description="暂无作品" />
      </van-tab>
      <van-tab title="草稿">
        <van-empty description="暂无草稿" />
      </van-tab>
    </van-tabs>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Tab as VanTab, Tabs as VanTabs, Tag as VanTag, Empty as VanEmpty } from 'vant'
import { useCardStore } from '@/stores/card'

const cardStore = useCardStore()
const activeTab = ref(0)

const completedWorks = computed(() => {
  return cardStore.works.filter(w => w.status === 'completed')
})

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}
</script>

<style scoped>
.works {
  padding: 16px;
}

.header {
  padding: 8px 0 24px;
}

.title {
  font-size: 24px;
  font-weight: 600;
  color: #1A1A1A;
}

.works-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding-top: 16px;
}

.work-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
}

.work-preview {
  aspect-ratio: 1;
  background: #F3F4F6;
}

.work-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.work-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #E5E7EB 0%, #D1D5DB 100%);
}

.work-info {
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.work-date {
  font-size: 12px;
  color: #9CA3AF;
}
</style>
