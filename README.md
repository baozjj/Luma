# Luma - 光栅卡定制 App

一款基于 Vue 3 的移动端应用，专注于个性化光栅卡（Lenticular Card）定制服务。用户可以上传视频，系统自动抽帧生成光栅动态效果，并支持自定义边框装饰。

## ✨ 功能特性

- 📹 **视频上传**：支持 MP4/MOV 格式，1-5秒时长限制
- 🎞️ **智能抽帧**：自动从视频中提取 6-12 帧
- 🎨 **边框装饰**：拖拽贴纸到边框任意位置，支持缩放/旋转
- 🌀 **3D 预览**：滑动旋转卡片，实时模拟光栅动态效果
- 💾 **作品管理**：保存作品至本地，随时查看编辑
- 📤 **导出功能**：支持导出预览图和 GIF 动图

## 🛠️ 技术栈

- **框架**：Vue 3 + Vite
- **状态管理**：Pinia
- **路由**：Vue Router
- **UI 组件**：Vant 4（移动端）
- **样式**：TailwindCSS + Scoped CSS

## 📦 安装与运行

```bash
# 克隆项目
git clone https://github.com/yourusername/luma.git
cd luma

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 🎯 使用说明

1. 点击"开始制作"进入创建流程
2. 上传或拍摄 1-5 秒的视频
3. 系统自动抽帧，可手动调整帧序列
4. 从贴纸库选择图案，拖拽到边框装饰
5. 3D 预览查看光栅效果
6. 保存作品或导出图片/GIF

## 📱 项目结构

```
src/
├── layouts/          # 布局组件
│   └── TabLayout.vue
├── views/            # 页面组件
│   ├── Home.vue
│   ├── Works.vue
│   ├── Profile.vue
│   └── create/       # 创建流程页面
│       ├── VideoUpload.vue
│       ├── FrameEdit.vue
│       ├── Decorate.vue
│       └── Preview3D.vue
├── stores/           # Pinia 状态管理
│   └── card.js
├── router/           # 路由配置
│   └── index.js
├── styles/           # 全局样式
│   └── index.css
├── App.vue
└── main.js
```

## 🎨 设计理念

采用**简约风格**设计：
- 克制用色，主色为深灰黑 (#1A1A1A)
- 大量留白，元素间距宽松
- 细线性图标，扁平化设计
- 轻柔过渡动画，无夸张效果

## 📄 License

MIT

## 👨‍💻 开发者

欢迎提交 Issue 和 Pull Request！
