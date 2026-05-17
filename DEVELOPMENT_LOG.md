# 开发日志 / Development Log

## 项目概述

- **项目名称**: HUI ZZZI Photography Website
- **技术栈**: Next.js 15 + React + TypeScript + Tailwind CSS
- **部署平台**: Vercel
- **自定义域名**: www.huizzzi.art / huizzzi.art
- **创建日期**: 2026-05-13

---

## 已完成的工作

### 1. 自定义域名绑定
- **状态**: 已完成
- **详情**: 在腾讯云购买域名 `huizzzi.art`，并在 Vercel 项目中绑定。裸域 `huizzzi.art` 自动 307 重定向到 `www.huizzzi.art`。
- **DNS 配置**:
  - `www` → CNAME → `cname.vercel-dns.com`
  - `@` → A 记录 → Vercel 提供的 IP

### 2. 国内图片加速方案（COS）
- **状态**: 已完成代码修改，待优化
- **背景**: 网站部署在 Vercel（海外节点），国内访问图片加载缓慢。
- **方案**: 将图片迁移到腾讯云对象存储（COS）北京节点，通过环境变量控制图片加载来源。
- **已修改文件**:
  - `src/config/images.ts` — 新增图片 URL 解析器
  - `src/data/series.ts` — 所有照片路径改为通过 `getImageUrl()` 生成
  - `src/app/about/page.tsx` — 个人照片路径改为通过 `getImageUrl()` 生成
  - `src/config/media.ts` — 视频 URL 解析器（已有）
- **环境变量**:
  - `NEXT_PUBLIC_IMAGE_BASE` = `https://photo-1392627581.cos.ap-beijing.myqcloud.com`
- **COS 存储桶信息**:
  - 名称: `photo-1392627581`
  - 地域: 北京 (`ap-beijing`)
  - 权限: 公有读私有写

### 3. Git 配置修复
- **状态**: 已完成
- **问题**: Vercel 部署被阻止，因为提交者邮箱是本地地址 `zhaoyihui@192.168.0.104`。
- **解决**: 重新配置 Git 用户邮箱为 `zhaoyihui78@gmail.com`，并重新推送代码。

### 4. 视频恢复与 COS 迁移
- **状态**: 已完成
- **背景**: 2025-05-13 视频资产丢失事件后，从本地 `film/` 目录找回了 6 部核心视频（含新增"地坛的夏"）。
- **压缩**: 使用 ffmpeg 将 6 部视频从约 1.25GB 压缩至约 133MB（H.264 1080p，CRF 28）。
- **COS 上传**: 将压缩后的视频和封面 poster.jpg 上传到腾讯云 COS `works/videos/` 各子目录下。
- **代码修改**:
  - `src/config/media.ts` — 默认从 COS 加载视频，本地开发可通过 `NEXT_PUBLIC_VIDEO_BASE=''` 回退到本地
  - `src/data/series.ts` — 按月份重新排序 seasons-of-beijing 的 6 部影片（正月→二月→六月→七月→十月→十一月）
  - `.gitignore` — 重新启用 `*.mp4` 排除规则
  - `clean-build.sh` — 改为保留视频文件，不再删除
  - `OPERATION_GUIDE.md` — 新增视频上传 COS 的完整操作指南
- **流量评估**: 6 部压缩视频总计 133MB，加上图片 90MB，完整访客约消耗 223MB。COS 每月 10GB 免费流量额度内约可容纳 45 个完整访客（实际因并非人人看完所有视频，估计 80-150 人）。

