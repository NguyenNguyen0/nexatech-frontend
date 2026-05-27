import { searchAuditLogs, type AuditLogRecord } from '@/services/auditApi'
import { listBrands } from '@/services/brandApi'
import { listInventory, getLowStockInventory } from '@/services/inventoryApi'
import type { NotificationItem } from '@/services/notificationApi'
import { adminGetAllOrders, adminGetOrderStats, type OrderResponse, type OrderStatsResponse } from '@/services/orderApi'
import {
  adminGetAllPayments,
  type PaymentResponse,
  type PaymentStatsResponse,
} from '@/services/paymentApi'
import { listProducts } from '@/services/productApi'
import { listReviews, type ReviewItem } from '@/services/reviewApi'
import { getShipments, type TrackingInfo } from '@/services/shippingApi'
import type { BrandItem, InventoryItem, ProductMinimal } from '@/types/catalog'

export interface DashboardData {
  range: {
    from: string
    to: string
    previousFrom: string
    previousTo: string
  }
  orders: {
    stats: OrderStatsResponse | null
    previousStats: OrderStatsResponse | null
    recent: OrderResponse[]
    total: number
  }
  payments: {
    stats: PaymentStatsResponse | null
    previousStats: PaymentStatsResponse | null
    recent: PaymentResponse[]
    total: number
  }
  inventory: {
    items: InventoryItem[]
    lowStock: InventoryItem[]
    total: number
  }
  catalog: {
    products: ProductMinimal[]
    productTotal: number
    brands: BrandItem[]
  }
  reviews: {
    items: ReviewItem[]
    total: number
  }
  shipping: {
    shipments: TrackingInfo[]
    total: number
  }
  notifications: {
    failed: NotificationItem[]
    totalFailed: number
  }
  audit: {
    recent: AuditLogRecord[]
  }
  unavailable: string[]
}

export interface DashboardRangeParams {
  from?: string
  to?: string
  forceRefresh?: boolean
}

const DASHBOARD_CACHE_PREFIX = 'nexatech.admin.dashboard'
const DASHBOARD_CACHE_VERSION = 'v2'
const DASHBOARD_CACHE_TTL_MS = 2 * 60 * 1000
const memoryCache = new Map<string, { savedAt: number; data: DashboardData }>()

const todayIsoDate = () => new Date().toISOString().slice(0, 10)

