---
name: corpass-theme-seller
description: >
  Apply the teal CORPASS theme to the seven real pages of the CORPASS Seller
  dashboard — Overview, Product Catalog, Messages, Orders, Stock, Profile, and
  Support. Use this skill WHENEVER the user asks to "restyle/redesign the seller
  dashboard", "apply the CORPASS theme to my app", "make the seller pages match
  the mockup", "reskin the dashboard", or to update the look of any of those seven
  routes (/dashboard/seller, /catalog, /messages, /orders, /stock, /profile,
  /support). It carries the full theme tokens plus an exact, element-by-element
  playbook for each screen. Presentation-only: it changes CSS, design tokens,
  spacing, color, typography, and class assignments, and NEVER touches business
  logic, data flow, APIs, routing, or component behavior.
---

# CORPASS Theme — Seller Pages

Applies the teal CORPASS theme to the seven real seller-dashboard pages. This skill
bundles the theme itself (tokens + component recipes) and adds a per-screen playbook
that maps every element currently on each page to the right token/class.

The current app is a monochrome admin theme (white canvas, black active nav and
buttons, hairline card borders, green/red status words). The target is the teal
CORPASS look: deep petrol-teal brand, soft rounded cards, pill status badges, light
cool-gray canvas. This skill turns the former into the latter — **looks only.**

## The one rule that matters

**Change how it looks, never what it does.** Touch the appearance layer only. If a
change could alter behavior, data, routing, or output, it is out of scope — leave
that code alone.

- ✅ CSS/SCSS, CSS-in-JS style objects, Tailwind `theme.extend` + class swaps,
  `className`/`class` changes, importing the bundled theme files, a purely
  presentational wrapper only when layout demands it.
- ❌ Logic, state, hooks, effects, handlers, API/data fetching, queries, routing,
  prop *behavior*, renaming things, build config (beyond adding a stylesheet),
  rewording user-facing copy/labels/data, anything backend.

## Bundled resources

| File | What it is | When to use |
| --- | --- | --- |
| `assets/design-tokens.css` | All CSS variables + safe base layer. Source of truth. | Always — import globally first. |
| `assets/components.css` | Ready-made `cp-*` classes (cards, buttons, badges, nav, rows, timeline, bubbles, inputs, avatar). | Apply to existing elements or copy into your selectors. |
| `references/page-playbook.md` | **The core of this skill.** Element-by-element mapping for the shared shell + all 7 pages. | Read before styling each page; follow its section for that route. |
| `assets/redesign-preview.html` | The Overview, Orders, and Stock pages rendered in the target theme. | Open in a browser as the visual target; compare your result. |

## The seven pages (and their routes)

1. **Overview** — `/dashboard/seller` — stat cards, Recent Orders, Top Active Items.
2. **Product Catalog** — `/dashboard/seller/catalog` — toolbar + product cards.
3. **Messages** — `/dashboard/seller/messages` — thread list + conversation pane.
4. **Orders** — `/dashboard/seller/orders` — tabs, filter pills, order rows.
5. **Stock** — `/dashboard/seller/stock` — status summary cards + inventory matrix.
6. **Profile** — `/dashboard/seller/profile` — identity card + reviews breakdown.
7. **Support** — `/dashboard/seller/support` — contact card + query form.

## Global swaps (apply everywhere first)

These appear on every page; do them once via shared components, then move page by page.

| Current (monochrome) | Becomes (teal theme) |
| --- | --- |
| Black-filled active nav pill, white text | `.cp-nav-item--active` → `--cp-brand-50` bg, `--cp-brand-700` text, `--cp-brand-600` icon |
| Gray inactive nav labels | `.cp-nav-item` → `--cp-text-secondary`, hover `--cp-surface-2` |
| Black-filled primary buttons (`+ Add Product`, tabs, etc.) | `.cp-btn--primary` → `--cp-brand-600` bg, white text, hover `--cp-brand-700` |
| White buttons w/ border (`Edit Settings`) | `.cp-btn--secondary` |
| Plain white page background | `body` → `--cp-bg` (#F4F5F7) |
| White cards, thin sharp border | `.cp-card` → `--cp-radius-lg`, `--cp-border`, `--cp-shadow-sm` |
| Near-black headings | keep `--cp-text`; titles 22px/700, subtitles `--cp-text-muted` |
| Green/red status WORDS (PLACED, DELIVERED…) | semantic pill `.cp-badge--*` (see playbook mapping) |
| Uppercase gray section labels (WORKSPACE, PRICING…) | keep style, color `--cp-text-muted`, 12px, weight 600 |
| Red "Sign Out" | keep as a quiet `--cp-danger` text link |
| Orange stars / rating bars (Profile) | map to `--cp-warning` (the theme's amber) |
| WhatsApp green tile (Support) | map to `--cp-success` / `--cp-success-bg` |

## Workflow

1. **Install the theme.** Copy `assets/design-tokens.css` and `assets/components.css`
   into the project styles dir; import tokens once, globally, before other styles.
   For Tailwind, also merge the `theme.extend` block (see the theme's own
   application guide, or mirror the tokens into `colors.brand`, `borderRadius`,
   `boxShadow`, `fontFamily`).
2. **Restyle the shared shell** (sidebar, top account button, page header pattern)
   using the Global swaps table. This instantly lifts all seven pages.
3. **Go page by page, in route order.** For each page open
   `references/page-playbook.md`, find that page's section, and apply the mappings to
   the *existing* elements — prefer adding a `cp-*` class or pointing the current
   selector at tokens over restructuring markup.
4. **Preserve behavior.** Re-skinning the `+ Add Product` button or an order row
   changes its look, not its click/route/data. Don't touch handlers, fetches, props
   logic, or copy.
5. **Verify** against `assets/redesign-preview.html` and confirm the app still works
   exactly as before. Diff your changes — every line should be presentational.
6. **Report** changed files and confirm no logic/data/markup-structure was altered.

## Tips specific to this app

- The current design leans on pure black; replacing black with `--cp-brand-600`
  (active nav, buttons) and pure-white panels with softly-bordered `.cp-card`s is
  ~70% of the transformation.
- Status colors are semantic — map by meaning, not by the current color: see the
  status table in the playbook (PLACED/NEW → info, CONFIRMED → neutral or success,
  DELIVERED → success, SHIPPED → info, CANCELLED/Quote Required → danger).
- Keep the few existing accent moments on-theme: Stock alert cards already use
  amber/red → use `--cp-warning-bg` / `--cp-danger-bg`; Profile stars → `--cp-warning`.
- Light-mode only, matching the app. Treat dark mode as a separate, explicit request.
