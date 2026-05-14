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

---

## 已知问题

> **备注**: 2026-05-14 视频资产丢失问题已完全解决，6 部核心视频已恢复并迁移至 COS。

### 问题 1: About 页面个人照片无法加载 ✅ 已修复
- **状态**: 已修复（2026-05-14）
- **根因**: Vercel 环境变量 `NEXT_PUBLIC_IMAGE_BASE` 指向 COS，导致 `getImageUrl('/huizzzi.png')` 请求了 COS 上并不存在的文件。
- **修复**: `src/app/about/page.tsx` 改为直接使用本地路径 `src='/huizzzi.png'`，从 Vercel 自身加载。单张 2.6MB 的肖像图无需走 COS。

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

- [ ] 将 `public/huizzzi.png` 上传到 COS 根目录，修复 About 页面照片
- [ ] 开启腾讯云 CDN 加速，替换 COS 默认域名
- [ ] 批量压缩 `works/photos/` 和 `works/thumbs/` 中的图片
- [ ] 验证国内访问速度（F12 Network 检查图片加载时间）
- [ ] 考虑移除 Git 仓库中的 `public/works` 大文件（使用 `git-filter-repo` 或 BFG）
- [ ] 配置 GitHub Actions 自动部署到 COS（可选）

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

*最后更新: 2026-05-14*
