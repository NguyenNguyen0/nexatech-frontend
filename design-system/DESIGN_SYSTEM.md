# NexaTech Design System

> Version 1.0 — Internal reference for `client/` and `admin/` apps.
> Token source of truth: `design-system/tokens.css`

---

## 1. Philosophy

NexaTech's visual language is **Tech-Forward Futuristic** — inspired by the brand poster's bold blue gradients, floating product imagery, and confident typography. The system balances two modes:

| Mode | App | Feel |
|------|-----|------|
| **Storefront** | `client/` | Consumer-facing, vibrant, product-dense (à la GEARVN) |
| **Admin Panel** | `admin/` | Data-dense, focused, professional dark dashboard |

**Three core principles:**
1. **Blue is the hero** — every CTA, link, and active state pulls from the primary blue spectrum
2. **Density with breathing room** — product grids are information-dense but never cramped
3. **Motion is purposeful** — micro-interactions confirm actions; animations never distract

---

## 2. Brand Colors

### Primary Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary` | `#0052FF` | Buttons, links, active indicators |
| `--color-primary-light` | `#3B7BFF` | Hover states |
| `--color-primary-dark` | `#003DCC` | Pressed / active states |
| `--color-primary-subtle` | `#E8EFFE` | Tag bg, badge fill, row highlight |

### Accent (Electric Cyan)

| Token | Value | Usage |
|-------|-------|-------|
| `--color-secondary` | `#00C2FF` | Gradient partner, highlights, neon accents |
| `--color-secondary-light` | `#5DDEFF` | Glow effects |
| `--color-secondary-dark` | `#008FBF` | Accessible cyan on light bg |

### Gradients

```css
/* Hero sections, banner backgrounds */
background: var(--gradient-hero);
/* → linear-gradient(160deg, #001A66 0%, #0052FF 50%, #00C2FF 100%) */

/* Primary CTAs, active badges */
background: var(--gradient-brand);
/* → linear-gradient(135deg, #0052FF 0%, #00C2FF 100%) */

/* Gradient text (product names, display headings) */
.text-gradient-brand
```

### Semantic Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-success` | `#00B96B` | In-stock, confirmed order |
| `--color-warning` | `#FF9500` | Low stock, pending |
| `--color-danger` | `#FF3B30` | Out of stock, error, delete |
| `--color-info` | `#0052FF` | Info banners |

---

## 3. Typography

### Fonts

| Role | Family | Weights | Usage |
|------|--------|---------|-------|
| **Display** | `Syne` | 600, 700, 800 | Hero headings, section titles, brand moments |
| **Body** | `DM Sans` | 300, 400, 500, 600 | All UI text, descriptions, data |
| **Mono** | `JetBrains Mono` | 400, 500 | Prices (optional), order IDs, code |

### Import
```css
/* In globals.css / index.css */
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');
```

### Scale

| Token | Size | Usage |
|-------|------|-------|
| `--text-hero` | `5rem / 80px` | Poster-scale hero (landing only) |
| `--text-5xl` | `3.815rem / 61px` | Page hero headline |
| `--text-4xl` | `3.052rem / 48.8px` | Section hero |
| `--text-3xl` | `2.441rem / 39px` | Section title |
| `--text-2xl` | `1.953rem / 31.25px` | Card title, modal heading |
| `--text-xl` | `1.563rem / 25px` | Sub-section label |
| `--text-lg` | `1.25rem / 20px` | Lead paragraph, price |
| `--text-base` | `1rem / 16px` | Body text |
| `--text-sm` | `0.8rem / 12.8px` | Labels, captions, meta |
| `--text-xs` | `0.64rem / 10.24px` | Badges, tags, footnotes |

### Usage Examples

```tsx
// Hero heading — Storefront
<h1 className="font-display text-5xl font-extrabold tracking-tight text-gradient-brand">
  All Your Tech. One Place.
</h1>

// Section title
<h2 className="font-display text-3xl font-bold text-[var(--color-text-primary)]">
  Flash Sale
</h2>

// Product name
<h3 className="font-body text-base font-semibold text-[var(--color-text-primary)]">
  MacBook Pro M3 14"
</h3>

// Price
<span className="font-body text-xl font-bold text-[var(--color-primary)]">
  $1,299.00
</span>

// Meta / label
<span className="font-body text-sm text-[var(--color-text-secondary)]">
  SKU: NT-MB-M3-14
</span>
```

---

## 4. Spacing

Uses a **4px base grid**. Always use spacing tokens — never arbitrary pixel values.

```
space-1  = 4px   (tight: icon padding, chip gaps)
space-2  = 8px   (compact: input inner padding)
space-3  = 12px  (default inner padding)
space-4  = 16px  (default gap, card padding)
space-6  = 24px  (section inner spacing)
space-8  = 32px  (section gap, card gap)
space-12 = 48px  (section margin)
space-16 = 64px  (hero spacing)
space-20 = 80px  (page section gap)
```

