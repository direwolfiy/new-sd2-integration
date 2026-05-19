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
- `src/components/ui/` — shadcn/ui 组件
- `src/mocks/` — Mock 数据 + UI 类型定义（逐步淘汰中）
- `src/lib/` — 工具函数（cn helper、adapters、API client）
- `src/lib/api/` — API 客户端层（类型定义 + 各域 API 函数）
- `src/stores/` — Zustand 全局状态（auth-store、credit-store）
- `src/hooks/` — 自定义 hooks（useApi、useAsyncTask）
- `public/fonts/` — Inter woff2 字体文件

---

## API Layer

### Client (`src/lib/api/client.ts`)

- 封装 `get/post/put/del<T>` 四个方法，内建 JSON 解析和错误处理
- **请求签名**：HMAC-SHA256 签名已实现 —— 当 `signKey` 存在时自动附加 `X-Timestamp`、`X-Nonce`、`X-Sign` 头
- **Token 刷新**：收到 401 + bizCode `AUTH_TOKEN_EXPIRED` 时自动用 refreshToken 换新 token，并发去重，刷新失败触发 logout
- **大整数保护**：JSON 解析前用正则将 15 位以上数字包装为字符串，防止精度丢失
- **代理**：Next.js rewrites 将 `/api-content/:path*` 转发到 `https://precontent.lingify.cn/api-content/:path*`

### Auth Store (`src/stores/auth-store.ts`)

- Zustand store，管理 `initialize()` → `login()` → `logout()` 生命周期
- Token 双重存储：`client.ts` 模块变量（内存，供请求使用）+ localStorage `"sd2_auth"`（持久化）
- `useApi` hook 等待 auth 初始化完成后才发请求

### Domain API Modules (`src/lib/api/`)

| 模块 | 文件 | 主要功能 |
|------|------|---------|
| `authApi` | `auth.ts` | login, refreshToken, logout |
| `projectsApi` | `projects.ts` | 项目 CRUD（列表用 POST RPC 风格） |
| `episodesApi` | `episodes.ts` | 分集/章节 CRUD + 章节脚本查询 |
| `elementsApi` | `elements.ts` | 元素模板 CRUD + Seedance 角色创建/更新/删除 |
| `scriptsApi` | `scripts.ts` | 剧本查询/导入 + 风格查询 |
| `shotsApi` | `shots.ts` | 分镜脚本 + AI prompt 生成 + episode workflow 编排 |
| `imagesApi` | `images.ts` | 图片生成任务提交 + 轮询 |
| `videosApi` | `videos.ts` | 视频生成任务提交 + 轮询 |
| `assetsApi` | `assets.ts` | 资产库列表查询 |
| `creditsApi` | `credits.ts` | 积分余额 + 租户账户查询 |

### Adapters (`src/lib/adapters.ts`)

三个适配器将 API DTO 转为 UI 层类型：
- `adaptProject()` — `ContentItem` → `Project`
- `adaptChapter()` — `ChapterItem` → `Episode`
- `adaptElements()` — `SceneRoleItem[]` → `ElementItem[]`（按名称去重角色，映射模板类型到元素类型）

### Hooks

- `useApi<T>(fetcher, deps)` — 通用数据获取，等待 auth 初始化，无 token 时跳过，返回 `{ data, isLoading, error, refetch }`
- `useAsyncTask(pollFn)` — 异步任务轮询（图片/视频生成），指数退避（2s 起，1.5x 倍增，上限 10s），状态机 `idle → pending → running → completed/failed`

---

## Mock Data Status

Mock 数据在 `src/mocks/`，以 `// TODO: [mock]` 标记。API 层已完整建立，mock 正逐步淘汰。

