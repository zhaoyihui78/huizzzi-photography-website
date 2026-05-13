# HUI ZZZI Photography Website

[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://www.huizzzi.art)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)

> 个人摄影作品集网站，展示北京城市风光、自然风景、建筑与人文纪实。
>
> 线上地址：[https://www.huizzzi.art](https://www.huizzzi.art)

---

## 技术栈

- **框架**: [Next.js](https://nextjs.org) 15 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **动画**: Framer Motion
- **部署**: Vercel
- **图片存储**: 腾讯云 COS (北京节点)
- **域名**: huizzzi.art (腾讯云)

---

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

访问 [http://localhost:3000](http://localhost:3000) 查看效果。

---

## 项目结构

```
├── public/                  # 静态资源
│   ├── works/
│   │   ├── photos/          # 摄影作品（已迁移至 COS）
│   │   ├── thumbs/          # 缩略图（已迁移至 COS）
│   │   └── videos/          # 视频封面（已迁移至 COS）
│   └── huizzzi.png          # 个人肖像
├── src/
│   ├── app/                 # Next.js App Router 页面
│   ├── components/          # 公共组件
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

---

## 已知问题

1. **About 页面个人照片加载失败**: `public/huizzzi.png` 尚未上传到 COS，需要手动上传至存储桶根目录。
2. **图片体积较大**: `public/works` 总计约 91MB，建议后续压缩并开启 CDN 加速。

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