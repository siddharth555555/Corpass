# Design System & Theme Guidelines

This master file serves as the source of truth for the entire Corpass platform design language. All new UI components, features, and applications must strictly adhere to these guidelines to maintain a cohesive, enterprise-grade experience.

## Brand Identity & Tone
**Target Audience**: B2B Corporate Procurement, Enterprise Clients, Vendors.
**Vibe**: Premium, Minimal, Enterprise-grade, Clean and trustworthy.
**Keywords**: B2B SaaS, Procurement Platform, Enterprise Dashboard, Marketplace, Inventory, Vendor Portal.

## Core Design Principles
1. **High Information Density**: The UI must accommodate dense data tables, lists, and complex forms without feeling cluttered.
2. **Search-First Experience**: Global search, advanced filtering, and easy navigation are prioritized over deep hierarchical menus.
3. **Fast & Uncluttered**: UIs should load quickly with minimal visual noise. Emphasize content and functionality over decorative elements.
4. **Smooth UX**: Interactions should be snappy and logical.

---

## Design Primitives

### 1. Shapes & Borders
- **Corners**: Soft rounded corners (`rounded-md` or `rounded-lg` in Tailwind, typically 6px to 8px).
- **Borders**: Thin, subtle borders (e.g., `border-slate-200`) to separate content areas rather than heavy shadows.

### 2. Typography
- **Font Family**: Strong, legible, modern sans-serif — Inter (primary), fallback to system UI fonts (San Francisco, Segoe UI, Roboto).
- **Hierarchy**: Clear distinction between headings, subheadings, body text, and small UI text.
- **Weight**: `500` (medium) for headings, `400` (regular) for dense body copy, `600` (semibold) sparingly for key labels.

### 3. Spacing Scale
Use an 8px base grid. Standard values:

| Token | Value | Usage |
|---|---|---|
| `space-1` | `4px` | Icon padding, tight inline gaps |
| `space-2` | `8px` | Component internal gaps |
| `space-3` | `12px` | Small component padding |
| `space-4` | `16px` | Default element spacing |
| `space-5` | `20px` | Card/panel internal padding (vertical) |
| `space-6` | `24px` | Card/panel internal padding (horizontal), section gaps |
| `space-8` | `32px` | Page content padding, major section gaps |
| `space-10` | `40px` | Large section separators |

> **Rule**: Never use arbitrary spacing values. Stick to the 8px grid. Excessive vertical space (padding > `space-8` on empty states or panels) is a violation.

---

## Color System

### Philosophy
The palette is built on a **Slate foundation** — neutral, cool-toned, and professional — with a **Blue primary accent** for actions and a **Teal secondary** for highlights and data visualization. Warm neutrals (`stone`) replace stark white to prevent the interface from feeling cold or clinical.

**No white (`#FFFFFF`) backgrounds anywhere on the page canvas, sidebar, or panels.** Use the surface tiers below instead.

---

### Background Surfaces (Light Mode)

These replace ALL `bg-white` usage across the platform — including sidebars, navbars, and cards.

| Token | Hex | Tailwind Approx | Usage |
|---|---|---|---|
| `bg-canvas` | `#F8F7F5` | `stone-50` | Page-level background (outermost layer) |
| `bg-surface` | `#F1F0EE` | `stone-100` | Card, panel, sidebar, and navbar backgrounds |
| `bg-surface-raised` | `#ECEAE7` | `stone-200` | Hover states, active rows, inset sections |
| `bg-overlay` | `#FFFFFF` | — | Modals, dropdowns, popovers **only** |

> **Rule**: Nest surfaces by depth. Canvas → Surface → Surface-raised. Reserve `bg-overlay` (`#FFFFFF`) exclusively for elements that float above the page. A sidebar or topbar is **not** a floating element — it must use `bg-surface`, not `bg-overlay`.

---

### Primary Brand Color — Slate Blue

Used for primary CTAs, active nav states, links, and key data highlights.

| Token | Hex | Usage |
|---|---|---|
| `brand-50` | `#EEF2FF` | Light tinted backgrounds (e.g., active nav item bg, selected row) |
| `brand-100` | `#E0E7FF` | Subtle chip/badge backgrounds |
| `brand-200` | `#C7D2FE` | Borders on focus rings, active field outlines |
| `brand-500` | `#4F63D2` | Default interactive state (buttons, links, icons, active nav text) |
| `brand-600` | `#3D4FB8` | Hover state on primary buttons |
| `brand-700` | `#2E3A8C` | Active/pressed state |
| `brand-900` | `#1E2560` | Text on light brand backgrounds |