---

## 5. Components

### 5.1 Buttons

```
Variants: primary | secondary | ghost | danger | outline
Sizes:    sm | md | lg | icon
```

**Visual spec:**

| Variant | Background | Text | Border | Hover |
|---------|-----------|------|--------|-------|
| `primary` | `gradient-brand` | white | none | `gradient-brand-hover` + lift |
| `secondary` | `color-primary-subtle` | `color-primary` | none | darken bg |
| `ghost` | transparent | `color-primary` | none | `primary-subtle` bg |
| `outline` | transparent | `color-primary` | `color-primary` | fill primary subtle |
| `danger` | `color-danger` | white | none | darken |

```tsx
// Primary — main CTA (Add to Cart, Checkout)
<Button variant="primary" size="lg">Add to Cart</Button>

// Style reference
// bg: gradient-brand, border-radius: radius-md
// padding: space-3 space-6, font: DM Sans 600
// transition: transform 150ms ease-bounce
// hover: translateY(-1px) + shadow-lg
// active: translateY(1px)
```

### 5.2 Product Card

Product cards are the **most critical component** in the storefront. Reference GEARVN's dense grid layout.

```
Structure:
├── Image area (aspect-ratio: 1/1, bg: gray-50)
│   ├── Discount badge (top-left, gradient-brand)
│   ├── Wishlist button (top-right, ghost)
│   └── Quick-view overlay (bottom, on hover)
├── Content area
│   ├── Brand tag (text-xs, text-secondary)
│   ├── Product name (text-sm / text-base, font-semibold, 2 lines max)
│   ├── Rating row (stars + count)
│   ├── Price row
│   │   ├── Sale price (text-lg, font-bold, color-primary)
│   │   └── Original price (text-sm, line-through, text-tertiary)
│   └── Add to Cart button (full-width, primary)
```

**States:**
- Default: subtle border, shadow-card
- Hover: border-color → primary, shadow-md, image scales 1.04
- Out of stock: image opacity 0.6, overlay "Hết hàng" badge

### 5.3 Flash Sale Banner

Hero promotional strip with countdown timer. Uses `gradient-hero` background with white text.

```
Structure:
├── Background: gradient-hero
├── Left: Headline (Syne 800) + Subtitle
├── Center: Countdown timer (HH:MM:SS)
│   └── Each unit: glass-card box + label
└── Right: CTA button (white bg, primary text)
```

### 5.4 Navigation Header (Storefront)

Height: `--header-height: 72px`

```
Structure:
├── Left: Logo (NexaTech wordmark)
├── Center: Search bar (full-width, rounded-full)
│   └── Category dropdown + search input + search button (gradient-brand)
├── Right: Icons row
│   ├── Account (user icon + name if logged in)
│   ├── Wishlist (heart + count badge)
│   └── Cart (cart icon + item count badge — gradient-brand bg)
└── Bottom: Category mega-menu bar (Laptops, Smartphones, Accessories...)
```

### 5.5 Admin Sidebar

Width: `--sidebar-width: 260px`

```
Structure:
├── Logo area (top, 64px)
├── Nav sections (collapsible groups)
│   ├── Section label (text-xs, tracking-widest, text-tertiary)
│   └── Nav items (icon + label + optional badge)
│       States: default / hover / active
│       Active: bg primary-subtle, text-primary, border-left 3px primary
└── User profile (bottom, avatar + name + role)
```

**Dark by default** in admin. Use `bg: color-bg-elevated` for sidebar, `bg: color-bg-base` for main content area.

### 5.6 Badge / Tag

```
Sizes:    xs | sm | md
Variants: default | primary | success | warning | danger | outline

// Discount tag
<Badge variant="danger" size="sm">-15%</Badge>
// bg: danger, text: white, border-radius: radius-sm

// In-stock tag  
<Badge variant="success" size="xs">Còn hàng</Badge>

// Category tag
<Badge variant="outline" size="sm">Laptop Gaming</Badge>
```

### 5.7 Input / Search

```
Sizes:    sm | md | lg
States:   default | focus | error | disabled

Default:  bg: bg-sunken, border: color-border, radius: radius-md
Focus:    border: color-primary (2px), shadow: 0 0 0 3px primary-subtle
Error:    border: color-danger, shadow: 0 0 0 3px danger-subtle
```

---

## 6. Layout System

### Storefront (`client/`) Grid

```
Max width: 1280px (--container-max)
Padding:   0 16px → 0 24px (md+) → 0 32px (xl+)

Product Grid:
  mobile:   2 columns
  tablet:   3 columns  (md: 768px+)
  desktop:  4 columns  (lg: 1024px+)
  wide:     5 columns  (xl: 1280px+)

Gap: space-3 (12px) mobile → space-4 (16px) desktop
```

### Admin Panel Grid

```
Layout: Sidebar (260px fixed) + Main content area
Main content max-width: none (full remaining width)

Data tables: full-width
Dashboard cards: 2-col (md) → 3-col (lg) → 4-col (xl)
Stat widgets: always 4-col on desktop
```