### 5. 页面视觉与交互优化（2026-05-14）
- **状态**: 已完成
- **Film Photography 页面艺术升级**:
  - 新增显影动画（`animate-develop`）：图片加载时模拟胶片从黑色逐渐显影的效果
  - 新增显影液波纹背景（`animate-liquid-drift`）：琥珀色调缓慢流动的液体波纹
  - 新增漏光效果（Light Leak）：每张胶片四角叠加暖色调渐变漏光
  - 新增日期戳（Date Stamp）：胶片右下角模拟冲印日期的红色数字
  - 新增胶片信息悬浮卡：鼠标悬停显示相机型号、胶片品牌、ISO 等元数据
  - 新增接触印相hover暗化：悬浮在某张照片上时其他照片变暗，模仿首页效果
  - 新增巨型胶片条背景装饰：低透明度（4%-6%）的巨大胶片条在背景缓慢漂移
  - 移除红标标记、放大镜功能、信封动画（用户反馈干扰主体）
- **Seasons of Beijing 页面优化**:
  - 统一视频卡片宽度，移除左右不对称内边距
  - 视频按月份重新排序并添加文人金句引用
  -  tightened 页面间距（header mb-6，section py-10 md:py-16）
- **Lightbox Story Mode 修复**:
  - 修复播放时照片模糊问题
  - 实现优雅的 Ken Burns 效果：渐隐渐显 + 缓慢放大（0.9s 缓入缓出，5.5s 线性缩放）
  - 使用 `AnimatePresence mode="wait"` 避免两张图片重叠

### 6. PWA Service Worker 与带宽优化（2026-05-14）
- **状态**: 已完成
- **Service Worker 实现**:
  - `public/sw.js`：Cache First 策略缓存 COS 图片和视频，Stale While Revalidate 缓存静态资源
  - `src/components/ServiceWorkerRegister.tsx`：客户端自动注册 SW
  - `public/manifest.json`：PWA 配置，支持添加到主屏幕
  - `src/app/layout.tsx`：引入 manifest 和 ServiceWorkerRegister
- **视频悬浮自动播放移除**：为节省带宽，视频卡片不再在鼠标悬浮时自动播放，改为点击播放
- **COS Cache-Control 配置**：为 COS 对象添加 `public, max-age=31536000, immutable` 缓存头

### 7. local-dev 本地开发分支（2026-05-14）
- **状态**: 已完成
- **目的**：创建零 COS 流量消耗的本地开发环境
- **操作**：
  - 从 COS 下载全部照片、缩略图、视频到 `public/works/`（总计约 248MB）
  - `src/config/media.ts` 改为始终返回 `localPath`（不走 COS）
  - 创建 `local-dev` 分支保存本地开发配置
- **使用方式**：`git checkout local-dev && npm run dev`，所有资源走本地，不消耗 COS 流量
- **注意事项**：`local-dev` 分支的大文件不合并回 `main`，`main` 分支仍走 COS 加载

### 8. Guestbook 留言板（2026-05-14 ~ 2026-05-15）
- **状态**: 已完成，已合并到 `main` 并部署上线
- **方案**: GitHub Discussions 作为数据存储 + 自定义前端 UI（信件墙）
- **前端组件**:
  - `src/app/guestbook/page.tsx` — 留言板页面，信封打开动画
  - `src/components/CommentWall.tsx` — 信件墙，从 GitHub API 拉取评论，散落卡片布局
  - `src/components/LetterCard.tsx` — 单封信件卡片，带旋转角度和胶带装饰
  - `src/components/LetterModal.tsx` — 信件详情弹窗，支持 ESC 关闭
  - `src/components/GuestbookForm.tsx` — 留言提交表单，昵称可选，本地草稿自动保存
  - `src/components/GiscusComments.tsx` — Giscus iframe 嵌入（备用方案）
  - `src/components/Sidebar.tsx` — 侧边栏新增 Guestbook 导航入口
- **后端接口**:
  - `api/comment.js` — Vercel Serverless Function，通过 GitHub GraphQL API 发帖
  - `src/app/api/comment/route.ts` — Next.js App Router API Route（供本地 `next dev` 使用）
- **安全与防刷**:
  - IP 限流：1 分钟 3 条（内存 Map + 过期清理）
  - 蜜罐字段 `website` 防机器人
  - 敏感词/内容过滤：拦截博彩、垃圾广告、脚本注入
  - 内容长度限制：2~2000 字符
