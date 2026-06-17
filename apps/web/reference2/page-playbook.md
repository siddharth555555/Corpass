# Page Playbook

Element-by-element mapping from the current monochrome seller dashboard to the teal
CORPASS theme. Tokens (`--cp-*`) and classes (`.cp-*`) come from `design-tokens.css`
and `components.css`. Apply to the **existing** elements — add a class or point the
current selector at a token; don't rebuild markup, don't touch behavior.

## Contents
- Shared shell (sidebar, top bar, page header) — do this first
- Status → badge map (used by Overview & Orders)
- 1. Overview · 2. Product Catalog · 3. Messages · 4. Orders · 5. Stock
  · 6. Profile · 7. Support

---

## Shared shell

**Sidebar** (`.cp-sidebar` on the container)
- Background white `--cp-surface`, right edge 1px `--cp-border`, width `--cp-sidebar-width`.
- Logo wordmark "CORPASS" stays; tint it `--cp-text` (mark can keep its art).
- User block "Lakshmi Rao / Seller": name `--cp-text` 15px/600, role `--cp-text-muted`
  13px; hairline divider below in `--cp-border`.
- "WORKSPACE" label: `--cp-text-muted`, 12px, weight 600, slight letter-spacing.
- Nav items → `.cp-nav-item`. The current **black-filled active item** ("Overview"
  etc.) → `.cp-nav-item--active` (`--cp-brand-50` bg, `--cp-brand-700` text,
  `--cp-brand-600` icon). Inactive labels → `--cp-text-secondary`, hover `--cp-surface-2`.
- Bottom "N" avatar → `.cp-avatar`; "Sign Out" stays a quiet `--cp-danger` text link.

**Top bar / account button** (top-right circular person icon)
- Render as a 36px circle, `--cp-surface` bg, 1px `--cp-border`, icon `--cp-text-secondary`,
  hover `--cp-surface-2`.

**Page header pattern** (every page: big title + gray subtitle)
- Title: `--cp-text`, `--cp-text-xl` (22px), weight 700.
- Subtitle: `--cp-text-muted`, `--cp-text-base`.
- Header-right actions (e.g. "+ Add Product", "Edit Settings") use the button rules below.

---

## Status → badge map

Map by **meaning**, not by the current color. Use `.cp-badge` + variant.

| Status word on screen | Variant |
| --- | --- |
| PLACED, NEW ORDER, New | `.cp-badge--info` |
| CONFIRMED | `.cp-badge--neutral` (or `--success` if you want it greener) |
| SHIPPED | `.cp-badge--info` |
| DELIVERED, Good, Verified, Active | `.cp-badge--success` |
| Low Stock, Pending, …Due | `.cp-badge--warning` |
| CANCELLED, Rejected, Quote Required, Out of Stock | `.cp-badge--danger` |

Order-id chips like `ORD-20260616-9332` → `--cp-font-mono`, `--cp-text-muted`,
`--cp-surface-3` bg, `--cp-radius-sm`, 2×8 padding.

---

## 1. Overview — `/dashboard/seller`

**Stat cards** (Pending Orders, Total Sales (YTD), Active Items, Review Rating)
- Each → `.cp-card`. Label → `.cp-stat__label` (`--cp-text-muted` 13px). Big number
  → `.cp-stat__value` (`--cp-display` 28px/700, `--cp-text`).
- The current **black underline bar** under "Pending Orders" (selected accent) →
  a 3px `--cp-brand-600` bottom accent (or drop it; the brand tint is enough).
- "Review Rating 0 (0 reviews)": the "(0 reviews)" stays `--cp-text-muted`.

**Recent Orders panel** → `.cp-card`
- Header "Recent Orders" 16px/600 `--cp-text`; "View All" → `--cp-brand-600` 13px link.
- Each row → `.cp-row`: product name `--cp-text` 14px/600 (truncate ok); sub line
  `ORD-… • 16/06/2026` → `--cp-text-muted` 13px; amount right `--cp-text` 700.
- Status word PLACED/CONFIRMED → badge per the status map (PLACED→info, CONFIRMED→neutral).

