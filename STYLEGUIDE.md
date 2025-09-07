# Antimony Labs Style Guide

This document defines the core design system primitives and component conventions used across the Antimony Labs site.

## 1. Brand Foundations

| Token | Light | Dark | Notes |
|-------|-------|------|-------|
| Accent | `--accent-color` (default indigo 500) | indigo 400 | May be overridden by theme preferences |
| Background Base | `#ffffff` | `#0f1115` | High contrast neutral backdrop |
| Background Subtle | `#f5f7fa` | `#1a1f27` | Section blocks, cards alt |
| Surface / Card | `#ffffff` | `#1f252e` | Elevated containers |
| Border / Divider | `#e2e8f0` | `#2c3440` | 1px or 0.5px hairlines |
| Text Primary | `#111827` | `#f1f5f9` | 90–92% contrast target |
| Text Secondary | `#475569` | `#94a3b8` | Body secondary / metadata |
| Text Muted | `#64748b` | `#64748b` | Use sparingly |

## 2. Spacing Scale

Tailwind base scale is used; compact mode multiplies by `0.85`.
| Step | px |
|------|----|
| xs | 4 |
| sm | 8 |
| md | 16 |
| lg | 24 |
| xl | 32 |
| 2xl | 48 |

## 3. Typography

| Usage | Class | Notes |
|-------|-------|-------|
| Page Title | `text-4xl md:text-5xl font-semibold tracking-tight` | Hero headings |
| Section Title | `text-2xl font-semibold` | Major section anchors |
| Subheading | `text-lg font-medium text-secondary` | Optional line below h2 |
| Body | `text-base leading-relaxed` | Default prose |
| Small / Meta | `text-xs uppercase tracking-wide text-muted` | Labels, timestamps |

Font size preference multiplies with `--font-size-scale` (small=0.875, large=1.125).

## 4. Elevation & Shadows

| Level | Usage | Tailwind Approx |
|-------|-------|-----------------|
| 0 | Flat sections | none |
| 1 | Standard card | `shadow-sm` + subtle ring |
| 2 | Interactive hover | `shadow-md` + translate-y-0.5 transition |
| 3 | Modal / Popover | `shadow-xl` backdrop blur |

## 5. Motion & Interaction

| Animation Level | Duration Var | Usage |
|-----------------|-------------|-------|
| none | 0ms | Respect reduced motion |
| reduced | 150ms | Fades only |
| normal | 300ms | Scale + subtle translate |
| enhanced | 500ms | 3D / parallax permissible |

Transitions should opt-in via utility: `transition-[colors,transform,opacity]`.

## 6. Technology Icons System

Central registry at `src/lib/tech/registry.ts` exports metadata (name, icon, url, optional package.json key). Components must not hardcode icon imports ad hoc to keep consistency.

Accessibility: Links wrap icons, each with `aria-label="{Name} version {x}"` when version is available. Tooltip content is duplicated only visually; screen readers rely on the label.

## 7. Project Cards

Structure:
```
<article>
  header (title + status chip)
  description
  tech row (icons)
  metrics / highlights (inline badges)
</article>
```
Required classes: `rounded-lg border bg-surface/50 backdrop-blur-sm hover:shadow-md transition`.

## 8. Experience Timeline

Layout: Vertical timeline with left border accent. Role blocks use consistent heading: `text-lg font-semibold` + company link.

## 9. Blog Post Meta

Author is now brand-level: `Antimony Labs`. Replace legacy personal name occurrences. Use small meta line: `text-xs text-secondary flex gap-2 items-center` with date • read time.

## 10. Dark Mode Strategy

Dark theme is class-based (`.dark`). Avoid relying solely on opacity; always specify explicit dark color tokens. Favor perceptual contrast > 4.5:1 for body text.

## 11. Theming Hooks

`themeManager` preferences expose: `mode`, `colorScheme`, `fontSize`, etc. When building new components, prefer reading state via `useTheme()` and adjusting minor variants (e.g., density) rather than inline ad hoc calculations.

## 12. Future Enhancements

- Token extraction to dedicated `design-tokens.css` generated from TS.
- Automated visual regression (Playwright) for key components across light/dark and contrast modes.
- Color algorithmic generation (OKLCH) to replace static palette.

---
Last updated: Initial draft automated.