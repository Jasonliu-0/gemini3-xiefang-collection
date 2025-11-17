# 🌸 Gemini 3.0-撷芳集

**撷芳拾翠 · 集珍纳华**

一个优雅的 AI 作品展示平台，专为展示和分享通过 Gemini 3.0 创作的优秀作品而设计。

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8)](https://tailwindcss.com/)

---

## 📜 名字寓意

**撷芳集** - 采撷芬芳，汇集佳作

- 🌸 **撷芳** - 采撷芬芳，选取精华
- 💎 **拾翠** - 拾取翠玉，收藏珍品
- ✨ **集珍** - 汇集珍宝，作品如珠
- 🎨 **纳华** - 容纳华美，包罗万象

> 采撷芬芳如花的优秀作品，拾取翠玉般的精品创作，汇集成珍贵的作品集，容纳一切华美的 AI 艺术。

---

## ✨ 核心特色

### 🎯 创新功能

1. **🎨 HTML 代码直接上传**
   - 支持粘贴 HTML/SVG 代码直接上传
   - 自动 Base64 编码存储
   - 无需配置文件存储服务

2. **🖼️ 实时代码预览**
   - 首页卡片自动渲染 HTML 内容
   - iframe 安全沙盒隔离
   - 所见即所得的预览效果

3. **🔐 多平台登录**
   - Linux DO OAuth2 登录
   - GitHub OAuth2 登录
   - 访客浏览模式

4. **💬 智能评论系统**
   - 登录用户自动使用头像和昵称
   - 支持 5 星评分
   - 评论分页加载
   - 相对时间显示

5. **🔍 强大搜索筛选**
   - 实时搜索（标题/描述/作者）
   - 热门标签筛选
   - 多种排序方式（最新/浏览/点赞）

6. **📱 完整的交互功能**
   - 防重复点赞系统
   - 分享到社交平台
   - 一键回到顶部
   - 源码下载和预览

7. **🌙 深色模式**
   - 优雅的深色主题
   - 一键切换，平滑过渡
   - 所有组件完美适配

8. **📊 数据统计图表**
   - 热门标签分布饼图
   - 月度作品趋势图
   - TOP 10 作品浏览量对比
   - 实时数据可视化

9. **🛡️ 管理员后台**
   - 权限控制系统
   - 作品管理面板
   - 数据监控概览
   - 作品编辑和删除功能

---

## 🎯 完整功能列表

### 🔐 用户系统
- ✅ Linux DO OAuth2 登录
- ✅ GitHub OAuth2 登录
- ✅ 访客浏览模式
- ✅ 用户信息展示
- ✅ 登录状态管理

### 📤 作品上传
- ✅ HTML/SVG 代码粘贴上传
- ✅ 文件拖拽上传
- ✅ 智能标签选择器
- ✅ 自动缩略图生成
- ✅ 作品链接和源码仓库链接
- ✅ 作品描述和标签

### 🖼️ 作品展示
- ✅ 响应式网格布局
- ✅ HTML 实时预览
- ✅ 热门标签云
- ✅ 实时统计数据
- ✅ 毛玻璃效果卡片
- ✅ 优雅的动画过渡

### 🔍 搜索与筛选
- ✅ 实时搜索
- ✅ 标签筛选
- ✅ 排序功能（最新/浏览量/点赞数）
- ✅ 筛选条件显示
- ✅ 快速清除筛选

### 📱 作品详情
- ✅ 全屏预览
- ✅ 代码语法高亮
- ✅ 一键复制代码
- ✅ 源码下载（登录用户）
- ✅ 外部链接跳转
- ✅ 分享功能

### ❤️ 互动功能
- ✅ 智能评论系统
- ✅ 评论分页加载
- ✅ 5 星评分
- ✅ 防重复点赞
- ✅ 分享到社交平台
- ✅ 一键回到顶部

### 🎨 UI/UX
- ✅ 优雅的中式美学设计
- ✅ 响应式布局（完美适配移动端）
- ✅ 毛玻璃效果
- ✅ 平滑动画过渡
- ✅ 首页背景轮播
- ✅ 打字机效果标语
- ✅ **深色模式切换**

### 📊 数据分析
- ✅ **热门标签分布饼图**
- ✅ **月度作品趋势图**
- ✅ **TOP 10 作品排行榜**
- ✅ 实时统计数据展示

### 🛡️ 管理功能
- ✅ **管理员权限系统**
- ✅ **作品管理后台**
- ✅ **数据监控面板**
- ✅ **作品编辑和删除功能**

---

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm / yarn / pnpm
- Supabase 账号（免费）

### 安装步骤

```bash
# 1. 克隆项目
git clone https://github.com/Jasonliu-0/gemini3-xiefang-collection.git
cd gemini3-xiefang-collection

# 2. 安装依赖
npm install

# 3. 配置环境变量
# 创建 .env.local 文件
cp .env.example .env.local

# 4. 编辑 .env.local，填入配置信息
# 详见下方"环境变量配置"章节

# 5. 初始化数据库
# 在 Supabase SQL Editor 中运行 supabase-setup.sql

# 6. 启动开发服务器
npm run dev

# 7. 访问应用
# http://localhost:3000
```

---

## ⚙️ 环境变量配置

创建 `.env.local` 文件并填入以下配置：

```bash
# ============================================
# Supabase 配置（必需）
# ============================================
# 在 https://supabase.com 创建项目后获取
NEXT_PUBLIC_SUPABASE_URL=你的_Supabase_项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的_Supabase_匿名密钥

# ============================================
# Linux DO OAuth2 配置（可选）
# ============================================
# 在 https://connect.linux.do 申请应用
NEXT_PUBLIC_LINUX_DO_CLIENT_ID=你的_Client_ID
LINUX_DO_CLIENT_SECRET=你的_Client_Secret
NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000/api/auth/callback

# ============================================
# GitHub OAuth2 配置（可选）
# ============================================
# 在 https://github.com/settings/developers 创建应用
NEXT_PUBLIC_GITHUB_CLIENT_ID=你的_GitHub_Client_ID
GITHUB_CLIENT_SECRET=你的_GitHub_Client_Secret
NEXT_PUBLIC_GITHUB_REDIRECT_URI=http://localhost:3000/api/auth/github-callback
```

---

## 🗄️ 数据库设置

### 1. 创建 Supabase 项目

访问 [Supabase](https://supabase.com)，创建免费项目。

### 2. 运行初始化脚本

在 Supabase 控制台的 **SQL Editor** 中运行 `supabase-setup.sql`。

### 3. 配置行级安全策略（可选）

如果遇到权限问题，可以临时禁用 RLS：

```sql
ALTER TABLE works DISABLE ROW LEVEL SECURITY;
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE likes DISABLE ROW LEVEL SECURITY;
```

> ⚠️ 注意：生产环境建议保持 RLS 启用并正确配置策略。

---

## 🔐 OAuth 登录配置

### Linux DO 登录

1. 访问 [Linux DO Connect](https://connect.linux.do)
2. 创建新应用，填写以下信息：
   - **应用名**：Gemini 3.0-撷芳集
   - **应用主页**：`http://localhost:3000`（或你的域名）
   - **应用描述**：AI 作品展示平台
   - **回调地址**：`http://localhost:3000/api/auth/callback`
3. 获取 `Client ID` 和 `Client Secret`
4. 填入 `.env.local`

### GitHub 登录

1. 访问 [GitHub Developer Settings](https://github.com/settings/developers)
2. 创建 OAuth App：
   - **Application name**：Gemini 3.0-撷芳集
   - **Homepage URL**：`http://localhost:3000`
   - **Authorization callback URL**：`http://localhost:3000/api/auth/github-callback`
3. 获取 `Client ID` 和 `Client Secret`
4. 填入 `.env.local`

---

## 📊 权限说明

| 功能 | 访客 | 登录用户 |
|------|:----:|:--------:|
| 浏览作品 | ✅ | ✅ |
| 搜索筛选 | ✅ | ✅ |
| 查看详情 | ✅ | ✅ |
| 分享作品 | ✅ | ✅ |
| **上传作品** | ❌ | ✅ |
| **下载源码** | ❌ | ✅ |
| **预览代码** | ❌ | ✅ |
| **发表评论** | ❌ | ✅ |
| **点赞作品** | ✅ | ✅ |

---

## 📝 使用指南

### 上传作品

1. 点击右上角「上传作品」按钮
2. 填写作品信息：
   - **标题**（必填）
   - **描述**（可选）
   - **作品链接**（可选）
   - **源码**：粘贴 HTML/SVG 代码或上传文件
   - **源码仓库链接**（可选）：GitHub、GitLab 等
   - **标签**（至少选择一个）
3. 点击「上传作品」完成

### 查看作品

- 首页展示所有作品
- 点击作品卡片查看详情
- 使用搜索框快速查找
- 点击标签筛选相关作品

### 互动功能

- **点赞**：点击爱心按钮为作品点赞
- **评论**：在作品详情页发表评论和评分
- **分享**：点击分享按钮分享到社交平台
- **下载**：登录用户可下载作品源码

### 新功能使用

#### 深色模式
- 点击 Header 右侧的 🌙/☀️ 图标切换主题
- 自动保存偏好设置
- 支持系统主题跟随
- 所有页面和组件完美适配

#### 统计图表
- 首页自动展示数据统计（需至少有 1 个作品）
- 包含热门标签分布、月度趋势、TOP 10 作品
- 位于作品列表底部
- 支持深色模式

#### 管理员后台
- 管理员登录后，Header 显示 🛡️ "管理后台"按钮
- 访问 `/admin` 页面管理所有作品
- 功能包括：
  - 📊 数据概览（总作品数、浏览量、点赞数、今日新增）
  - 🔍 作品列表（支持 HTML 代码预览）
  - ✏️ 编辑作品
  - 🗑️ 删除作品
- 非管理员访问显示"访问受限"

---

## 🚀 部署指南

### Vercel 部署（推荐）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Fork 本项目到你的 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量（同 `.env.local`）
4. 部署完成

**重要**：部署后记得更新 OAuth 回调地址为你的生产域名。

### Docker 部署

```bash
# 构建镜像
docker build -t gemini3-xiefang .

# 运行容器
docker run -p 3000:3000 --env-file .env.local gemini3-xiefang

# 或使用 docker-compose
docker-compose up -d
```

---

## 📂 项目结构

```
gemini3-xiefang-collection/
├── app/                      # Next.js App Router
│   ├── api/                 # API 路由
│   │   └── auth/           # OAuth 回调
│   │       ├── callback/   # Linux.do 回调
│   │       └── github-callback/ # GitHub 回调
│   ├── admin/              # 🆕 管理员后台
│   ├── upload/             # 上传页面
│   ├── works/              # 作品详情页
│   ├── layout.tsx          # 全局布局
│   ├── page.tsx            # 首页
│   └── globals.css         # 全局样式
├── components/              # React 组件
│   ├── ui/                 # UI 基础组件
│   ├── back-to-top.tsx     # 回到顶部
│   ├── comment-section.tsx # 评论组件
│   ├── header.tsx          # 导航栏
│   ├── like-button.tsx     # 点赞按钮
│   ├── login-button.tsx    # 登录按钮
│   ├── theme-toggle.tsx    # 🆕 主题切换
│   ├── theme-provider.tsx  # 🆕 主题提供器
│   ├── stats-dashboard.tsx # 🆕 统计图表
│   ├── source-code-viewer.tsx # 源码查看器
│   ├── upload-form.tsx     # 上传表单
│   ├── work-card.tsx       # 作品卡片
│   └── work-grid.tsx       # 作品网格
├── lib/                     # 工具函数
│   ├── admin.ts            # 🆕 管理员权限
│   ├── auth.ts             # 认证逻辑
│   ├── supabase.ts         # Supabase 客户端
│   └── utils.ts            # 通用工具
├── types/                   # TypeScript 类型
│   └── database.ts         # 数据库类型
├── supabase-setup.sql      # 数据库初始化脚本
├── netlify.toml            # 🆕 Netlify 配置
├── Dockerfile              # Docker 配置
├── docker-compose.yml      # Docker Compose 配置
├── package.json            # 依赖配置
├── tailwind.config.ts      # Tailwind 配置
├── tsconfig.json           # TypeScript 配置
└── README.md               # 项目文档
```

---

## 🎨 技术栈

- **框架**：[Next.js 14](https://nextjs.org/) (App Router)
- **语言**：[TypeScript](https://www.typescriptlang.org/)
- **样式**：[Tailwind CSS](https://tailwindcss.com/)
- **UI 组件**：[shadcn/ui](https://ui.shadcn.com/)
- **数据库**：[Supabase](https://supabase.com/) (PostgreSQL)
- **认证**：OAuth2 (Linux DO / GitHub)
- **部署**：[Netlify](https://www.netlify.com/) / Vercel / Docker
- **图标**：[Lucide Icons](https://lucide.dev/)
- **图表**：[Recharts](https://recharts.org/) - 数据可视化
- **主题**：[next-themes](https://github.com/pacocoursey/next-themes) - 深色模式

---

## 💡 设计理念

### 撷芳集的美学

本项目采用优雅的中式美学设计，融合现代 Web 技术：

- **命名寓意**：撷芳拾翠，集珍纳华
- **视觉风格**：简洁优雅，蓝紫渐变
- **交互体验**：流畅自然，细节精致
- **文化底蕴**：古典诗意，现代演绎

### 技术创新

- **Base64 存储**：避免复杂的文件存储配置
- **实时预览**：所见即所得的展示效果
- **智能评论**：根据登录状态自动适配
- **渐进增强**：访客友好，登录增强

---

## 🐛 常见问题

<details>
<summary><b>Q: 上传失败，提示 "row-level security policy" 错误？</b></summary>

**A:** 需要禁用 RLS 或正确配置策略：

```sql
ALTER TABLE works DISABLE ROW LEVEL SECURITY;
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE likes DISABLE ROW LEVEL SECURITY;
```
</details>

<details>
<summary><b>Q: 首页看不到 HTML 预览？</b></summary>

**A:** 确保：
1. 使用"粘贴代码"方式上传
2. 粘贴完整的 HTML 代码（包含 `<html>` 标签）
3. 不要手动上传缩略图（会自动使用 HTML 预览）
</details>

<details>
<summary><b>Q: OAuth 登录失败？</b></summary>

**A:** 检查：
1. `.env.local` 中的配置是否正确
2. 回调地址是否与 OAuth 应用配置一致
3. 是否重启了开发服务器
4. 浏览器控制台是否有错误信息
</details>

<details>
<summary><b>Q: 如何关闭 OAuth 登录？</b></summary>

**A:** 删除或注释掉 `.env.local` 中对应的配置即可。应用会自动隐藏相关登录按钮。
</details>

<details>
<summary><b>Q: 代码文件大小限制？</b></summary>

**A:** Base64 存储适合 < 1MB 的代码文件。大文件建议使用 Supabase Storage 或外部链接。
</details>

<details>
<summary><b>Q: 如何成为管理员？</b></summary>

**A:** 在 `lib/admin.ts` 文件中的 `ADMIN_USERS` 数组添加你的 GitHub 或 Linux.do 用户名：
```typescript
export const ADMIN_USERS = [
  'Jasonliu-0',
  'your-username', // 添加你的用户名
]
```
重新部署后即可看到管理后台入口。
</details>

<details>
<summary><b>Q: 统计图表不显示？</b></summary>

**A:** 统计图表需要至少有 1 个作品才会显示。上传作品后，在作品列表底部即可看到数据统计。
</details>

<details>
<summary><b>Q: 深色模式如何使用？</b></summary>

**A:** 点击 Header 右侧的月亮/太阳图标即可切换。主题偏好会自动保存，下次访问时保持选择的主题。
</details>

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 如何贡献

1. Fork 本项目
2. 创建特性分支：`git checkout -b feature/AmazingFeature`
3. 提交更改：`git commit -m 'Add some AmazingFeature'`
4. 推送到分支：`git push origin feature/AmazingFeature`
5. 提交 Pull Request

### 参与方式

- 🐛 [报告 Bug](https://github.com/Jasonliu-0/gemini3-xiefang-collection/issues/new)
- 💡 [功能建议](https://github.com/Jasonliu-0/gemini3-xiefang-collection/issues/new)
- 📖 改进文档
- 🔧 提交代码

---

## 📄 开源协议

本项目采用 [MIT License](LICENSE) 开源协议。

您可以自由地：
- ✅ 商业使用
- ✅ 修改源代码
- ✅ 分发
- ✅ 私人使用

唯一要求：保留原作者版权声明。

---

## 🙏 致谢

感谢以下开源项目和服务：

- [Next.js](https://nextjs.org/) - React 全栈框架
- [Supabase](https://supabase.com/) - 开源 Firebase 替代品
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
- [shadcn/ui](https://ui.shadcn.com/) - 精美的 React 组件库
- [Lucide Icons](https://lucide.dev/) - 优雅的图标库
- [Recharts](https://recharts.org/) - 强大的图表库
- [next-themes](https://github.com/pacocoursey/next-themes) - 主题切换解决方案
- [Linux DO](https://linux.do/) - Linux 中文社区
- [Netlify](https://www.netlify.com/) - 前端部署平台

---

## 🎯 路线图

### 已完成 ✅
- [x] 基础作品展示
- [x] 多平台 OAuth 登录
- [x] HTML 代码直接上传
- [x] 实时预览
- [x] 评论和点赞
- [x] 搜索和筛选
- [x] 分享功能
- [x] 回到顶部
- [x] 评论分页

### 新增功能 ✅
- [x] **深色模式** - 优雅的深色主题，一键切换，完美适配
- [x] **统计图表** - 数据可视化，热门标签、月度趋势、TOP 10 作品
- [x] **管理员后台** - 作品管理、数据监控、编辑和删除功能

### 计划中 🚧
- [ ] 用户个人主页
- [ ] 作品收藏功能
- [ ] 高级搜索
- [ ] 多语言支持（完整实现）
- [ ] 数据导出功能
- [ ] 作品分类标签

---

## 📊 项目统计

- **版本**：v3.1.0
- **功能数量**：40+ 个核心功能
- **技术栈**：12+ 个主流技术
- **新增功能**：深色模式、统计图表、多语言、管理后台
- **开发周期**：持续更新中

---

## 📞 联系方式

- **GitHub**：[@Jasonliu-0](https://github.com/Jasonliu-0)
- **项目主页**：[Gemini 3.0-撷芳集](https://github.com/Jasonliu-0/gemini3-xiefang-collection)
- **问题反馈**：[Issues](https://github.com/Jasonliu-0/gemini3-xiefang-collection/issues)

---

## ⭐ Star 历史

如果这个项目对你有帮助，请给个 Star ⭐

[![Star History Chart](https://api.star-history.com/svg?repos=Jasonliu-0/gemini3-xiefang-collection&type=Date)](https://star-history.com/#Jasonliu-0/gemini3-xiefang-collection&Date)

---

## 📸 预览截图

> 截图展示最新功能和界面设计

（可在部署后添加实际截图）

---

**Made with ❤️ by Jasonliu-0**

**撷芳拾翠，集珍纳华 - 在这里，发现并珍藏 AI 创作的璀璨之作！** 🌸✨

---

<div align="center">

### 愿 Gemini 3.0-撷芳集 成为您的 AI 创作珍藏之所！🎨

**[立即开始](https://github.com/Jasonliu-0/gemini3-xiefang-collection) · [查看演示](#) · [报告问题](https://github.com/Jasonliu-0/gemini3-xiefang-collection/issues)**

</div>
