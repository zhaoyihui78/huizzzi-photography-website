# HUI ZZZI 摄影网站 - 操作指南

> 本文档记录网站维护、图片加速、部署等所有操作的具体步骤。

---

## 目录

1. [图片上传到腾讯云 COS](#一图片上传到腾讯云-cos)
2. [视频上传到腾讯云 COS](#二视频上传到腾讯云-cos)
3. [开启 CDN 加速](#三开启-cdn-加速)
4. [修改 Vercel 环境变量](#四修改-vercel-环境变量)
5. [本地开发到部署的完整流程](#五本地开发到部署的完整流程)
6. [Git 配置与代码推送](#六git-配置与代码推送)
7. [图片压缩优化](#七图片压缩优化)
8. [视频压缩优化](#八视频压缩优化)
9. [COS 费用与免费额度](#九cos-费用与免费额度)
10. [常见问题排查](#十常见问题排查)
11. [PWA 与 Service Worker 配置](#十一pwa-与-service-worker-配置)
12. [本地开发分支 local-dev](#十二本地开发分支-local-dev)
13. [COS Cache-Control 配置](#十三cos-cache-control-配置)

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

## 二、视频上传到腾讯云 COS

### 2.1 视频与图片的区别

| 对比项 | 图片 | 视频 |
|--------|------|------|
| 单文件大小 | 几十 KB ~ 几 MB | 几十 MB ~ 几百 MB |
| 能否放入 Git | ✅ 可以 | ❌ 太大，会拖慢 Vercel 构建 |
| 存储位置 | `public/works/photos/` | **必须放在 COS** |
| 加载方式 | 页面加载时同时请求 | 点击/悬浮时才播放 |

**结论**：视频绝对不能提交到 Git 仓库，必须单独上传到 COS。

### 2.2 压缩视频（上传前必须做）

原始视频通常几百 MB，直接上传会消耗大量流量费。需要先压缩到适合网页播放的大小。

**压缩标准**：

| 参数 | 建议值 | 说明 |
|------|--------|------|
| 分辨率 | 1920x1080 (1080p) | 足够清晰，兼容性最好 |
| 视频编码 | H.264 (libx264) | 所有浏览器都支持 |
| 视频码率 | 3-5 Mbps | 平衡画质和体积 |
| 音频码率 | 128 kbps | 足够 |
| 目标大小 | < 50MB/个 | Vercel 单文件上限 |

**使用 ffmpeg 压缩**（如果已安装）：

```bash
ffmpeg -i "原始视频.mp4" -vf scale=1920:-2 -c:v libx264 -preset medium -crf 28 -c:a aac -b:a 128k -movflags +faststart "压缩后.mp4"
```

**压缩效果参考**：
- 故宫春雪：160MB → 11MB
- 北海公园的秋：315MB → 37MB
- 颐和园的晚霞：256MB → 13MB
- 圆明园的秋：217MB → 46MB
- 祈年纳福：207MB → 10MB
- 地坛的夏：94MB → 16MB

### 2.3 上传视频到 COS

1. 打开 [腾讯云 COS 控制台](https://console.cloud.tencent.com/cos)
2. 进入存储桶 `photo-1392627581` → **文件列表**
3. 进入 `works/videos/` 目录（没有就新建文件夹）
4. 在里面创建与视频同名的子文件夹：
   ```
   works/videos/
     beihaiqiu/
     ditandexia/
     gugongchunxue/
     xinniantiantan/
     yiheyuandexia/
     yuanmingyuande/
   ```
5. 将压缩后的 `.mp4` 文件分别拖入对应文件夹
6. 确认上传后文件路径为：
   ```
   works/videos/gugongchunxue/故宫春雪.mp4
   works/videos/beihaiqiu/北海公园的秋.mp4
   ...
   ```

### 2.4 生成视频封面（poster）

每个视频需要一个封面图，用于页面未播放时展示。

**用 ffmpeg 截取封面**：

```bash
ffmpeg -i "视频.mp4" -ss 00:00:01 -vframes 1 -q:v 2 "poster.jpg"
```

将生成的 `poster.jpg` 与 `.mp4` 放在同一目录下，一起上传到 COS。

### 2.5 修改代码引用 COS 视频

视频上传到 COS 后，需要修改代码让网站从 COS 加载视频。

**文件**：`src/config/media.ts`

```typescript
const COS_BASE = 'https://photo-1392627581.cos.ap-beijing.myqcloud.com';

export function getVideoUrl(_title: string, localPath: string): string {
  const base = process.env.NEXT_PUBLIC_VIDEO_BASE ?? COS_BASE;
  if (base) {
    return `${base}${localPath}`;
  }
  return localPath; // 本地开发备用
}
```

**本地开发时的特殊处理**：

如果想在本地开发时不用 COS（避免消耗流量），可以临时设置环境变量：

```bash
NEXT_PUBLIC_VIDEO_BASE='' npm run dev
```

这样本地会读取 `public/works/videos/` 下的本地视频。

### 2.6 排除视频文件提交到 Git

**文件**：`.gitignore`

确保包含以下规则：

```gitignore
# 视频文件不上传 Git（通过 COS 加载）
*.mp4
```

如果之前误把视频提交到了 Git，用以下命令移除（保留本地文件）：

```bash
git rm --cached -r public/works/videos/
git commit -m "移除视频文件，改为 COS 加载"
```

---

## 三、开启 CDN 加速

> ⚠️ **重要前提**：使用腾讯云**国内 CDN** 需要域名 ICP 备案。如果你的域名没有备案，无法开启国内 CDN 加速。
>
> 未备案的情况下，图片仍然可以通过 COS 默认域名访问（服务器在国内），速度已经比 Vercel 海外节点快很多。

### 3.1 备案后开启 CDN（有备案）

如果你已完成备案：

1. 打开 [腾讯云 CDN 控制台](https://console.cloud.tencent.com/cdn)
2. 点击 **域名管理** → **添加域名**
3. **加速域名**：填入你的 COS 域名
   ```
   photo-1392627581.cos.ap-beijing.myqcloud.com
   ```
4. **源站类型**：选择 **COS**
5. **选择存储桶**：选择你的存储桶
6. 点击 **提交**

提交后腾讯云会分配一个 CDN 加速域名，类似：
```
photo-1392627581.cos.ap-beijing.myqcloud.com.cdn.dnsv1.com
```

然后将 Vercel 环境变量 `NEXT_PUBLIC_IMAGE_BASE` 改为 CDN 加速域名。

### 3.2 未备案的替代方案

如果你没有备案：

- **先用 COS 默认域名**（已在使用，速度可以接受）
- **压缩图片**（见第七节）来进一步提升加载速度
- 未来备案后再开启 CDN

> **注意**：COS 控制台里的"自定义 CDN 加速域名"也要求你有一个已备案的自定义域名（如 `img.huizzzi.art`），否则无法使用。

---

## 四、修改 Vercel 环境变量

### 4.1 进入 Vercel 环境变量设置

1. 打开 [Vercel Dashboard](https://vercel.com/dashboard)
2. 进入你的项目 `huizzzi-photography-website`
3. 点击顶部 **Settings**
4. 左侧菜单点击 **Environment Variables**

### 4.2 添加/修改环境变量

点击 **Add Environment Variable**，填写：

| 字段 | 值（示例） |
|------|-----------|
| **Key** | `NEXT_PUBLIC_IMAGE_BASE` |
| **Value** | `https://photo-1392627581.cos.ap-beijing.myqcloud.com` |

- 如果使用 CDN，Value 改为 CDN 加速域名

### 4.3 重新部署

修改环境变量后，Vercel 不会自动重新部署，需要手动触发：

1. 进入 **Deployments** 标签
2. 点击最新一次部署右侧的 **Redeploy**
3. 选择 **Use existing Build Cache**
4. 点击 **Redeploy**

---

## 五、本地开发到部署的完整流程

### 5.1 本地修改代码

```bash
cd ~/Downloads/huizzzi-photography-website-main

# 修改代码...
```

### 5.2 本地预览（可选）

```bash
npm run dev
```

访问 http://localhost:3000 预览效果。

### 5.3 提交代码

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

### 5.4 Vercel 自动部署

推送后 Vercel 会自动：
1. 拉取最新代码
2. 执行 `npm run build`
3. 部署到生产环境
4. 更新 `www.huizzzi.art`

整个过程约 1-3 分钟。

### 5.5 验证部署

1. 访问 `https://www.huizzzi.art`
2. 按 **F12** → **Network** → **Img**
3. 确认图片 URL 包含 `myqcloud.com` 或 CDN 域名

---

## 六、Git 配置与代码推送

### 6.1 首次配置 Git

如果你换了电脑或重装系统，需要重新配置：

```bash
# 设置用户名和邮箱（必须与 GitHub 账户一致）
git config --global user.name "zhaoyihui78"
git config --global user.email "zhaoyihui78@gmail.com"
```

### 6.2 使用 Token 推送（无 gh CLI 时）

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

### 6.3 检查远程仓库地址

```bash
git remote -v
```

应该显示：
```
origin  https://github.com/zhaoyihui78/huizzzi-photography-website.git (fetch)
origin  https://github.com/zhaoyihui78/huizzzi-photography-website.git (push)
```

---

## 七、图片压缩优化

### 7.1 为什么需要压缩

当前 `public/works` 文件夹约 **91MB**，单张图片可能 2-5MB，网页加载会非常慢。

### 7.2 压缩标准

| 用途 | 建议宽度 | 建议格式 | 建议大小 |
|------|---------|---------|---------|
| 缩略图（thumbs） | 600px | WebP 或 JPEG | < 100KB |
| 详情大图（photos） | 1920px | WebP 或 JPEG | 200-500KB |
| 海报/封面 | 1920px | WebP 或 JPEG | < 500KB |

### 7.3 压缩工具

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

### 7.4 上传压缩后的图片

压缩完成后，将压缩后的图片上传到 COS 覆盖原有文件。

---

## 八、视频压缩优化

### 8.1 为什么需要压缩

原始视频通常几百 MB，直接上传会消耗大量流量费，也会拖慢访客加载速度。压缩后可以在保证画质的前提下大幅减少体积。

### 8.2 压缩标准

| 参数 | 建议值 | 说明 |
|------|--------|------|
| 分辨率 | 1920x1080 (1080p) | 足够清晰，兼容性最好 |
| 视频编码 | H.264 (libx264) | 所有浏览器都支持 |
| 视频码率 | 3-5 Mbps | 平衡画质和体积 |
| 音频码率 | 128 kbps | 足够 |
| 目标大小 | < 50MB/个 | 控制单文件体积 |

### 8.3 使用 ffmpeg 压缩

```bash
ffmpeg -i "原始视频.mp4" -vf scale=1920:-2 -c:v libx264 -preset medium -crf 28 -c:a aac -b:a 128k -movflags +faststart "压缩后.mp4"
```

### 8.4 生成视频封面

每个视频需要一个封面图（poster），用于页面未播放时展示：

```bash
ffmpeg -i "视频.mp4" -ss 00:00:01 -vframes 1 -q:v 2 "poster.jpg"
```

### 8.5 压缩效果参考

| 视频 | 原始大小 | 压缩后 |
|------|---------|--------|
| 祈年纳福 | 207MB | ~10MB |
| 故宫春雪 | 160MB | ~11MB |
| 地坛的夏 | 94MB | ~16MB |
| 颐和园的晚霞 | 256MB | ~13MB |
| 北海公园的秋 | 315MB | ~37MB |
| 圆明园的秋 | 217MB | ~46MB |

6 部视频从约 1.25GB 压缩到约 133MB，压缩率近 **90%**。

---

## 九、COS 费用与免费额度

### 9.1 新用户免费额度

腾讯云 COS 对新用户有**每月免费额度**：

| 项目 | 免费额度 | 你的情况 |
|------|---------|---------|
| **标准存储容量** | 50GB/月 | 你只有 91MB ✅ 完全免费 |
| **标准存储请求** | 100万次/月 | 个人网站几乎用不完 ✅ |
| **外网下行流量** | 10GB/月 | **关键！看访客量** |

> 免费额度详情参考官方文档：https://cloud.tencent.com/document/product/436/6240

**10GB 流量是什么概念**：
- 你的网站图片总计约 90MB
- 10GB ÷ 90MB ≈ **111 个完整访客**
- 即每月有 100 多人完整浏览你的网站，**不花钱**

**视频对流量的影响**：

当前 6 部压缩后的视频总计约 **133MB**，单个大小如下：

| 视频 | 大小 | 访客消耗（完整观看）|
|------|------|-------------------|
| 祈年纳福 | ~10MB | 1 次播放 ≈ 10MB |
| 故宫春雪 | ~11MB | 1 次播放 ≈ 11MB |
| 地坛的夏 | ~16MB | 1 次播放 ≈ 16MB |
| 颐和园的晚霞 | ~13MB | 1 次播放 ≈ 13MB |
| 北海公园的秋 | ~37MB | 1 次播放 ≈ 37MB |
| 圆明园的秋 | ~46MB | 1 次播放 ≈ 46MB |

**合计**：图片 90MB + 视频 133MB = **223MB/完整访客**

- 10GB ÷ 223MB ≈ **45 个完整访客**
- 也就是说，如果每位访客都完整看完所有视频，每月约 45 人就会用完免费流量
- **实际场景中**：大部分访客只看部分视频，因此真实可承受的访客数会更高（估计 80-150 人）

> **建议**：视频确实会显著增加流量消耗，但目前仍在免费额度内。如果未来流量超出，优先购买 COS 流量包或开启 CDN（需备案）。

### 9.2 超出免费额度后怎么计费

超出后会**自动按量计费**，从腾讯云账户余额扣款：

| 项目 | 单价 |
|------|------|
| 外网下行流量（中国大陆） | 约 **0.5-0.8 元/GB** |
| 标准存储容量 | 约 **0.12 元/GB/月** |

**举例**：
- 某个月用了 20GB 流量（超出 10GB）
- 多出的 10GB 约扣 **5-8 元**

### 9.3 如何避免意外扣费

#### 方法 1：设置额度告警（推荐）

1. [腾讯云费用中心](https://console.cloud.tencent.com/expense)
2. 绑定微信/手机，开启**余额不足告警**
3. COS 控制台 → 存储桶 → **基础配置** → **默认告警**
   - 已默认开启：当 1 分钟内外网下行流量 > **5000MB** 时发告警

#### 方法 2：购买 COS 资源包（封顶）

如果担心超量，可以购买 **COS 标准存储流量包**：

- **购买地址**：https://buy.cloud.tencent.com/cos
- **推荐规格**：50GB 或 100GB 流量包
- **效果**：费用优先从包里扣，用完才按量计费

> **注意**：COS 流量包 和 CDN 流量包 是两种东西，**不能互相抵扣**。

### 9.4 已买 CDN 流量包但无法使用？

如果你之前买了 CDN 流量包（如 17 元 100GB），但因为没有备案无法开启 CDN：

**可以退订**：
1. 打开 [腾讯云 CDN 控制台](https://console.cloud.tencent.com/cdn)
2. 左侧菜单 → **资源包管理**
3. 找到你买的流量包
4. 点击 **自助退订**（需满足"未使用且未过期"）
5. 钱会原路退回

### 9.5 费用优化建议

| 阶段 | 建议 |
|------|------|
| **初期（访客少）** | 什么都不买，先白嫖免费额度 |
| **观察期（1-2个月）** | 在费用中心看实际账单 |
| **流量超 10GB/月** | 考虑买 COS 流量包，比按量便宜 30-50% |
| **备案完成后** | 开启 CDN，此时 CDN 流量包就能用了 |

### 9.6 当前费用汇总

| 项目 | 费用 |
|------|------|
| 域名 `huizzzi.art` | 18 元/首年 |
| COS 存储（91MB） | 免费（50GB 额度内）|
| COS 流量 | 免费（10GB/月 额度内）|
| CDN 流量包（买了但暂不能用）| 17 元（建议退订）|

---

## 十、常见问题排查

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
   - 参考第七节压缩图片体积

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

## 十一、PWA 与 Service Worker 配置

### 11.1 功能说明

网站已配置 PWA（渐进式 Web 应用）和 Service Worker，实现以下功能：
- **离线缓存图片**：访客首次访问后，COS 图片和视频会被缓存到浏览器，后续访问不再消耗 COS 流量
- **加速重复访问**：缓存优先策略让二次加载几乎 instantaneous
- **可安装到桌面**：支持"添加到主屏幕"，像原生 App 一样使用

### 11.2 相关文件

| 文件 | 说明 |
|------|------|
| `public/manifest.json` | PWA 配置文件，定义应用名称、图标、主题色 |
| `public/sw.js` | Service Worker 脚本，处理缓存逻辑 |
| `src/components/ServiceWorkerRegister.tsx` | React 组件，在客户端注册 Service Worker |
| `src/app/layout.tsx` | 引入 `ServiceWorkerRegister` 和 `manifest` |

### 11.3 缓存策略

Service Worker 使用两套缓存：

1. **`huizzzi-cache-v1`**（静态资源）
   - 缓存：`/logo.svg`、`/manifest.json` 等静态文件
   - 策略：**Stale While Revalidate**（先读缓存，同时后台更新）

2. **`huizzzi-images-v1`**（媒体资源）
   - 缓存：COS 图片（`myqcloud.com` 域名）和视频
   - 策略：**Cache First**（先读缓存，没有才请求网络并写入缓存）
   - 缓存上限：200 个文件

### 11.4 更新缓存

如果上传了新图片到 COS，需要让用户浏览器更新缓存：

**方法 1：修改 Service Worker 文件（推荐）**
1. 打开 `public/sw.js`
2. 修改版本号，例如 `huizzzi-cache-v1` → `huizzzi-cache-v2`
3. 提交并推送，用户下次访问会自动清理旧缓存

**方法 2：用户手动清除**
- Chrome: F12 → Application → Storage → Clear site data

### 11.5 本地开发注意事项

- `npm run dev`（开发模式）**不会注册 Service Worker**，这是正常的
- `npm run build` + `npx serve@latest out`（生产预览）会正常工作
- 本地测试 SW 时必须用 `localhost` 或 `https`，不支持 `file://`

---

## 十二、本地开发分支 local-dev

### 12.1 分支目的

`local-dev` 分支用于**零 COS 流量消耗**的本地开发测试。所有图片和视频都走本地 `public/works/` 目录，不请求腾讯云 COS。

### 12.2 分支差异

| 项目 | `main` 分支 | `local-dev` 分支 |
|------|------------|-----------------|
| 图片加载 | 走 COS (`myqcloud.com`) | 走本地 `public/works/photos/` |
| 视频加载 | 走 COS (`myqcloud.com`) | 走本地 `public/works/videos/` |
| `src/config/media.ts` | 使用 `COS_BASE` | 直接返回 `localPath` |
| `public/works/` 目录 | 只有少量本地备用图 | 包含全部照片、缩略图、视频（~248MB）|
| 适合场景 | 生产部署、预览效果 | 本地开发、调试代码 |

### 12.3 切换到 local-dev 分支

```bash
# 1. 创建并切换到 local-dev 分支（基于当前 main）
git checkout -b local-dev

# 2. 确保本地资源已下载
# public/works/photos/    <- 全部照片
# public/works/thumbs/    <- 全部缩略图
# public/works/videos/    <- 全部视频 + poster.jpg

# 3. 修改 src/config/media.ts（local-dev 版本已修改）
# 确保 getVideoUrl() 直接返回 localPath

# 4. 启动本地开发服务器
npm run dev
```

### 12.4 从 COS 下载全部资源到本地

如果需要在另一台机器上准备 local-dev 环境，使用以下脚本：

```bash
#!/bin/bash
# download-assets.sh - 从 COS 下载所有资源到本地

BASE="https://photo-1392627581.cos.ap-beijing.myqcloud.com"
OUT="public/works"

# 照片列表（根据 series.ts 中的定义补充）
photos=(
  "beijing01.jpg" "beijing02.jpg" ...
)

# 缩略图列表
thumbs=(
  "beijing01.jpg" "beijing02.jpg" ...
)

# 下载照片
for f in "${photos[@]}"; do
  curl -L -o "$OUT/photos/$f" "$BASE/works/photos/$f"
done

# 下载缩略图
for f in "${thumbs[@]}"; do
  curl -L -o "$OUT/thumbs/$f" "$BASE/works/thumbs/$f"
done

# 下载视频（以 gugongchunxue 为例）
curl -L -o "$OUT/videos/gugongchunxue/gugongchunxue.mp4" "$BASE/works/videos/gugongchunxue/gugongchunxue.mp4"
curl -L -o "$OUT/videos/gugongchunxue/poster.jpg" "$BASE/works/videos/gugongchunxue/poster.jpg"
# ... 其他视频同理
```

> **注意**：视频和缩略图完整列表请参考 `src/data/series.ts` 中的定义。

### 12.5 分支管理规范

1. **功能开发**：在 `local-dev` 分支上写代码、调试，不消耗 COS 流量
2. **代码同步**：开发完成后，将代码改动（不含 `public/works` 大文件）合并到 `main`
3. **不要合并媒体文件**：`local-dev` 分支的 `public/works/` 大文件**不要**通过 PR 合并到 `main`
4. **`.gitignore`**：确保 `main` 和 `local-dev` 都排除 `*.mp4`，但 `local-dev` 可以通过 `--force` 强制追踪（如果需要在分支间共享本地视频）

---

## 十三、COS Cache-Control 配置

### 13.1 为什么需要配置

COS 默认返回的 HTTP 头中没有 `Cache-Control`，导致浏览器**每次访问都重新下载**图片，既浪费流量又降低体验。

### 13.2 配置方法

1. 打开 [腾讯云 COS 控制台](https://console.cloud.tencent.com/cos)
2. 进入存储桶 → **文件列表**
3. 选择需要配置的文件/文件夹
4. 点击 **更多操作** → **修改元数据**
5. 添加：**`Cache-Control: public, max-age=31536000, immutable`**
   - `public`：允许 CDN/浏览器缓存
   - `max-age=31536000`：缓存 1 年（秒）
   - `immutable`：文件内容不会改变（适合哈希命名的文件）

### 13.3 批量配置

对于整个 `works/` 目录，建议使用腾讯云 CLI 或 API 批量设置：

```bash
# 使用 coscli 工具（需先安装配置）
coscli config init

# 批量设置 Cache-Control
coscli hash -r cos://photo-1392627581/works/ --headers "Cache-Control: public, max-age=31536000, immutable"
```

### 13.4 验证配置

在浏览器 F12 → Network → 点击图片请求，查看 Response Headers：
```
cache-control: public, max-age=31536000, immutable
```

如果有这个头，说明配置成功。

---

*最后更新: 2026-05-14*