**Top Active Items panel** → `.cp-card`
- "View Catalog" → `--cp-brand-600` link.
- Rows → `.cp-row` + `.cp-thumb` (40×40, `--cp-surface-3`) for the image; name 14px/600;
  `Office Supplies • 1224 in stock` → `--cp-text-muted`; price right 700;
  unit `PER PIECE / PER MONTH / PER PROJECT` → `--cp-text-muted` 11px uppercase.

---

## 2. Product Catalog — `/dashboard/seller/catalog`

**Header** "Product Catalog" + subtitle. Right action **`+ Add Product`** (currently
black) → `.cp-btn .cp-btn--primary` (teal).

**Toolbar card** ("All Products" + search + category dropdown)
- Wrap in a `.cp-card` (lighter `--cp-surface-2` tint is fine for the toolbar strip).
- "All Products" 16px/600. Search field → `.cp-input .cp-search`. Category dropdown →
  `.cp-input` styling (border `--cp-border-strong`, radius `--cp-radius-md`).

**Product cards** (4-up grid) → `.cp-card` (padding 0 at top so the image is flush;
use `.cp-card--flush` then pad the body)
- Image area: `--cp-surface-3` bg, radius top corners `--cp-radius-lg`; placeholder
  icon `--cp-text-disabled`.
- The **category tag** overlaid on the image (currently black pill "OFFICE SUPPLIES",
  "SOFTWARE & SAAS") → `.cp-badge--neutral` or a brand tint
  (`--cp-brand-50`/`--cp-brand-700`); keep uppercase, 11px.
- Title 16px/700 `--cp-text` (truncate); description `--cp-text-muted` 13px.
- The two **STOCK / DELIVERY** mini-boxes → small chips on `--cp-surface-3`,
  radius `--cp-radius-sm`: label `--cp-text-muted` 11px uppercase, value `--cp-text` 600.
- Divider 1px `--cp-border`. **PRICING** label `--cp-text-muted` 11px; price
  `--cp-text` 700 + unit muted. **"Quote Required"** → `--cp-danger`; "From ₹80,000"
  → `--cp-text-muted`.

---

## 3. Messages — `/dashboard/seller/messages`

**Two-pane card** (list + conversation) — wrap both in one `.cp-card--flush`, split by
a 1px `--cp-border` column rule.

**Left — Messages & Negotiations**
- Heading 18px/700. Filter pills **All / Orders / Inquiries**: active "All" (currently
  black) → brand chip (`--cp-brand-600` bg, white); inactive → `.cp-btn--secondary`
  pill (`--cp-radius-pill`).
- Thread item "Corpass / 16/06/2026 / 30 active threads": company `--cp-text` 15px/600;
  date `--cp-text-muted` 12px; "30 active threads" → `.cp-badge--neutral`. Whole item
  is a `.cp-row` with hover `--cp-surface-2`; selected state uses `--cp-brand-50` bg.

**Right — empty state** ("Select a Conversation")
- Icon circle → `--cp-brand-50` bg, icon `--cp-brand-600`. Title `--cp-text` 18px/600,
  helper `--cp-text-muted`.

**When a thread is open** (message bubbles, if present) → `.cp-bubble`:
incoming `.cp-bubble--in` (`--cp-surface-2`), outgoing `.cp-bubble--out`
(`--cp-brand-50`); timestamps `.cp-bubble__meta`. Negotiation actions:
Approve `.cp-btn--success`, Counter `.cp-btn--secondary`, Reject `.cp-btn--danger-outline`.

---

## 4. Orders — `/dashboard/seller/orders`

**Header** "Sales & Orders" + subtitle.

**Orders / Invoices tabs** (segmented control)
- Active tab "Orders" → `--cp-surface` bg, `--cp-text`, 1px `--cp-border`, radius
  `--cp-radius-md`, soft shadow; inactive "Invoices" → `--cp-text-muted`.
- "Invoices **12**" count → `.cp-badge--info`.

**Filter pills** (All 21 / New Order 7 / Confirmed 2 / Shipped 0 / Delivered 11 /
Cancelled 1) — chips; active "All" (black) → brand chip; the count uses the same text
tone. Optionally tint each pill's count with its status color.

**Sort/date controls** (right): `dd/mm/yyyy` date input + "Newest First" dropdown →
`.cp-input` styling.

