<template>
  <div class="works">
    <header class="header">
      <h1 class="title">我的作品</h1>
    </header>

    <van-tabs v-model:active="activeTab" shrink>
      <van-tab title="已完成">
        <div class="works-list" v-if="completedWorks.length">
          <WorkCard 
            v-for="work in completedWorks" 
            :key="work.id"
            :work="work"
          />
        </div>
        <van-empty v-else description="暂无作品" />
      </van-tab>
      <van-tab title="草稿">
        <van-empty description="暂无草稿" />
      </van-tab>
    </van-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Tab as VanTab, Tabs as VanTabs, Empty as VanEmpty } from 'vant'
import { useCardStore } from '@/stores/card'
import WorkCard from './components/WorkCard/index.vue'

const cardStore = useCardStore()
const activeTab = ref(0)

const completedWorks = computed(() => {
  return cardStore.works.filter(w => w.status === 'completed')
})
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
</style>
