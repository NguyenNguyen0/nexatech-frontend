# NexaTech Frontend

Hệ thống frontend gồm 2 ứng dụng độc lập:

## 📂 Structure

```
nexatech-frontend/
├── client/          🛒 Storefront (Next.js)   → port 3000
├── admin/           🔧 Admin Panel (Vite+React) → port 4000
└── README.md
```

## 🚀 Quick Start

```bash
# Client (storefront cho khách hàng)
cd client && npm install && npm run dev
# → http://localhost:3000

# Admin (hệ thống quản trị cho nhân viên)
cd admin && npm install && npm run dev
# → http://localhost:4000
```

## 📋 Architecture

| | Client | Admin |
|--|--------|-------|
| **Framework** | Next.js (App Router) | Vite + React |
| **Port** | 3000 | 4000 |
| **Target** | Khách hàng | Nhân viên nội bộ |
| **Layout** | Header + Footer | Sidebar + Topbar |
| **Routing** | File-based | react-router-dom |
| **Auth** | Cookie-based | JWT + localStorage |

## 🔗 API Gateway

Cả 2 ứng dụng đều kết nối tới cùng API Gateway:
- **URL**: `http://localhost:8080`
- **Prefix**: `/api/v1/*`
