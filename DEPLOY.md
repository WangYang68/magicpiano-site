# MagicPiano 官网 · Cloudflare Pages 部署指南

> 本目录是 `E:\MagicPiano\html\` 下的官方静态站，**直接上传整个 `html` 文件夹到 Cloudflare Pages 即可上线**。不需要 npm / build / 数据库。

---

## 0. 准备：三件事先确认

| 事项 | 状态 |
|---|---|
| ✅ Cloudflare 账号 | 在 [dash.cloudflare.com](https://dash.cloudflare.com) 注册 / 登录 |
| ✅ 域名 | **`magicpiano.eu.cc`**（DigitalPlat 免费域名，已注册成功） |
| ⬜ 域名 NS 托管到 Cloudflare | 见下面第 1 步，**必须先做**，否则 Pages 绑不上自定义域名 |

### 第 1 步（关键）：把 `magicpiano.eu.cc` 的 NS 交给 Cloudflare

`.eu.cc` 是 DigitalPlat 提供的免费域名，它的 DNS 记录不在注册面板里加，而是要把**权威 NS** 指向 Cloudflare，之后所有解析都在 Cloudflare 里管。

1. **Cloudflare 控制台** → 右上角 **Add a domain**（或左侧 Domains → Overview → Add domain）→ 选 **Connect a domain**（不是转入注册商）。
2. 输入完整域名：**`magicpiano.eu.cc`**（不要填父域 `eu.cc`，也不要带 `https://`）→ Continue。
3. 套餐选 **Free** → 点卡片里的 **Select plan**。
4. Cloudflare 会扫描现有 DNS 记录，直接点 **Continue to activation**。
5. 页面会给出**两个 Cloudflare 名称服务器**，长这样（以你页面上显示的为准，别抄我的）：

   ```
   xxxx.ns.cloudflare.com
   yyyy.ns.cloudflare.com
   ```

6. 回到 **DigitalPlat 域名面板**（domain.digitalplat.org）→ **My Domains** → 点 `magicpiano.eu.cc` → 找 **名称服务器 / Name Server** 标签 → 把上面两个地址填进 **NAME SERVER 1 / 2**，其余留空 → **Update**。
7. 回到 Cloudflare 点 **I updated my nameservers**，然后等状态从 `Pending` 变成 **Active**（通常 5–30 分钟，最坏 24 小时）。

> ⚠️ 如果 DigitalPlat 面板里有 **DNSSEC / DS 记录**，先删掉再改 NS，否则会解析失败。
>
> ⚠️ `.eu.cc` 需要**每年在 DigitalPlat 面板点一次 Renew**（到期前 180 天内可续，每次续一年），否则域名会被暂停。建议设个日历提醒。

---

## 1. 创建 Pages 项目

两种方式任选其一，**效果一样**。直接上传适合「没有代码仓库 / 一次性发布」，Git 连接适合「以后想用 push 自动部署」。

### 方式 A · 直接上传（最快，5 分钟）

1. 进入 Cloudflare 控制台 → 左侧 **Workers & Pages** → **Create** → **Pages** 标签 → **Upload assets**。
2. **Project name**：填 `magicpiano`（或你想要的英文短名，最终访问地址会是 `magicpiano.pages.dev`）。
3. **Production branch environment name**：保持默认 `production`。
4. **Asset folder** 这一步**先别动**，直接点 **Create project**。
5. 创建后跳到上传页：
   - **生成 zip**（推荐用脚本，避免多套一层目录）：

     ```bash
     cd E:\MagicPiano\html
     python pack.py
     ```

     会在 `E:\MagicPiano\` 下生成 `site-20260903-0931.zip`，**zip 内根目录直接就是 `index.html`**，并自动排除 `.workbuddy`、临时文件。

     > 手动压缩也可以，但**必须**：进到 `html` 目录里，全选文件 → 压缩。别在外面直接右键压缩 `html` 文件夹，那样会多一层。
   - 把 zip 拖到上传区，点 **Deploy site**。
6. 等 1-2 分钟，部署成功会显示一个 `*.pages.dev` 临时地址，先打开看一眼。

> ⚠️ 重新上传覆盖：以后更新网站，重新压缩整个 `html` 目录上传到同一个项目即可。

### 方式 B · 通过 Git 自动部署（推荐长期使用）

1. 把 `E:\MagicPiano\html` 目录传到 GitHub / GitLab 一个仓库（例如 `yourname/magicpiano-site`）。
2. Cloudflare 控制台 → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**。
3. 选你的仓库 → **Set up builds and deployments**：
   - **Framework preset**：`None`
   - **Build command**：留空
   - **Build output directory**：填 `/` 或 `.`（即仓库根目录，因为 `index.html` 在根目录）
4. 点 **Save and Deploy**，Cloudflare 会自动部署。以后在仓库里 push 改动的文件，网站自动更新。

---

## 3. 绑定 `magicpiano.eu.cc` 到 Pages

> 前提：域名在 Cloudflare 里已经是 **Active** 状态（见第 0 步）。

1. 进入 Pages 项目 → **Custom domains** → **Set up a custom domain**。
2. 输入 **`magicpiano.eu.cc`** → Continue。
3. 因为域名已经托管在 Cloudflare，Cloudflare 会**自动帮你创建 CNAME 记录**（指向 `magicpiano.pages.dev`），直接点 **Activate domain** 即可。
4. 等 1–5 分钟，状态变成 **Active**，SSL 证书自动签发。

### 顺手把 `www` 也加上（可选）

第 2 步再输一次 **`www.magicpiano.eu.cc`** 绑上；然后在 Cloudflare **Rules → Redirect Rules** 里加一条：`www.magicpiano.eu.cc` → 301 → `https://magicpiano.eu.cc/$1`，避免两个地址各算一个站点分散权重。

