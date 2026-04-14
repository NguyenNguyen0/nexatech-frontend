> ✅ **Next.js (Multi-Zone)** → dành cho **CUSTOMER (SEO, public)**
> ✅ **Vite (SPA)** → dành cho **internal roles (ADMIN, MANAGER, STAFF, …)**

---

# 🧠 1. Phạm vi câu trả lời (focus lại)

👉 Bạn hỏi:

> “Thiết kế lại domain + route cho **user-facing (Next.js)**”

👉 Vậy mình sẽ chỉ design phần:

```bash
CUSTOMER (Next.js Multi-Zone)
```

---

# 🧱 2. DOMAIN (ZONE) CHO CUSTOMER APP

👉 Tối ưu theo các site bạn đưa:

* CellphoneS
* GearVN
* Shopee

---

## ✅ CORE ZONES (bắt buộc)

```bash
shell        (homepage + layout + SEO entry)
product      (catalog + product detail)
cart         (cart + checkout)
order        (order + tracking)
user         (account)
```

---

## ⚡ OPTIONAL (nên có sớm)

```bash
search       (search riêng - nếu scale lớn)
marketing    (flash sale, deals, landing page)
```

---

# 🌐 3. URL STRUCTURE (CHUẨN SEO)

👉 Đây là phần QUAN TRỌNG NHẤT với Next.js

---

## 🏠 HOME (shell)

```bash
/ 
```

* banner
* flash sale
* category highlight

---

## 🛍️ PRODUCT DOMAIN

```bash
/products
/products/:slug
/products/category/:categorySlug
/products/brand/:brandSlug
```

👉 Ví dụ chuẩn SEO:

```bash
/products/iphone-15-pro-max
/products/category/dien-thoai
```

---

## 🔍 SEARCH DOMAIN

```bash
/search?q=iphone
/search?category=gaming-gear
```

👉 giống Shopee

---

## 🛒 CART DOMAIN

```bash
/cart
/cart/checkout
/cart/success
```

---

## 📦 ORDER DOMAIN

```bash
/orders
/orders/:id
/orders/tracking/:id
```

---

## 👤 USER DOMAIN

```bash
/account
/account/profile
/account/orders
/account/addresses
/account/payment-methods
```

---

## 🎯 MARKETING DOMAIN (QUAN TRỌNG)

👉 học từ Shopee / CellphoneS

```bash
/flash-sale
/deals
/voucher
/campaign/:slug
```

---

# 🧭 4. MULTI-ZONE MAPPING

```bash
/                     → shell
/products/*           → product
/search/*             → search (optional)
/cart/*               → cart
/orders/*             → order
/account/*            → user
/flash-sale/*         → marketing
```

---

# 🏗️ 5. PROJECT STRUCTURE (Next.js)

```bash
apps/
 ├── shell/
 ├── product/
 ├── cart/
 ├── order/
 ├── user/
 ├── search/        (optional)
 ├── marketing/     (optional)

packages/
 ├── ui/
 ├── hooks/
 ├── types/
 ├── config/
```

---

# ⚙️ 6. CONFIG MULTI-ZONE

## 🧠 shell (gateway)

```js
module.exports = {
  async rewrites() {
    return [
      {
        source: "/products/:path*",
        destination: "http://localhost:3001/products/:path*",
      },
      {
        source: "/cart/:path*",
        destination: "http://localhost:3002/cart/:path*",
      },
      {
        source: "/orders/:path*",
        destination: "http://localhost:3003/orders/:path*",
      },
      {
        source: "/account/:path*",
        destination: "http://localhost:3004/account/:path*",
      },
    ];
  },
};
```

---

# 🔥 7. SEO BEST PRACTICE (RẤT QUAN TRỌNG)

👉 Vì bạn dùng Next.js:

## ✅ URL sạch

```bash
/products/iphone-15-pro-max
```

❌ không dùng:

```bash
/products?id=123
```

---

## ✅ Metadata dynamic

```ts
generateMetadata({ params }) {
  return {
    title: product.name,
    description: product.description,
  };
}
```

---

## ✅ SSR / ISR

* product detail → ISR
* homepage → SSR

---

# 🧠 8. KHÔNG CẦN trong Next.js

👉 Vì bạn đã tách Vite:

❌ `/admin`
❌ `/manager`
❌ `/staff`
❌ `/inventory`
❌ `/payment` (internal)

👉 tất cả nằm ở **Vite app**

---

# 🚀 9. FINAL (CHỐT CHO BẠN)

## 👉 ZONES bạn cần tạo:

```bash
shell
product
cart
order
user
(search)       optional
(marketing)    optional
```

---

## 👉 URL chính:

```bash
/
/products/*
/search
/cart/*
/orders/*
/account/*
/flash-sale
```

---

## 👉 Kiến trúc:

* Next.js → customer + SEO
* Vite → admin/backoffice
* API → shared backend

---
