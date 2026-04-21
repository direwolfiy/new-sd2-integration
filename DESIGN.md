# SD2 Design System

## 1. Visual Theme & Atmosphere

Pure black dark canvas design system for Chinese-first interfaces. The experience is built on neutral black (`#0a0a0a`) — no blue tint, no warm undertone — providing a neutral stage where content and accents stand on their own. The accent color (default: `#00CAE0`) is deployed sparingly, appearing only in temporary events (focus rings, selection states, progress indicators), never in persistent navigation or structural elements.

The typography is bilingual-first: **Inter** for Latin, system fonts for CJK, with careful attention to Chinese-specific spacing and rhythm. Chinese block characters require more generous line-height and restrained letter-spacing compared to Latin text.

**Key Characteristics:**
- Pure black (`#0a0a0a`) canvas — neutral, no color tint, content-first
- Inter (local) + system CJK font stack — no external font dependencies for Chinese
- Single accent color (default `#00CAE0`) — 90% neutrals, 10% accent, never in persistent navigation
- Pill-shaped buttons (40px+ radius) — no sharp corners on interactive elements
- Chinese line-height 1.6–1.8× for body text, 1.1–1.2× for large display text
- Mild negative letter-spacing for Chinese headings (-0.01em to -0.02em) — never extreme
- Five-level surface hierarchy through background color and subtle borders — depth without color

## 2. Color Palette & Roles

### Neutral Palette

The palette is 90% neutrals. Five surface levels create depth through background brightness alone.

| Token | Hex | Role |
|-------|-----|------|
| Background | `#0a0a0a` | Page canvas, bottom layer |
| Card | `#141414` | Elevated surfaces, cards, panels |
| Popover | `#1c1c1c` | Floating elements, dropdowns, tooltips |
| Input | `#262626` | Input backgrounds, code blocks, embedded areas |
| Highlight | `#333333` | Selected rows, hover rows (with border) |

### Text

| Token | Hex | Role |
|-------|-----|------|
| Primary | `#ffffff` | Headings, high-emphasis body text |
| Secondary | `#999999` | Body text, descriptions, secondary information |
| Tertiary | `#666666` | Placeholder text, disabled labels, subtle hints |

### Accent System

The accent color is configurable. Default: `#00CAE0`. Auto-generated variants via `makeAccent()`:

```
makeAccent(hex):
  color  = hex
  bg     = rgba(r, g, b, 0.08)
  border = rgba(r, g, b, 0.15)
  text   = rgba(r, g, b, 0.8)
```

**Accent usage rules:**
- **DO**: Focus rings, card selection borders, progress bars, active toggle, AI generation indicators, badge tags
- **DO NOT**: Navigation activation, tab indicators, persistent structural elements, status badges (use grayscale instead)

Navigation activation uses **white text + `white/[0.08]` background** — never the accent color.

### Borders & Dividers

| Token | Value | Role |
|-------|-------|------|
| Border | `rgba(255,255,255,0.06)` | Card borders, dividers, panel edges |
| Input border | `rgba(255,255,255,0.08)` | Input field borders |
| Ring | `rgba(255,255,255,0.12)` | Hover ring on cards |

### Danger

| Token | Hex | Role |
|-------|-----|------|
| Danger | `#ef4444` | Delete actions, error states — independent of accent |

### Gradient System
- No prominent gradients — flat surfaces with subtle borders for depth
- Skeleton shimmer uses `white/5 → white/10 → white/5` gradient animation

## 3. Surface Hierarchy

Five elevation levels, from deep to shallow. Depth is communicated through background brightness and border opacity — no drop shadows on static elements.

| Level | Background | Role | Border |
|-------|-----------|------|--------|
| L0 — Page | `#0a0a0a` | Page canvas, bottom layer | none |
| L1 — Card | `#141414` | Cards, panels, sections | `rgba(255,255,255,0.06)` |
| L2 — Float | `#1c1c1c` | Dropdowns, tooltips, popovers | `rgba(255,255,255,0.08)` |
| L3 — Embed | `#262626` | Input backgrounds, code blocks | `rgba(255,255,255,0.1)` |
| L4 — Highlight | `#333333` | Selected rows, hover states | `rgba(255,255,255,0.06)` + ring |

## 4. Typography Rules

### Font Stack

