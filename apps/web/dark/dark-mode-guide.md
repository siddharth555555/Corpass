# Dark Mode Guide

Reference for applying and verifying the CORPASS dark layer. Pairs with
`assets/dark-tokens.css`.

## Contents
- The palette and why it's shaped this way
- The luminance inversion (the one concept to understand)
- Per-component checks
- Hardcoded-color audit
- Images, logos, and shadows
- Accessibility / contrast pairs
- Test checklist

---

## The palette

Dark values live once in `dark-tokens.css` as `--cpd-*` and are mapped onto the public
`--cp-*` tokens under the dark selectors. Edit them in that one block.

- **Canvas / surfaces:** near-black with a faint cool/teal lean —
  `--cp-bg #0C1110` → `--cp-surface #131A19` → `--cp-surface-2 #182120`
  → `--cp-surface-3 #1F2A29`. Elevation reads as *lighter*, the inverse of light mode.
- **Borders:** `--cp-border #233130`, `--cp-border-strong #324241` — slightly more
  present than in light mode so cards still separate from the canvas.
- **Text:** `--cp-text #E8EDEC`, secondary `#AAB6B4`, muted `#7E8C89`,
  disabled `#56625F`.
- **Brand:** interactive teal `--cp-brand-600 #15A39B` (links, icons, primary fills),
  with light steps for text-on-tint and dark steps for tint surfaces (see below).
- **Status:** brighter text + darker tinted backgrounds — success `#4FD0A0` on
  `#11281F`, warning `#E8B95C` on `#2A2410`, danger `#F08A8A` on `#2A1414`,
  info `#6FB0F5` on `#122236`.
- **Shadows:** deeper (up to `rgba(0,0,0,.6)`) since soft shadows vanish on dark;
  borders do more of the separation work.

## The luminance inversion (read this)

In light mode the brand scale goes light→dark as the number rises, and components rely
on that: e.g. active nav = light tint `--cp-brand-50` background + dark `--cp-brand-700`
text. In dark mode that relationship **flips**:

- `--cp-brand-50/100` become **dark teal-tinted surfaces** (`#122624` / `#173430`) —
  used as backgrounds (active nav, avatar, outgoing chat bubble).
- `--cp-brand-700/800` become **light teal** (`#5FD3CB` / `#93E4DD`) — used as the
  text/icon sitting on those tints.

Because both ends move together, every existing tint-bg + colored-text pairing keeps
its contrast with **no component edits**. The only exception is white text hardcoded on
a brand/success fill — handled next.

## Per-component checks

Most `cp-*` components flip automatically. Verify these specifically:

- **Primary button** (`.cp-btn--primary`) — fill becomes bright teal; `dark-tokens.css`
  switches its text from white to near-black `#04201E` for contrast. Hover (brand-700,
  lighter) keeps dark text. ✓ handled.
- **Success button** (`.cp-btn--success`) and **timeline done node**
  (`.cp-timeline__node--done`) — same white→`#04201E` correction. ✓ handled.
- **Secondary / ghost buttons** — surface + border + secondary text; flip automatically.
- **Badges** — text+tinted-bg pairs all move together; check `info`/`success`/`warning`/
  `danger`/`neutral` against the dark backgrounds.
- **Active nav, avatar, outgoing bubble, ::selection** — tint surface + light teal text;
  automatic. ✓
- **Inputs / search** — surface-3 fill, border-strong, `--cp-text` value, muted
  placeholder, bright-teal focus ring; automatic. Confirm the focus ring is visible.
- **Stat numbers, list rows, dividers, thumbnails** — token-driven; automatic.
- **Stock status cards** (warning/danger tinted) — now dark tinted via the status-bg
  tokens; confirm the number/icon use the matching status *text* token.
- **Profile rating bars / stars** — `--cp-warning` amber on a `--cp-surface-3` track;
  amber stays legible on dark. ✓

## Hardcoded-color audit

Dark mode surfaces any literal colors that bypassed the tokens. Search the codebase for
these and replace with the token equivalent (still styling only):

| Found in code | Replace with |
| --- | --- |
| `#fff` / `white` as a page/card background | `var(--cp-surface)` (or `--cp-bg` for the canvas) |
| `#000` / `black` / near-black text | `var(--cp-text)` |
| Ad-hoc grays for secondary/muted text | `var(--cp-text-secondary)` / `var(--cp-text-muted)` |
| Hardcoded border grays (`#e5e7eb`, etc.) | `var(--cp-border)` / `var(--cp-border-strong)` |
| Literal brand teal hexes | the matching `--cp-brand-*` step |
| Black-filled buttons/badges from the old UI | `.cp-btn--primary` / `.cp-badge--*` |

If a value stays literal it simply won't flip — usually showing up as a white block or
invisible text in dark mode. That's the fastest way to find leftovers.

## Images, logos, and shadows

- **Logo:** if the CORPASS wordmark/mark is dark-on-transparent, it can disappear on the
  dark canvas. Provide a light variant and swap by mode (CSS `content`/`background-image`
  under `[data-theme="dark"]`, or a `<picture>` with a media query), or apply a subtle
  filter. Don't change what the logo links to.
- **Catalog / Stock building image & photo placeholders:** bright placeholders can glow.
  Lay a `--cp-surface` gradient/overlay over image areas in dark mode, or dim with
  `filter: brightness(.85)`. Keep text overlays legible.
- **Empty-state and icon art:** icons using `currentColor` follow text automatically;
  fixed-color SVGs may need a dark variant.
- **Shadows:** already deepened via tokens; if a custom shadow looks absent, lean on
  `--cp-border` instead of a heavier shadow.

## Accessibility / contrast pairs

These pairings were chosen for legibility; keep them if you edit values:
- body text `#E8EDEC` on `#0C1110` / `#131A19` — high.
- muted `#7E8C89` — fine for secondary text; don't use it for primary content.
- primary button: near-black `#04201E` on bright teal `#15A39B`/`#5FD3CB` — high.
- each status text on its own dark tinted bg — comfortably legible.
- focus ring `rgba(21,163,155,.38)` — visible on both surfaces; keep focus-visible.

## Test checklist

1. Toggle system dark (OS) with no `data-theme` set — app goes dark.
2. Set `data-theme="light"` while OS is dark — app stays light (manual wins).
3. Set `data-theme="dark"` while OS is light — app goes dark.
4. Every page: no white flashes, no invisible text, cards separate from canvas.
5. Buttons/badges/inputs/focus rings all legible; status colors read correctly.
6. Seller app: walk Overview, Catalog, Messages, Orders, Stock, Profile, Support.
7. Behavior unchanged everywhere — only appearance differs.
