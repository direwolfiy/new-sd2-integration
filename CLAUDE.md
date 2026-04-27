# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Purpose

SD2 漫剧生产平台的前端。当前状态是从**高保真原型**向**生产可用前端**重构升级的过渡期。

**禁止 push 代码到远程仓库**，必须经过用户明确同意后才能 push。本地 commit 可以自由进行。

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
- `src/mocks/` — Mock 数据 + TypeScript 类型定义（UI 共享类型）
- `src/lib/` — 工具函数（cn helper、adapters、API client）
- `src/lib/api/` — API 客户端层（类型定义 + 各域 API 函数）
- `src/stores/` — Zustand 全局状态（auth-store、credit-store）
- `src/hooks/` — 自定义 hooks（useApi、useAsyncTask）
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

Mock 数据在 `src/mocks/`，以 `// TODO: [mock]` 标记。

| File | Content | API Status |
|------|---------|------------|
| `types.ts` | UI 共享类型（Project, Episode, Element 等） | 作为 UI 层类型保留 |
| `projects.ts` | 8 个不同状态的项目 | 已替换为 API |
| `episodes.ts` | 分集数据 | 已替换为 API |
| `elements.ts` | 角色/场景/道具元素详情 | 已替换为 API（列表），详情仍 mock |
| `scripts.ts` | 剧本元数据 + 分集内容 | 待替换（无对应 script 查询 API） |
| `shots.ts` | 分镜镜头 + 版本历史 | 待替换（需章节脚本 API） |
| `assets.ts` | 全局资产 | 已替换为 API |
| `credits.ts` | 积分消耗计算 | 待替换 |
| `export.ts` | BGM/音效/转场/字幕 | 待替换 |

---

## Current Implementation Status

### Phase 1 (Complete): 基础设施层
- Auth 系统（login/refresh/logout + AuthProvider + Login 页面）
- API 客户端层（client.ts + 10 个域 API 文件 + 类型定义）
- Zustand stores（auth-store + credit-store）
- Hooks（useApi + useAsyncTask）
- Next.js dev proxy 配置

### Phase 2 (Complete): 逐页面 Mock 替换
- 项目列表、资产库、项目设置 → 使用 `useApi` + API 调用 + loading skeleton
- 分集管理 → `fetchChapters` API
- 元素库 → `fetchElements` API + adaptElement 适配器
- 布局组件 → `fetchProject` / `fetchChapter` API
- 分镜/视频页 → 章节 API 获取内容状态
- 导出页 → 仍使用 mock（shot 版本数据无对应 API）
- 所有页面添加了 loading skeleton 和 error 处理

### Phase 3 (Complete): 大组件拆分
- `workshop-content.tsx` (666→40) → task-card + generation-form
- `character-editor.tsx` (613→165) → character-edit-modal + character-variant-card
- `scene-editor.tsx` (610→160) → scene-edit-modal + scene-state-card
- `elements/page.tsx` (673→244) → create-element-modal + delete-confirm-modal + element-grid

### Remaining Work
- `export/page.tsx` (694 行) — 仍为 mock，需等待后端视频合成 API 确认
- 脚本导入/分析 overlay 组件 — 内部仍使用 mock 流程
- 请求签名（后端可通过 `APP_ENABLE_REQUEST_SIGN=false` 关闭）

---

## Development Rules

### Design Compliance
- 所有界面必须符合 `DESIGN.md`，颜色/字体/间距/圆角从 DESIGN.md 取值
- 新增视觉元素前先检查 DESIGN.md 是否已有定义
- 设计系统参考页在 `/design-system/*`，可作为实际代码参考

### Data Flow
- 页面通过 `useApi` hook 从 API 获取数据
- API 响应通过 `adapters.ts` 转换为 UI 类型
- `src/mocks/types.ts` 仍作为 UI 层共享类型使用
- 组件通过 props 接收数据，不直接调用 API 或 import mock

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

### What to Skip
- 不做 SEO 优化
- 不引入 i18n 框架，直接硬编码中文
- 不做性能优化（除非页面明显卡顿）
- 不写 storybook/组件文档

---

## Backend API Reference

后端 (`lingify_content_api-release-1.0.0/`) 是完整的生产系统。所有端点前缀 `/api-content/v1/`。

| 前端域 | 后端端点 | API 文件 |
|--------|---------|---------|
| 认证 | `/admin-user/login`, `/admin-user/refresh-token`, `/admin-user/logout` | `auth.ts` |
| 项目列表 | `/resource/scene-content/list` (POST) | `projects.ts` |
| 项目详情 | `/resource/scene-content/{id}` (GET) | `projects.ts` |
| 章节/分集 | `/resource/scene-chapter/list` (GET), `/resource/scene-chapter/{id}` (GET) | `episodes.ts` |
| 元素/模板 | `/resource/template/list` (POST) | `elements.ts` |
| 章节脚本 | `/novel-show/chapter/{id}/scripts` (GET) | `shots.ts` |
| 风格 | `/novel-show/project/styles` (GET) | `scripts.ts` |
| 资产 | `/asset/resource/list` (POST) | `assets.ts` |
| 图片生成 | `/image-generation/edit-image` (POST) | `images.ts` |
| 视频生成 | `/video/generation/unified/submit` (POST) | `videos.ts` |
| 积分 | `/system/tenant-account/current` (GET) | `credits.ts` |

所有 API 响应封装为 `Result<T>`。ID 字段为雪花 ID（后端序列化为字符串避免前端精度丢失）。异步 AI 任务：前端创建 PENDING → 后台调度执行 → 前端轮询状态。

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