- **交互优化**:
  - 24 小时内新留言高亮入场动画
  - 评论数量显示在页面头部
  - 每 60 秒自动轮询刷新
  - 骨架屏 loading 状态
  - 空状态提示"还没有人留言"
- **Giscus 配置**:
  - repo: `zhaoyihui78/huizzzi-photography-website`
  - repoId: `R_kgDOSaa2rQ`
  - category: `General`
  - categoryId: `DIC_kwDOSaa2rc4C9CSF`
  - mapping: `pathname`
  - theme: 自定义 CSS
  - lang: `zh-CN`

### 9. Photo Map 摄影地图（2026-05-15 ~ 2026-05-17）
- **状态**: 已完成
- **方案**: 以北京城区为底图，用精致标记点定位拍摄机位，点击弹出代表作、最佳拍摄时段和交通提示
- **前端组件**:
  - `src/app/map/page.tsx` — 摄影地图页面，包含标题、地图容器和详情面板
  - `src/components/PhotoMap.tsx` — 地图核心交互组件，支持缩放、拖拽和标记点动画
  - `src/components/MapLocationPanel.tsx` — 地点详情弹窗，底部滑出，包含照片、拍摄时间、交通方式和 EXIF 信息
- **数据层**: `src/data/locations.ts`，纯静态配置，包含经纬度、描述及 SVG 坐标映射函数
- **资源**: 使用 SVG 格式作为底图（基于 OSM 数据提取）
- **交互优化**: 标记点 stagger 动画逐个显现，复古极简设计，与网站整体的画廊质感保持一致

### 10. 图片资源压缩与优化
- **状态**: 已完成
- **操作**: 
  - 编写了 `scripts/compress-images.js` 脚本，使用 `sharp` 库将 `public/works/photos/` 和 `works/thumbs/` 目录下的所有 `jpg/png` 图片批量压缩转换为了 WebP 格式。
  - 大图（Photos）统一缩放为 1920px 宽（Quality 90），缩略图（Thumbs）统一缩放为 800px 宽（Quality 80）。
  - 更新了 `src/data/series.ts` 以引用 `.webp` 文件。
  - 大幅减小了文件体积，提升了加载速度和带宽利用率。

### 11. 照片点赞功能 (Like Feature)
- **状态**: 已完成
- **方案**: GitHub Discussions 作为后端存储 (零成本) + `localStorage` 前端防重
- **核心实现**:
  - `src/app/api/likes/route.ts`: 利用 `GITHUB_TOKEN`，在仓库的 General 分类下自动寻找/创建一个标题为 `photo_likes_db` 的 Discussion，将其 `body` 作为 JSON 数据库存储所有照片的点赞数。
  - 包含内存级 IP 限流（1 分钟 30 次）。
  - `src/components/LikeButton.tsx`: 乐观更新（Optimistic UI）点赞按钮，配合 Framer Motion 的微交互动画（心形跳动与数字递增）。
  - 集成在 `Lightbox` 组件右下角，与 EXIF 信息呼应。
- **优势**: 完全复用了已有的 GitHub 基础设施和环境变量，**彻底免费**，无需注册或开启任何第三方数据库（如 Redis）。

---

## 已知问题

> **备注**: 2026-05-14 视频资产丢失问题已完全解决，6 部核心视频已恢复并迁移至 COS。

### 问题 1: About 页面个人照片无法加载 ✅ 已修复
- **状态**: 已修复（2026-05-14）
- **根因**: Vercel 环境变量 `NEXT_PUBLIC_IMAGE_BASE` 指向 COS，导致 `getImageUrl('/huizzzi.png')` 请求了 COS 上并不存在的文件。
- **修复**: `src/app/about/page.tsx` 改为直接使用本地路径 `src='/huizzzi.png'`，从 Vercel 自身加载。单张 2.6MB 的肖像图无需走 COS。

