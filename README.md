# NexaTech Frontend

> E-commerce platform frontend — split into two independent applications for clear separation of concerns and independent deployment.

<p align="left">
  <img src="https://img.shields.io/badge/React-19.2.0-61dafb?logo=react&style=flat-square" alt="React 19.2.0" />
  <img src="https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs&style=flat-square" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/TypeScript-5.9.3-3178c6?logo=typescript&style=flat-square" alt="TypeScript 5.9.3" />
  <img src="https://img.shields.io/badge/TailwindCSS-v4-38bdf8?logo=tailwindcss&style=flat-square" alt="TailwindCSS v4" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&style=flat-square" alt="Vite 8" />
</p>

## Architecture Overview

```
nexatech-frontend/
│
├── client/                  🛒 Customer Storefront (Next.js)
│   ├── app/
│   │   ├── (storefront)/    Public pages with Header + Footer
│   │   │   ├── page.tsx              /            → Home
│   │   │   ├── product/page.tsx      /product     → Product listing
│   │   │   ├── cart/page.tsx         /cart         → Shopping cart
│   │   │   ├── cart/checkout/        /cart/checkout→ Checkout flow
│   │   │   ├── order/page.tsx        /order       → Order tracking
│   │   │   ├── user/page.tsx         /user        → User profile
│   │   │   └── marketing/page.tsx    /marketing   → Promotions
│   │   └── auth/
│   │       ├── login/                /auth/login
│   │       ├── register/             /auth/register
│   │       └── forgot-password/      /auth/forgot-password
│   ├── components/          Shared UI (Header, Footer, Shadcn)
│   ├── features/            Domain logic (auth, cart, home)
│   ├── lib/                 Utilities (axios client, helpers)
│   ├── middleware.ts        Route protection (cookie-based)
│   └── package.json
│
├── admin/                   🔧 Internal Admin Panel (Vite + React)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── auth/        Admin login (role-based redirect)
│   │   │   ├── admin/       ADMIN role routes
│   │   │   │   ├── dashboard/    Analytics & overview
│   │   │   │   ├── product/      Product management (CRUD)
│   │   │   │   ├── order/        Order management
│   │   │   │   ├── users/        User management
│   │   │   │   ├── kanban/       Kanban board
│   │   │   │   ├── calendar/     Scheduling
│   │   │   │   ├── chats/        Messaging
│   │   │   │   ├── email/        Email management
│   │   │   │   ├── tasks/        Task management
│   │   │   │   ├── support/      Support tickets
│   │   │   │   └── settings/     Profile, account, appearance
│   │   │   ├── manager/     MANAGER role dashboard
│   │   │   ├── staff/        STAFF role dashboard
│   │   │   ├── warehouse/   WAREHOUSE role dashboard
│   │   │   └── accountant/  ACCOUNTANT role dashboard
│   │   ├── routes/          react-router-dom configuration
│   │   ├── services/        API services (auth, users, roles)
│   │   ├── components/      Shared UI components (Shadcn)
│   │   └── layouts/         AppShell (Sidebar + Topbar)
│   └── package.json
│
├── .gitignore
└── README.md
```

## Quick Start

### Prerequisites

- **Node.js** >= 18
- **npm** >= 9
- **API Gateway** running on `http://localhost:8080`

### Installation & Development

```bash
# Clone the repository
git clone <repo-url>
cd nexatech-frontend

# --- Client (Storefront) ---
cd client
npm install
npm run dev
# → http://localhost:3000

# --- Admin (Dashboard) ---  [separate terminal]
cd admin
npm install
npm run dev
# → http://localhost:4000
```

## Technology Stack

| | Client (Storefront) | Admin (Dashboard) |
|--|---------------------|-------------------|
| **Framework** | Next.js 15 (App Router) | Vite 8 + React 19.2.0 |
| **Language** | TypeScript 5.9.3 | TypeScript 5.9.3 |
| **Styling** | TailwindCSS v4 + Shadcn UI | TailwindCSS v4 + Shadcn UI |
| **Routing** | File-based (App Router) | react-router-dom v7 |
| **HTTP Client** | Axios (with interceptors) | Axios (with interceptors) |
| **Port** | 3000 | 4000 |

## Application Comparison

| Aspect | Client | Admin |
|--------|--------|-------|
| **Target Users** | Customers | Internal staff (Admin, Manager, Staff, Warehouse, Accountant) |
| **Layout** | Header + Footer | Sidebar + Topbar (AppShell) |
| **Authentication** | Cookie-based, redirects to `/` | JWT + localStorage, redirects by role |
| **Registration** | ✅ Self-service | ❌ Admin-created accounts only |
| **SEO** | ✅ Critical (SSR/SSG) | ❌ Not needed (internal SPA) |
| **Deployment** | Vercel / Node.js server | Static hosting / Nginx |

## API Integration

Both applications connect to the same backend through an API Gateway:

```
Client (Next.js :3000)  ──┐
                           ├──→  API Gateway (:8080)  ──→  Microservices
Admin  (Vite    :4000)  ──┘
```

### Client API Proxy (next.config.ts)

The client proxies API requests through Next.js rewrites to avoid CORS:

```
/api/v1/*  →  http://localhost:8080/api/v1/*
```

### Admin API

