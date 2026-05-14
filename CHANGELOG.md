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

### Phase 6: 仓库架构优化与视频托管迁移 (2025-05-13)
- **问题背景**：项目包含大量高码率 4K/1080p 视频素材（总容量 1.3GB+，单文件最大 330MB），远超 GitHub 单文件 100MB 限制，导致推送直接超时（HTTP 408）。
- **视频去留整理**：移除低价值的「天坛01~08」系列片段，仅保留 5 部核心长片（故宫春雪、北海公园的秋、颐和园的晚霞、圆明园、祈年纳福）。
- **Git 历史重写**：使用 `git filter-branch` 彻底从历史提交中清除大体积视频 blob，配合 `git gc --prune=now` 将 `.git` 目录从 3GB 压缩至正常范围。
- **托管策略迁移**：将视频资产迁移至 [GitHub Release v1.0.0](https://github.com/zhaoyihui78/huizzzi-photography-website/releases/tag/v1.0.0) 作为 CDN 源。
  - 小体积封面图 (`poster.jpg`) 继续保留在 `public/` 目录内，随代码仓库静态部署。
  - 视频 `src` 统一替换为 Release 直链：`https://github.com/zhaoyihui78/huizzzi-photography-website/releases/download/v1.0.0/{拼音名}.mp4`。
- **防护机制**：更新 `.gitignore` 全局排除 `*.mp4`，防止未来误提交大文件。

### Phase 7: 视频资产恢复与 COS 迁移 (2026-05-14)
- **视频找回**：从本地 `film/` 目录找回 6 部核心视频，包含此前丢失的 5 部以及新增的第 6 部「地坛的夏」。
- **视频压缩**：使用 ffmpeg 统一压缩至 1080p H.264，CRF 28，音频 128kbps AAC。6 部视频从约 1.25GB 降至约 133MB，压缩率近 90%。
- **COS 托管迁移**：将压缩后的视频和封面 poster.jpg 上传至腾讯云 COS `photo-1392627581` 存储桶的 `works/videos/` 目录下。
- **代码适配**：
  - `src/config/media.ts` 默认 base 改为 COS 地址，本地开发可通过 `NEXT_PUBLIC_VIDEO_BASE=''` 回退。
  - `src/data/series.ts` 按月份重新排序 6 部影片：正月（祈年纳福）→ 二月（故宫春雪）→ 六月（地坛的夏）→ 七月（颐和园的晚霞）→ 十月（北海公园的秋）→ 十一月（圆明园的秋）。
  - `.gitignore` 重新启用 `*.mp4` 排除，视频不再进入 Git 仓库。
  - `clean-build.sh` 改为保留视频文件，配合静态导出直接部署。
- **文档更新**：完善 `OPERATION_GUIDE.md`，新增视频上传 COS、视频压缩优化、费用分析等章节。

---

## 事故记录 (Incident Log)

### 2025-05-13 核心视频资产丢失事件

**事件概述**：
5 部核心长片视频（故宫春雪、北海公园的秋、颐和园的晚霞、圆明园、祈年纳福）的原始 `.mp4` 文件在本地和云端同时丢失，导致四季巡礼页面视频播放功能完全不可用。

**丢失时间线**：
1. `git filter-branch` 清除 git 历史中的视频 blob 时，工作目录中的 `public/works/videos/*/*.mp4` 文件被一并移除。
2. 为减小 Vercel 部署包体积，手动执行 `find public/works/videos -name '*.mp4' -delete` 删除残留视频。
3. 构建后清理脚本 `clean-build.sh` 在每次 `next build` 后自动删除 `out/works/videos/` 下的 `.mp4` 文件。
4. 发现 GitHub Release v1.0.0 的下载端点返回 404，删除 Release 试图重建；重建后因本地已无视频源文件，导致新 Release 为空。
5. 检查本地备份目录 `作品/视频/` 后发现，该目录下仅有「天坛01~08」片段及封面截图，**5 部核心长片的原始 `.mp4`  nowhere to be found**。

**影响范围**：
- `/series/seasons-of-beijing/` 页面的 5 个视频卡片：悬浮静默播放和点击弹窗播放均失效。
- GitHub Release v1.0.0 目前为空，无任何视频资产。

**根因分析**：
- **缺乏多重备份**：视频仅存在于 `public/` 和 `out/` 两个临时目录中，没有独立的云盘/外部硬盘备份。
- **清理脚本过于激进**：`clean-build.sh` 在构建后无条件删除所有 `.mp4`，未区分「待部署」与「仅 Release CDN 引用」的场景。
- **git 操作与文件系统耦合**：`git filter-branch --index-filter` 理论上只改索引，但实际执行后工作目录文件也丢失了，未在第一时间察觉。

**恢复计划（已于 2026-05-14 完成）**：
- [x] 从本地 `film/` 目录找回 6 部核心视频（含新增"地坛的夏"）。
- [x] 使用 ffmpeg 压缩至 1080p / H.264，单文件控制在 50MB 以内（总计从 1.25GB 降至 133MB）。
- [x] 上传至腾讯云 COS，国内访问速度优于 GitHub Release。
- [x] 代码默认从 COS 加载视频，本地开发可通过 `NEXT_PUBLIC_VIDEO_BASE=''` 回退。

**教训与后续措施**：
1. **大媒体文件永不依赖单一存储**：任何超过 100MB 的资产在清理前必须确认至少有 2 个独立备份（本地外置硬盘 + 云盘）。
2. **清理脚本增加白名单机制**：`clean-build.sh` 不应直接 `find -delete`，而应根据显式清单操作，避免误删。
3. **Git 与媒体资产分离**：视频/原始素材不应放在 `public/` 内，应放在项目根目录外的 `assets/` 或 `media/` 中，通过构建脚本按需复制，避免 git 操作误触。

---

## 当前项目状态 (Current Status as of 2025-05-13)

### 已就绪功能
| 模块 | 状态 | 说明 |
|------|------|------|
| 首页 (`/`) | ✅ 完成 | Hero 全屏展示 + Masonry 瀑布流画廊，支持 `max-w-[1500px]` 紧凑高级排版。 |
| 系列详情页 (`/series/[slug]`) | ✅ 完成 | 支持 `default` / `dark` / `oriental` 三主题动态解析；视频悬浮自动播放；破坏性网格与视差文字。 |
| 关于页 (`/about`) | ✅ 完成 | 左右分栏画廊级排版，水彩自画像 + 博物馆相框。 |
| 灯箱 (Lightbox) | ✅ 完成 | 镜头呼吸动画、Ken Burns 幻灯片 Story Mode、程序化机械快门音效。 |
| 自定义光标 | ✅ 完成 | `mix-blend-mode: difference` 磁性反色圆点。 |
| 入场动画 | ✅ 完成 | 镜头对焦模糊过渡 + 黑色幕布贝塞尔曲线拉开。 |
| 平滑滚动 | ✅ 完成 | Lenis 全局惯性滚动。 |
| 音效系统 | ✅ 完成 | Web Audio API 物理级合成（快门声、纸张摩擦声）。 |
| 数据层 | ✅ 完成 | `src/data/series.ts` 集中管理摄影系列、视频、EXIF 元数据。 |
| 视频托管 | ✅ 完成 | 6 部核心视频已恢复并迁移至腾讯云 COS，四季巡礼页面视频播放功能正常。 |

### 技术债务与已知限制
- **Git LFS 弃用**：早期曾尝试用 Git LFS 追踪 `.mp4`，但 `git-lfs` 未在环境中安装，导致视频以原始 blob 进入历史。现已完全迁移至 Release 方案，`.gitattributes` 中的 `filter=lfs` 规则虽仍存在，但不再生效。
- **视频外链加载**：已从 GitHub Release 迁移至腾讯云 COS，国内访问速度显著提升。
- **海报图体积**：`public/works/photos/film/` 下仍有约 20 张 3MB 级胶片扫描图，目前仍在 Git 仓库内，未达 GitHub 限制但未来需关注。

---

## 待优化与未来规划 (Backlog)
- [ ] 移动端触控体验的深度适配（目前重交互多依赖 Hover）。
- [ ] 跨页面转场的 Shared Element Transition（点击图片后图片直接放大无缝进入详情页）。
- [ ] 增加更多基于 WebGL/Three.js 的轻量级图像畸变效果（如鼠标滑过图片产生水波纹）。
- [x] ~~评估将视频从 GitHub Release 迁移至 Cloudflare R2 / 国内 CDN，提升国内访问速度。~~ 已完成：已迁移至腾讯云 COS。