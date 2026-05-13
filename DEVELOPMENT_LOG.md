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

---

## 已知问题

### 问题 1: About 页面个人照片无法加载
- **状态**: 待排查
- **文件位置**: `public/huizzzi.png`（本地存在，2.7MB）
- **代码引用**: `src/app/about/page.tsx` 第 121 行，通过 `getImageUrl('/huizzzi.png')` 引用
- **可能原因**:
  1. COS 存储桶中缺少 `/huizzzi.png` 文件（图片上传时只上传了 `works/` 文件夹）
  2. 文件体积过大（2.7MB），加载超时
- **建议**: 将 `huizzzi.png` 上传到 COS 根目录，或压缩后重新上传

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
| COS 存储 | 按量计费（目前极低） |
| CDN 流量 | 暂未开启 |

---

## 关键链接

- Vercel 项目: https://vercel.com/zhaoyihuis-projects/huizzzi-photography-website
- GitHub 仓库: https://github.com/zhaoyihui78/huizzzi-photography-website
- 腾讯云 COS 控制台: https://console.cloud.tencent.com/cos
- 线上地址: https://www.huizzzi.art

---

*最后更新: 2026-05-13*
