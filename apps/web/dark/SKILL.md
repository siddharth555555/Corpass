---
name: corpass-theme-dark
description: >
  Add a dark mode to the CORPASS theme. A companion layer for the corpass-theme and
  corpass-theme-seller skills that re-points the same --cp-* tokens to a dark palette,
  so any UI already wired to the theme flips automatically — light and dark from one
  codebase. Use this skill WHENEVER the user asks to "add dark mode", "make a dark
  theme", "support dark/light toggle", "respect system dark mode", or to provide a
  dark variant of the CORPASS dashboard. Presentation-only: it adds CSS that overrides
  color/shadow tokens and (optionally) a small theme toggle. It never changes business
  logic, data, APIs, routing, or component behavior.
---

# CORPASS Theme — Dark Mode

A dark layer for the CORPASS theme. It reuses the **same token names** the light theme
already exposes (`--cp-bg`, `--cp-surface`, `--cp-brand-600`, `--cp-success`, …) and
simply re-points them to a dark palette under a dark-mode selector. Every element you
already styled with theme tokens or `cp-*` classes turns dark for free — you do not
restyle anything a second time.

## The one rule (unchanged)

**Change how it looks, never what it does.** This layer is CSS-only. The single,
clearly-marked exception is the *optional* `theme-toggle.js`, which adds a manual
light/dark switch — it sets one attribute on `<html>` and remembers the choice, and
touches none of your app's existing logic. If you only want to follow the OS setting,
you don't need any JS at all.

## How it works

The light theme drives components through tokens. This layer redefines those tokens
under two selectors:
- `@media (prefers-color-scheme: dark)` — follows the operating system, **zero JS**.
- `[data-theme="dark"]` on `<html>` — a manual override that wins over the system
  setting (set `"light"` to force light).

Key idea: in dark mode the brand scale's luminance **inverts** — the low steps
(`--cp-brand-50/100`) become dark teal-tinted *surfaces* and the high steps
(`--cp-brand-700/800`) become light teal *text*. That keeps every tint-background +
colored-text pairing (active nav, avatar, chat bubble, selection) readable without
editing a single component. `--cp-brand-600` becomes a bright interactive teal for
links, icons, and primary-button fills.

## Bundled resources

| File | What it is | When to use |
| --- | --- | --- |
| `assets/dark-tokens.css` | The dark layer: dark palette + token remap + the few component corrections. | Always. Import it **last**, after design-tokens.css and components.css. |
| `assets/theme-toggle.js` | Optional manual light/dark switch (`toggleCorpassTheme()` / `setCorpassTheme()`). | Only if you want a manual toggle; skip for system-only. |
| `references/dark-mode-guide.md` | Palette rationale, per-component checks, image/logo/shadow gotchas, contrast notes, test checklist. | Read while applying and when verifying. |
| `assets/dark-preview.html` | The shell + core components rendered dark. | Open as the visual target. |

## Workflow

1. **Confirm the theme is in.** This layer is meaningless unless the app already
   consumes `--cp-*` tokens / `cp-*` classes (via corpass-theme or
   corpass-theme-seller). If it doesn't yet, apply that first.
2. **Add the layer.** Copy `assets/dark-tokens.css` into the styles dir and import it
   **after** the theme files so its overrides win:
   ```
   @import "design-tokens.css";
   @import "components.css";
   @import "dark-tokens.css";
   ```
3. **Pick activation.** System-only needs nothing more. For a manual switch, also add
   `assets/theme-toggle.js` and wire a button to `toggleCorpassTheme()`.
4. **Audit for hardcoded colors.** Dark mode exposes any place still using literal
   `#fff` / `#000` / `black` / hex grays instead of tokens — those won't flip and may
   become invisible. Replace them with the matching token (see the guide). This is
   still styling only.
5. **Handle assets.** Logos, placeholder images, and the catalog/stock building image
   may need a dark variant or an overlay so they don't glow or vanish (see guide).
6. **Verify** against `assets/dark-preview.html`: toggle both modes, check contrast on
   text/badges/buttons, confirm focus rings are visible, and confirm behavior is
   unchanged. For the seller app, walk all seven pages in dark mode.

## Notes

- **Tailwind users:** if you mapped tokens into `theme.extend`, the variable remap
  flows through automatically. For Tailwind's own `dark:` variant, set
  `darkMode: ['selector', '[data-theme="dark"]']` so both systems agree.
- Pure black is intentionally avoided — the dark canvas is a near-black with a faint
  cool/teal lean to match the brand and reduce harshness.
- All dark text/badge/button pairings were chosen for legible contrast; if you shift a
  value, re-check it (the guide lists the pairs that matter).
