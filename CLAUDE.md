# New SD2 — Frontend Prototype

## Project Purpose

这是一个**高保真前端原型**项目，核心目标是**最快速度**搭建可交互、视觉准确的界面原型。

速度优先，但不写烂代码。通过合理的约束让原型保持可维护、可演进，而不是一次性用完就扔。

## Tech Stack
- **Framework**: Next.js (App Router)
- **UI Library**: shadcn/ui
- **Styling**: TailwindCSS
- **Design System**: [DESIGN.md](./DESIGN.md) — 唯一设计规范

## Project Structure
```
src/
  app/          # Next.js App Router 页面
  components/   # 共享组件
    ui/         # shadcn/ui 组件
  lib/          # 工具函数
  mocks/        # Mock 数据（JSON 或 TS 对象）
```

## Commands
- `npm run dev` — 启动开发服务器
- `npm run dev:fresh` — 清除 .next 缓存后启动（HMR 缓存损坏时使用）
- `npm run build` — 生产构建（用于验证无编译错误）
- `npm run lint` — 运行 linter

---

## Development Rules

### What to optimize for
- **迭代速度** > 代码完美度。能跑起来的界面比精致的抽象更有价值。
- **视觉还原度**。原型存在的意义就是让决策者看到、点到、感受到。
- **可替换性**。所有 mock 数据和硬编码逻辑都要在代码中明确标记，方便后续替换为真实接口。

### What to skip (prototype only)
- 不要搭建 API 层、后端集成、auth 流程。原型阶段用 mock 数据。
- 不要引入 i18n 框架。直接硬编码中文文案。
- 不要做 SEO 优化（meta tags、structured data、sitemap）。
- 不要做性能优化（code splitting、lazy loading、image optimization），除非页面明显卡顿。
- 不要写 storybook 或组件文档。原型迭代太快，文档会立刻过时。

### Mock data strategy
- Mock 数据放在 `src/mocks/` 目录，按功能模块分文件。
- 使用 TypeScript 定义数据结构（`interface` 或 `type`），不要用 `any`。
- Mock 数据要真实可信——用合理的中文姓名、地址、金额，不要用 "Lorem ipsum" 或 "test123"。
- 组件通过 props 接收数据，不要在组件内部 import mock。这样后续替换真实数据时只改页面级数据获取，不动组件。
- 用注释标记硬编码边界：`// TODO: [mock] replace with API call`

### Testing approach
- **不写单元测试**。原型 UI 变化频繁，测试只会拖慢迭代且不断断裂。
- **不写 E2E 测试**。原型阶段没有稳定的功能路径值得自动化验证。
- **用 TypeScript 作为主要安全网**。开启 strict 模式，让类型系统在编译期捕获错误。
- **用 `npm run build` 做冒烟测试**。定期执行构建，确认无类型错误、无编译失败。
- **用 `npm run lint` 保持基本代码规范**。
- **在关键工具函数（非 UI）上酌情写测试**。如果某个 lib 函数逻辑复杂且稳定，可以写单元测试保护。

### Component conventions
- 用 TailwindCSS class 直接写样式，不要抽 custom CSS。
- 从 `@/components/ui` 引入 shadcn/ui 组件。
- 组件拆分粒度：如果一个 JSX 块超过 40 行，考虑拆子组件。
- 不要为了复用而提前抽象。三个相似组件并排摆放 > 一个过早泛化的组件。等真正出现第三次复用时再提取。
- Props 类型直接用 TypeScript interface，不要引入 zod 做运行时校验（原型阶段无外部输入）。

### State management
- 页面级状态用 React useState/useReducer，不要引入全局状态库。
- URL 状态（tab 切换、筛选）用 Next.js searchParams，不要引入额外路由库。
- 如果后续确实需要全局状态，优先 zustand（轻量、无 boilerplate）。

### Design compliance
- 所有页面和组件必须符合 DESIGN.md。
- 颜色、字体、间距、圆角、阴影从 DESIGN.md 对应值取，不要凭感觉写。
- 新增视觉元素前先检查 DESIGN.md 是否已有定义。

### Code health checklist
每次新增页面或功能后，快速过一遍：
1. `npm run build` 通过？
2. TypeScript 无 `any`？
3. Mock 数据是否在 `src/mocks/` 并有类型定义？
4. 组件是否通过 props 接收数据（而非内部硬编码）？
5. 视觉是否符合 DESIGN.md？

---

## Design System Quick Reference

详见 [DESIGN.md](./DESIGN.md)，以下是高频使用的快速参考：

- **Background**: `#0a0a0a` | **Card**: `#141414` | **Text**: `#ffffff`
- **Accent**: `#00CAE0` (可配置，详见 makeAccent)
- **Secondary text**: `#999999` | **Tertiary text**: `#666666`
- **Border**: `rgba(255,255,255,0.06)` | **Ring hover**: `rgba(255,255,255,0.12)`
- **Buttons**: Always pill-shaped (rounded-full), 五级层级
- **Nav activation**: `white/[0.08]` bg + white text, NEVER accent
- **Icons**: Lucide React, currentColor, 16px default, strokeWidth 1.5
- **Chinese body line-height**: 1.6–1.8
- **Chinese heading tracking**: -0.01em to -0.02em
- **Chinese heading weight**: 500 only
- **Default transition**: `transition-colors duration-200`
- **Font**: Inter (local woff2) + system CJK — no Google Fonts
