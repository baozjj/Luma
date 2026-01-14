<template>
  <div class="user-card">
    <div class="avatar">
      <van-icon name="user-o" size="32" color="#9CA3AF" />
    </div>
    <div class="user-info">
      <div class="username">{{ username }}</div>
      <div class="user-desc">{{ description }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon as VanIcon } from 'vant'

interface Props {
  username?: string
  description?: string
}

withDefaults(defineProps<Props>(), {
  username: 'Luma 用户',
  description: '免费版'
})
</script>

<style scoped>
.user-card {
  display: flex;
  align-items: center;
  padding: 24px;
  background: #fff;
  border-radius: 12px;
  margin-bottom: 24px;
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #F3F4F6;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.username {
  font-size: 18px;
  font-weight: 500;
  color: #1A1A1A;
  margin-bottom: 4px;
}

.user-desc {
  font-size: 14px;
  color: #9CA3AF;
}
</style>