The admin app calls the API Gateway directly via Axios with JWT Bearer tokens.

### Key API Endpoints

| Service | Base Path | Description |
|---------|-----------|-------------|
| Auth | `/api/v1/auth/*` | Login, register, refresh, logout |
| Users | `/api/v1/users/*` | User CRUD, profile |
| Products | `/api/v1/products/*` | Product catalog |
| Cart | `/api/v1/cart/*` | Shopping cart operations |
| Orders | `/api/v1/orders/*` | Order management |

## Authentication

### Client Auth Flow

1. User submits credentials at `/auth/login`
2. Backend returns `access_token` + `refresh_token`
3. Tokens stored in `localStorage`
4. Axios interceptor attaches `Bearer` token to requests
5. Auto-refresh on `401/403` responses
6. Next.js middleware checks cookies for route protection

### Admin Auth Flow

1. Staff logs in at `/auth/login`
2. JWT decoded to extract `realm_access.roles`
3. Redirected to role-specific dashboard (`/admin`, `/manager`, `/staff`, etc.)
4. `ProtectedRoute` component guards authenticated routes

### Role Hierarchy

| Role | Access Level | Default Path |
|------|-------------|--------------|
| `ADMIN` | Full system access | `/admin/dashboard` |
| `MANAGER` | Department management | `/manager` |
| `STAFF` | Operational tasks | `/staff` |
| `WAREHOUSE` | Inventory management | `/warehouse` |
| `ACCOUNTANT` | Financial reports | `/accountant` |
| `CUSTOMER` | Storefront only | Client app (`:3000`) |

## Project Structure Details

### Client — Feature-Based Architecture

```
client/
├── app/                     Next.js App Router (pages & layouts)
├── components/
│   ├── ui/                  Shadcn UI primitives (Button, Input, Card, etc.)
│   ├── layout/              Header, Footer
│   └── shared/              ThemeProvider, Loader, etc.
├── features/
│   ├── auth/
│   │   ├── components/      LoginForm
│   │   ├── services/        auth-api.ts (login, register, refresh)
│   │   └── utils/           authStorage, authSession
│   ├── cart/
│   │   ├── components/      CartPage
│   │   └── services/        cart-api.ts
│   └── home/
│       └── components/      HeroSection, QuickLinks, FlashSale, ProductSection
├── lib/
│   ├── axios-client.ts      Configured Axios instance with interceptors
│   ├── constants.ts         API paths, role config
│   └── utils.ts             cn(), formatters
├── types/                   TypeScript interfaces (Cart, Auth, etc.)
└── middleware.ts            Edge middleware for route protection
```

### Admin — Page-Based Architecture

```
admin/src/
├── pages/                   Route pages
│   ├── admin/               Admin-specific pages
│   │   ├── dashboard/       Overview, analytics, charts
│   │   ├── product/         DataTable with CRUD operations
│   │   ├── order/           Order management
│   │   ├── users/           User management with dialogs
│   │   ├── kanban/          Drag & drop board
│   │   ├── calendar/        FullCalendar integration
│   │   ├── tasks/           Task tracking with DataTable
│   │   ├── email/           Email templates (React Email)
│   │   ├── support/         Support ticket system
│   │   └── settings/        Profile, account, appearance, notifications
│   ├── manager/             Manager dashboard
│   ├── staff/               Staff dashboard
│   ├── warehouse/           Warehouse dashboard
│   └── auth/                Login page with brand panel
├── routes/                  react-router-dom config
│   ├── index.tsx            Root router (createBrowserRouter)
│   ├── admin.tsx            Admin route tree
│   ├── manager.tsx          Manager routes
│   ├── staff.tsx            Staff routes
│   ├── warehouse.tsx        Warehouse routes
│   ├── accountant.tsx       Accountant routes
│   └── components/
│       ├── ProtectedRoute   Auth guard wrapper
│       ├── LazyWrapper      Code-splitting wrapper
│       └── PageLoader       Loading skeleton
├── services/                API layer
│   ├── authApi.ts           Authentication endpoints
│   ├── authStorage.ts       Token persistence
│   ├── authSession.ts       JWT decoding & role extraction
│   ├── userApi.ts           User CRUD
│   └── roleApi.ts           Role management
├── layouts/                 App shell (sidebar + header)
├── components/              Shared UI (sidebar, nav, data-table)
└── hooks/                   Custom hooks
```

## Development

### Environment Variables

**Client** (`client/.env.local`):

```env
API_GATEWAY_URL=http://localhost:8080
```

**Admin** (`admin/.env`):

```env
VITE_API_URL=http://localhost:8080
```

### Build for Production

```bash
# Client
cd client && npm run build    # Output: client/.next/

# Admin
cd admin && npm run build     # Output: admin/dist/
```

### Deployment

| App | Strategy | Notes |
|-----|----------|-------|
| **Client** | Vercel, Docker, or Node.js server | Requires Node.js runtime for SSR |
| **Admin** | Static hosting (Nginx, S3, Cloudflare) | Pure SPA, no server needed |

## Contributing

1. Create a feature branch from `dev`
2. Make changes in the appropriate app (`client/` or `admin/`)
3. Test locally with both apps running
4. Submit a merge request

## License

Internal project — NexaTech © 2025
