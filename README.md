# NexaTech Micro-frontends Monorepo

This repository is managed as an npm monorepo with multiple micro-frontend services.

## Services & Ports

| Service               | Type      | URL                     |
| --------------------- | --------- | ----------------------- |
| `host-app`            | Next.js   | http://localhost:3000   |
| `auth`                | Next.js   | http://localhost:3001   |
| `product`             | Next.js   | http://localhost:3002   |
| `cart`                | Next.js   | http://localhost:3003   |
| `order`               | Next.js   | http://localhost:3004   |
| `user`                | Next.js   | http://localhost:3005   |
| `marketing`           | Next.js   | http://localhost:3006   |
| `nexatech-admin`      | Vite      | http://localhost:4001   |
| `nexatech-manager`    | Vite      | http://localhost:4002   |
| `nexatech-staff`      | Vite      | http://localhost:4003   |
| `nexatech-warehouse`  | Vite      | http://localhost:4004   |
| `nexatech-accountant` | Vite      | http://localhost:4005   |

## Commands

### Installation
Install all dependencies for the root and all workspaces:
```bash
npm install
```

### Development
Run all services in parallel (requires `concurrently`):
```bash
npm run dev:all
```
Or run a specific service:
```bash
npm run w:dev:host
npm run w:dev:auth
# ... etc
```

### Build
Build all services:
```bash
npm run build
```
Build a specific service:
```bash
npm run w:build:host
# ... etc
```

### Other Commands
- `npm run lint`: Lint all workspaces.
- `npm run type-check`: Type-check all workspaces.
- `npm run clean`: Clean all workspaces (if `clean` script is defined).
