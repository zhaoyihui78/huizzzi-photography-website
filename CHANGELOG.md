# HUI ZZZI Photography Portfolio - Development Log

## 核心定位
本项目是一个为摄影师/视觉创作者打造的高级个人作品集网站（Portfolio）。设计核心理念为 **“画廊级排版 (Editorial Design)”、“沉浸式交互 (Immersive Interaction)” 与 “电影感 (Cinematic Vibe)”**。

## 技术栈 (Tech Stack)
- **框架:** Next.js 14 (App Router)
- **语言:** TypeScript
- **样式:** Tailwind CSS (自定义复杂设计系统与 CSS 变量)
- **动画:** Framer Motion (页面转场、视差滚动、复杂编排动画)
- **平滑滚动:** Lenis (原生惯性滚动体验)
- **声音合成:** Web Audio API (无资源依赖的物理级音效合成)

---

## 阶段开发记录

### Phase 1: 基础架构与核心页面构建
- **路由与结构设计**：搭建首页 (`/`)、作品系列详情页 (`/series/[slug]`) 和关于页面 (`/about`)。
- **动态数据注入**：通过 `src/data/series.ts` 集中管理静态数据（摄影图、视频集、分类、EXIF 等信息）。
- **侧边栏导航 (Sidebar)**：实现固定侧边栏，集成全局时钟组件和基于当前路由的 Active 状态。
- **自定义光标 (Custom Cursor)**：弃用系统指针，使用具有 `mix-blend-mode: difference` 属性的磁性反色圆点，悬停于图片时放大为 `[ View ]` 提示。

### Phase 2: 首页重构与排版优化
- **全屏 Hero 与瀑布流**：首页顶部引入大型 Hero 图片，下方接多列 Masonry 瀑布流。
- **移除冗余设计**：移除了早期版本首页关于“胶片摄影”的特定标签，保持首页的纯粹感和留白。
- **图片尺寸控制**：经过多轮调优，将首页图片限制在 `max-w-[1500px]` 居中展示，去除极端的视差导致的缝隙，达成紧凑、克制的高级感。

### Phase 3: 沉浸式详情页与“主题 (Theme)”系统
- **动态主题架构 (Theme Resolution)**：将全局主题从单一的 `darkMode` 升级为支持多状态的主题系统。
  - `default`：纯净白（建筑、自然景观）
  - `dark`：暗房黑 `#0a0a0a`（`Film Photography` 胶片系列）
  - `oriental`：东方宣纸 `#f4f1ea`（`Seasons of Beijing` 视频系列）
- **胶片暗房排版 (Contact Sheet)**：在 `film-life` 系列中，引入高仿真 `FilmFrame` 组件，模拟带齿孔、品牌型号印刷和曝光编号的真实底片灯箱效果。
- **视频画廊交互 (Hover B-Roll)**：在四季巡礼页面，移除传统的“播放”按钮。实现**鼠标悬浮即自动静音播放视频片段**，移开则恢复为黑白电影感海报。

### Phase 4: 极致的微交互与艺术感升级
- **入场动画 (Cinematic Reveal)**：
  - 弃用传统的 Loading 圈。
  - 采用 **“镜头对焦 (Lens Focus)”** 理念：文字 `HUI ZZZI` 从模糊 (`blur 12px`) 和紧凑字距中平滑过渡到锐利清晰，最后配合极具张力的贝塞尔曲线拉开黑色幕布。
- **破坏性网格 (Broken Grid Layout)**：
  - 打破传统的左右对称排版，让文字卡片以半透明毛玻璃 (`backdrop-blur`) 形式与图片产生 **错位与重叠 (Overlapping)**。
  - 底层加入巨型透明排版文字（基于滚动条进度产生的 Parallax 视差移动），强化空间深度。
- **沉浸式灯箱与 Story Mode**：
  - 重写 Lightbox 组件，加入类似相机镜头的呼吸引擎。
  - 新增 **Play Story** 幻灯片模式：隐藏鼠标和 UI，照片以 5 秒/张的速度进行极其缓慢的电影级缩放 (**Ken Burns Effect**)，自动播放。
- **程序化声音设计 (Web Audio Synthesis)**：
  - 不加载任何 mp3/wav 文件，通过底层 Oscillator 和 Noise 滤波直接生成声音。
  - **机械快门声 (Shutter)**：在切换大图和 Story Mode 时触发，带有金属反光板震动的质感。
  - **纸张摩擦声 (Paper Rustle)**：当用户切换进入东方主题页面时，触发极轻微的宣纸摩擦音效。

### Phase 5: About 页面重排
- 引入左右分栏的画廊级介绍排版。
- 将提供的个人水彩自画像 (`huizzzi.png`) 安置于右侧，并配以博物馆级别的相框边框、阴影和策展标签（`Portrait · 2026`）。

---

## 待优化与未来规划 (Backlog)
- [ ] 移动端触控体验的深度适配（目前重交互多依赖 Hover）。
- [ ] 跨页面转场的 Shared Element Transition（点击图片后图片直接放大无缝进入详情页）。
- [ ] 增加更多基于 WebGL/Three.js 的轻量级图像畸变效果（如鼠标滑过图片产生水波纹）。