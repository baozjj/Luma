import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/main',
    component: () => import('@/layouts/TabLayout.vue'),
    children: [
      {
        path: 'main',
        name: 'Home',
        component: () => import('@/views/Home/index.vue'),
        meta: { title: '首页' }
      },
      {
        path: 'works',
        name: 'Works',
        component: () => import('@/views/Works/index.vue'),
        meta: { title: '我的作品' }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/Profile/index.vue'),
        meta: { title: '我的' }
      }
    ]
  },
  {
    path: '/create',
    name: 'Create',
    component: () => import('@/views/create/VideoUpload/index.vue'),
    meta: { title: '上传图片' }
  },
  {
    path: '/create/decorate',
    name: 'Decorate',
    component: () => import('@/views/create/Decorate/index.vue'),
    meta: { title: '边框装饰' }
  },
  {
    path: '/create/preview',
    name: 'Preview',
    component: () => import('@/views/create/Preview3D/index.vue'),
    meta: { title: '3D预览' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
