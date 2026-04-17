# New SD2 — Frontend Prototype

## Tech Stack
- **Framework**: Next.js (App Router)
- **UI Library**: shadcn/ui
- **Styling**: TailwindCSS
- **Design System**: See [DESIGN.md](./DESIGN.md) — the sole design reference

## Design System Rules
All visual decisions must follow DESIGN.md. Key constraints:

- **Background**: Pure black `#000000` — never warm dark grays
- **Accent**: Framer Blue `#0099ff` — the only accent color, used for links/borders/focus
- **Buttons**: Always pill-shaped (40px+ radius), frosted glass or solid white variants
- **Cards**: Dark surface with blue ring shadow `rgba(0,153,255,0.15) 0px 0px 0px 1px`
- **Display font**: GT Walsheim Medium (weight 500 only), extreme negative letter-spacing
- **Body font**: Inter with OpenType features (cv01, cv05, cv09, cv11, ss03, ss07)
- **Elevation**: Blue ring shadows, white top-edge highlights, deep ambient shadows — no traditional drop shadows
- **Spacing**: 8px base unit, 80–120px section padding

## Project Structure
```
src/
  app/          # Next.js App Router pages
  components/   # Shared components
    ui/         # shadcn/ui components
  lib/          # Utilities
  styles/       # Global styles, fonts
```

## Commands
- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run lint` — Run linter

## Conventions
- Use TailwindCSS classes directly — avoid custom CSS unless necessary for fonts/animations
- Import shadcn/ui components from `@/components/ui`
- All new pages/components must comply with DESIGN.md
- Responsive breakpoints: Mobile (<809px), Tablet (809–1199px), Desktop (>1199px)
