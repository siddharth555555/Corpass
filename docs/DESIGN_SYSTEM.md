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

## Design Primitives

### 1. Shapes & Borders
- **Corners**: Soft rounded corners (e.g., `rounded-md` or `rounded-lg` in Tailwind, typically 6px to 8px).
- **Borders**: Thin, subtle borders (e.g., `border-gray-200` or `border-slate-200`) to separate content areas rather than heavy shadows.

### 2. Colors
- **Backgrounds**: Neutral, crisp backgrounds (White `#FFFFFF` for primary content areas, subtle off-whites like `#F8FAFC` or `#F1F5F9` for app backgrounds/sidebars).
- **Text Colors**: High contrast for readability (`#0F172A` for primary text, `#64748B` for secondary).
- **Accent Colors**: Limited palette. Use a single strong primary brand color (e.g., a deep corporate blue or rich slate) exclusively for primary actions (buttons, active states, key data highlights).
- **Semantic Colors**: Subdued greens, reds, and yellows for success, error, and warning states. Do not use overly saturated/neon variations.

### 3. Typography
- **Font Family**: Strong, legible, modern sans-serif (e.g., Inter, Roboto, or system UI fonts like San Francisco).
- **Hierarchy**: Clear distinction between headings, subheadings, body text, and small UI text.
- **Weight**: Use medium/semibold weights for headings and regular for dense body copy.

## What to Avoid (Strictly Prohibited)
- ❌ **Glassmorphism**: No frosted glass, background blurs, or excessive transparency.
- ❌ **Overly Colorful "Startup" Aesthetics**: No playful illustrations, bubbly blobs, or whimsical color combinations.
- ❌ **Crypto Style**: No dark mode with neon glows or "hacker" aesthetics.
- ❌ **Excessive Gradients**: Stick to flat colors. If a gradient is absolutely necessary, it should be barely perceptible.
- ❌ **Heavy Animations**: No bouncy transitions or long loading animations. Micro-interactions should be under 150ms.

## Key Screens & Flows to Design For
When building out the platform, keep these specific flows in mind:
- **Dashboard**: High-level metrics, quick actions, pending approvals.
- **Marketplace & Catalog Browsing**: Grid/list views of products with dense specs and quick "Add to bundle" actions.
- **Procurement Flow & Bundle Builder**: Multi-step, clear progress indicators, easy cart modification.
- **RFQ (Request for Quote) Flow**: Structured forms with clear required fields and document upload capabilities.
- **Vendor Management**: Data tables for vendor scores, compliance, and history.
- **Order Tracking**: Timeline views, clear status badges.
- **Admin Panels**: Dense, highly functional configuration views with bulk-action support.

---
*Note: These guidelines should be implemented in `packages/ui` as our base Tailwind theme and shadcn/ui configuration.*
