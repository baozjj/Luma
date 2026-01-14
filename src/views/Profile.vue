<template>
  <div class="profile">
    <header class="header">
      <h1 class="title">我的</h1>
    </header>

    <div class="user-card">
      <div class="avatar">
        <van-icon name="user-o" size="32" color="#9CA3AF" />
      </div>
      <div class="user-info">
        <div class="username">Luma 用户</div>
        <div class="user-desc">免费版</div>
      </div>
    </div>

    <van-cell-group inset class="menu-group">
      <van-cell title="我的素材" is-link icon="photo-o" />
      <van-cell title="设置" is-link icon="setting-o" />
      <van-cell title="帮助与反馈" is-link icon="question-o" />
      <van-cell title="关于 Luma" is-link icon="info-o" />
    </van-cell-group>

    <div class="version">版本 1.0.0</div>
  </div>
</template>

<script setup>
import { Cell as VanCell, CellGroup as VanCellGroup, Icon as VanIcon } from 'vant'
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
