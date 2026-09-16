# MagicalPiano 官网 · Cloudflare Pages 部署指南

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

> ⚠️ **Cloudflare Pages 只认 GitHub 和 GitLab**，不支持 Gitee / 码云 / Bitbucket。
> 你的 `E:\MagicPiano` 仓库远端是 Gitee，所以官网**必须单独建一个 GitHub 仓库**（已完成，见下面第 1 步）。
>
> ⚠️ **用了 Git 集成就不能再切回直传**（官方限制）。想保留直传能力就别走这条路。

#### B-0 · 本地仓库（✅ 已完成）

`E:\MagicPiano\html` 已经是独立 Git 仓库，27 个文件、1 次提交、分支 `main`。
父仓库 `E:\MagicPiano` 的 `.gitignore` 已加 `html/`，两个仓库互不干扰。

```
git log --oneline -1
# 46b2334 feat: 魔琴 MagicPiano 官网首版（静态站 · Cloudflare Pages）
```

#### B-1 · 先把 GitHub 切成中文界面（可选，1 分钟）

GitHub 网页端原生支持简体中文，不用装插件：

- 右上角头像 → **Settings** → 左侧 **Appearance** → **Language** → 选 **简体中文** → **Save preferences**
- 或者把浏览器首选语言设为「中文（简体）」并重启浏览器，GitHub 会自动跟随

> Cloudflare 控制台也能切中文：右上角头像 → **My Profile**？不需要，直接：右上角头像 → **Language** 下拉选 **简体中文**。

#### B-2 · 在 GitHub 建一个空仓库

1. 登录 [github.com](https://github.com)（你的账号是 **WangYang68**）。
2. 右上角 **+** → **New repository**（新建仓库）。
3. 填：
   - **Repository name**：`magicpiano-site`
   - **Public**（公开，Pages 免费版私有仓库也能用，但公开更简单）
   - **不要**勾选 Add a README / .gitignore / license —— 保持**完全空仓库**
4. 点 **Create repository**。
5. 建好后会显示一个以 `https://github.com/WangYang68/magicpiano-site.git` 结尾的地址，**复制它**。

#### B-3 · 把本地仓库推上去

在 `E:\MagicPiano\html` 里执行（把地址换成你自己的）：

```bash
git remote add origin https://github.com/WangYang68/magicpiano-site.git
git push -u origin main
```

第一次 push 会弹窗让你登录 GitHub（浏览器授权，或输用户名 + **Personal Access Token**）。

> **密码填什么**：GitHub 从 2021 年起不再接受账号密码，命令行要用 **Token**。
> 生成：GitHub → 头像 → **Settings** → 左侧最下面 **Developer settings** → **Personal access tokens** → **Tokens (classic)** → **Generate new token (classic)** → 勾选 `repo` → 生成后**复制保存**（只显示一次）。弹窗要密码时贴这个 Token。
>
> **嫌麻烦就用 GitHub Desktop**（见 B-3 备用方案），它是图形界面、中文、自动处理登录。

<details>
<summary><b>B-3 备用：用 GitHub Desktop（全中文图形界面，不用命令行）</b></summary>

1. 下载安装 [GitHub Desktop](https://desktop.github.com/)（Windows 版跟随系统语言，你系统是中文它就是中文）。
2. 打开后 **File → Add local repository**（添加本地仓库）→ 选 `E:\MagicPiano\html`。
3. 它会提示「这个目录已经是 Git 仓库」，直接确认。
4. 顶部菜单 **Repository → Repository settings → Remote** → 填 B-2 第 5 步复制的地址 → Save。
5. 点顶部 **Push origin**（推送），第一次会让你登录 GitHub 授权，跟着点就行。
6. 左下角 History 里能看到那条提交，网页刷新仓库就能看到 27 个文件。

以后更新：改完文件 → Desktop 左下角填 Summary → **Commit to main** → **Push origin**。
</details>

#### B-4 · Cloudflare 连接这个仓库

**情况一：你还没建 Pages 项目**

1. Cloudflare → **Workers & Pages** → **Create** → **Pages** 标签 → **Connect to Git**。
2. 点 GitHub 图标 → **Install & Authorize**（授权 Cloudflare 访问 GitHub）。
3. 选 `magicpiano-site` 仓库 → **Begin setup**。

**情况二：你已经用方式 A 建过项目了**

1. 进那个项目 → **Settings** → **Builds & deployments** → **Git Repository** 那行点 **Manage / Connect**。
2. 授权 GitHub 并选 `magicpiano-site`。
3. 绑定后，以后部署来源就变成 Git 了（**不可逆回直传**）。

#### B-5 · 构建配置（照抄，别改）

| 字段 | 填什么 | 为什么 |
|---|---|---|
| Project name | `magicpiano` | 决定 `xxx.pages.dev` 的名字 |
| Production branch | `main` | 推到这个分支才更新正式站 |
| Framework preset | **`None`** | 纯静态，不需要框架 |
| Build command | **留空** | 没有构建步骤 |
| Build output directory | **`/`** | `index.html` 就在仓库根目录 |
| Root directory | 留空 | 同上 |

点 **Save and Deploy**，等 1 分钟左右，状态变 ✅ Success 就上线了。

#### B-6 · 以后怎么改网站

```bash
cd E:\MagicPiano\html
# 改文件……
git add -A
git commit -m "更新下载链接"
git push
```

推完 30–90 秒，站点自动更新。Cloudflare 项目页能看到每次部署记录和对应的 commit。

> 想跳过某次部署：在 commit 信息开头加 `[skip ci]`，如 `git commit -m "[skip ci] 改个错别字"`。

#### B-7 · 常见问题

| 现象 | 原因 / 解决 |
|---|---|
| `git push` 提示认证失败 | 密码要用 **Token** 不是账号密码；或改用 GitHub Desktop |
| Cloudflare 里看不到仓库 | 授权时没勾选这个仓库 → GitHub → Settings → Applications → **Cloudflare Pages** → Configure → 勾选它 |
| 部署成功但页面 404 | Build output directory 不是 `/`，或 `index.html` 不在仓库根 |
| 提示 "repository is being used by another account" | 这个仓库已绑到别的 Cloudflare 账号，换个仓库名 |
| 中文文件名乱码 | 提交前执行 `git config --global core.quotepath false`（只是显示问题，不影响部署） |

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