| 文件 | 用途 | 状态 |
|------|------|------|
| `types.ts` | UI 共享类型（Project, Episode, Element 等） | 作为 UI 层类型保留 |
| `projects.ts` | 项目列表 mock | 页面已用 API，仅 `dev-navigator.tsx` 引用 |
| `episodes.ts` | 分集 mock | 页面已用 API，`dev-navigator` + `export/page` 仍引用 |
| `elements.ts` | 角色/场景/道具 mock | 页面已用 API，仅 `dev-navigator.tsx` 引用 |
| `scripts.ts` | 剧本内容 mock | `script-overlay`、`script-analysis-result-overlay`、`elements/page`、`dev-navigator` 仍引用 |
| `shots.ts` | 分镜镜头 + 版本 mock（最大文件 31KB） | `storyboard/page`、`video/page`、`export/page`、`video-shot-overlay` 仍引用 |
| `assets.ts` | 全局资产 mock | 页面已用 API，`workshop/generation-form`、`export/page` 仍引用 |
| `export.ts` | BGM/音效/转场/字幕 mock | 仅 `export/page.tsx` 引用 |

### 仍依赖 Mock 的页面/组件

| 页面/组件 | 依赖的 mock | 备注 |
|-----------|------------|------|
| `export/page.tsx` | shots, episodes, assets, export（4 个 mock 源） | 最重度的 mock 依赖，694 行，等待后端视频合成 API |
| `storyboard/page.tsx` | shots | 已接入 episodesApi，分镜数据仍用 mock |
| `video/page.tsx` | shots | 已接入 episodesApi，分镜数据仍用 mock |
| `video-shot-overlay.tsx` | shots | 镜头详情弹层 |
| `elements/page.tsx` | scripts | 元素列表已用 API，剧本提取流程用 mock |
| `script-overlay.tsx` | scripts | 剧本查看 |
| `script-analysis-result-overlay.tsx` | scripts | AI 分析结果确认 |
| `workshop/generation-form.tsx` | assets | 工坊生成表单 |
| `dev-navigator.tsx` | projects, episodes, elements, scripts | 开发导航器（仅开发用） |
| `script-import-overlay.tsx` | — | 文件上传功能待实现 |
| `image-generate-overlay.tsx` | —（内部 mock 数据） | 图片生成，生成历史/资源库仍为内部 mock |
| `scene-image-generate-overlay.tsx` | —（内部 mock 数据） | 场景图生成，生成历史/资源库仍为内部 mock |

---

## Component Inventory

**Layout components**: `sidebar.tsx`, `header-user-area.tsx`, `credit-balance.tsx`

**Overlay 组件** (全屏或半屏弹层):
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

**Workshop 组件** (已拆分):
- `workshop-content.tsx` — 容器组件（666→40 行）
- `workshop/generation-form.tsx` — 生成表单
- `workshop/task-card.tsx` — 任务卡片
- `workshop/types.ts` — 共享类型

**Character 子组件**:
- `character/character-edit-modal.tsx` — 编辑弹窗
- `character/character-variant-card.tsx` — 形象变体卡片

**Scene 子组件**:
- `scene/scene-edit-modal.tsx` — 编辑弹窗
- `scene/scene-state-card.tsx` — 场景状态卡片

**Elements 子组件**:
- `elements/element-grid.tsx` — 元素网格
- `elements/create-element-modal.tsx` — 创建元素弹窗
- `elements/delete-confirm-modal.tsx` — 删除确认弹窗

**Standalone components**: `script-summary.tsx`, `dev-navigator.tsx`

---

## Development Rules

### Design Compliance
- 所有界面必须符合 `DESIGN.md`，颜色/字体/间距/圆角从 DESIGN.md 取值
- 新增视觉元素前先检查 DESIGN.md 是否已有定义
- 设计系统参考页在 `/design-system/*`

### Data Flow
- 页面通过 `useApi` hook 从 API 获取数据
- API 响应通过 `adapters.ts` 转换为 UI 类型
- `src/mocks/types.ts` 仍作为 UI 层共享类型使用，逐步迁移到 API 类型
- 组件通过 props 接收数据，不直接调用 API 或 import mock（待推进）

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

## Remaining Work

按优先级排列：

1. **分镜/视频页** — `shots.ts` mock 被 4 个文件引用，需接入 `shotsApi`（API 已有）
2. **剧本 overlay** — `scripts.ts` mock 被 4 个文件引用，需接入 `scriptsApi`（API 已有）
3. **导出页** `export/page.tsx`（694 行）— 依赖 4 个 mock 源，需等待后端视频合成 API 确认
4. **dev-navigator.tsx** — 引用 4 个 mock 数据数组，开发工具，低优先级

---

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
