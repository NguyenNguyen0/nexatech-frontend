# AGENTS.md — NexaTech Frontend

> Global agent instructions for the `nexatech-frontend` monorepo.
> Applies to: **Claude Code**, **Cursor / Windsurf**, **GitHub Copilot Workspace**, and any AI coding agent.

---

## 1. Project Overview

NexaTech is a **tech e-commerce platform** split into two independent frontend applications:

| App | Framework | Port | Audience |
|-----|-----------|------|----------|
| `client/` | Next.js 15 (App Router) | 3000 | Customers |
| `admin/` | Vite 6 + React 19 | 4000 | Internal staff |

Both apps share the same **API Gateway** at `http://localhost:8080` and follow the **NexaTech Design System** (see `design-system/DESIGN_SYSTEM.md`).

---

## 2. Repository Structure

```
nexatech-frontend/
├── client/          # Customer storefront (Next.js)
├── admin/           # Internal admin panel (Vite + React)
├── design-system/   # Shared design tokens & documentation
│   ├── DESIGN_SYSTEM.md
│   └── tokens.css
└── AGENTS.md        ← You are here
```

**Do not mix `client/` and `admin/` code.** They are independent deployments.

---

## 3. Coding Conventions

### 3.1 Language & Tooling
- **TypeScript only** — no plain `.js` files in `src/` or `app/`
- Strict mode enabled (`"strict": true` in tsconfig)
- ESLint + Prettier enforced — run `npm run lint` before committing
- Path aliases: use `@/` for the root of each app (e.g., `@/components/ui/Button`)

### 3.2 Naming
| Entity | Convention | Example |
|--------|-----------|---------|
| Components | PascalCase | `ProductCard.tsx` |
| Hooks | camelCase + `use` prefix | `useCartCount.ts` |
| Services / API | camelCase + `Api` suffix | `productApi.ts` |
| CSS modules | kebab-case | `product-card.module.css` |
| Constants | UPPER_SNAKE_CASE | `API_BASE_URL` |
| Types/Interfaces | PascalCase, no `I` prefix | `CartItem`, `UserRole` |

### 3.3 Component Structure
```tsx
// 1. Imports (external → internal → types → styles)
// 2. Types / interfaces
// 3. Component function (named export preferred)
// 4. Sub-components (if small & tightly coupled)
// 5. Default export (if needed for lazy loading)
```

### 3.4 File Co-location
```
features/cart/
├── components/    # UI components for this feature
├── hooks/         # Feature-specific hooks
├── services/      # API calls
├── types.ts       # Local types
└── index.ts       # Public barrel export
```

---

## 4. Styling Rules

> All styling follows the NexaTech Design System. See `design-system/tokens.css` for CSS variables.

- **TailwindCSS v4** — utility-first; prefer utilities over custom CSS
- **Shadcn UI** — use existing primitives before creating new ones
- **CSS Variables** from `tokens.css` must be used for colors, spacing, and typography — **never hardcode hex values**
- Dark mode: use `dark:` Tailwind prefix; tokens handle automatic theming
- Responsive: mobile-first (`sm:` → `md:` → `lg:` → `xl:`)
- Animation: prefer CSS transitions; use Framer Motion only for complex sequences

### Forbidden
```tsx
// ❌ Never do this
style={{ color: '#0066FF' }}
className="text-[#0066FF]"

// ✅ Do this
className="text-primary"
style={{ color: 'var(--color-primary)' }}
```

---

## 5. App-Specific Rules

### 5.1 Client (`client/`)

- Use **Server Components by default**; add `'use client'` only when needed (interactivity, hooks, browser APIs)
- Data fetching: `fetch()` with Next.js caching options — no client-side fetch for initial page data
- Images: always use `next/image` with explicit `width` / `height` or `fill`
- SEO: every page must export `generateMetadata()` or a static `metadata` object
- Route groups: `(storefront)` for public pages, `(auth)` for auth pages — respect this layout separation
- Middleware (`middleware.ts`): handles route protection via cookies — do not duplicate auth logic in pages

```tsx
// ✅ Correct data fetching in Server Component
async function ProductPage() {
  const products = await fetch(`${process.env.API_GATEWAY_URL}/api/v1/products`, {
    next: { revalidate: 60 }
  }).then(r => r.json())
  // ...
}
```

### 5.2 Admin (`admin/`)

