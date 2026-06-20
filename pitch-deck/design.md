# Design Document — Corpass Pitch Deck

## 1. Profile Baseline Declaration

- **Profile selection**: `profiles/strategic.md` (fundraising pitch deck style)
- **Selection rationale**: This is a B2B platform pitch deck for potential investors, buyers, and sellers. It needs to convey credibility, vision, and business viability — exactly what the strategic profile is designed for.
- **Referenced dimensions**: Narrative framework (Problem → Solution → Product → Market → Business Model → Competitive Edge → CTA), information density (medium-high), color guidance (steady, premium, low-saturation), font guidance (sans-serif for authority, serif for elegance), content expression techniques (big numbers, comparison matrices, flowcharts).
- **Deviation notes**: 
  - Less emphasis on "grand vision/macro perspective" — this is a practical B2B platform, not a moonshot. Tone is grounded and operational.
  - More emphasis on dual-audience (buyer + seller) messaging — each section needs to speak to both sides.
  - No team page with photos (not requested) — replaced with a focused closing CTA.

## 2. Style Baseline Declaration

- **Style anchor selection**: 
  - **McKinsey/BCG strategic reports**: Referenced for information density, clear hierarchy, data-forward presentation, and premium restraint. The clean grid, generous margins, and sharp-cornered containers.
  - **Muji brand aesthetic**: Referenced for warmth, natural paper tones, and uncluttered minimalism. The "less is more" philosophy that avoids decoration for decoration's sake.
- **Referenced dimension explanation**: 
  - From McKinsey: Layout discipline, grid alignment, sharp corners, data prominence, professional authority.
  - From Muji: Color warmth (natural, earthy tones), whitespace breathing room, no flashy gradients or effects, simplicity as sophistication.

## 3. Style Details

### Color Design Principles
- **Overall tendency**: Conservative & steady with warm undertones. B2B procurement is a trust-based business. The palette must feel reliable, not trendy.
- **Temperature**: Warm-neutral, papery. Evokes physical documents, ledgers, and the tactile nature of procurement.
- **Primary**: `#a16207` (Copper/Amber) — Corpass brand color. Warm, metallic, grounded. Used for titles, accents, big numbers, and key highlights.
- **Background**: `#fafaf9` (Warm Paper) — Not pure white. Gives a subtle, premium paper feel that reduces eye strain and adds warmth.
- **Text**: `#1c1917` (Ink) — Near-black with warm undertones. Softer than pure black. Used for all body text and headings.
- **Secondary**: `#64748b` (Slate) — For annotations, captions, secondary information, and source notes.
- **Surface**: `#f5f5f4` (Light Warm Gray) — For card backgrounds, tables, and subtle containers.
- **Accent**: `#166534` (Money Green) — Used very sparingly for positive metrics, growth indicators, and "success" states. Echoes the "money" semantic in the brand.
- **No blue/cyan**: Strictly avoided. This is not a generic SaaS deck. The warm copper + ink palette is distinctive and on-brand.

### Font Usage Principles
- **Title font**: `Oranienbaum` — Elegant high-contrast serif. Used for page titles and cover text. Adds a touch of refinement and trust without being old-fashioned. Set in Bold or Regular with generous letter spacing on cover.
- **Body font**: `Liter` — Modern neo-grotesque sans-serif. Clean, rational, optimized for screen. Highly readable at small sizes. Used for all body text, bullet points, and annotations.
- **Big numbers**: `Liter` at 48-56px, Bold. Paired with small explanatory text below.
- **Font size hierarchy**:
  - Cover title: 48px
  - Cover subtitle: 20px
  - Page titles: 28px
  - Body text: 18-20px
  - Big numbers: 48-56px
  - Annotations/captions: 14px
  - Navigation/chapter numbers: 12px

### Text Box and Container Styles
- **Content separation**: Primarily whitespace and font size differences. Cards used only when necessary for grouping (e.g., comparison cards, feature lists).
- **Cards**: Sharp-cornered rectangles (`rect` shape), no border, filled with `$surface` color. Used for feature comparisons and value props.
- **No rounded rectangles**: Strictly prohibited. Sharp corners convey authority and precision.
- **No borders on cards**: Separation achieved through fill color contrast + whitespace.
- **Decorative elements**: Minimal. A thin horizontal line (`straightConnector1`, 1-2px, `$copper`) can be used as a section divider under titles. No other decorative shapes.

### Image Style
- **Icons**: Solid style (`fas:`), used sparingly. Only for feature lists and process steps. Color: `$copper` or `$ink`. Restrained usage.
- **Tables**: Minimal three-line style. Header row with `$copper` background + white text. Body rows alternate `$background` and `$surface`. No vertical borders. Clean horizontal lines only.
- **Charts**: Minimal flat style. Bar charts use `$copper` for primary series, `$ink` for secondary. No 3D effects. Grid lines in `#e7e5e4`.
- **Illustrations**: No stock photos. If images are used, they should be product screenshots or abstract geometric patterns. For this deck, no images on content pages — text and data-forward.

## 4. Layout System

### Global Layout Characteristics
- **Canvas**: 1280 x 720 (16:9)
- **Page margins**: 60px left/right, 50px top/bottom
- **Content area**: 1160 x 620 (within margins)
- **Unified elements**:
  - Bottom-right: Page number in 12px `$slate` text, every page except cover and final.
  - Top-left: A thin 2px copper horizontal line spanning the content width, placed just below the page title area (optional on dense pages).
- **Grid**: All content aligned to a consistent left margin of 60px. Right-aligned content respects the 60px right margin.

