# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Purpose

SD2 漫剧生产平台的前端。当前状态是从**高保真原型**向**生产可用前端**重构升级的过渡期。

后端 API（`lingify_content_api-release-1.0.0/`）已是完整的生产系统。本项目的目标是：还原原型界面设计，逐步将 mock 数据替换为真实 API 调用，所有界面符合 `DESIGN.md` 的设计规范。

## Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19
- **UI Library**: shadcn/ui (base-nova style)
- **Styling**: TailwindCSS v4
- **Language**: TypeScript (strict mode)
- **Icons**: Lucide React
- **Font**: Inter (local woff2) + system CJK

## Commands

- `npm run dev` — 启动开发服务器 (0.0.0.0, port 3000)
- `npm run dev:fresh` — 清除 .next 缓存后启动
- `npm run build` — 生产构建（冒烟测试，验证无类型/编译错误）
- `npm run lint` — ESLint

无测试框架。TypeScript strict + `npm run build` 是主要安全网。

---

## Architecture

### Route Structure

```
src/app/
  layout.tsx              → Root: Inter font, html lang="zh-CN", DevNavigator
  (global)/
    layout.tsx            → TopBar (logo/search/credit/avatar) + Sidebar
    page.tsx              → 项目列表（着陆页）
    assets/page.tsx       → 全局资产库
    project/new/page.tsx  → 创建项目
  (project)/project/[id]/
    (workspace)/
      layout.tsx          → 项目工作台 header (项目名 + tab导航 + 用户区)
      page.tsx            → redirect → /project/:id/elements
      elements/page.tsx   → 元素库（角色/场景/道具/音效 tab + 剧本提取流程）
      episodes/page.tsx   → 分集管理（列表/网格视图）
      workshop/page.tsx   → 工坊（AI 图像/视频生成）
      settings/page.tsx   → 项目设置
    (episode)/episode/[ep]/
      layout.tsx          → 分集工作台 header (返回项目 + 步骤导航 + 剧本查看)
      page.tsx            → redirect → storyboard
      storyboard/page.tsx → 分镜（镜头列表/卡片，AI生成入口）
      video/page.tsx      → 视频生成（镜头状态，prompt编辑）
      export/page.tsx     → 成片剪辑导出（时间线、音效、字幕、转场）
      workshop/page.tsx   → 分集级工坊
  design-system/          → 设计系统参考页 (color/components/icons/layout/motion)
```

### Key Directories

- `src/components/` — 共享组件（sidebar、各种 overlay、editor）
- `src/components/ui/` — shadcn/ui 组件（目前只有 button）
- `src/mocks/` — Mock 数据 + TypeScript 类型定义
- `src/lib/` — 工具函数（cn helper）
- `public/fonts/` — Inter woff2 字体文件

### Component Inventory

**Layout components**: `sidebar.tsx`, `header-user-area.tsx`, `credit-balance.tsx`

**Overlay components** (全屏或半屏弹层):
- `script-overlay.tsx` — 剧本查看
- `script-import-overlay.tsx` — 剧本导入（粘贴/上传）
- `script-analysis-progress-overlay.tsx` — AI 分析进度
- `script-analysis-result-overlay.tsx` — 分析结果确认
- `extraction-progress-overlay.tsx` — 元素提取进度
- `character-editor.tsx` — 角色编辑（形象变体、属性）
- `scene-editor.tsx` — 场景编辑（状态、图片）
- `image-generate-overlay.tsx` — 图片生成（prompt、模型选择、结果）
- `scene-image-generate-overlay.tsx` — 场景图生成
- `recognition-overlay.tsx` — 识别结果确认
- `video-shot-overlay.tsx` — 视频镜头详情（prompt、参考图、历史）
- `credit-insufficient-modal.tsx` — 余额不足提示

**Standalone components**: `workshop-content.tsx`, `script-summary.tsx`, `dev-navigator.tsx`

**Dev tools**: `dev-navigator.tsx` — 开发导航器，快速跳转到各页面状态场景

### Mock Data

所有 mock 数据在 `src/mocks/`，以 `// TODO: [mock]` 标记。文件及内容：

| File | Content |
|------|---------|
| `types.ts` | 所有数据类型定义（Project, Episode, Element, Asset, Script, Shot 等） |
| `projects.ts` | 8 个不同状态的项目（进行中/完结/归档） |
| `episodes.ts` | 分集数据，关联项目 |
| `elements.ts` | 角色/场景/道具/音效元素 |
| `scripts.ts` | 剧本元数据 + 分集内容 |
| `shots.ts` | 分镜镜头数据 + 版本历史 |
| `assets.ts` | 全局资产（图片/视频/音频） |
| `credits.ts` | 积分余额和消耗计算 |
| `export.ts` | 导出相关数据（BGM、音效、转场、字幕） |

组件通过 props 接收数据，不在内部 import mock。替换 API 时只改页面级数据获取。

---

## Current Implementation Status

### Completed Pages (原型完整，交互可用)

| Page | File | Lines | Notes |
|------|------|-------|-------|
| 项目列表 | `(global)/page.tsx` | 107 | 卡片网格 + 搜索筛选 + 新建入口 |
| 创建项目 | `(global)/project/new/page.tsx` | ~90 | 名称 + 封面 + 风格预设 |
| 全局资产库 | `(global)/assets/page.tsx` | ~80 | 类型筛选 + 网格浏览 |
| 元素库 | `(workspace)/elements/page.tsx` | 673 | **最复杂的页面**: 4种类型tab、剧本提取流程、空状态、搜索、创建/删除、角色编辑器、场景编辑器 |
| 分集管理 | `(workspace)/episodes/page.tsx` | 177 | 列表/网格视图切换、阶段状态标签 |
| 项目设置 | `(workspace)/settings/page.tsx` | ~100 | 基本信息编辑表单 |
| 分镜 | `(episode)/.../storyboard/page.tsx` | 223 | 镜头列表、AI生成入口、拖拽占位 |
| 视频 | `(episode)/.../video/page.tsx` | 165 | 镜头状态、prompt编辑、生成详情overlay |
| 成片导出 | `(episode)/.../export/page.tsx` | 694 | **第二复杂**: 时间线编辑器、素材源面板、音频/字幕/转场tab |
| 工坊 | `workshop/page.tsx` + `workshop-content.tsx` | 666 | AI图像/视频生成、任务历史、模型选择 |