```css
/* Tailwind config */
brand: {
  50:  '#EEF2FF',
  100: '#E0E7FF',
  200: '#C7D2FE',
  500: '#4F63D2',
  600: '#3D4FB8',
  700: '#2E3A8C',
  900: '#1E2560',
}
```

---

### Secondary Accent — Teal

Used for data visualizations, secondary badges, informational callouts, and charts.

| Token | Hex | Usage |
|---|---|---|
| `teal-50` | `#E6F7F4` | Callout / info block backgrounds |
| `teal-100` | `#B3E8DF` | Chart fill, tag backgrounds |
| `teal-500` | `#0F9E82` | Active chart lines, secondary action icons |
| `teal-700` | `#0A6E5A` | Text on teal-50 backgrounds |
| `teal-900` | `#064740` | Strong text, dark chart labels |

---

### Text Colors

| Token | Hex | Usage |
|---|---|---|
| `text-primary` | `#0F172A` | All headings, primary body copy |
| `text-secondary` | `#475569` | Supporting labels, table subtext, metadata |
| `text-tertiary` | `#94A3B8` | Placeholder text, disabled states, hints |
| `text-on-brand` | `#FFFFFF` | Text placed directly on `brand-500` or darker |
| `text-on-canvas` | `#1E293B` | Body text on canvas backgrounds |

---

### Border Colors

| Token | Hex | Usage |
|---|---|---|
| `border-subtle` | `#E2E0DC` | Default card borders, table dividers |
| `border-default` | `#CBD5E1` | Input field outlines, section separators |
| `border-strong` | `#94A3B8` | Hover states, focused inputs |
| `border-brand` | `#4F63D2` | Active/selected elements |

---

### Semantic Colors

Subdued, professional — no neon or oversaturated variants.

#### Success (Sage Green)
| Token | Hex | Usage |
|---|---|---|
| `success-50` | `#F0FDF4` | Success banner background |
| `success-500` | `#22C55E` | Success icon, positive delta |
| `success-700` | `#15803D` | Success text on light bg |

#### Warning (Amber)
| Token | Hex | Usage |
|---|---|---|
| `warning-50` | `#FFFBEB` | Warning banner background |
| `warning-500` | `#F59E0B` | Warning icon |
| `warning-700` | `#B45309` | Warning text on light bg |

#### Error / Danger (Muted Red)
| Token | Hex | Usage |
|---|---|---|
| `danger-50` | `#FEF2F2` | Error banner background |
| `danger-500` | `#EF4444` | Error icon, destructive action |
| `danger-700` | `#B91C1C` | Error text on light bg |

#### Info (Slate Blue — same ramp as brand)
Use `brand-50` / `brand-500` / `brand-900` for informational states to maintain cohesion.

---

### Data Visualization Palette

For charts, graphs, and multi-series data. Use in this order to maintain accessible contrast.

| Order | Name | Hex |
|---|---|---|
| 1 | Brand Blue | `#4F63D2` |
| 2 | Teal | `#0F9E82` |
| 3 | Slate | `#64748B` |
| 4 | Amber | `#D97706` |
| 5 | Rose | `#E05A6A` |
| 6 | Indigo | `#6366F1` |

> Do not use all six unless the chart requires it. Start with Brand Blue + Teal for 2-series, add Slate for 3-series.

---

### Tailwind Theme Extension (Full Config Snippet)

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        canvas:  '#F8F7F5',
        surface: {
          DEFAULT: '#F1F0EE',
          raised:  '#ECEAE7',
          overlay: '#FFFFFF',
        },
        brand: {
          50:  '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          500: '#4F63D2',
          600: '#3D4FB8',
          700: '#2E3A8C',
          900: '#1E2560',
        },
        teal: {
          50:  '#E6F7F4',
          100: '#B3E8DF',
          500: '#0F9E82',
          700: '#0A6E5A',
          900: '#064740',
        },
        border: {
          subtle:  '#E2E0DC',
          default: '#CBD5E1',
          strong:  '#94A3B8',
          brand:   '#4F63D2',
        },
      },
    },
  },
}
```

---

## Component Usage Rules

### Buttons

| Variant | Background | Text | Border | Hover |
|---|---|---|---|---|
| Primary | `brand-500` | `#FFFFFF` | none | `brand-600` |
| Secondary | `surface` | `text-primary` | `border-default` | `surface-raised` |
| Destructive | `danger-50` | `danger-700` | `danger-500` | `danger-500` bg |
| Ghost | transparent | `brand-500` | none | `brand-50` bg |