### Special Page Layouts
- **Cover page**: Centered layout. Large title in `Oranienbaum` 48px, centered. Subtitle below in `Liter` 20px, `$slate`. A thin copper line separates title from subtitle. Background is solid `$background`. No images — the power is in the typography.
- **Table of contents**: Left-right split. Left 40%: large "CONTENTS" text in `Oranienbaum` 36px, vertical. Right 60%: chapter list in a clean grid with chapter numbers in `$copper` and titles in `$ink`.
- **Chapter transition pages**: Left 50%: solid `$copper` background with chapter number in white (Oranienbaum, 72px). Right 50%: `$background` with chapter title in `$ink` (Oranienbaum, 32px) and a one-line subtitle in `$slate` (Liter, 18px).
- **Final page**: Centered layout similar to cover. Large "Join Corpass" in `Oranienbaum` 40px. Contact details below in `Liter` 18px, `$slate`. No decoration.

### Content Page Layout Patterns
- **Problem/Solution pages**: Top title + left-right two-column. Left column: 3-4 bullet points with icons. Right column: a single compelling statement or big number.
- **Feature pages (Buyer/Seller)**: Top title + 3-column grid of feature cards. Each card: icon (top) + title (bold) + description (body). Cards are sharp rectangles with `$surface` fill.
- **Process/Lifecycle pages**: Top title + horizontal timeline flow. 5-6 steps connected by a thin line. Each step: small number circle + step name + one-line description.
- **Business model page**: Top title + left-right split. Left: big number (commission %) + explanation. Right: subscription tier table.
- **Competitive edge page**: Top title + 4-column comparison cards. Each card: competitor name (top, bold) + 2-3 lines of weakness. Corpass card highlighted with `$copper` background + white text.

## 5. Style Usage Rules

- `$title` (Oranienbaum, 28px, `$ink`): Page titles on all content pages.
- `$coverTitle` (Oranienbaum, 48px, `$ink`): Cover title only.
- `$subtitle` (Liter, 20px, `$slate`): Cover subtitle, chapter subtitles.
- `$body` (Liter, 18px, `$ink`, lineHeight 1.6): All body text, bullet points.
- `$bigNumber` (Liter, 48px, `$copper`, bold): Key metrics and percentages.
- `$caption` (Liter, 14px, `$slate`): Source annotations, page numbers, footnotes.
- `$chapterNum` (Oranienbaum, 72px, white): Chapter transition page numbers.
- `$chapterTitle` (Oranienbaum, 32px, `$ink`): Chapter transition page titles.
- Colors allocation:
  - `$copper`: Titles, big numbers, accent lines, highlighted cards, chart primary series.
  - `$ink`: Body text, headings, secondary chart series.
  - `$slate`: Captions, annotations, secondary text, page numbers.
  - `$background`: Page backgrounds.
  - `$surface`: Card fills, table alternating rows, subtle containers.
  - `$money`: Very sparingly — positive growth indicators only.

## 6. Risk Prohibitions

- [ ] **No rounded rectangles**: All shapes must use sharp corners (`rect`, not `roundRect`).
- [ ] **No blue/cyan colors**: The palette is warm copper + ink + slate. No cool tones.
- [ ] **No gradient backgrounds**: Solid colors only. No subtle gradients on backgrounds or shapes.
- [ ] **No stock photos**: Text and data-forward. No decorative images.
- [ ] **No flashy animations or effects**: No shadows, glows, or 3D effects.
- [ ] **No more than 5 bullet points per content block**: Split into columns or cards if needed.
- [ ] **Font size minimums**: Body text ≥ 18px. Annotations ≥ 14px. Page titles ≥ 28px.
- [ ] **No information overload**: One core argument per page. If content exceeds 6-7 points, use cards or split across pages.
- [ ] **No generic chapter titles**: Page titles must be arguments, not labels (e.g., "B2B Procurement Is Broken" not "Market Analysis").
- [ ] **No decorative icons for decoration**: Icons only when they add semantic meaning to a feature or step.

## 7. Theme Definition

```yaml
theme:
  colors:
    copper: "#a16207"
    ink: "#1c1917"
    slate: "#64748b"
    background: "#fafaf9"
    surface: "#f5f5f4"
    money: "#166534"
    border: "#e7e5e4"
  textStyles:
    coverTitle:
      fontSize: 48
      color: "$ink"
      fontFamily: "Oranienbaum"
      lineHeight: 1.2
    title:
      fontSize: 28
      color: "$ink"
      fontFamily: "Oranienbaum"
      lineHeight: 1.3
    subtitle:
      fontSize: 20
      color: "$slate"
      fontFamily: "Liter"
      lineHeight: 1.4
    body:
      fontSize: 18
      color: "$ink"
      fontFamily: "Liter"
      lineHeight: 1.6
    bigNumber:
      fontSize: 48
      color: "$copper"
      fontFamily: "Liter"
      lineHeight: 1.1
    caption:
      fontSize: 14
      color: "$slate"
      fontFamily: "Liter"
      lineHeight: 1.4
    chapterNum:
      fontSize: 72
      color: "#ffffff"
      fontFamily: "Oranienbaum"
      lineHeight: 1.0
    chapterTitle:
      fontSize: 32
      color: "$ink"
      fontFamily: "Oranienbaum"
      lineHeight: 1.3
  tableStyles:
    default:
      fontSize: 16
      fontFamily: "Liter"
      headerFill: "$copper"
      headerColor: "#ffffff"
      headerBold: true
      bodyFill: ["$background", "$surface"]
      bodyColor: "$ink"
      border:
        style: solid
        width: 1
        color: "$border"
```
