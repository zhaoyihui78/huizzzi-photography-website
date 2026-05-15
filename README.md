# HUI ZZZI Photography Website

[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://www.huizzzi.art)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)

> 个人摄影作品集网站，展示北京城市风光、自然风景、建筑与人文纪实。
>
> 线上地址：[https://www.huizzzi.art](https://www.huizzzi.art)

---

## 技术栈

- **框架**: [Next.js](https://nextjs.org) 16 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **动画**: Framer Motion
- **部署**: Vercel
- **图片存储**: 腾讯云 COS (北京节点)
- **留言系统**: GitHub Discussions + 自定义前端 UI
- **域名**: huizzzi.art (腾讯云)
- **PWA**: Service Worker 离线缓存 + 可安装到主屏幕

---

## 本地开发

```bash
# 安装依赖
npm install

# 创建本地环境变量（如需测试留言提交）
echo "GITHUB_TOKEN=ghp_你的token" > .env.local

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

访问 [http://localhost:3000](http://localhost:3000) 查看效果。

**注意**：由于项目路径含中文时 Turbopack 有兼容 bug，建议将项目放在纯英文路径下运行。

---

## 项目结构

```
├── api/                     # Vercel Serverless Functions
│   └── comment.js           # 留言提交接口（GitHub Discussions）
├── public/                  # 静态资源
│   ├── works/               # 摄影作品与视频（main 分支已迁移至 COS，local-dev 分支保留本地副本）
│   │   ├── photos/
│   │   ├── thumbs/
│   │   └── videos/
│   ├── sw.js                # Service Worker 离线缓存脚本
│   ├── manifest.json        # PWA 配置
│   ├── logo.svg             # HZ 品牌 SVG 图标
│   └── huizzzi.png          # 个人肖像
├── src/
│   ├── app/                 # Next.js App Router 页面
│   │   ├── api/comment/     # 本地开发 API Route
│   │   └── guestbook/       # 留言板页面
│   ├── components/          # 公共组件
│   │   ├── CommentWall.tsx  # 信件墙
│   │   ├── GuestbookForm.tsx# 留言表单
│   │   ├── LetterCard.tsx   # 信件卡片
│   │   ├── LetterModal.tsx  # 信件详情弹窗
│   │   └── GiscusComments.tsx# Giscus 备用组件
│   ├── config/              # 配置文件（图片/视频 URL 解析）
│   ├── data/                # 摄影系列数据
│   └── utils/               # 工具函数
└── next.config.ts           # Next.js 配置
```

---

## 图片加速方案

由于 Vercel 部署在海外，国内访问图片较慢，因此将图片迁移到 **腾讯云 COS** 进行加速。

### 环境变量

在 Vercel 控制台设置以下环境变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `NEXT_PUBLIC_IMAGE_BASE` | `https://photo-1392627581.cos.ap-beijing.myqcloud.com` | COS 存储桶域名 |
| `NEXT_PUBLIC_VIDEO_BASE` | `release` 或 CDN 地址 | 视频加载模式 |

### 配置说明

- `src/config/images.ts` — 图片 URL 解析器，根据环境变量自动拼接完整路径
- `src/config/media.ts` — 视频 URL 解析器，支持本地/GitHub Release/CDN 三种模式
- 本地开发时若不设置 `NEXT_PUBLIC_IMAGE_BASE`，图片会回退到本地 `public/` 目录

### PWA 与离线缓存

网站已配置 Service Worker，实现图片和视频的离线缓存：
- **首次访问**：从 COS 加载资源并缓存到浏览器
- **后续访问**：直接从本地缓存读取，**不消耗 COS 流量**
- **缓存策略**：静态资源 Stale While Revalidate，媒体资源 Cache First
- **更新缓存**：修改 `public/sw.js` 中的版本号（如 `huizzzi-cache-v1` → `v2`）即可触发客户端清理旧缓存

### 本地开发分支 local-dev

为避免开发测试时消耗 COS 流量，创建了 `local-dev` 分支：

```bash
# 切换到本地开发分支（所有资源走本地，不走 COS）
git checkout local-dev
npm run dev
```

- `local-dev` 分支包含完整的 `public/works/` 资源（照片 + 视频，约 248MB）
- `main` 分支的 `public/works/` 仅保留少量备用文件，生产环境从 COS 加载
- **注意**：`local-dev` 的大文件不要合并回 `main`

---

## Guestbook 留言板

网站内置留言板功能，访客可以留下文字留言，以信件墙的形式展示。

- **数据存储**: GitHub Discussions（免费，无需自建数据库）
- **前端展示**: 自定义信件墙 UI，散落的卡片布局，点击展开阅读完整内容
- **提交方式**: 自定义表单（无需登录 GitHub）
- **安全**: IP 限流、敏感词过滤、蜜罐防机器人

### 环境变量

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `GITHUB_TOKEN` | `ghp_xxx` | GitHub Personal Access Token，用于发帖到 Discussions |

在 Vercel 控制台 → Settings → Environment Variables 中配置。

---

## 已知问题

1. **图片体积较大**: `public/works` 总计约 91MB，建议后续压缩并开启 CDN 加速。

详见 [DEVELOPMENT_LOG.md](./DEVELOPMENT_LOG.md)。

---

## 部署

本项目通过 GitHub + Vercel 自动部署：

1. 代码推送至 `main` 分支
2. Vercel 自动触发构建与部署
3. 自定义域名 `www.huizzzi.art` 自动更新

---

## 开发日志

项目进度与问题追踪请查看 [DEVELOPMENT_LOG.md](./DEVELOPMENT_LOG.md)。

---

*Created by HUI ZZZI*