---

## 7. Motion & Animation

### Principles
1. **Ease-in = exiting**, **ease-out = entering**, **ease-in-out = transitioning**
2. Keep durations short: UI interactions < 250ms, page transitions < 400ms
3. Use `--ease-bounce` for confirmatory actions (add to cart, success states)

### Standard Transitions

```css
/* Default UI interaction */
transition: var(--transition-base);
/* = all 220ms cubic-bezier(0.4, 0, 0.2, 1) */

/* Fast: hover states, color changes */
transition: var(--transition-fast);
/* = all 120ms cubic-bezier(0.4, 0, 0.2, 1) */

/* Bounce: add to cart, like button, badge pop */
transition: transform var(--duration-normal) var(--ease-bounce);
```

### Key Micro-interactions

| Interaction | Effect |
|-------------|--------|
| Button hover | `translateY(-1px)` + shadow increase |
| Button active | `translateY(1px)` |
| Card hover | `translateY(-4px)` + shadow-md + image scale(1.04) |
| Add to cart | Cart icon bounce + badge count pop (scale 1.3 → 1) |
| Page load | Staggered fade-in-up (50ms delay between items) |
| Skeleton → content | Fade transition 300ms |

---

## 8. Dark Mode

### Strategy
- Storefront: user-toggleable (system default preferred), persist in `localStorage`
- Admin: **dark by default**; allow toggle in settings

### Implementation
```tsx
// In Tailwind config
darkMode: 'class'  // or 'media'

// Toggle dark mode
document.documentElement.classList.toggle('dark')

// Or via data attribute (admin)
document.documentElement.setAttribute('data-theme', 'dark')
```

All tokens automatically switch to dark variants via the `.dark` / `[data-theme="dark"]` selector in `tokens.css`.

---

## 9. Iconography

- **Library**: Lucide React (already in Shadcn setup)
- **Size scale**: 14px (xs) | 16px (sm) | 20px (md) | 24px (lg) | 32px (xl)
- **Stroke width**: 1.5px default; 2px for emphasis
- **Color**: Inherit from parent text color; use `currentColor`

```tsx
import { ShoppingCart, Heart, Search } from 'lucide-react'

// Standard usage
<ShoppingCart size={20} strokeWidth={1.5} className="text-[var(--color-text-primary)]" />

// Active/brand state
<ShoppingCart size={20} className="text-[var(--color-primary)]" />
```

---

## 10. Responsive Breakpoints

| Name | Min-width | Use case |
|------|-----------|----------|
| `sm` | 640px | Large phones, small tablets |
| `md` | 768px | Tablets, landscape phones |
| `lg` | 1024px | Laptops, small desktops |
| `xl` | 1280px | Standard desktops |
| `2xl` | 1536px | Large monitors |

**Mobile-first always.** Write base styles for mobile, then override upward.

---

## 11. Accessibility

- Color contrast: all text meets WCAG AA (4.5:1 for body, 3:1 for large text)
- Focus states: visible focus ring on all interactive elements (`.focus-ring`)
- Touch targets: minimum 44×44px for all interactive elements
- Screen reader: use `aria-label` on icon-only buttons; `aria-live` on cart count updates
- Reduced motion: respect `prefers-reduced-motion`

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 12. Tailwind Config Reference

```ts
// tailwind.config.ts — extend with design tokens
import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}', './app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          light:   'var(--color-primary-light)',
          dark:    'var(--color-primary-dark)',
          subtle:  'var(--color-primary-subtle)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)',
        },
        surface: {
          base:     'var(--color-bg-base)',
          elevated: 'var(--color-bg-elevated)',
          sunken:   'var(--color-bg-sunken)',
        },
        content: {
          primary:   'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          tertiary:  'var(--color-text-tertiary)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          strong:  'var(--color-border-strong)',
          focus:   'var(--color-border-focus)',
        }
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        xs:   'var(--radius-xs)',
        sm:   'var(--radius-sm)',
        md:   'var(--radius-md)',
        lg:   'var(--radius-lg)',
        xl:   'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
      },
      boxShadow: {
        xs:   'var(--shadow-xs)',
        sm:   'var(--shadow-sm)',
        md:   'var(--shadow-md)',
        lg:   'var(--shadow-lg)',
        xl:   'var(--shadow-xl)',
        card: 'var(--shadow-card)',
        glow: 'var(--shadow-blue-glow)',
      },
      transitionTimingFunction: {
        standard:   'cubic-bezier(0.4, 0, 0.2, 1)',
        decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
        accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
        bounce:     'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    }
  },
  plugins: [],
} satisfies Config
```

---

## 13. Changelog

| Version | Date | Notes |
|---------|------|-------|
| 1.0 | 2025 | Initial release — color system, typography, core components |

---

*NexaTech Design System © 2025 — Internal use only*
