# HUI ZZZI 摄影网站 - 操作指南

> 本文档记录网站维护、图片加速、部署等所有操作的具体步骤。

---

## 目录

1. [图片上传到腾讯云 COS](#一图片上传到腾讯云-cos)
2. [开启 CDN 加速](#二开启-cdn-加速)
3. [修改 Vercel 环境变量](#三修改-vercel-环境变量)
4. [本地开发到部署的完整流程](#四本地开发到部署的完整流程)
5. [Git 配置与代码推送](#五git-配置与代码推送)
6. [图片压缩优化](#六图片压缩优化)
7. [常见问题排查](#七常见问题排查)

---

## 一、图片上传到腾讯云 COS

### 1.1 进入 COS 控制台

1. 打开 [腾讯云 COS 控制台](https://console.cloud.tencent.com/cos)
2. 点击左侧存储桶列表，进入你的存储桶（如 `photo-1392627581`）

### 1.2 上传文件夹

1. 点击顶部菜单 **文件列表**
2. 点击 **上传文件夹**
3. 点击 **选择文件夹**，在本地找到 `public/works` 文件夹
4. 确保上传后 COS 里的目录结构为：
   ```
   works/
     photos/
       beijing01.jpg
       ...
     thumbs/
       beijing01.jpg
       ...
     videos/
       gugongchunxue/
         poster.jpg
       ...
   ```
5. 点击 **上传**

### 1.3 上传单张图片

如果只需要上传个别图片（如 `huizzzi.png`）：

1. **文件列表** → **上传文件**
2. 选择本地图片
3. 确认上传后文件在 COS 根目录（不需要放在文件夹里）

> **注意**：`huizzzi.png` 需要上传到 COS 根目录，不能放在 `works/` 里，因为代码里引用的是 `/huizzzi.png`。

### 1.4 验证图片是否可访问

在浏览器地址栏直接访问：
```
https://photo-1392627581.cos.ap-beijing.myqcloud.com/works/photos/beijing01.jpg
```

如果能看到图片，说明上传成功且权限正确。

---

## 二、开启 CDN 加速

> COS 默认域名虽然能用，但没有 CDN 缓存加速。开启 CDN 后，图片会通过国内节点分发，速度提升明显。

### 2.1 进入 CDN 控制台

1. 打开 [腾讯云 CDN 控制台](https://console.cloud.tencent.com/cdn)
2. 点击 **域名管理** → **添加域名**

### 2.2 添加加速域名

1. **加速域名**：填入你的 COS 域名
   ```
   photo-1392627581.cos.ap-beijing.myqcloud.com
   ```
2. **源站类型**：选择 **COS**
3. **选择存储桶**：选择你的存储桶
4. 点击 **提交**

### 2.3 获取 CDN 加速域名

提交后，腾讯云会分配一个 CDN 加速域名，类似：
```
photo-1392627581.cos.ap-beijing.myqcloud.com.cdn.dnsv1.com
```

### 2.4 修改 Vercel 环境变量

将 `NEXT_PUBLIC_IMAGE_BASE` 的值从 COS 域名改为 CDN 加速域名。

详见下一节。

---

## 三、修改 Vercel 环境变量

### 3.1 进入 Vercel 环境变量设置

1. 打开 [Vercel Dashboard](https://vercel.com/dashboard)
2. 进入你的项目 `huizzzi-photography-website`
3. 点击顶部 **Settings**
4. 左侧菜单点击 **Environment Variables**

### 3.2 添加/修改环境变量

点击 **Add Environment Variable**，填写：

| 字段 | 值（示例） |
|------|-----------|
| **Key** | `NEXT_PUBLIC_IMAGE_BASE` |
| **Value** | `https://photo-1392627581.cos.ap-beijing.myqcloud.com` |

- 如果使用 CDN，Value 改为 CDN 加速域名

### 3.3 重新部署

修改环境变量后，Vercel 不会自动重新部署，需要手动触发：

1. 进入 **Deployments** 标签
2. 点击最新一次部署右侧的 **Redeploy**
3. 选择 **Use existing Build Cache**
4. 点击 **Redeploy**

---

## 四、本地开发到部署的完整流程

### 4.1 本地修改代码

```bash
cd ~/Downloads/huizzzi-photography-website-main

# 修改代码...
```

### 4.2 本地预览（可选）

```bash
npm run dev
```

访问 http://localhost:3000 预览效果。

### 4.3 提交代码

```bash
# 查看修改了哪些文件
git status

# 添加所有修改
git add .

# 提交（写清楚本次修改内容）
git commit -m "描述本次修改，如：优化图片加载速度"

# 推送到 GitHub
git push
```

### 4.4 Vercel 自动部署

推送后 Vercel 会自动：
1. 拉取最新代码
2. 执行 `npm run build`
3. 部署到生产环境
4. 更新 `www.huizzzi.art`

整个过程约 1-3 分钟。

### 4.5 验证部署

1. 访问 `https://www.huizzzi.art`
2. 按 **F12** → **Network** → **Img**
3. 确认图片 URL 包含 `myqcloud.com` 或 CDN 域名

---

## 五、Git 配置与代码推送

### 5.1 首次配置 Git

如果你换了电脑或重装系统，需要重新配置：

```bash
# 设置用户名和邮箱（必须与 GitHub 账户一致）
git config --global user.name "zhaoyihui78"
git config --global user.email "zhaoyihui78@gmail.com"
```

### 5.2 使用 Token 推送（无 gh CLI 时）

如果没有安装 GitHub CLI，推送时会提示输入密码，此时需要 Personal Access Token：

1. 打开 https://github.com/settings/tokens/new
2. Note 填 `Vercel Deploy`
3. Expiration 选 **No expiration**
4. 勾选 **repo** 权限
5. 点击 **Generate token**
6. **复制 token**（只显示一次）

推送时：
- **Username**：`zhaoyihui78`
- **Password**：粘贴刚才复制的 token

### 5.3 检查远程仓库地址

```bash
git remote -v
```

应该显示：
```
origin  https://github.com/zhaoyihui78/huizzzi-photography-website.git (fetch)
origin  https://github.com/zhaoyihui78/huizzzi-photography-website.git (push)
```

---

## 六、图片压缩优化

### 6.1 为什么需要压缩

当前 `public/works` 文件夹约 **91MB**，单张图片可能 2-5MB，网页加载会非常慢。

### 6.2 压缩标准

| 用途 | 建议宽度 | 建议格式 | 建议大小 |
|------|---------|---------|---------|
| 缩略图（thumbs） | 600px | WebP 或 JPEG | < 100KB |
| 详情大图（photos） | 1920px | WebP 或 JPEG | 200-500KB |
| 海报/封面 | 1920px | WebP 或 JPEG | < 500KB |

### 6.3 压缩工具

#### 在线工具（少量图片）

- [TinyPNG](https://tinypng.com/) — 支持 JPEG/PNG/WebP，一次最多 20 张
- [Squoosh](https://squoosh.app/) — Google 出品，可对比压缩前后效果

#### 批量压缩脚本（大量图片）

如果你安装了 Node.js，可以使用 `sharp` 批量压缩：

```bash
# 安装 sharp
npm install -g sharp

# 创建压缩脚本 compress.js
```

脚本示例（`compress.js`）：

```javascript
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = './public/works/photos';
const outputDir = './public/works/photos-compressed';

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

fs.readdirSync(inputDir).forEach(file => {
  if (!file.endsWith('.jpg')) return;
  sharp(path.join(inputDir, file))
    .resize(1920, null, { withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toFile(path.join(outputDir, file))
    .then(() => console.log(`Compressed: ${file}`))
    .catch(err => console.error(`Failed: ${file}`, err));
});
```

运行：
```bash
node compress.js
```

### 6.4 上传压缩后的图片

压缩完成后，将压缩后的图片上传到 COS 覆盖原有文件。

---

## 七、常见问题排查

### Q1: 部署被 Vercel 阻止，提示"提交作者的电子邮件地址无效"

**原因**：Git 提交时用的邮箱与 GitHub 账户不一致。

**解决**：
```bash
git config user.email "zhaoyihui78@gmail.com"
git config user.name "zhaoyihui78"
git commit --amend --reset-author --no-edit
git push --force-with-lease
```

---

### Q2: 图片显示 404（找不到）

**排查步骤**：

1. **检查 COS 里是否有图片**
   - 打开 COS 控制台 → 文件列表
   - 确认 `works/photos/` 文件夹存在且里面有图片

2. **检查图片 URL**
   - 浏览器 F12 → Network → Img
   - 看图片请求 URL 是否以 `myqcloud.com` 结尾
   - 如果不是，说明环境变量未生效

3. **检查环境变量**
   - Vercel → Settings → Environment Variables
   - 确认 `NEXT_PUBLIC_IMAGE_BASE` 已设置且值正确
   - 修改后必须 **Redeploy** 才能生效

4. **检查 COS 权限**
   - 存储桶 → 权限管理
   - 确认是 **公有读私有写**

---

### Q3: 图片加载慢

**排查步骤**：

1. **确认走 COS/CDN**
   - F12 Network 看图片 URL
   - 如果还是 `www.huizzzi.art/...`，说明还在走 Vercel

2. **开启 CDN**
   - 参考第二节开启腾讯云 CDN

3. **压缩图片**
   - 参考第六节压缩图片体积

---

### Q4: 本地 `npm run dev` 图片不显示

**原因**：本地没有设置 `NEXT_PUBLIC_IMAGE_BASE`，代码会回退到本地路径。

**解决**：确保 `public/works` 文件夹在本地存在。

---

### Q5: 如何更新网站内容（新增照片）

**步骤**：

1. **本地准备图片**
   - 新照片放入 `public/works/photos/`
   - 缩略图放入 `public/works/thumbs/`
   - 修改 `src/data/series.ts` 添加新照片数据

2. **上传到 COS**
   - 将新图片上传到 COS 对应目录

3. **提交代码**
   ```bash
   git add .
   git commit -m "新增北京城市风光系列"
   git push
   ```

4. **等待 Vercel 自动部署**

---

## 附录：关键链接汇总

| 平台 | 链接 |
|------|------|
| Vercel Dashboard | https://vercel.com/zhaoyihuis-projects |
| GitHub 仓库 | https://github.com/zhaoyihui78/huizzzi-photography-website |
| 腾讯云 COS 控制台 | https://console.cloud.tencent.com/cos |
| 腾讯云 CDN 控制台 | https://console.cloud.tencent.com/cdn |
| 腾讯云 DNSPod | https://console.dnspod.cn |
| 线上地址 | https://www.huizzzi.art |

---

*最后更新: 2026-05-13*
