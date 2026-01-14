<template>
  <div class="tab-layout">
    <div class="page-content">
      <router-view />
    </div>
    <van-tabbar v-model="active" route>
      <van-tabbar-item to="/main" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item to="/works" icon="photo-o">我的作品</van-tabbar-item>
      <van-tabbar-item to="/profile" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Tabbar as VanTabbar, TabbarItem as VanTabbarItem } from 'vant'

const active = ref(0)
</script>

<style scoped>
.tab-layout {
  min-height: 100vh;
  background: #FAFAFA;
}

.page-content {
  padding-bottom: 50px;
}
</style>
