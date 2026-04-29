'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ShoppingCart,
  Package,
  Star,
  Search,
  Filter,
  ArrowRight,
  CheckCircle,
  Minus,
  Plus,
  X,
  ShoppingBag,
  Loader2,
  Sparkles,
  Tag,
} from 'lucide-react';
import { toast } from 'sonner';
import { MOCK_PRODUCTS, type MockProduct } from '@/lib/mockData';
import { formatCurrency } from '@/lib/format';

const CATEGORIES = ['Tất cả', 'Điện thoại', 'Laptop', 'Tablet', 'Phụ kiện', 'Đồng hồ'];

interface CartItem {
  product: MockProduct;
  quantity: number;
}

export function ProductShowcase() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Tất cả');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  const filtered = MOCK_PRODUCTS.filter((p) => {
    const matchCategory = category === 'Tất cả' || p.category === category;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  const addToCart = (product: MockProduct) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.product.id === product.id);
      if (existing) {
        return prev.map((c) =>
          c.product.id === product.id ? { ...c, quantity: c.quantity + 1 } : c,
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    toast.success(`Đã thêm ${product.name} vào giỏ`);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((c) => c.product.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) =>
          c.product.id === productId
            ? { ...c, quantity: Math.max(0, c.quantity + delta) }
            : c,
        )
        .filter((c) => c.quantity > 0),
    );
  };

  const cartTotal = cart.reduce((sum, c) => sum + c.product.price * c.quantity, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Giỏ hàng trống');
      return;
    }
    setCheckingOut(true);

    // Simulate a short delay for UX
    await new Promise((r) => setTimeout(r, 1200));

    toast.success('Đã tạo đơn hàng thành công! (Mock)', {
      description: 'Chuyển đến trang thanh toán...',
    });

    // In a real app, this would call the checkout API
    // For mock: redirect to payment initiate with mock order data
    const mockOrderId = `ord-${Date.now().toString(36)}`;
    setTimeout(() => {
      window.location.href = `/orders/${MOCK_PRODUCTS[0] ? 'ord-001' : mockOrderId}`;
    }, 800);
    setCheckingOut(false);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12">
      {/* Hero Section */}
      <div className="relative card-nexatech p-8 sm:p-12 mb-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-indigo-500/5" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <Sparkles className="size-3.5" />
            Mock Store — Dữ liệu giả lập
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            Khám phá sản phẩm
          </h1>
          <p className="text-muted-foreground max-w-lg">
            Duyệt qua các sản phẩm giả lập để kiểm tra toàn bộ luồng đặt hàng — từ thêm giỏ hàng đến thanh toán.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm sản phẩm..."
            className="w-full pl-11 pr-4 py-3 bg-secondary/50 rounded-2xl text-sm border border-border/50 focus:border-primary/40 focus:ring-2 focus:ring-primary/10 outline-none transition-all"
          />
        </div>
        <button
          onClick={() => setShowCart(true)}
          className="btn-pill bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 relative cursor-pointer"
        >
          <ShoppingCart className="size-4" />
          Giỏ hàng
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`btn-pill text-sm whitespace-nowrap cursor-pointer transition-all ${
              category === cat
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                : 'bg-secondary text-foreground hover:bg-secondary/80'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-12">
        {filtered.map((product) => (
          <div
            key={product.id}
            className="card-nexatech overflow-hidden group"
          >
            {/* Product Image Placeholder */}
            <div className="aspect-square bg-gradient-to-br from-secondary to-secondary/50 flex items-center justify-center relative">
              <Package className="size-16 text-muted-foreground/20" />

              {!product.inStock && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="bg-black/70 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                    Hết hàng
                  </span>
                </div>
              )}

              {product.originalPrice > product.price && (
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                    <Tag className="size-2.5" />
                    -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                  </span>
                </div>
              )}
            </div>

            <div className="p-4">
              <p className="text-xs text-muted-foreground mb-1">{product.brand} · {product.category}</p>
              <h3 className="font-semibold text-sm leading-snug line-clamp-2 mb-2 min-h-[2.5rem]">
                {product.name}
              </h3>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-3">
                <Star className="size-3.5 text-amber-500 fill-amber-500" />
                <span className="text-xs font-medium">{product.rating}</span>
                <span className="text-xs text-muted-foreground">
                  · Đã bán {new Intl.NumberFormat('vi-VN').format(product.soldCount)}
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg font-bold text-primary">
                  {formatCurrency(product.price)}
                </span>
                {product.originalPrice > product.price && (
                  <span className="text-xs text-muted-foreground line-through">
                    {formatCurrency(product.originalPrice)}
                  </span>
                )}
              </div>

              {/* Add to Cart */}
              <button
                onClick={() => addToCart(product)}
                disabled={!product.inStock}
                className="btn-pill w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <ShoppingCart className="size-4" />
                {product.inStock ? 'Thêm vào giỏ' : 'Hết hàng'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card-nexatech p-12 flex flex-col items-center text-center">
          <Filter className="size-10 text-muted-foreground/30 mb-4" />
          <h3 className="font-semibold mb-2">Không tìm thấy sản phẩm</h3>
          <p className="text-sm text-muted-foreground">Thử tìm kiếm với từ khóa khác</p>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/orders" className="card-nexatech p-5 flex items-center gap-4 group cursor-pointer">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
            <Package className="size-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">Đơn hàng của tôi</p>
            <p className="text-xs text-muted-foreground mt-0.5">Xem và quản lý đơn hàng</p>
          </div>
          <ArrowRight className="size-4 text-muted-foreground/30 group-hover:text-blue-600 transition-colors" />
        </Link>
        <Link href="/order" className="card-nexatech p-5 flex items-center gap-4 group cursor-pointer">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
            <ShoppingBag className="size-5 text-emerald-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">Tổng quan</p>
            <p className="text-xs text-muted-foreground mt-0.5">Thống kê và quản lý đơn hàng</p>
          </div>
          <ArrowRight className="size-4 text-muted-foreground/30 group-hover:text-emerald-600 transition-colors" />
        </Link>
      </div>

      {/* Cart Slide-over */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowCart(false)}
          />
          {/* Panel */}
          <div className="relative w-full max-w-md bg-background shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border/50">
              <div className="flex items-center gap-2">
                <ShoppingCart className="size-5 text-primary" />
                <h2 className="text-lg font-bold">Giỏ hàng</h2>
                <span className="text-sm text-muted-foreground">({cartCount})</span>
              </div>
              <button
                onClick={() => setShowCart(false)}
                className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
                    <ShoppingCart className="size-8 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm text-muted-foreground">Giỏ hàng trống</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map(({ product, quantity }) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/30"
                    >
                      <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                        <Package className="size-6 text-muted-foreground/40" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{product.name}</p>
                        <p className="text-sm text-primary font-semibold mt-0.5">
                          {formatCurrency(product.price)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => updateQuantity(product.id, -1)}
                          className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors cursor-pointer"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, 1)}
                          className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors cursor-pointer"
                        >
                          <Plus className="size-3" />
                        </button>
                        <button
                          onClick={() => removeFromCart(product.id)}
                          className="w-7 h-7 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors cursor-pointer ml-1"
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="border-t border-border/50 p-6 space-y-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-muted-foreground">Tổng cộng</span>
                  <span className="text-xl font-bold text-primary">{formatCurrency(cartTotal)}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={checkingOut}
                  className="btn-pill w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 py-3 text-base font-semibold cursor-pointer"
                >
                  {checkingOut ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="size-5" />
                      Đặt hàng ({cartCount} sản phẩm)
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