### 问题 2: Guestbook 留言墙空白（线上）✅ 已修复
- **状态**: 已修复（2026-05-15）
- **根因**: `CommentWall.tsx` 在 `setComments` 的 state updater 函数中调用了 `setNewIds` 和 `setTimeout`。React 的 state updater 必须是纯函数，副作用导致 React 18 并发渲染丢弃更新。
- **修复**: 将 `newIds` 的更新逻辑移到独立的 `useEffect` 中监听 `comments` 变化。

### 问题 2: 图片加载速度仍不理想
- **状态**: 待优化
- **当前情况**: 图片已通过 COS 加载，但用户反馈仍有延迟感
- **可能原因**:
  1. 未开启 CDN 加速（COS 默认域名 vs CDN 加速域名）
  2. 图片体积过大（`public/works` 总计约 91MB）
  3. 原图尺寸过大，未做响应式压缩
- **待优化方案**:
  - 开启腾讯云 CDN 加速
  - 批量压缩图片（建议缩略图宽度 600px，大图宽度 1920px）
  - 转换为 WebP 格式

### 问题 3: Vercel 部署体积警告
- **状态**: 待关注
- **详情**: 仓库包含大量高清图片（约 91MB），虽然已迁移到 COS，但 Git 历史记录中仍保留了这些文件，导致仓库体积较大

---

## 待办事项 (TODO)

- [x] 将 `public/huizzzi.png` 上传到 COS 根目录，修复 About 页面照片 → 改为本地加载
- [x] Guestbook 留言板开发、优化并合并到 main 分支
- [x] 批量压缩 `works/photos/` 和 `works/thumbs/` 中的图片 (已转换为 WebP 格式)
- [ ] 开启腾讯云 CDN 加速，替换 COS 默认域名
- [ ] 验证国内访问速度（F12 Network 检查图片加载时间）
- [ ] 考虑移除 Git 仓库中的 `public/works` 大文件（使用 `git-filter-repo` 或 BFG）
- [ ] 配置 GitHub Actions 自动部署到 COS（可选）
- [ ] **新增 Field Notes 手记板块**
  - **方案**: 短篇摄影知识文章，杂志排版风格（Editorial Layout）
  - **路由**: `/notes`（封面网格列表）+ `/notes/[slug]`（沉浸式单篇阅读）
  - **数据层**: `src/content/notes/*.mdx`，frontmatter 驱动，无需 CMS
  - **视觉**: 列表页左侧大图 + 右侧标题/摘要；详情页非对称双栏，正文 60% + 右侧 sticky 参数表/参考图
  - **交互**: 列表页悬停封面图放大 + 标题笔触下划线；详情页滚动进度条变章节锚点
  - **主题**: 保持 `#fdfcf9` 暖白纸底色，与留言板形成「阅读区」视觉共识
  - **导航**: 侧边栏 `Guestbook` 下方新增 `Field Notes` 入口
  - **内容形式**: 每篇 800–1500 字，聚焦一个具体话题（如 Zone System、黄金时刻、胶片宽容度）

---

## 费用记录

| 项目 | 费用 |
|------|------|
| 域名 `huizzzi.art` | 18 元/首年 |
| COS 存储（91MB 图片 + 133MB 视频） | 免费（50GB/月 额度内） |
| COS 流量 | 免费（10GB/月 额度内，约 80-150 完整访客） |
| CDN 流量包 | 17 元（买了但暂不能用，建议退订） |

---

## 关键链接

- Vercel 项目: https://vercel.com/zhaoyihuis-projects/huizzzi-photography-website
- GitHub 仓库: https://github.com/zhaoyihui78/huizzzi-photography-website
- 腾讯云 COS 控制台: https://console.cloud.tencent.com/cos
- 线上地址: https://www.huizzzi.art

---

*最后更新: 2026-05-17*

---

## 功能规划记录