```
/* TailwindCSS variable mapping */
--font-inter: Inter (local woff2, weights 400/500)
--font-heading: same stack as --font-inter (no separate heading font)
```

- **Latin / Body / UI**: `Inter` (via next/font/local, weights 400/500) — clean geometric sans-serif
- **CJK**: System fonts only — no external web fonts for Chinese (too large, unreliable)
- **System fallbacks**: PingFang SC (macOS), Noto Sans SC (Android/Linux), Microsoft YaHei (Windows), system-ui
- **Heading font**: Uses the same stack as body text (`font-heading` class maps to the same variable). Chinese headings rely on weight 500 and size contrast, not a separate typeface

### Chinese vs English Typography Rules

| Property | English | Chinese | Reason |
|----------|---------|---------|--------|
| Line-height (body) | 1.4–1.6 | 1.6–1.8 | Chinese characters are dense block shapes; need more vertical breathing room |
| Line-height (display) | 0.85–1.0 | 1.1–1.2 | Chinese characters don't have ascenders/descenders, but strokes still need separation |
| Letter-spacing (display) | -0.03em to -0.05em | -0.01em to -0.02em | Chinese characters are already visually tight; extreme negative tracking causes stroke overlap |
| Letter-spacing (body) | -0.01em to normal | normal | Body text should never have negative tracking in Chinese |
| Font-weight (heading) | 500–700 | 500 | Chinese strokes are heavier than Latin at the same weight; 500 is sufficient for emphasis |
| Font-weight (body) | 400 | 400 | Standard weight for readability |
| Font-size ratio (mixed) | 1:1 | Chinese 1.05–1.1× English | Chinese characters appear slightly smaller than Latin at the same font-size; consider sizing up |

### Typography Hierarchy

| Role | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|--------|-------------|----------------|-------|
| Display Hero | 64–72px | 500 | 1.1 | -0.02em | Primary hero headline |
| Section Display | 48px | 500 | 1.15 | -0.02em | Section-level headline |
| Feature Heading | 32px | 500 | 1.3 | -0.01em | Feature card or subsection heading |
| Card Title | 24px | 500 | 1.4 | normal | Card component heading |
| Body Large | 18px | 400 | 1.8 | normal | Emphasized body text, descriptions |
| Body | 15px | 400 | 1.8 | normal | Standard body text |
| Nav/UI | 15px | 400 | 1.0 | -0.01em | Navigation links, UI labels |
| Caption | 14px | 400 | 1.7 | normal | Subtle descriptions, footnotes |
| Label | 13px | 500 | 1.7 | normal | Button labels, form labels, badges |

### Font Loading Strategy
- Inter loaded via `next/font/local` from woff2 files (no Google Fonts dependency)
- CJK uses system fonts exclusively — no web fonts, no layout shift, no network dependency
- System fonts serve as fallback for both Latin and CJK

### Principles
- **CJK spacing restraint**: Never apply extreme negative letter-spacing to Chinese text. The block character structure means even -0.03em can feel cramped
- **Generous line-height**: Chinese body text always uses 1.6–1.8× line-height. Tighter values cause visual stroke crowding and reduce readability
- **Weight ceiling at 500**: Chinese headings use weight 500 (medium). Going to 700 (bold) makes Chinese strokes appear excessively heavy
- **Mixed-script rhythm**: When Chinese and English/numbers appear together, the font stack automatically selects the correct typeface per glyph

## 5. Icon System

Uses **Lucide React** — stroke-based linear icons, inheriting color via `currentColor`.

| Property | Value | Notes |
|----------|-------|-------|
| Default size | 16px | Navigation, labels, sidebar |
| Small | 14px | Inside buttons, inline annotations |
| Medium | 20px | Standalone button icons, toolbars |
| Large | 24px | Empty states, prominent buttons |
| Stroke width | 1.5 (default) or 2 (emphasis) | Never use filled variants |
| Color | `currentColor` only | Never set explicit color on icons |

**Alignment**: Use `flex items-center gap-2` with adjacent text. No manual margin/padding for alignment.

**Import**: `import { IconName } from "lucide-react"`

## 6. Component Stylings

### Button Hierarchy

Five levels, ordered by visual weight. All buttons are pill-shaped (rounded-full).

