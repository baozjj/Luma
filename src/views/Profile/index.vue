<template>
  <div class="profile">
    <header class="header">
      <h1 class="title">我的</h1>
    </header>

    <UserCard />

    <van-cell-group inset class="menu-group">
      <van-cell title="我的素材" is-link icon="photo-o" />
      <van-cell title="设置" is-link icon="setting-o" />
      <van-cell title="帮助与反馈" is-link icon="question-o" />
      <van-cell title="关于 Luma" is-link icon="info-o" />
    </van-cell-group>

    <div class="version">版本 1.0.0</div>
  </div>
</template>

<script setup lang="ts">
import { Cell as VanCell, CellGroup as VanCellGroup } from 'vant'
import UserCard from './components/UserCard/index.vue'
</script>

<style scoped>
.profile {
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

.menu-group {
  margin: 0;
}

.version {
  text-align: center;
  font-size: 12px;
  color: #9CA3AF;
  margin-top: 40px;
}
</style>