### Field Notes 手记板块
- **提出日期**: 2026-05-15
- **状态**: 已记录，待开发
- **方案概要**:
  - 短篇摄影知识文章，杂志排版风格（Editorial Layout）
  - 路由: `/notes`（封面网格列表）+ `/notes/[slug]`（沉浸式单篇阅读）
  - 数据层: `src/content/notes/*.mdx`，frontmatter 驱动，无需 CMS
  - 视觉: 列表页左侧大图 + 右侧标题/摘要；详情页非对称双栏，正文 60% + 右侧 sticky 参数表/参考图
  - 交互: 列表页悬停封面图放大 + 标题笔触下划线；详情页滚动进度条变章节锚点
  - 主题: 保持 `#fdfcf9` 暖白纸底色，与留言板形成「阅读区」视觉共识
  - 导航: 侧边栏 `Guestbook` 下方新增 `Field Notes` 入口
  - 内容形式: 每篇 800–1500 字，聚焦一个具体话题（如 Zone System、黄金时刻、胶片宽容度）
- **内容发布工作流方案**:
  - **方案一（推荐）: Git 提交 + Vercel 自动部署**
    - 在本地新建 `src/content/notes/xxx.mdx` → `git add .` → `git commit -m "add note: xxx"` → `git push origin main`
    - Vercel 检测到推送后自动构建并部署，约 30 秒~1 分钟上线
    - 优点：免费、版本控制、和现有工作流完全一致
    - 缺点：需要会写 Markdown/MDX
  - **方案二: GitHub 网页直写（不用开本地编辑器）**
    - 直接访问 GitHub 仓库网页 → `Add file → Create new file` → 在网页编辑器里写 frontmatter + 正文
    - 保存即自动提交，Vercel 同样自动部署
    - 优点：手机、平板都能写；不需要本地开发环境
    - 缺点：GitHub 编辑器比较简陋，没有预览
  - **方案三: Notion / 飞书写 → GitHub Actions 自动同步（适合高频写作）**
    - 在 Notion 里写文章（体验最好），通过定时 GitHub Actions 工作流把 Notion 内容拉取下来生成 MDX，自动提交到仓库
    - 优点：写作体验最佳；支持图片拖拽、多人协作
    - 缺点：需要配置一次 Notion API + Actions 脚本（约 30 分钟工作量）
  - **当前建议**: 先走方案二。文章更新频率不会太高（摄影知识不是日更），直接在 GitHub 网页写 frontmatter 和 Markdown 足够用。等以后真的需要每周发两三篇时，再升级到方案三。

### Photo Map 摄影地图
- **提出日期**: 2026-05-15
- **状态**: 已完成 (开发记录见上文)
- **方案概要**:
  - 以北京城区为底图，用精致标记点定位拍摄机位，点击弹出代表作 + 拍摄时段 + 交通提示
  - 路由: `/map`
  - 底图: 手绘风格 SVG 地图（只保留二环~五环轮廓、主要水系、地铁环线），底色 `#fdfcf9`，水系淡青色，与网站暖白纸质感统一
  - 标记点: 胶片齿孔圆形或相机取景框小图标，悬停展开 Polaroid 拍立得小图（复用 `Polaroid` 组件）
  - 地点详情弹窗: 底部滑出面板，含代表作轮播、最佳拍摄时段、交通方式、关联手记入口
  - 数据层: `src/data/locations.ts`，每个地点含 `name`、`lat/lng`（SVG 坐标映射）、`seriesSlug`、`bestTime`、`transport`、`photos[]`，纯静态无需 API
  - 交互: 标记点 stagger 动画逐个显现（0.15s 间隔）；鼠标滚轮缩放 SVG 地图；移动端双指缩放
  - 主题: `#fdfcf9` 背景，`#d6ceb8` 地图线条，`#c9a96e` 标记激活态，与留言板/手记保持阅读区视觉统一
  - 导航: 侧边栏新增 `Map` 入口
  - 工作流: 新增地点即新增 `locations.ts` 对象 + SVG 坐标，发布频率极低，走 Git 提交即可
- **为什么不选收藏夹/器材清单**: 收藏夹与手记内容形态重叠；器材清单太技术化破坏画廊感；摄影地图是空间维度，能把现有作品串成可"走"的路线