| Level | Background | Text | Border | Use |
|-------|-----------|------|--------|-----|
| Primary | `#ffffff` | `#000000` | none | Page main CTA — one per view |
| Secondary | `accent/0.08` | `accent/0.8` | `accent/0.15` | Related secondary actions (generate, export) |
| Tertiary | `white/0.06` | `#ffffff` | none | Low-weight actions (cancel, back) |
| Ghost | transparent | `accent/0.8` or `#999` | none | Inline links, subtle actions |
| Danger | `#ef4444/0.1` | `#ef4444` | `#ef4444/0.2` | Destructive actions — independent of accent |

**Sizes**: Small (h-8, px-4, text 12px), Default (h-10, px-6, text 13px), Large (h-12, px-8, text 15px)

**States**: Hover (background brightens), Active (`scale(0.97)` + duration-100), Disabled (`opacity-0.4` + `cursor-not-allowed`), Loading (text → spinner + status text + `pointer-events-none`)

### Cards & Containers

- **Default**: `#141414` background, `rgba(255,255,255,0.06)` border, `rounded-lg` (8px)
- **Hover**: Ring shadow `rgba(255,255,255,0.12) 0px 0px 0px 1px`
- **Selected**: Accent border `rgba(accent, 0.2)` + accent ring shadow + checkmark badge
- **Dragging**: `opacity-0.8`, `scale(1.02)`, elevated shadow `0 8px 24px rgba(0,0,0,0.4)`
- **Drop target**: Dashed border `2px dashed rgba(accent, 0.4)`, `accent/0.05` background

### Inputs & Forms

- **Default**: `#262626` background, `rgba(255,255,255,0.1)` border, white text
- **Focus**: Accent border + accent ring `ring-1 ring-accent`
- **Error**: `#ef4444` border + ring + error message below
- **Disabled**: `opacity-0.4`, `cursor-not-allowed`, `white/5` border
- **Placeholder**: `white/30` text color

### Toggle

- **Off**: `white/20` track, white thumb at left
- **On**: Accent track, white thumb translated right
- **Transition**: `duration-200`, color and transform

### Navigation Tabs

- **Inactive**: `#666` text, transparent background
- **Active**: `white/[0.08]` background, white text, `rounded-md`
- **Hover**: Text lightens to `#999`
- **Separator**: `white/[0.06]` vertical border between sections

## 7. Motion & Animation

### Duration Scale

| Name | Value | Tailwind | Use |
|------|-------|----------|-----|
| instant | 100ms | `duration-100` | Button active scale, toggle switch |
| fast | 150ms | `duration-150` | Color changes, fade in/out, tooltip appear |
| normal | 200ms | `duration-200` | Default — hover, focus, background, border |
| slow | 300ms | `duration-300` | Layout changes, expand/collapse, panel slide |
| sluggish | 500ms | `duration-500` | Large displacement, page transitions, skeleton shimmer |

### Easing Curves

| Name | Value | Use |
|------|-------|-----|
| ease-out | `cubic-bezier(0, 0, 0.2, 1)` | Elements appearing — entrance, tooltip, panel expand |
| ease-in | `cubic-bezier(0.4, 0, 1, 1)` | Elements disappearing — exit, panel collapse |
| ease-in-out | `cubic-bezier(0.4, 0, 0.2, 1)` | State changes — color, size transitions |
| spring | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Elastic feedback — button press, drag release |

### Shared Transitions by Component Type

| Type | Transition | Duration | Easing |
|------|-----------|----------|--------|
| Buttons, links, icons | `transition-colors` | 200ms | ease-in-out |
| Cards, panels | `transition-shadow` | 200ms | ease-in-out |
| Expand/collapse | `transition-all` (max-height + opacity) | 300ms | ease-out |
| Tooltips, popovers, modals | `transition-[opacity,transform]` | 150ms | ease-out |

### Component Animations

| Animation | Implementation | Use |
|-----------|---------------|-----|
| Spinner | `border-2 border-white/20 border-t-accent rounded-full animate-spin` | Loading indicators, button loading state |
| Pulse Dot | `animate-ping opacity-75` (outer) + static dot (inner) | Task in progress, online status |
| Skeleton Shimmer | `bg-gradient white/5→white/10→white/5`, 1.5s infinite | Content loading placeholders |
| Scale Press | `active:scale-[0.97] transition-transform duration-100` | Button press feedback |