- **Client-side SPA only** — no SSR concerns; all data via Axios with JWT
- Auth: JWT stored in `localStorage`; use `authStorage.ts` and `authSession.ts` — do not access `localStorage` directly elsewhere
- Route guards: wrap every protected page in `<ProtectedRoute>` with the correct `allowedRoles`
- Role-based rendering: check roles from `authSession.getRoles()` — never from raw JWT decoding in components
- Lazy-load all page components via `<LazyWrapper>` to keep the initial bundle small

```tsx
// ✅ Correct protected route
<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
  <DashboardPage />
</ProtectedRoute>
```

---

## 6. API Integration

### Base URLs
```
Client:  /api/v1/*  (proxied via next.config.ts → http://localhost:8080)
Admin:   http://localhost:8080/api/v1/*  (direct, with Bearer token)
```

### Axios Conventions
- Use the pre-configured Axios instance from `lib/axios-client.ts` — **never create a raw `axios` instance**
- Error handling: catch errors at the service layer and throw typed errors; components receive typed errors only
- Optimistic updates: use for cart, likes, and similar fast-feedback operations

### Key Endpoints
| Resource | Path |
|----------|------|
| Auth | `/api/v1/auth/*` |
| Users | `/api/v1/users/*` |
| Products | `/api/v1/products/*` |
| Cart | `/api/v1/cart/*` |
| Orders | `/api/v1/orders/*` |

---

## 7. State Management

- **No global state library** (no Redux, no Zustand) unless explicitly added
- Server state: use React's built-in cache + Next.js fetch caching (client) / React Query if added
- Client UI state: `useState` / `useReducer` locally; lift only when truly shared
- Auth state: managed exclusively through `authStorage` / `authSession` utilities

---

## 8. Testing Guidelines

- Unit tests: Vitest + React Testing Library
- Test files: co-located as `ComponentName.test.tsx`
- Test IDs: use `data-testid="nexa-[component]-[element]"` pattern
- Do not test implementation details — test behavior and output

```tsx
// ✅
expect(screen.getByTestId('nexa-cart-total')).toHaveTextContent('$99.00')

// ❌
expect(component.state.total).toBe(99)
```

---

## 9. Git Workflow

- Branch from `dev` — never commit directly to `main` or `dev`
- Branch naming: `feat/`, `fix/`, `chore/`, `refactor/` prefixes
  - Example: `feat/product-filter`, `fix/cart-quantity-bug`
- Commit messages: Conventional Commits format
  ```
  feat(cart): add quantity stepper with optimistic update
  fix(auth): handle expired refresh token edge case
  chore(deps): upgrade Next.js to 15.3
  ```
- One logical change per commit — avoid "fix everything" commits

---

## 10. Agent Task Checklist

Before completing any task, verify:

- [ ] TypeScript compiles without errors (`npm run tsc --noEmit`)
- [ ] Lint passes (`npm run lint`)
- [ ] No hardcoded colors or magic numbers — use design tokens
- [ ] No `console.log` left in production code
- [ ] Server Components do not import client-only code (no `'use client'` imports in server components)
- [ ] New API calls use the shared Axios instance
- [ ] Protected routes have `<ProtectedRoute>` wrapper (admin only)
- [ ] New pages export `metadata` (client only)
- [ ] Responsive: tested at `sm`, `md`, `lg` breakpoints

---

## 11. Prohibited Patterns

```tsx
// ❌ Direct localStorage access outside authStorage
localStorage.getItem('token')

// ❌ Hardcoded API URLs
fetch('http://localhost:8080/api/v1/products')

// ❌ any type
const data: any = await response.json()

// ❌ Default export for non-page components
export default function Button() {}  // use named export

// ❌ Inline styles for design tokens
<div style={{ color: '#003DCC' }}>

// ❌ Creating new Axios instance
import axios from 'axios'; axios.get(...)

// ❌ Mixing client/ and admin/ imports
import { authStorage } from '../../admin/src/services/authStorage'
```

---

## 12. Design System Reference

| Token file | `design-system/tokens.css` |
|------------|---------------------------|
| Full spec | `design-system/DESIGN_SYSTEM.md` |
| Primary color | `--color-primary: #0052FF` |
| Font (display) | `Syne` |
| Font (body) | `DM Sans` |
| Border radius base | `--radius-md: 10px` |

When in doubt about visual decisions, consult `DESIGN_SYSTEM.md` first.

---

*NexaTech © 2025 — Internal use only*