---

### Sidebar Navigation

The sidebar is a structural chrome element — it is **not** a floating overlay and must **never** use `bg-white` or `bg-overlay`.

| Property | Value |
|---|---|
| Background | `bg-surface` (`#F1F0EE`) |
| Width | `240px` (fixed) |
| Border | `1px solid border-subtle` on the right edge only |
| Logo area height | `56px`, vertically centered, `px-4` |
| Nav item padding | `8px 12px`, `rounded-md` |
| Nav item font | `text-sm font-medium`, `text-secondary` (`#475569`) |
| Nav item icon | `16px`, same color as label |
| **Active nav item** | Background `brand-50` (`#EEF2FF`), text `brand-500` (`#4F63D2`), `3px brand-500` left border accent |
| Hover nav item | Background `bg-surface-raised` (`#ECEAE7`), text `text-primary` |
| Section label | `text-xs uppercase tracking-widest`, `text-tertiary`, `px-3 pt-4 pb-1` |
| User footer | `border-top: 1px solid border-subtle`, `p-3`, avatar + name + role stacked |

---

### Top Navigation / Page Header Bar

The top bar sits between the sidebar and main content. It carries the page title and primary page-level actions.

| Property | Value |
|---|---|
| Background | `bg-canvas` (`#F8F7F5`) — inherits page background, **no separate bg** unless a sticky header is needed |
| Sticky header background | `bg-surface` with `border-bottom: 1px solid border-subtle` |
| Page title | `text-xl font-semibold`, `text-primary` |
| Height | `56px`, vertically centered |
| Padding | `px-8` |
| Primary action button | Right-aligned, `Primary` button variant |

---

### Metric / KPI Cards

Used on dashboards to display top-level numbers.

| Property | Value |
|---|---|
| Background | `bg-surface` (`#F1F0EE`) |
| Border | `1px solid border-subtle` |
| Border-radius | `8px` |
| Padding | `20px 24px` |
| Label | `text-xs uppercase tracking-wide font-medium`, `text-secondary` |
| Value | `text-3xl font-semibold`, `text-primary` |
| Sub-label / delta | `text-sm`, `text-secondary` or semantic color for positive/negative |
| Icon (optional) | `20px`, top-right corner, `text-tertiary` |
| Bottom accent (optional) | `3px solid brand-500` bottom border to highlight key metric |

> **Empty/loading state**: Replace `--` with `₹0` or `0` as appropriate. Do **not** show a grey loading bar unless data is actively fetching. If loading, use a skeleton shimmer (`bg-surface-raised` animated pulse) instead.

---

### Data Tables

| Property | Value |
|---|---|
| Row background | `bg-canvas` |
| Alternate row | `bg-surface` |
| Hover row | `bg-surface-raised` |
| Header | `bg-surface`, `text-secondary`, `text-xs uppercase tracking-wide` |
| Borders | `border-subtle` on rows, `border-default` on outer frame |

---

### Badges / Status Chips

Use semantic `*-50` as background, `*-700` as text. Font: `text-xs font-medium`, `rounded-full`, `px-2 py-0.5`.

| Status | Background | Text |
|---|---|---|
| Active | `teal-50` | `teal-700` |
| Pending | `warning-50` | `warning-700` |
| Error / Rejected | `danger-50` | `danger-700` |
| Info / Draft | `brand-50` | `brand-700` |
| Neutral / Archived | `bg-surface-raised` | `text-secondary` |

---

### Cards & Panels

| Property | Value |
|---|---|
| Background | `bg-surface` |
| Border | `1px solid border-subtle` |
| Border-radius | `8px` |
| Padding | `20px 24px` |
| Section header within card | `text-sm font-semibold text-primary`, `border-bottom: 1px solid border-subtle`, `pb-3 mb-4` |

---

### Empty States

Empty states must feel intentional and compact — they should **not** expand to fill available viewport height.

| Property | Value |
|---|---|
| Container padding | `py-10` maximum (never `py-20` or full-height centering) |
| Icon container | `40px × 40px`, `rounded-full`, `bg-surface-raised`, centered icon `20px text-tertiary` |
| Heading | `text-sm font-medium`, `text-primary`, `mt-3` |
| Subtext | `text-sm`, `text-secondary`, max-width `320px`, centered |
| CTA link | `text-sm font-medium`, `brand-500`, `mt-2` |
| CTA button (if primary action) | `Primary` button variant, `mt-4` |