### 验证

```bash
curl -I https://magicpiano.eu.cc
# 期望：HTTP/2 200，并且有 cloudflare 响应头
```

打开浏览器访问 `https://magicpiano.eu.cc`，确认：导航栏 logo 显示正常、轮播图能翻页、语言切换有效、F12 Console 无 404。

---

## 3.1 已完成的域名配置（无需再改）

`index.html` 头部这些地址**已经全部写死成正式域名**，部署即可生效：

```html
<meta property="og:url"       content="https://magicpiano.eu.cc/">
<meta property="og:image"     content="https://magicpiano.eu.cc/assets/img/og-image.png">
<meta name="twitter:image"    content="https://magicpiano.eu.cc/assets/img/og-image.png">
<link rel="canonical"         href="https://magicpiano.eu.cc/">
```

`robots.txt` 里的 Sitemap 地址也已同步。**以后如果换域名**，全局替换 `magicpiano.eu.cc`（涉及 `index.html`、`robots.txt`、`sitemap.xml` 三个文件）即可。

---

## 4. ⚠️ 重要：为什么 `*.exe` 安装包不放进 Pages

- Cloudflare Pages 单文件大小限制 **25 MB**，魔琴安装包约 60 MB，**放不进去也跑不动**。
- 已用网盘分发：页面里「下载」区块已经指向 **迅雷 / 夸克 / 百度网盘** 三个镜像，不影响用户下载。

如果以后想把安装包也搬到 Cloudflare：免费方案是开通 **Cloudflare R2**（对象存储，10 GB / 月 免费），把 exe 放 R2，再用公开地址替换 `index.html` 里的网盘链接即可。需要做可以随时叫我帮你配。

---

## 5. 目录结构说明

```
E:\MagicPiano\html\          ← 打包这个目录的内容（不要多一层 html/）
├── index.html                主页（中文为默认原文）
├── robots.txt                搜索引擎抓取规则
├── sitemap.xml               站点地图（已写正式域名）
├── _headers                  Cloudflare Pages 缓存与安全头
├── _redirects                备用重定向规则（当前无重定向）
├── DEPLOY.md                 本文件
├── tools_gen_assets.py       一键重新生成 favicon / og-image / logo
├── assets/
│   ├── css/style.css
│   ├── js/
│   │   ├── i18n.js           简 / 繁 / 英 字典（170 个键）
│   │   └── main.js           交互、语言切换、轮播、动画
│   └── img/
│       ├── logo.png          256×256 原版 logo（来自 myapp/images/icon.ico）
│       ├── favicon.ico       多尺寸 16/32/48/64/128/256
│       ├── favicon.png
│       ├── apple-touch-icon.png
│       ├── og-image.png      1200×630 社交分享图
│       └── qq_guild.jpg      腾讯频道二维码
└── img/                      轮播图（9 张，共约 2.2 MB）
    ├── PC_cn.png   PC_tw.png   PC_en.png
    ├── PC_midi.png PC_si.png   PC_sz.png   PC_edit.png
    └── android1.png android2.png
```

> 轮播图清单在 `assets/js/main.js` 顶部的 `SLIDES` 数组里（每项含 `src / cn / tw / en`）。换图只改这里，缩略图和圆点数量自动跟着变。

---

## 6. 常见问题

**Q：上传后访问 404？**
A：检查 zip 包的根目录是不是直接是 `index.html`，不能嵌套一层 `html/index.html`。

**Q：样式乱了 / 字体不对？**
A：F12 打开 Console 看 404 资源路径。`/assets/css/style.css` 等路径都是相对根目录的，不要改 `_redirects`。

**Q：多语言切换没反应？**
A：先在浏览器 Console 看 JS 报错。多半是 `assets/js/i18n.js` 没加载上；或改了文件名但 HTML 里没同步。

**Q：想新增一个游戏按键模式？**
A：在 `index.html` 找到「游戏支持」区块的 `game-grid` 末尾加一个 `<div class="game-item reveal">`，然后去 `assets/js/i18n.js` 在两个字典里都加一条 `g18: '...'`。改完重新上传。

**Q：想换轮播图？**
A：图片放 `img/`，然后改 `assets/js/main.js` 顶部的 `SLIDES` 数组（每项含 `src` / `cn` / `tw` / `en` 四个字段，文案三语同步）。缩略图与圆点会自动生成，数量不用手改。

**Q：想换交流频道二维码 / 链接？**
A：二维码图替换 `assets/img/qq_guild.jpg`；链接在 `index.html` 里搜 `pd.qq.com`，共 3 处（社区卡片按钮、底部 CTA、页脚文案）。

**Q：希望点「下载」直接拉取 exe 而非网盘？**
A：建议把 exe 放进 Cloudflare R2，然后在 `index.html` 的 `.mirror` 区块里把第一项换成 R2 的公开 URL。

---

部署顺利 🚀 有问题随时找我。
