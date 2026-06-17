# Application Guide

How to wire the CORPASS theme into different stacks. Pick the section that matches
the repo. The golden rule from `SKILL.md` still holds throughout: **style only,
never behavior.**

## Table of contents
1. Plain HTML / CSS
2. Tailwind CSS (with config block)
3. React / Next.js
4. Vue / Nuxt
5. Angular
6. Component libraries (MUI, Bootstrap, Ant, Chakra)
7. Antigravity IDE — where to put this skill

---

## 1. Plain HTML / CSS

1. Copy `design-tokens.css` and `components.css` into your styles folder.
2. Link tokens first, then your stylesheet, then components:
   ```html
   <link rel="stylesheet" href="/styles/design-tokens.css" />
   <link rel="stylesheet" href="/styles/site.css" />
   <link rel="stylesheet" href="/styles/components.css" />
   ```
3. In `site.css`, replace hard-coded colors/spacing with `var(--cp-*)`. Add `cp-*`
   classes to existing elements where convenient.

## 2. Tailwind CSS

Import the tokens once (e.g. top of `globals.css`, before `@tailwind` layers or via
`@layer base`), then map them into the Tailwind theme so utilities like `bg-brand`,
`text-muted`, `rounded-card` resolve to the tokens.

```js
// tailwind.config.js  →  merge into your existing config (don't replace it)
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          50:'#EAF4F3',100:'#D2E8E6',200:'#A7D0CD',300:'#6FB1AD',400:'#2E8C88',
          500:'#0A6E6E',600:'#015C5D',700:'#034849',800:'#023638',900:'#012829',
          DEFAULT:'#015C5D',
        },
        canvas:'#F4F5F7', surface:'#FFFFFF', 'surface-2':'#FAFBFC', 'surface-3':'#F1F2F5',
        hairline:'#ECEDF0', 'hairline-strong':'#E0E2E7',
        ink:'#16191C', 'ink-secondary':'#4B5563', muted:'#8A909A',
        success:{DEFAULT:'#0F7A57', bg:'#E4F4EC'},
        warning:{DEFAULT:'#9A6700', bg:'#FBF0D6'},
        danger:{DEFAULT:'#C23B3B', bg:'#FBE7E7'},
        info:{DEFAULT:'#2C68B5', bg:'#E7F0FB'},
      },
      borderRadius: { card:'16px', md:'12px', pill:'999px' },
      boxShadow: {
        'cp-sm':'0 1px 2px rgba(16,24,40,.04), 0 1px 3px rgba(16,24,40,.06)',
        'cp-md':'0 4px 12px rgba(16,24,40,.06), 0 2px 4px rgba(16,24,40,.04)',
      },
      fontFamily: { sans:['Inter','Plus Jakarta Sans','Geist','system-ui','sans-serif'] },
    },
  },
};
```

Then re-skin by swapping utility classes (look-only): e.g. a button becomes
`bg-brand text-white rounded-md font-semibold hover:bg-brand-700`; a card becomes
`bg-surface border border-hairline rounded-card shadow-cp-sm`. Do not change the
button's handler or the card's content.

## 3. React / Next.js

- Import `design-tokens.css` once in the root entry (`app/layout.tsx`,
  `_app.tsx`, `main.tsx`, or `index.tsx`).
- For CSS Modules / styled-components / Emotion, reference `var(--cp-*)` inside the
  existing styled blocks — keep the component's props and logic identical.
- Only touch the `className`/`css`/`sx` props and style objects. Leave JSX structure,
  hooks, and handlers alone. Adding a class is fine; rewriting the component is not.

## 4. Vue / Nuxt

- Import `design-tokens.css` in `main.js`/`nuxt.config` global CSS.
- Edit only `<style>` blocks (scoped is fine) and `:class` bindings. Leave
  `<template>` structure and `<script>` untouched except for class strings.

## 5. Angular

- Add `design-tokens.css` (and `components.css`) to the `styles` array in
  `angular.json`, or `@import` them in `styles.scss`.
- Edit component `.scss`/`.css` and template `class`/`[ngClass]` only. Use `::ng-deep`
  sparingly and only for visual overrides.

## 6. Component libraries

You usually theme via the library's theming API rather than fighting it:
- **MUI:** map the tokens into `createTheme({ palette, shape, typography, shadows })`
  — `palette.primary.main = '#015C5D'`, `shape.borderRadius = 12`, soft `shadows`.
- **Bootstrap:** override the Sass `$primary`, `$body-bg`, `$border-radius`,
  `$box-shadow-sm`, `$font-family-sans-serif` variables with the token values, then
  recompile.
- **Ant Design:** set `ConfigProvider` theme tokens (`colorPrimary:'#015C5D'`,
  `borderRadius:12`, `colorBgLayout:'#F4F5F7'`).
- **Chakra:** extend the theme `colors.brand`, `radii`, `shadows`, `fonts`.
In all cases, theme tokens only — don't change component props that drive behavior.

## 7. Antigravity IDE — where to put this skill

This is an agent-agnostic skill (a `SKILL.md` plus reference/asset files), so it
works with Antigravity's agent the same way it works with any coding agent:

- **Simplest:** drop the whole `corpass-theme/` folder into your repository (e.g.
  `./corpass-theme/`) and tell the Antigravity agent: *"Read corpass-theme/SKILL.md
  and apply the CORPASS theme to this app — styling only, no behavior changes."*
- **As persistent guidance:** if your Antigravity workspace has a project rules /
  agent-context location (e.g. an `AGENTS.md`, a rules file, or a knowledge/skills
  directory), add a short pointer there:
  *"For any restyle/redesign request, follow ./corpass-theme/SKILL.md. Presentation
  only — never change logic, data, APIs, or behavior."*
  Then the agent picks it up automatically when you ask for UI changes.
- Exact menu names/paths vary by Antigravity version; if you're unsure where rules
  live, the in-repo folder + an explicit instruction (first bullet) always works.