const addDays = (date: Date, days: number) => {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

const isoDate = (date: Date) => date.toISOString().slice(0, 10)

const optional = async <T>(label: string, work: Promise<T>, unavailable: string[], fallback: T): Promise<T> => {
  try {
    return await work
  } catch {
    unavailable.push(label)
    return fallback
  }
}

const daysBetween = (from: Date, to: Date) => Math.max(1, Math.round((to.getTime() - from.getTime()) / 86400000) + 1)

const cacheKey = (from: string, to: string) => `${DASHBOARD_CACHE_PREFIX}.${DASHBOARD_CACHE_VERSION}.${from}.${to}`

const readDashboardCache = (key: string): DashboardData | null => {
  const memoryHit = memoryCache.get(key)
  if (memoryHit && Date.now() - memoryHit.savedAt <= DASHBOARD_CACHE_TTL_MS) {
    return memoryHit.data
  }

  if (typeof window === 'undefined') return null

  try {
    const raw = window.sessionStorage.getItem(key)
    if (!raw) return null

    const parsed = JSON.parse(raw) as { savedAt: number; data: DashboardData }
    if (!parsed?.savedAt || Date.now() - parsed.savedAt > DASHBOARD_CACHE_TTL_MS) {
      window.sessionStorage.removeItem(key)
      return null
    }

    memoryCache.set(key, parsed)
    return parsed.data
  } catch {
    window.sessionStorage.removeItem(key)
    return null
  }
}

const writeDashboardCache = (key: string, data: DashboardData) => {
  const payload = { savedAt: Date.now(), data }
  memoryCache.set(key, payload)

  if (typeof window === 'undefined') return

  try {
    window.sessionStorage.setItem(key, JSON.stringify(payload))
  } catch {
    // Keep the in-memory cache even if sessionStorage is full or unavailable.
  }
}

const emptyPaymentStats = (from: string, to: string): PaymentStatsResponse => ({
  from,
  to,
  totalPayments: 0,
  totalRevenue: 0,
  byStatus: {},
  byMethod: {},
  dailyRevenue: [],
})

const buildPaymentStatsFromPayments = (
  payments: PaymentResponse[],
  from: string,
  to: string,
): PaymentStatsResponse => {
  const start = new Date(`${from}T00:00:00`).getTime()
  const end = new Date(`${to}T23:59:59.999`).getTime()
  const stats = emptyPaymentStats(from, to)
  const byDay = new Map<string, { date: string; count: number; revenue: number }>()

  for (const payment of payments) {
    const createdAt = new Date(payment.createdAt).getTime()
    if (Number.isNaN(createdAt) || createdAt < start || createdAt > end) continue

    stats.totalPayments += 1
    stats.byStatus[payment.status] = (stats.byStatus[payment.status] ?? 0) + 1
    stats.byMethod[payment.method] = (stats.byMethod[payment.method] ?? 0) + 1

    if (payment.status === 'COMPLETED') {
      stats.totalRevenue += Number(payment.amount ?? 0)
      const day = payment.createdAt.slice(0, 10)
      const current = byDay.get(day) ?? { date: day, count: 0, revenue: 0 }
      current.count += 1
      current.revenue += Number(payment.amount ?? 0)
      byDay.set(day, current)
    }
  }

  stats.dailyRevenue = [...byDay.values()].sort((a, b) => a.date.localeCompare(b.date))
  return stats
}

export async function getAdminDashboardData(params: DashboardRangeParams = {}): Promise<DashboardData> {
  const toDate = new Date(params.to ?? todayIsoDate())
  const fromDate = new Date(params.from ?? isoDate(addDays(toDate, -29)))
  const periodDays = daysBetween(fromDate, toDate)
  const previousToDate = addDays(fromDate, -1)
  const previousFromDate = addDays(previousToDate, -(periodDays - 1))

  const from = isoDate(fromDate)
  const to = isoDate(toDate)
  const previousFrom = isoDate(previousFromDate)
  const previousTo = isoDate(previousToDate)
  const unavailable: string[] = []
  const key = cacheKey(from, to)

  if (!params.forceRefresh) {
    const cached = readDashboardCache(key)
    if (cached) return cached
  }

  const [
    orderStats,
    previousOrderStats,
    recentOrders,
    recentPayments,
    inventoryPage,
    lowStock,
    productsPage,
    brands,
    reviewsPage,
    shipmentsPage,
    auditPage,
  ] = await Promise.all([
    optional('Order statistics', adminGetOrderStats(from, to), unavailable, null),
    optional('Previous order statistics', adminGetOrderStats(previousFrom, previousTo), unavailable, null),
    optional('Recent orders', adminGetAllOrders({ page: 0, size: 10, sort: 'createdAt,desc' }), unavailable, null),
    optional('Recent payments', adminGetAllPayments({ page: 0, size: 500, sort: 'createdAt,desc' }), unavailable, null),
    optional('Inventory', listInventory({ page: 0, size: 100, sort: 'quantity,asc' }), unavailable, null),
    optional('Low-stock inventory', getLowStockInventory(), unavailable, []),
    optional('Products', listProducts({ page: 0, size: 100, sort: 'createdAt,desc' }), unavailable, null),
    optional('Brands', listBrands({ active: true, size: 100 }), unavailable, []),
    optional('Customer reviews', listReviews({ page: 0, size: 20, sort: 'createdAt,desc' }), unavailable, null),
    optional('Shipments', getShipments({ page: 0, size: 20, sort: 'createdAt,desc' }), unavailable, null),
    optional('Audit logs', searchAuditLogs(1, 10, { sortBy: 'timestamp', sortDir: 'desc' }), unavailable, null),
  ])

  const recentPaymentRows = recentPayments?.content ?? []
  const resolvedPaymentStats = buildPaymentStatsFromPayments(recentPaymentRows, from, to)
  const resolvedPreviousPaymentStats = buildPaymentStatsFromPayments(recentPaymentRows, previousFrom, previousTo)
  const resolvedLowStock = lowStock.length > 0
    ? lowStock
    : (inventoryPage?.content ?? []).filter((item) => item.status !== 'IN_STOCK')

  const data: DashboardData = {
    range: { from, to, previousFrom, previousTo },
    orders: {
      stats: orderStats,
      previousStats: previousOrderStats,
      recent: recentOrders?.content ?? [],
      total: recentOrders?.totalElements ?? 0,
    },
    payments: {
      stats: resolvedPaymentStats,
      previousStats: resolvedPreviousPaymentStats,
      recent: recentPaymentRows,
      total: recentPayments?.totalElements ?? 0,
    },
    inventory: {
      items: inventoryPage?.content ?? [],
      lowStock: resolvedLowStock,
      total: inventoryPage?.totalElements ?? 0,
    },
    catalog: {
      products: productsPage?.content ?? [],
      productTotal: productsPage?.totalElements ?? 0,
      brands,
    },
    reviews: {
      items: reviewsPage?.content ?? [],
      total: reviewsPage?.totalElements ?? 0,
    },
    shipping: {
      shipments: shipmentsPage?.content ?? [],
      total: shipmentsPage?.totalElements ?? 0,
    },
    notifications: {
      failed: [],
      totalFailed: 0,
    },
    audit: {
      recent: auditPage?.content ?? [],
    },
    unavailable: [...new Set(unavailable)],
  }

  writeDashboardCache(key, data)
  return data
}
