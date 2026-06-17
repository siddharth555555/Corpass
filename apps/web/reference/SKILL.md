---
name: corpass-theme
description: >
  Restyle an existing web application to match the CORPASS visual theme — a clean,
  modern B2B SaaS look with a deep petrol-teal brand, soft cards, pill status
  badges, and a light cool-gray canvas. Use this skill WHENEVER the user asks to
  "redesign", "restyle", "reskin", "apply the CORPASS theme", "make it look like
  the mockup", "update the UI/look/styling", or otherwise change the appearance of
  a site WITHOUT changing features or functionality. This skill is presentation-only:
  it changes CSS, design tokens, spacing, color, typography, and class assignments,
  and never touches business logic, data flow, APIs, routing, or component behavior.
---

# CORPASS Theme

A presentation-only redesign skill. It re-skins an existing website to the CORPASS
look while leaving every feature, behavior, and backend untouched.

## The one rule that matters

**Change how it looks, never what it does.** This skill is allowed to touch the
appearance layer only. If a change could alter behavior, data, or output, it is
out of scope — stop and leave that code alone.

### ✅ In scope (do these)
- CSS / SCSS / Less files, `<style>` blocks, CSS-in-JS style objects
- Design tokens / CSS custom properties (colors, type, spacing, radius, shadow)
- Tailwind `theme.extend` config and utility-class swaps that only change looks
- Adding/swapping `className`/`class` values on existing elements
- Adding a purely-presentational wrapper element only when a layout demands it
- Importing the theme's `design-tokens.css` and `components.css`

### ❌ Out of scope (never do these)
- Business logic, state, hooks, reducers, effects, event-handler logic
- API calls, data fetching, queries, schemas, env/config, build pipeline (beyond
  adding a stylesheet import)
- Routing, navigation logic, conditionals that decide what renders
- Renaming functions/variables/props, or changing prop *types* or component APIs
- Reordering, removing, or rewording user-facing data, copy, or labels
- Anything in the backend, database, or server

If the user's request seems to require a behavior change to look right, surface it
and ask — don't silently change logic.

## Bundled resources

| File | What it is | When to read/use |
| --- | --- | --- |
| `assets/design-tokens.css` | All CSS variables + a safe base layer. The source of truth. | Always. Import this globally first. |
| `assets/components.css` | Ready-made `cp-*` component classes (cards, buttons, badges, sidebar, table rows, timeline, chat bubbles, etc.). | When you want copyable recipes or classes to apply directly. |
| `references/component-patterns.md` | Exact visual spec for each component in the mockup (values, states). | When styling a specific component and you need the precise look. |
| `references/application-guide.md` | How to apply the theme per stack (plain CSS, Tailwind, React/Vue/Angular, MUI/Bootstrap), plus a Tailwind config block. | Read at the start to pick the right integration path for the repo. |
| `assets/theme-preview.html` | A standalone rendered reference of the theme. | Open in a browser to see the target; compare your result against it. |

## Theme at a glance

- **Brand:** deep petrol teal — primary `#015C5D` (`--cp-brand-600`), hover `#034849`.
  Used for primary buttons, the logo plate, active nav, links, focus rings.
- **Canvas:** light cool gray `#F4F5F7`; **surfaces:** white cards with a 1px
  `#ECEDF0` border + a very soft shadow; **radius:** cards 16px, buttons/inputs 12px,
  badges fully pill.
- **Text:** near-black `#16191C` for headings/numbers, `#4B5563` body, `#8A909A` muted.
- **Status:** success teal-green, warning amber, danger red, info blue — each a
  text+soft-background pair used as pill badges.
- **Type:** Inter (or Plus Jakarta Sans / Geist), 14px body, bold 28px stat numbers,
  semibold headings.
- **Feel:** calm, airy, generous whitespace, low-contrast borders, soft shadows.
  When in doubt, choose the quieter option.

## Workflow

1. **Read `references/application-guide.md`** and inspect the repo to identify the
   stack (framework, styling system) and where global styles live.
2. **Install tokens.** Copy `assets/design-tokens.css` (and `components.css` if you
   want the recipe classes) into the project's styles directory and import them once,
   globally, before other styles so variables cascade. For Tailwind, also merge the
   `theme.extend` block from the application guide.
3. **Map, don't rebuild.** Go screen by screen. For each component, point its
   *existing* selector at the tokens, or add the matching `cp-*` class. Prefer editing
   styles / adding classes over restructuring markup. Use
   `references/component-patterns.md` for exact values.
4. **Preserve every behavior.** Do not touch handlers, data, props logic, or copy.
   Re-skinning a `<button>` means changing its look, not its `onClick`.
5. **Verify.** Open `assets/theme-preview.html` and the app side by side. Confirm:
   brand teal in the right places, soft cards, pill badges with correct status
   colors, consistent radius/spacing, on-brand focus rings, and — critically — that
   the app still works exactly as before. Diff your changes: every changed line
   should be presentational.
6. **Report** the files you changed and confirm no logic/markup-structure/data was
   altered.

## Tips for a faithful result

- Replace ad-hoc hex values and magic-number spacings with the tokens; consistency
  is most of the look.
- Keep shadows soft and borders faint — heavy shadows or dark borders break the feel.
- Status colors are semantic: map words like *Shipped/Delivered/Good/Verified* →
  success, *Cancelled/Rejected* → danger, *…Due/Pending* → warning, *New* → info.
- Keep the on-brand `:focus-visible` ring — it's accessibility, not decoration.
- This theme is light-mode only (matching the mockup). If the user wants dark mode,
  treat it as a separate, explicit request and add a `[data-theme="dark"]` token set.
