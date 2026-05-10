---
name: NexaTech Digital Core
colors:
  surface: '#fbf9f8'
  surface-dim: '#dbdad9'
  surface-bright: '#fbf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f3'
  surface-container: '#efeded'
  surface-container-high: '#e9e8e7'
  surface-container-highest: '#e4e2e2'
  on-surface: '#1b1c1c'
  on-surface-variant: '#40484f'
  inverse-surface: '#303031'
  inverse-on-surface: '#f2f0f0'
  outline: '#707880'
  outline-variant: '#c0c7d0'
  surface-tint: '#006496'
  primary: '#004d75'
  on-primary: '#ffffff'
  primary-container: '#006699'
  on-primary-container: '#bfe0ff'
  inverse-primary: '#90cdff'
  secondary: '#bb0012'
  on-secondary: '#ffffff'
  secondary-container: '#e90a1c'
  on-secondary-container: '#fffbff'
  tertiary: '#6d3d00'
  on-tertiary: '#ffffff'
  tertiary-container: '#8f5201'
  on-tertiary-container: '#ffd5b0'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cce5ff'
  primary-fixed-dim: '#90cdff'
  on-primary-fixed: '#001e31'
  on-primary-fixed-variant: '#004b72'
  secondary-fixed: '#ffdad6'
  secondary-fixed-dim: '#ffb4ab'
  on-secondary-fixed: '#410002'
  on-secondary-fixed-variant: '#93000c'
  tertiary-fixed: '#ffdcbf'
  tertiary-fixed-dim: '#ffb873'
  on-tertiary-fixed: '#2d1600'
  on-tertiary-fixed-variant: '#6a3b00'
  background: '#fbf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e2'
typography:
  display-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Be Vietnam Pro
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  price-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 24px
  label-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  container-max: 1200px
  gutter: 16px
  section-margin: 40px
  card-padding: 12px
  stack-sm: 4px
  stack-md: 8px
  stack-lg: 16px
---

## Brand & Style

The design system is engineered for a high-performance Vietnamese electronics retail environment. It targets tech enthusiasts, gamers, and professionals who value reliability, technical specifications, and efficiency. 

The visual style is **Corporate / Modern**, emphasizing clarity and trust. It utilizes a structured grid, ample white space to let product imagery stand out, and a technical blue accent color that signals stability and expertise. The aesthetic mirrors industry leaders like GearVN and CellphoneS, prioritizing a high information density that remains legible and easy to navigate. The emotional response is one of "organized abundance"—providing the customer with all the technical details they need within a clean, production-ready framework.

## Colors

The color palette is anchored by a professional **Tech Blue** (#006699), used for primary actions, navigation headers, and brand reinforcement. To drive conversions, a **Strategic Red** (#E30019) is utilized sparingly for high-urgency elements such as "Flash Sale" tags, discount percentages, and final price points.

Neutral tones are strictly managed to maintain a clean appearance. Surfaces use a very light gray to differentiate sections, while borders remain soft to avoid visual clutter. Text utilizes a tiered gray scale to establish clear hierarchy between product titles, technical specs, and secondary metadata.

## Typography

This design system uses **Be Vietnam Pro** for its localized optimization and modern, humanist character. The type hierarchy is designed to handle long Vietnamese product names without breaking layouts.

- **Headlines:** Use Bold weights for section titles like "Flash Sale" or "Sản phẩm nổi bật".
- **Product Titles:** Use Semi-bold at 15px-16px, capped at 2 lines to maintain grid alignment.
- **Pricing:** Distinctive bold styling, often using the secondary red color to draw the eye immediately.
- **Labels:** Small, medium-weight caps for category tags or technical attributes (e.g., CPU, RAM).

## Layout & Spacing

The design system employs a **12-column Fixed Grid** for desktop (1200px max width) to ensure a consistent browsing experience. On mobile devices, it transitions to a fluid 2-column layout for product listings to maximize vertical real estate.

- **Vertical Rhythm:** 8px base unit. 40px spacing between major homepage sections.
- **Margins:** 16px side margins on mobile; centered container on desktop.
- **Density:** High density in product grids (4 or 5 items per row on desktop) to facilitate quick comparison, common in Vietnamese retail electronics.

## Elevation & Depth

To maintain a "clean and practical" feel, this design system avoids heavy shadows. Instead, it relies on **Low-contrast outlines** and **Tonal layers**.

- **Level 0 (Base):** White background (#FFFFFF) for the main canvas.
- **Level 1 (Cards/Surface):** White cards with a 1px solid border (#E5E7EB).
- **Level 2 (Hover State):** When hovering over a product card, a subtle ambient shadow (0px 4px 20px rgba(0,0,0,0.08)) is applied to lift the element, signaling interactivity.
- **Level 3 (Modals/Overlays):** Standard system elevation with a 20% backdrop blur for search overlays and login modals.

## Shapes

The design system uses **Soft** roundedness. This 4px–8px radius provides a modern touch while maintaining the structural rigidity expected of a professional technical store.

- **Buttons & Inputs:** 4px radius for a precise, "tech" look.
- **Product Cards:** 8px radius to subtly soften the layout and contain images comfortably.
- **Sale Badges:** Fully rounded (pill-shaped) to contrast against the rectangular product images and draw attention.

## Components

### Buttons
- **Primary:** Solid Blue (#006699) with white text. Hover state is a slightly darker tint.
- **Secondary:** White background with 1px Blue border.
- **Buy Now:** Often uses the Secondary Red to maximize CTR on product detail pages.

### Product Cards
Cards include a fixed-height image container (ratio 1:1), followed by a product title (max 2 lines), a tech-spec summary (e.g., "RTX 4060, 16GB RAM"), the current price in Red, and the original price in struck-through Gray. A "Installment 0%" badge is a critical localized requirement.

### Navigation Bar
A two-tier header. The top tier contains the logo, a prominent search bar (the primary navigational tool), and account/cart links. The second tier contains a "Product Categories" dropdown and quick links to "Laptops," "PC Gaming," etc.

### Input Fields
Clean, 1px bordered boxes that use the Tech Blue for the focus state. Placeholder text is a light neutral gray.

### Flash Sale Timer
A high-contrast component with dark backgrounds and white mono-spaced numbers to create a sense of urgency and technical precision.