### Overlays (完整实现)

10+ overlay 组件覆盖完整的剧本导入→分析→提取→编辑→生成流程。

### Layout Components

3 套布局已完整：全局布局（TopBar+Sidebar）、项目工作台布局（Tab导航）、分集工作台布局（步骤导航）。

### Not Yet Implemented (PRD 中列出但代码中缺失)

- 帮助中心 (`/help`)
- 意见反馈 (`/feedback`)
- 个人中心 (`/settings`)
- 总剧本编辑模块（PRD 3.3.1，当前只有查看 overlay，无独立编辑页面）

---

## Large Files Needing Refactoring

以下文件超过 600 行，在生产化重构时应拆分：

| File | Lines | Issue |
|------|-------|-------|
| `elements/page.tsx` | 673 | 混合了页面逻辑、创建modal、删除确认、多种元素类型渲染 |
| `export/page.tsx` | 694 | 完整的时间线编辑器，应拆为 TimelineClip、SourcePanel 等子组件 |
| `workshop-content.tsx` | 666 | 任务管理 + 生成面板 + 历史记录，应拆分 |
| `character-editor.tsx` | 613 | 编辑器可拆为属性面板、形象管理、生成面板 |
| `scene-editor.tsx` | 610 | 同上 |

---

## Development Rules

### Design Compliance
- 所有界面必须符合 `DESIGN.md`，颜色/字体/间距/圆角从 DESIGN.md 取值
- 新增视觉元素前先检查 DESIGN.md 是否已有定义
- 设计系统参考页在 `/design-system/*`，可作为实际代码参考

### Data Flow
- 组件通过 props 接收数据，不在内部 import mock
- 页面级组件负责数据获取（当前从 mocks，后续替换为 API）
- Mock 数据在 `src/mocks/`，以 `// TODO: [mock]` 标记硬编码边界
- Mock 数据要真实可信（合理中文姓名、地址、金额），不用 "Lorem ipsum"

### Component Conventions
- TailwindCSS class 直接写样式，不抽 custom CSS
- shadcn/ui 组件从 `@/components/ui` 引入
- JSX 块超过 40 行考虑拆子组件
- 不提前抽象，三个相似组件并排 > 一个过早泛化的组件
- Props 类型用 TypeScript interface，不用 zod

### State Management
- 页面状态用 React useState/useReducer
- URL 状态用 Next.js searchParams
- 如需全局状态优先 zustand

### What to Skip (still prototype-adjacent)
- 不做 SEO 优化
- 不引入 i18n 框架，直接硬编码中文
- 不做性能优化（除非页面明显卡顿）
- 不写 storybook/组件文档
- 不引入 API 层，mock 数据继续使用直到后端集成阶段

---

## Backend API Reference

后端 (`lingify_content_api-release-1.0.0/`) 是完整的生产系统，运行在 `localhost:8000`。关键 API 路由组：

| Domain | Route Prefix | Description |
|--------|-------------|-------------|
| 认证 | `/login/` | 登录鉴权 |
| 项目 | `/anime/`, `/novel_show/` | 动漫项目、解说剧项目 CRUD |
| 章节/分集 | `/novel_show/chapter/` | 分集管理 |
| 剧本 | `/resource/script/`, `/novel_show/script/` | 剧本编辑、AI分析 |
| 角色/场景 | `/resource/element/`, `/resource/scene_role/` | 元素管理 |
| 图片生成 | `/image/` | 图片生成任务提交+查询 |
| 视频生成 | `/video/` | 视频任务提交+查询 |
| 音频 | `/audio/` | 音频任务提交+查询+BGM库 |
| 资产 | `/asset/`, `/material/` | 资产库、素材库 |
| 工坊/AI | `/ai/chat/` | AI对话（策略路由） |
| 文件 | `/file/` | 文件上传下载、ZIP打包 |
| 计费 | `/system/` | 租户账户、充值、价格规则 |
| 监控 | `/monitoring/` | 健康检查 |

所有 API 响应封装为 `Result<T>`。异步 AI 任务流程：前端创建 PENDING → 后台调度执行 → 前端轮询状态。

## Design System Quick Reference

详见 `DESIGN.md`：

- **Background**: `#0a0a0a` | **Card**: `#141414` | **Text**: `#ffffff`
- **Accent**: `#00CAE0`（仅用于临时交互状态，不用在持久导航或结构元素）
- **Secondary text**: `#999999` | **Tertiary text**: `#666666`
- **Border**: `rgba(255,255,255,0.06)` | **Ring hover**: `rgba(255,255,255,0.12)`
- **Buttons**: Always pill-shaped (`rounded-full`)，五级层级
- **Nav activation**: `white/[0.08]` bg + white text, NEVER accent
- **Icons**: Lucide React, `currentColor`, 16px default, strokeWidth 1.5
- **Chinese body line-height**: 1.6–1.8 | **Heading weight**: 500 only
- **Chinese heading tracking**: -0.01em to -0.02em
- **Font**: Inter (local woff2) + system CJK — no Google Fonts
- **Default transition**: `transition-colors duration-200`