### Accessibility
- Respect `prefers-reduced-motion`: disable animations for users who prefer reduced motion
- Never rely on animation alone to convey information — always pair with text or icon changes

## 8. Layout Patterns

布局模式通过设计系统组件页面（`/design-system/layout`）和实际页面体现，不在此文字描述。参考源码：
- 全局页面：`src/app/page.tsx`
- 项目工作台：`src/app/design-system/layout/page.tsx`（项目工作台 section）
- 分集工作台：同上（分集工作台 section）

## 9. Spacing & Radius

### Spacing System
- **Base unit**: 4px
- **Section padding**: 80px–120px between sections (desktop), 60px (mobile)
- **Card padding**: 24px internal
- **Component gaps**: 4px–24px between related elements

### Border Radius Scale
- **6px**: Small elements, badges
- **8px**: Standard components, cards
- **12px**: Large containers, panels
- **rounded-full (9999px)**: Buttons, pills, avatars

## 10. Do's and Don'ts

### Do
- Use pure black (`#0a0a0a`) as the primary background
- Keep all buttons pill-shaped (rounded-full)
- Use the accent color only for temporary interactive events
- Use `white/[0.08]` background + white text for navigation activation
- Set Chinese body line-height to 1.6–1.8
- Use weight 500 for all headings
- Apply letter-spacing of -0.01em to -0.02em for Chinese display text only
- Use Lucide icons with `currentColor` inheritance
- Follow the five-level surface hierarchy for elevation
- Use `transition-colors duration-200` as the default transition

### Don't
- Use the accent color in persistent navigation or structural elements
- Apply extreme negative letter-spacing to Chinese text (never below -0.03em)
- Use font-weight 700+ for Chinese headings — 500 is the ceiling
- Set Chinese body line-height below 1.6 — strokes will visually crowd
- Introduce multiple accent colors
- Use squared or slightly-rounded buttons — always pill-shaped
- Create heavy drop shadows on static elements — use ring borders instead
- Place light/white backgrounds behind content sections
- Load external web fonts for CJK — use system fonts
- Use filled icon variants — stroke-based only

## 11. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile | <809px | Single column, stacked features, hamburger nav |
| Tablet | 809–1199px | 2-column features, nav partially visible |
| Desktop | >1199px | Full layout, side-by-side features |

### Collapsing Strategy
- **Navigation**: Full sidebar → hamburger menu at mobile
- **Hero text**: 72px → 48px → 36px across breakpoints
- **Feature sections**: Side-by-side → stacked vertically
- **Section spacing**: 120px desktop → 60px mobile
- **Line-height**: Stays constant — CJK rules don't change with screen size

## 12. Agent Prompt Guide

### Quick Reference
- Background: `#0a0a0a` | Text: `#ffffff` | Accent: `#00CAE0`
- Secondary text: `#999999` | Tertiary text: `#666666`
- Surface: `#141414` (card) / `#1c1c1c` (popover) / `#262626` (input)
- Border: `rgba(255,255,255,0.06)` | Ring hover: `rgba(255,255,255,0.12)`
- Buttons: always `rounded-full`, five-level hierarchy
- Nav activation: `white/[0.08]` bg + white text, NEVER accent
- Icons: Lucide React, `currentColor`, default 16px, strokeWidth 1.5
- Chinese body line-height: 1.8 | English body line-height: 1.5
- Heading tracking: `-0.02em` (Chinese), `-0.04em` (English)
- Default transition: `transition-colors duration-200 ease-in-out`
- Font: Inter (local) + system CJK — no Google Fonts

### Code Generation Checklist
When generating components, verify:
1. Chinese text uses `font-heading` class or appropriate font variable
2. Body text line-height is 1.6–1.8 (not the English default of 1.3)
3. No extreme negative letter-spacing on Chinese (max -0.02em for display)
4. Heading font-weight is 500, never 700+ for Chinese
5. Accent color appears only on interactive/temporary elements
6. All buttons are pill-shaped (rounded-full)
7. Borders use `rgba(255,255,255,0.06)` for standard elements
8. Navigation activation uses white/gray, not accent
9. Icons inherit color via currentColor, no explicit color
10. No external web fonts for CJK — system fonts only