> **Rule**: An empty state is an invitation to act, not a decorative void. Keep the copy direct: state what is absent and what to do next.

---

### Forms & Inputs

| Property | Value |
|---|---|
| Input background | `bg-overlay` (`#FFFFFF`) — inputs are overlays within a surface |
| Input border | `1px solid border-default` |
| Input border (focus) | `2px solid brand-200`, `outline: none` |
| Input border (error) | `1px solid danger-500` |
| Input text | `text-sm`, `text-primary` |
| Placeholder | `text-tertiary` |
| Label | `text-xs font-medium`, `text-secondary`, `mb-1` |
| Helper text | `text-xs`, `text-tertiary` |
| Error text | `text-xs`, `danger-700` |
| Border-radius | `6px` |
| Height | `36px` (default), `32px` (compact) |

---

## Layout & Page Structure

### Standard App Shell

```
┌─────────────────────────────────────────────────┐
│  Sidebar (240px)  │  Page Content Area           │
│  bg-surface       │  bg-canvas                   │
│                   │  padding: 24px 32px           │
│  [Logo 56px]      │                               │
│  [Nav items]      │  [Page Header: title + CTA]  │
│                   │  [Metric Cards row]           │
│                   │  [Main Panel / Table]         │
│                   │                               │
│  [User footer]    │                               │
└─────────────────────────────────────────────────┘
```

### Content Area Spacing Rules

| Zone | Spacing |
|---|---|
| Page content padding | `padding: 24px 32px` |
| Gap between page header and first content row | `mb-5` (`20px`) |
| Gap between metric cards (grid) | `gap-4` (`16px`) |
| Gap between major page sections | `mb-6` (`24px`) |
| Panel internal top padding | `pt-5` (`20px`) |

> **Anti-pattern**: Do not let a single panel or empty state section grow to fill the full viewport height. Use `min-height` conservatively and only when content genuinely warrants it.

---

## What to Avoid (Strictly Prohibited)

- ❌ **Pure white (`#FFFFFF`) page, sidebar, or card backgrounds** — use surface tiers (`bg-canvas`, `bg-surface`) instead
- ❌ **Excessive negative space** — panels, cards, and empty states must not have padding > `py-10`. A sparse layout signals an incomplete UI, not a minimal one.
- ❌ **`--` or blank values in metric cards** — show `₹0` / `0` for zero states; use skeleton shimmer only during active data fetch
- ❌ **Glassmorphism**: No frosted glass, background blurs, or excessive transparency
- ❌ **Overly Colorful "Startup" Aesthetics**: No playful illustrations, bubbly blobs, or whimsical color combinations
- ❌ **Crypto Style**: No dark mode with neon glows or "hacker" aesthetics
- ❌ **Excessive Gradients**: Stick to flat colors. If a gradient is absolutely necessary, it should be barely perceptible.
- ❌ **Heavy Animations**: No bouncy transitions or long loading animations. Micro-interactions must be under 150ms.
- ❌ **Oversaturated semantic colors**: No bright `#00FF00` greens or `#FF0000` reds for status. Use the muted semantic tokens above.
- ❌ **Inline styles for colors/spacing** — always use design tokens via Tailwind classes or CSS custom properties

---

## Key Screens & Flows to Design For

When building out the platform, keep these specific flows in mind:

- **Dashboard**: High-level metrics (KPI cards), quick actions, pending approvals. Sidebar active on "Overview". No full-height empty states.
- **Marketplace & Catalog Browsing**: Grid/list views of products with dense specs and quick "Add to bundle" actions.
- **Procurement Flow & Bundle Builder**: Multi-step, clear progress indicators, easy cart modification.
- **RFQ (Request for Quote) Flow**: Structured forms with clear required fields and document upload capabilities.
- **Vendor Management**: Data tables for vendor scores, compliance, and history.
- **Order Tracking**: Timeline views, clear status badges.
- **Admin Panels**: Dense, highly functional configuration views with bulk-action support.

---

*Note: These guidelines are implemented in `packages/ui` as the base Tailwind theme and shadcn/ui configuration. Color tokens map directly to CSS custom properties and the Tailwind `extend.colors` block. When in doubt, refer to this file — do not invent new color values or spacing outside the defined system.*