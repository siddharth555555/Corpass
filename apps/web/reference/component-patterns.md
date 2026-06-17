# Component Patterns

Exact visual spec for each component visible in the CORPASS mockup. Values reference
tokens from `design-tokens.css`. Match these when styling the corresponding part of
the host app. All `cp-*` classes named here live in `components.css`.

## App shell
- **Canvas:** `--cp-bg` (#F4F5F7). Content sits in white cards with breathing room
  (gaps `--cp-space-6`).
- **Sidebar:** `--cp-sidebar-width` (240px), `--cp-surface` bg, 1px `--cp-border`
  right edge. Logo plate uses `--cp-brand-900`/`600`. User chip pinned at the bottom.
- **Top bar:** transparent over canvas; centered search (`.cp-search`), bell with a
  small `--cp-danger` dot, avatar.

## Navigation item — `.cp-nav-item`
- Rest: `--cp-text-secondary`, weight 500, radius `--cp-radius-md`, padding 10×12,
  icon inherits muted tone.
- Hover: `--cp-surface-2` bg.
- **Active:** `--cp-brand-50` bg, `--cp-brand-700` text (weight 600), icon
  `--cp-brand-600`. Exactly one active item.
- Count chips (e.g. Messages • 3): tiny `--cp-radius-pill`, `--cp-brand-600` bg,
  white text, ~11px.

## Stat card — `.cp-card` + `.cp-stat__*`
- Label `--cp-text-muted` 13px; value `--cp-display` (28px) bold `--cp-text`; delta
  row with arrow — up=`--cp-success`, down=`--cp-danger`, 12px semibold, followed by
  muted "vs last …". Optional sparkline in `--cp-brand-400`.

## Card / panel — `.cp-card`
- `--cp-surface` bg, 1px `--cp-border`, radius `--cp-radius-lg` (16px),
  `--cp-shadow-sm`, padding `--cp-card-padding` (22px). Title: 16px semibold.
  Section action links ("View all") in `--cp-brand-600`, 13px.

## Buttons — `.cp-btn`
| Variant | bg | text | border | hover |
| --- | --- | --- | --- | --- |
| primary | `--cp-brand-600` | #fff | — | `--cp-brand-700` |
| secondary | `--cp-surface` | `--cp-text-secondary` | `--cp-border-strong` | `--cp-surface-2` |
| ghost | transparent | `--cp-text-secondary` | — | `--cp-surface-2` |
| success | `--cp-success` | #fff | — | darker |
| danger-outline | `--cp-surface` | `--cp-danger` | `--cp-danger-border` | tinted |

Radius `--cp-radius-md`, padding 10×16, weight 600. Primary gets `--cp-shadow-xs`.

## Status badge — `.cp-badge`
Pill (`--cp-radius-pill`), 12px semibold, 3×10 padding, text+soft-bg+faint-border
pair. Semantic mapping:
- **success** — Shipped, Confirmed, Delivered, Good, Perfect, Verified, Active
- **warning** — Inspection Due, Maintenance Due, Pending, Due
- **danger** — Cancelled, Rejected, Overdue
- **info** — New
- **neutral** — anything uncategorized

## Input / search — `.cp-input`, `.cp-search`
Radius `--cp-radius-md`, padding 10×12, `--cp-text` text, `--cp-text-muted`
placeholder. Default border `--cp-border-strong`; search variant uses
`--cp-surface-3` fill with transparent border. Focus: `--cp-brand-400` border +
`--cp-shadow-focus` ring. Leading icon in `--cp-text-muted`.

## List row / table — `.cp-row`, `.cp-th`, `.cp-thumb`
- Header labels: `.cp-th` (12px semibold, `--cp-text-muted`).
- Rows: 14px vertical padding, 1px `--cp-border` divider, hover `--cp-surface-2`,
  no divider on last row.
- Product thumb: `.cp-thumb` 40×40, radius `--cp-radius-sm`, `--cp-surface-3` bg.
- Filter pills ("All 22", "New 7"): pill chips; selected = `--cp-brand-600` bg/white,
  unselected = `--cp-surface` with `--cp-border-strong`.

## Timeline — `.cp-timeline`
Vertical 2px rail in `--cp-border-strong`. Completed node = filled `--cp-brand-600`
circle with white check; pending = hollow `--cp-surface` circle with
`--cp-border-strong` ring. Step title `--cp-text` 14px; sub-id + timestamp
`--cp-text-muted` 12px (`.cp-timeline__time`).

## Quick-action tile
`.cp-card`-like with a soft tinted square icon badge (use a faint status/brand tint,
e.g. `--cp-brand-50`/`--cp-info-bg`/`--cp-warning-bg` per action), title `--cp-text`
14px semibold, subtitle `--cp-text-muted` 13px.

## Vendor / product card
White card, radius `--cp-radius-lg`, soft shadow. Logo chip top-left, name 14px
semibold, rating in `--cp-warning` star + value, category in `--cp-text-muted`.
Product cards: image area on `--cp-surface-3`, price `--cp-text` semibold, full-width
`.cp-btn--primary` "Add to cart" (or outline variant if shown lighter).

## Chat — `.cp-bubble`
- Incoming `.cp-bubble--in`: `--cp-surface-2` bg, squared bottom-left corner.
- Outgoing `.cp-bubble--out`: `--cp-brand-50` bg, `--cp-text`, squared bottom-right,
  right-aligned.
- Timestamps `.cp-bubble__meta` 11px `--cp-text-muted`.
- Negotiation actions: Approve = `.cp-btn--success`, Counter Offer =
  `.cp-btn--secondary`, Reject = `.cp-btn--danger-outline`.

## Avatar — `.cp-avatar`
Circle, `--cp-brand-100` bg, `--cp-brand-700` initials, or image cover.

## Profile / detail tabs
Tab bar with active tab in `--cp-brand-700` text + 2px `--cp-brand-600` underline,
inactive `--cp-text-muted`. Verified badge = `.cp-badge--success` with a check.
Big metric tiles reuse the stat-card pattern.