**Order rows** → each a `.cp-card` row (radius `--cp-radius-lg`, `--cp-shadow-sm`,
hover lift to `--cp-shadow-md`):
- Status badge top-left (NEW ORDER / CONFIRMED / DELIVERED / CANCELLED) → `.cp-badge--*`
  per the status map. Order-id chip next to it → mono neutral chip.
- Date top-right → `--cp-text-muted` 12px.
- Product name `--cp-text` 16px/600; "Buyer: **Corpass**" → label muted, value `--cp-text`.
- Amount → `--cp-text` 18px/700, right-aligned. Trailing chevron → `--cp-text-muted`.

---

## 5. Stock — `/dashboard/seller/stock`

**Header** "Stock Command" + subtitle.

**Summary cards** (3-up) — these already use status colors; map straight onto theme
status tokens:
- **TOTAL ASSETS** (cube icon) → `.cp-card` neutral; number `--cp-display`; icon
  `--cp-text-disabled`.
- **LOW STOCK ALERTS** (amber) → card bg `--cp-warning-bg`, border `--cp-warning-border`,
  label/number/icon `--cp-warning`.
- **OUT OF STOCK** (red) → card bg `--cp-danger-bg`, border `--cp-danger-border`,
  label/number/icon `--cp-danger`.

**INVENTORY MATRIX** section label `--cp-text-muted` uppercase; search field on the
right → `.cp-input .cp-search`.

**Inventory cards** (4-up, currently faint green tint) → `.cp-card` with a subtle
`--cp-brand-50` wash (keeps the existing greenish feel, now on-brand):
- Title `--cp-text` 16px/700 (truncate). `SKU: #45` → `--cp-text-muted` 12px mono.
- "AVAILABLE STOCK" label `--cp-text-muted` 11px uppercase; big number `--cp-display`
  `--cp-text`; unit (PCS / MONTH / PROJECT) `--cp-text-muted`.
- The first card's faded building image → keep as a low-opacity background; ensure text
  stays legible (overlay a `--cp-surface` gradient if needed).

---

## 6. Profile — `/dashboard/seller/profile`

**Header** "Profile" + subtitle. Right action **`Edit Settings`** → `.cp-btn--secondary`.

**Identity card** → `.cp-card`
- Avatar circle "LA" → `.cp-avatar` at ~64px (`--cp-brand-100` bg, `--cp-brand-700`
  initials). Name `--cp-text` 22px/700. `GSTIN: 36AABCS…` → label muted, value `--cp-text`
  600. Address → `--cp-text-muted`.
- Divider `--cp-border`. Two columns: **CONTACT INFORMATION** / **FULFILLMENT CAPACITY**
  labels `--cp-text-muted` uppercase 12px. Field labels muted; values `--cp-text`.
  "Delivery Range" value **Hyper Local** → `.cp-badge--neutral` (or brand tint chip).

**Reviews from Buyers** → `.cp-card`
- Big "4.5" → `--cp-display-lg` `--cp-text`; the 5 stars → `--cp-warning`; "11 Ratings"
  `--cp-text-muted`.
- Distribution rows (5→1): track `--cp-surface-3`, filled bar `--cp-warning`, radius
  `--cp-radius-pill`; the star glyph `--cp-warning`; count on the right `--cp-text-muted`.

---

## 7. Support — `/dashboard/seller/support`

**Header** "Support & Help Center" + subtitle.

**Left column**
- **CONTACT DETAILS** card → `.cp-card`. Section label `--cp-text` 16px/700.
  - WhatsApp row: icon tile → `--cp-success-bg` bg, `--cp-success` icon, radius
    `--cp-radius-md`; label "WhatsApp Support" `--cp-text-muted`, number `--cp-text` 600.
  - Email row: icon tile → `--cp-brand-50` bg, `--cp-brand-600` icon; same text treatment.
- **Office Hours** card → nested `.cp-card` on `--cp-surface-2`: title `--cp-text` 16px/700,
  lines `--cp-text-muted`.

**Right column — Submit a Query** card → `.cp-card`
- Heading 18px/700. "Subject (Optional)" + "Message *" labels `--cp-text-secondary` 14px.
- Inputs/textarea → `.cp-input` (focus ring `--cp-shadow-focus`); placeholders
  `--cp-text-muted`.
- **Submit Query** (currently unstyled text) → `.cp-btn .cp-btn--primary`, right- or
  left-aligned to match the form. Keep its submit handler untouched.
