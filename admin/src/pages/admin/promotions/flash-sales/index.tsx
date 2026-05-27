import { useEffect, useMemo, useState } from 'react'
import {
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Eye,
  PackageCheck,
  Percent,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/services/authApi'
import { listBrands } from '@/services/brandApi'
import { listCategories } from '@/services/categoryApi'
import { listProducts, searchProducts } from '@/services/productApi'
import {
  createBulkFlashSale,
  deleteFlashSaleCampaign,
  listAdminFlashSales,
  updateFlashSaleCampaignStatus,
  type AdminFlashSaleItem,
  type FlashSaleStatus,
} from '@/services/promotionApi'
import { Layout } from '@/components/custom/layout'
import { Button } from '@/components/custom/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { CategoryItem } from '@/types/catalog'

type ProductOption = {
  id: string
  name: string
  slug?: string
  sku: string
  category: string
  brand?: string
  thumbnail?: string
  originalPrice: number
  inventory: number
}

type CategoryOption = Pick<CategoryItem, 'id' | 'name' | 'parentId'>

type SelectedFlashSaleProduct = ProductOption & {
  discountPercent: number
  totalStock: number
}

type CampaignEditableStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'CANCELLED'

type FlashSaleCampaign = {
  id: string
  name: string
  codePrefix: string
  status: FlashSaleStatus
  productCount: number
  defaultDiscountPercent: number
  startTime: string
  endTime: string
  soldCount: number
  totalStock: number
  items: AdminFlashSaleItem[]
}

const PRODUCT_PLACEHOLDER =
  'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=160&q=80'
const PRODUCT_PICKER_PAGE_SIZE = 12

const statusLabel: Record<FlashSaleStatus, string> = {
  ACTIVE: 'Đang chạy',
  DRAFT: 'Bản nháp',
  PAUSED: 'Tạm dừng',
  ENDED: 'Đã kết thúc',
  CANCELLED: 'Đã hủy',
}

const editableStatusOptions: CampaignEditableStatus[] = ['DRAFT', 'ACTIVE', 'PAUSED', 'CANCELLED']

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function clampNumber(value: number, min: number, max: number) {
  if (Number.isNaN(value)) return min
  return Math.min(Math.max(value, min), max)
}

function getSalePrice(originalPrice: number, discountPercent: number) {
  return Math.round((originalPrice * (100 - discountPercent)) / 100)
}

function normalizeFilterName(value?: string | null) {
  return (value ?? '').trim().toLocaleLowerCase('vi')
}

function toIsoDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }
  return date.toISOString()
}

function getStatusClass(status: FlashSaleStatus) {
  if (status === 'ACTIVE') return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
  if (status === 'DRAFT') return 'bg-sky-500/10 text-sky-700 dark:text-sky-300'
  if (status === 'PAUSED') return 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
  if (status === 'CANCELLED') return 'bg-destructive/10 text-destructive'
  return 'bg-muted text-muted-foreground'
}

function groupFlashSales(items: AdminFlashSaleItem[]): FlashSaleCampaign[] {
  const groups = new Map<string, AdminFlashSaleItem[]>()

  items.forEach((item) => {
    const key = [item.codePrefix, item.name, item.startTime, item.endTime, item.status].join('|')
    groups.set(key, [...(groups.get(key) ?? []), item])
  })

  return Array.from(groups.entries()).map(([id, rows]) => {
    const first = rows[0]
    const totalStock = rows.reduce((sum, row) => sum + row.totalStock, 0)
    const soldCount = rows.reduce((sum, row) => sum + row.soldCount, 0)
    const averageDiscount =
      rows.reduce((sum, row) => sum + row.discountPercent, 0) / Math.max(rows.length, 1)

    return {
      id,
      name: first.name,
      codePrefix: first.codePrefix,
      status: first.status,
      productCount: rows.length,
      defaultDiscountPercent: Math.round(averageDiscount),
      startTime: first.startTime,
      endTime: first.endTime,
      soldCount,
      totalStock,
      items: rows,
    }
  })
}

export default function FlashSaleAdminPage() {
  const [query, setQuery] = useState('')
  const [productType, setProductType] = useState('all')
  const [brand, setBrand] = useState('all')
  const [category, setCategory] = useState('all')
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([])
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [products, setProducts] = useState<ProductOption[]>([])
  const [productPage, setProductPage] = useState(0)
  const [productTotalPages, setProductTotalPages] = useState(0)
  const [productTotalElements, setProductTotalElements] = useState(0)
  const [flashSales, setFlashSales] = useState<AdminFlashSaleItem[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [loadingFlashSales, setLoadingFlashSales] = useState(false)
  const [saving, setSaving] = useState(false)
  const [updatingCampaignId, setUpdatingCampaignId] = useState<string | null>(null)
  const [deletingCampaignId, setDeletingCampaignId] = useState<string | null>(null)
  const [campaignToDelete, setCampaignToDelete] = useState<FlashSaleCampaign | null>(null)
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null)

  const [name, setName] = useState('Flash Sale mới')
  const [codePrefix, setCodePrefix] = useState('FLASH-MAY')
  const [defaultDiscountPercent, setDefaultDiscountPercent] = useState(20)
  const [defaultStock, setDefaultStock] = useState(10)
  const [startTime, setStartTime] = useState('2026-05-28T09:00')
  const [endTime, setEndTime] = useState('2026-05-28T12:00')
  const [status, setStatus] = useState<'DRAFT' | 'ACTIVE'>('DRAFT')
  const [selectedProducts, setSelectedProducts] = useState<SelectedFlashSaleProduct[]>([])
  const [payloadOpen, setPayloadOpen] = useState(false)

  const campaigns = useMemo(() => groupFlashSales(flashSales), [flashSales])
  const selectedCampaign = campaigns.find((campaign) => campaign.id === selectedCampaignId) ?? campaigns[0]
  const brandNameSet = useMemo(
    () => new Set(brands.map((item) => normalizeFilterName(item.name))),
    [brands]
  )
  const categoryIdSet = useMemo(() => new Set(categories.map((item) => item.id)), [categories])
  const productTypeOptions = useMemo(() => {
    const cleanCategories = categories.filter((item) => !brandNameSet.has(normalizeFilterName(item.name)))
    const rootCategories = cleanCategories.filter((item) => !item.parentId || !categoryIdSet.has(item.parentId))
    return (rootCategories.length > 0 ? rootCategories : cleanCategories).sort((a, b) =>
      a.name.localeCompare(b.name, 'vi')
    )
  }, [brandNameSet, categories, categoryIdSet])
  const categoryOptions = useMemo(() => {
    const cleanCategories = categories.filter((item) => !brandNameSet.has(normalizeFilterName(item.name)))

    if (productType === 'all') {
      const childCategories = cleanCategories.filter((item) => item.parentId && categoryIdSet.has(item.parentId))
      return (childCategories.length > 0 ? childCategories : cleanCategories).sort((a, b) =>
        a.name.localeCompare(b.name, 'vi')
      )
    }

    return cleanCategories
      .filter((item) => item.parentId === productType)
      .sort((a, b) => a.name.localeCompare(b.name, 'vi'))
  }, [brandNameSet, categories, categoryIdSet, productType])

  const productPageNumbers = useMemo(() => {
    if (productTotalPages <= 0) return []
    if (productTotalPages <= 1) return [0]

    const pages = new Set<number>([0, productTotalPages - 1])
    for (let offset = -1; offset <= 1; offset += 1) {
      const page = productPage + offset
      if (page >= 0 && page < productTotalPages) {
        pages.add(page)
      }
    }

    if (productPage <= 2) {
      pages.add(1)
      pages.add(2)
    }
    if (productPage >= productTotalPages - 3) {
      pages.add(productTotalPages - 2)
      pages.add(productTotalPages - 3)
    }

    const sorted = Array.from(pages)
      .filter((page) => page >= 0 && page < productTotalPages)
      .sort((a, b) => a - b)

    return sorted.reduce<(number | 'ellipsis')[]>((items, page, index) => {
      const previous = sorted[index - 1]
      if (previous != null && page - previous > 1) {
        items.push('ellipsis')
      }
      items.push(page)
      return items
    }, [])
  }, [productPage, productTotalPages])

  const parsePrice = (value: string) => {
    if (!value.trim()) return undefined
    const parsed = Number(value)
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined
  }

  const fetchCategories = async () => {
    try {
      const result = await listCategories({ active: true, size: 300 })
      const uniqueByNameAndParent = new Map<string, CategoryOption>()

      result
        .filter((item) => item.active !== false)
        .forEach((item) => {
          const normalizedName = normalizeFilterName(item.name)
          const parentId = item.parentId ?? null
          const key = `${parentId ?? 'root'}:${normalizedName}`
          if (!uniqueByNameAndParent.has(key)) {
            uniqueByNameAndParent.set(key, { id: item.id, name: item.name, parentId })
          }
        })

      setCategories(Array.from(uniqueByNameAndParent.values()).sort((a, b) => a.name.localeCompare(b.name, 'vi')))
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không tải được danh mục sản phẩm'))
    }
  }

  const fetchBrands = async () => {
    try {
      const result = await listBrands({ active: true, size: 300 })
      const uniqueByName = new Map<string, { id: string; name: string }>()

      result
        .filter((item) => item.active !== false)
        .forEach((item) => {
          const normalizedName = normalizeFilterName(item.name)
          if (!uniqueByName.has(normalizedName)) {
            uniqueByName.set(normalizedName, { id: item.id, name: item.name })
          }
        })

      setBrands(Array.from(uniqueByName.values()).sort((a, b) => a.name.localeCompare(b.name, 'vi')))
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không tải được danh sách hãng'))
    }
  }

  const fetchProducts = async (pageIndex = productPage) => {
    try {
      setLoadingProducts(true)
      const keyword = query.trim()
      const categoryId = category === 'all' ? (productType === 'all' ? undefined : productType) : category
      const productQuery = {
        categoryId,
        brandId: brand === 'all' ? undefined : brand,
        minPrice: parsePrice(minPrice),
        maxPrice: parsePrice(maxPrice),
        page: pageIndex,
        size: PRODUCT_PICKER_PAGE_SIZE,
        sort: 'updatedAt,desc',
      }
      const page = keyword
        ? await searchProducts({ ...productQuery, keyword })
        : await listProducts({ ...productQuery, active: true })
      setProductPage(page.page ?? pageIndex)
      setProductTotalPages(page.totalPages ?? 0)
      setProductTotalElements(page.totalElements ?? 0)
      setProducts(
        page.content
          .filter((product) => product.price > 0)
          .map((product) => ({
            id: product.id,
            name: product.name,
            slug: product.slug,
            sku: product.sku ?? '-',
            category: product.primaryCategoryName ?? product.brandName ?? 'Khác',
            brand: product.brandName,
            thumbnail: product.thumbnail,
            originalPrice: product.price,
            inventory: product.stockQuantity ?? 999,
          }))
      )
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không tải được danh sách sản phẩm'))
    } finally {
      setLoadingProducts(false)
    }
  }

  const fetchFlashSales = async () => {
    try {
      setLoadingFlashSales(true)
      const result = await listAdminFlashSales()
      setFlashSales(result.items)
      setSelectedCampaignId((current) => current ?? null)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không tải được danh sách flash sale'))
    } finally {
      setLoadingFlashSales(false)
    }
  }

  useEffect(() => {
    fetchBrands()
    fetchCategories()
    fetchFlashSales()
  }, [])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      fetchProducts(productPage)
    }, 300)

    return () => window.clearTimeout(timeout)
  }, [brand, category, maxPrice, minPrice, productPage, productType, query])

  const selectedProductIds = new Set(selectedProducts.map((product) => product.id))

  const selectedSummary = useMemo(() => {
    return selectedProducts.reduce(
      (summary, product) => {
        const salePrice = getSalePrice(product.originalPrice, product.discountPercent)
        summary.originalValue += product.originalPrice * product.totalStock
        summary.saleValue += salePrice * product.totalStock
        summary.totalStock += product.totalStock
        return summary
      },
      { originalValue: 0, saleValue: 0, totalStock: 0 }
    )
  }, [selectedProducts])

  const payloadPreview = useMemo(() => {
    return {
      name,
      codePrefix,
      defaultDiscountPercent,
      startTime: toIsoDateTime(startTime),
      endTime: toIsoDateTime(endTime),
      status,
      products: selectedProducts.map((product) => ({
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        productThumbnail: product.thumbnail,
        originalPrice: product.originalPrice,
        discountPercent: product.discountPercent,
        salePrice: getSalePrice(product.originalPrice, product.discountPercent),
        totalStock: product.totalStock,
      })),
    }
  }, [codePrefix, defaultDiscountPercent, endTime, name, selectedProducts, startTime, status])

  const addProduct = (product: ProductOption) => {
    if (selectedProductIds.has(product.id)) return

    setSelectedProducts((current) => [
      ...current,
      {
        ...product,
        discountPercent: defaultDiscountPercent,
        totalStock: Math.min(defaultStock, Math.max(product.inventory, 1)),
      },
    ])
  }

  const toggleProduct = (product: ProductOption) => {
    if (selectedProductIds.has(product.id)) {
      setSelectedProducts((current) => current.filter((item) => item.id !== product.id))
      return
    }

    addProduct(product)
  }

  const applyDefaultToSelected = () => {
    setSelectedProducts((current) =>
      current.map((product) => ({
        ...product,
        discountPercent: defaultDiscountPercent,
        totalStock: Math.min(defaultStock, Math.max(product.inventory, 1)),
      }))
    )
  }

  const updateSelectedProduct = (
    productId: string,
    updates: Partial<Pick<SelectedFlashSaleProduct, 'discountPercent' | 'totalStock'>>
  ) => {
    setSelectedProducts((current) =>
      current.map((product) =>
        product.id === productId
          ? {
              ...product,
              discountPercent:
                updates.discountPercent == null
                  ? product.discountPercent
                  : clampNumber(updates.discountPercent, 1, 90),
              totalStock:
                updates.totalStock == null
                  ? product.totalStock
                  : clampNumber(updates.totalStock, 1, Math.max(product.inventory, 1)),
            }
          : product
      )
    )
  }

  const resetBuilder = () => {
    setSelectedProducts([])
    setDefaultDiscountPercent(20)
    setDefaultStock(10)
    setName('Flash Sale mới')
    setCodePrefix('FLASH-MAY')
    setStatus('DRAFT')
  }

  const handleCreate = async () => {
    if (!selectedProducts.length) {
      toast.error('Chọn ít nhất một sản phẩm để tạo flash sale')
      return
    }
    if (!payloadPreview.startTime || !payloadPreview.endTime) {
      toast.error('Thời gian bắt đầu/kết thúc không hợp lệ')
      return
    }

    try {
      setSaving(true)
      await createBulkFlashSale(payloadPreview)
      toast.success('Đã tạo flash sale')
      resetBuilder()
      await fetchFlashSales()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Tạo flash sale thất bại'))
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateCampaignStatus = async (campaign: FlashSaleCampaign, nextStatus: CampaignEditableStatus) => {
    if (campaign.status === nextStatus) return

    try {
      setUpdatingCampaignId(campaign.id)
      const result = await updateFlashSaleCampaignStatus({
        codePrefix: campaign.codePrefix,
        name: campaign.name,
        startTime: campaign.startTime,
        endTime: campaign.endTime,
        currentStatus: campaign.status,
        status: nextStatus,
      })
      toast.success(
        result.updated > 0
          ? `Đã chuyển trạng thái sang ${statusLabel[nextStatus]}`
          : 'Không có flash sale nào được cập nhật'
      )
      if (selectedCampaignId === campaign.id) {
        setSelectedCampaignId(null)
      }
      await fetchFlashSales()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Cập nhật trạng thái flash sale thất bại'))
    } finally {
      setUpdatingCampaignId(null)
    }
  }

  const handleDeleteCampaign = async () => {
    if (!campaignToDelete) return

    try {
      setDeletingCampaignId(campaignToDelete.id)
      const result = await deleteFlashSaleCampaign({
        codePrefix: campaignToDelete.codePrefix,
        name: campaignToDelete.name,
        startTime: campaignToDelete.startTime,
        endTime: campaignToDelete.endTime,
        status: campaignToDelete.status,
      })
      toast.success(result.deleted > 0 ? `Đã xóa ${result.deleted} sản phẩm khỏi flash sale` : 'Không có flash sale để xóa')
      if (selectedCampaignId === campaignToDelete.id) {
        setSelectedCampaignId(null)
      }
      setCampaignToDelete(null)
      await fetchFlashSales()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Xóa flash sale thất bại'))
    } finally {
      setDeletingCampaignId(null)
    }
  }

  const readonlyRows = selectedProducts.length > 0 ? [] : selectedCampaign?.items ?? []

  return (
    <Layout fixed>
      <Layout.Body className='flex min-h-0 flex-col gap-6 overflow-y-auto md:overflow-y-auto'>
        <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
          <div>
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <Percent className='h-4 w-4' />
              Promotions
            </div>
            <h1 className='mt-1 text-2xl font-semibold'>Flash Sales</h1>
            <p className='mt-1 text-sm text-muted-foreground'>
              Tạo nhanh một đợt sale nhiều sản phẩm, có thể chỉnh phần trăm và số lượng riêng từng món.
            </p>
          </div>
          <div className='flex flex-wrap items-center gap-2'>
            <Button
              variant='outline'
              onClick={() => {
                fetchProducts(productPage)
                fetchFlashSales()
              }}
              leftSection={<RefreshCw className='h-4 w-4' />}
            >
              Tải lại
            </Button>
            <Button variant='outline' onClick={resetBuilder} leftSection={<RotateCcw className='h-4 w-4' />}>
              Làm mới form
            </Button>
            <Button variant='outline' onClick={() => setPayloadOpen(true)} leftSection={<Eye className='h-4 w-4' />}>
              Xem payload
            </Button>
            <Button onClick={handleCreate} loading={saving} leftSection={<Plus className='h-4 w-4' />}>
              Tạo flash sale
            </Button>
          </div>
        </div>

        <section className='min-w-0 rounded-lg border bg-card'>
          <div className='flex flex-col gap-1 border-b p-4'>
            <h2 className='font-medium'>Danh sách đợt Flash Sale</h2>
            <p className='text-sm text-muted-foreground'>
              Click vào một đợt sale để xem các sản phẩm bên trong.
            </p>
          </div>

          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Đợt sale</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead className='text-right'>Sản phẩm</TableHead>
                  <TableHead className='min-w-[180px]'>Đã bán</TableHead>
                  <TableHead className='text-right'>Giảm TB</TableHead>
                  <TableHead className='w-12' />
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingFlashSales ? (
                  <TableRow>
                    <TableCell colSpan={7} className='h-24 text-center text-muted-foreground'>
                      Đang tải flash sale...
                    </TableCell>
                  </TableRow>
                ) : campaigns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className='h-24 text-center text-muted-foreground'>
                      Chưa có flash sale nào.
                    </TableCell>
                  </TableRow>
                ) : (
                  campaigns.map((sale) => {
                    const soldPercent = sale.totalStock > 0 ? Math.round((sale.soldCount / sale.totalStock) * 100) : 0
                    const active = (selectedCampaignId ?? campaigns[0]?.id) === sale.id && selectedProducts.length === 0

                    return (
                      <TableRow
                        key={sale.id}
                        className={active ? 'bg-muted/60' : 'cursor-pointer'}
                        onClick={() => {
                          setSelectedCampaignId(sale.id)
                          setSelectedProducts([])
                        }}
                      >
                        <TableCell>
                          <div>
                            <p className='font-medium'>{sale.name}</p>
                            <p className='text-xs text-muted-foreground'>{sale.codePrefix}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {sale.status === 'ENDED' ? (
                            <Badge variant='outline' className={getStatusClass(sale.status)}>
                              {statusLabel[sale.status]}
                            </Badge>
                          ) : (
                            <div onClick={(event) => event.stopPropagation()}>
                              <Select
                                value={sale.status}
                                disabled={updatingCampaignId === sale.id}
                                onValueChange={(value) =>
                                  void handleUpdateCampaignStatus(sale, value as CampaignEditableStatus)
                                }
                              >
                                <SelectTrigger className='h-8 w-[150px]'>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {editableStatusOptions.map((item) => (
                                    <SelectItem key={item} value={item}>
                                      {statusLabel[item]}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className='flex min-w-[250px] items-center gap-2 text-sm'>
                            <CalendarClock className='h-4 w-4 text-muted-foreground' />
                            <span>
                              {formatDateTime(sale.startTime)} - {formatDateTime(sale.endTime)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className='text-right'>{sale.productCount}</TableCell>
                        <TableCell>
                          <div className='space-y-1'>
                            <div className='flex justify-between text-xs text-muted-foreground'>
                              <span>
                                {sale.soldCount}/{sale.totalStock}
                              </span>
                              <span>{soldPercent}%</span>
                            </div>
                            <Progress value={soldPercent} />
                          </div>
                        </TableCell>
                        <TableCell className='text-right'>{sale.defaultDiscountPercent}%</TableCell>
                        <TableCell>
                          <Button
                            size='icon'
                            variant='ghost'
                            loading={deletingCampaignId === sale.id}
                            disabled={deletingCampaignId === sale.id}
                            title='Xóa đợt flash sale'
                            onClick={(event) => {
                              event.stopPropagation()
                              setCampaignToDelete(sale)
                            }}
                          >
                            <Trash2 className='h-4 w-4 text-destructive' />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </section>

        <div className='grid gap-4 md:grid-cols-3'>
          <div className='rounded-lg border bg-card p-4'>
            <div className='flex items-center justify-between gap-3'>
              <div>
                <p className='text-sm text-muted-foreground'>Sản phẩm đang chọn</p>
                <p className='mt-1 text-2xl font-semibold'>{selectedProducts.length}</p>
              </div>
              <PackageCheck className='h-8 w-8 text-primary' />
            </div>
          </div>
          <div className='rounded-lg border bg-card p-4'>
            <p className='text-sm text-muted-foreground'>Tổng số lượng sale</p>
            <p className='mt-1 text-2xl font-semibold'>{selectedSummary.totalStock}</p>
          </div>
          <div className='rounded-lg border bg-card p-4'>
            <p className='text-sm text-muted-foreground'>Giá trị giảm dự kiến</p>
            <p className='mt-1 text-2xl font-semibold'>
              {formatCurrency(selectedSummary.originalValue - selectedSummary.saleValue)}
            </p>
          </div>
        </div>

        <div className='grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]'>
          <section className='rounded-lg border bg-card p-4'>
            <div className='mb-4'>
              <h2 className='font-medium'>Thông tin đợt sale mới</h2>
              <p className='text-sm text-muted-foreground'>Giá trị mặc định sẽ áp cho sản phẩm mới chọn.</p>
            </div>

            <div className='space-y-4'>
              <label className='block space-y-2'>
                <span className='text-sm font-medium'>Tên đợt sale</span>
                <Input value={name} onChange={(event) => setName(event.target.value)} />
              </label>

              <label className='block space-y-2'>
                <span className='text-sm font-medium'>Mã prefix</span>
                <Input value={codePrefix} onChange={(event) => setCodePrefix(event.target.value.toUpperCase())} />
              </label>

              <div className='grid grid-cols-2 gap-3'>
                <label className='block space-y-2'>
                  <span className='text-sm font-medium'>% giảm mặc định</span>
                  <Input
                    min={1}
                    max={90}
                    type='number'
                    value={defaultDiscountPercent}
                    onChange={(event) => setDefaultDiscountPercent(clampNumber(Number(event.target.value), 1, 90))}
                  />
                </label>
                <label className='block space-y-2'>
                  <span className='text-sm font-medium'>Số lượng mặc định</span>
                  <Input
                    min={1}
                    type='number'
                    value={defaultStock}
                    onChange={(event) => setDefaultStock(Math.max(Number(event.target.value), 1))}
                  />
                </label>
              </div>

              <label className='block space-y-2'>
                <span className='text-sm font-medium'>Bắt đầu</span>
                <Input type='datetime-local' value={startTime} onChange={(event) => setStartTime(event.target.value)} />
              </label>

              <label className='block space-y-2'>
                <span className='text-sm font-medium'>Kết thúc</span>
                <Input type='datetime-local' value={endTime} onChange={(event) => setEndTime(event.target.value)} />
              </label>

              <label className='block space-y-2'>
                <span className='text-sm font-medium'>Trạng thái khi lưu</span>
                <Select value={status} onValueChange={(value) => setStatus(value as 'DRAFT' | 'ACTIVE')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='DRAFT'>Bản nháp</SelectItem>
                    <SelectItem value='ACTIVE'>Kích hoạt ngay</SelectItem>
                  </SelectContent>
                </Select>
              </label>

              <Button
                className='w-full'
                variant='secondary'
                onClick={applyDefaultToSelected}
                disabled={!selectedProducts.length}
              >
                Áp mặc định cho sản phẩm đã chọn
              </Button>
            </div>
          </section>

          <section className='min-w-0 rounded-lg border bg-card'>
            <div className='flex flex-col gap-3 border-b p-4'>
              <div className='min-w-0'>
                <h2 className='font-medium'>Chọn sản phẩm cho đợt sale mới</h2>
                <p className='text-sm text-muted-foreground'>
                  Lọc và phân trang trực tiếp từ product-service.
                </p>
              </div>
              <div className='grid w-full gap-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-[minmax(220px,1.2fr)_minmax(160px,0.9fr)_minmax(160px,0.9fr)_minmax(190px,1fr)_minmax(120px,0.65fr)_minmax(120px,0.65fr)]'>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                  <Input
                    className='w-full pl-9'
                    placeholder='Tìm tên hoặc SKU'
                    value={query}
                    onChange={(event) => {
                      setQuery(event.target.value)
                      setProductPage(0)
                    }}
                  />
                </div>
                <Select
                  value={productType}
                  onValueChange={(value) => {
                    setProductType(value)
                    setCategory('all')
                    setProductPage(0)
                  }}
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Loại sản phẩm' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>Tất cả loại</SelectItem>
                    {productTypeOptions.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={brand}
                  onValueChange={(value) => {
                    setBrand(value)
                    setProductPage(0)
                  }}
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Hãng' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>Tất cả hãng</SelectItem>
                    {brands.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={category}
                  onValueChange={(value) => {
                    setCategory(value)
                    setProductPage(0)
                  }}
                  disabled={productType !== 'all' && categoryOptions.length === 0}
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Danh mục' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>
                      {productType === 'all' ? 'Tất cả danh mục' : 'Tất cả trong loại'}
                    </SelectItem>
                    {categoryOptions.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  className='w-full'
                  inputMode='numeric'
                  placeholder='Giá từ'
                  value={minPrice}
                  onChange={(event) => {
                    setMinPrice(event.target.value)
                    setProductPage(0)
                  }}
                />
                <Input
                  className='w-full'
                  inputMode='numeric'
                  placeholder='Giá đến'
                  value={maxPrice}
                  onChange={(event) => {
                    setMaxPrice(event.target.value)
                    setProductPage(0)
                  }}
                />
              </div>
            </div>

            <div className='max-h-[520px] overflow-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-10' />
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead>Danh mục</TableHead>
                    <TableHead className='text-right'>Giá gốc</TableHead>
                    <TableHead className='text-right'>Tồn kho</TableHead>
                    <TableHead className='text-right'>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingProducts ? (
                    <TableRow>
                      <TableCell colSpan={6} className='h-24 text-center text-muted-foreground'>
                        Đang tải sản phẩm...
                      </TableCell>
                    </TableRow>
                  ) : products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className='h-24 text-center text-muted-foreground'>
                        Không có sản phẩm phù hợp.
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((product) => {
                      const checked = selectedProductIds.has(product.id)

                      return (
                        <TableRow key={product.id}>
                          <TableCell>
                            <Checkbox checked={checked} onCheckedChange={() => toggleProduct(product)} />
                          </TableCell>
                          <TableCell>
                            <div className='flex min-w-[280px] items-center gap-3'>
                              <img
                                src={product.thumbnail || PRODUCT_PLACEHOLDER}
                                alt={product.name}
                                className='h-11 w-11 rounded-md object-cover'
                              />
                              <div>
                                <p className='font-medium'>{product.name}</p>
                                <p className='text-xs text-muted-foreground'>{product.sku}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className='min-w-[140px]'>
                              <p>{product.category}</p>
                              {product.brand && (
                                <p className='text-xs text-muted-foreground'>{product.brand}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className='text-right'>{formatCurrency(product.originalPrice)}</TableCell>
                          <TableCell className='text-right'>{product.inventory}</TableCell>
                          <TableCell className='text-right'>
                            <Button size='sm' variant={checked ? 'secondary' : 'outline'} onClick={() => toggleProduct(product)}>
                              {checked ? 'Đã chọn' : 'Chọn'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
            <div className='flex flex-col gap-3 border-t p-4 sm:flex-row sm:items-center sm:justify-between'>
              <p className='text-sm text-muted-foreground'>
                Trang {productTotalPages === 0 ? 0 : productPage + 1}/{productTotalPages} - {productTotalElements} sản phẩm
              </p>
              <div className='flex flex-wrap items-center gap-2'>
                <Button
                  size='sm'
                  variant='outline'
                  disabled={loadingProducts || productPage <= 0}
                  onClick={() => setProductPage((current) => Math.max(current - 1, 0))}
                  leftSection={<ChevronLeft className='h-4 w-4' />}
                >
                  Trước
                </Button>
                {productPageNumbers.map((item, index) =>
                  item === 'ellipsis' ? (
                    <span
                      key={`ellipsis-${index}`}
                      className='inline-flex h-8 min-w-8 items-center justify-center text-sm text-muted-foreground'
                    >
                      ...
                    </span>
                  ) : (
                    <Button
                      key={item}
                      size='sm'
                      variant={item === productPage ? 'default' : 'outline'}
                      disabled={loadingProducts}
                      className='min-w-8 px-3'
                      onClick={() => setProductPage(item)}
                    >
                      {item + 1}
                    </Button>
                  )
                )}
                <Button
                  size='sm'
                  variant='outline'
                  disabled={loadingProducts || productPage + 1 >= productTotalPages}
                  onClick={() =>
                    setProductPage((current) =>
                      productTotalPages > 0 ? Math.min(current + 1, productTotalPages - 1) : current
                    )
                  }
                  rightSection={<ChevronRight className='h-4 w-4' />}
                >
                  Sau
                </Button>
              </div>
            </div>
          </section>
        </div>

        <section className='min-w-0 rounded-lg border bg-card'>
          <div className='flex flex-col gap-1 border-b p-4'>
            <h2 className='font-medium'>
              {selectedProducts.length > 0
                ? 'Sản phẩm sắp tạo flash sale'
                : selectedCampaign
                  ? `Sản phẩm trong đợt: ${selectedCampaign.name}`
                  : 'Sản phẩm trong đợt sale'}
            </h2>
            <p className='text-sm text-muted-foreground'>
              Chọn sản phẩm mới để tạo đợt sale, hoặc click một đợt sale trong danh sách để xem chi tiết.
            </p>
          </div>

          <div className='max-h-[460px] overflow-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sản phẩm</TableHead>
                  
                  <TableHead className='text-right'>Giá gốc</TableHead>
                  <TableHead className='w-[120px]'>% giảm</TableHead>
                  <TableHead className='text-right'>Giá sale</TableHead>
                  <TableHead className='w-[140px]'>
                    {selectedProducts.length > 0 ? 'SL flash sale' : 'Tổng SL'}
                  </TableHead>
                  {selectedProducts.length > 0 && <TableHead className='text-right'>Tồn kho</TableHead>}
                  {selectedProducts.length === 0 && <TableHead className='text-right'>Còn lại</TableHead>}
                  <TableHead className='w-12' />
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedProducts.length > 0 ? (
                  selectedProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className='min-w-[280px]'>
                          <p className='font-medium'>{product.name}</p>
                          <p className='text-xs text-muted-foreground'>{product.sku}</p>
                        </div>
                      </TableCell>
                      
                      <TableCell className='text-right'>{formatCurrency(product.originalPrice)}</TableCell>
                      <TableCell>
                        <Input
                          min={1}
                          max={90}
                          type='number'
                          value={product.discountPercent}
                          onChange={(event) =>
                            updateSelectedProduct(product.id, {
                              discountPercent: Number(event.target.value),
                            })
                          }
                        />
                      </TableCell>
                      <TableCell className='text-right font-medium text-emerald-600 dark:text-emerald-300'>
                        {formatCurrency(getSalePrice(product.originalPrice, product.discountPercent))}
                      </TableCell>
                      <TableCell>
                        <Input
                          min={1}
                          max={product.inventory}
                          type='number'
                          value={product.totalStock}
                          onChange={(event) =>
                            updateSelectedProduct(product.id, {
                              totalStock: Number(event.target.value),
                            })
                          }
                        />
                      </TableCell>
                      <TableCell className='text-right'>{product.inventory}</TableCell>
                      <TableCell>
                        <Button
                          size='icon'
                          variant='ghost'
                          onClick={() =>
                            setSelectedProducts((current) => current.filter((item) => item.id !== product.id))
                          }
                          title='Xóa khỏi đợt sale'
                        >
                          <Trash2 className='h-4 w-4 text-destructive' />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : readonlyRows.length > 0 ? (
                  readonlyRows.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className='min-w-[280px]'>
                          <p className='font-medium'>{item.productName ?? item.productId}</p>
                          <p className='text-xs text-muted-foreground'>{item.code}</p>
                        </div>
                      </TableCell>
                      <TableCell className='text-right'>{formatCurrency(item.originalPrice)}</TableCell>
                      <TableCell>{item.discountPercent}%</TableCell>
                      <TableCell className='text-right font-medium text-emerald-600 dark:text-emerald-300'>
                        {formatCurrency(item.salePrice)}
                      </TableCell>
                      <TableCell>{item.totalStock}</TableCell>
                      <TableCell className='text-right'>{item.remainingStock}</TableCell>
                      <TableCell />
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className='h-32 text-center text-muted-foreground'>
                      Chưa có sản phẩm nào.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </section>
      </Layout.Body>

      <Dialog open={payloadOpen} onOpenChange={setPayloadOpen}>
        <DialogContent className='max-w-3xl'>
          <DialogHeader>
            <DialogTitle>Payload preview</DialogTitle>
            <DialogDescription>Dữ liệu sẽ gửi sang API bulk create.</DialogDescription>
          </DialogHeader>
          <pre className='max-h-[520px] overflow-auto rounded-lg bg-muted p-4 text-xs'>
            {JSON.stringify(payloadPreview, null, 2)}
          </pre>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(campaignToDelete)}
        onOpenChange={(open) => {
          if (!open && !deletingCampaignId) setCampaignToDelete(null)
        }}
        title='Xóa đợt flash sale?'
        desc={
          <div className='space-y-2'>
            <p>
              Bạn đang xoá đợt <span className='font-medium text-foreground'>{campaignToDelete?.name}</span>.
            </p>
            <p>
              Thao tác này sẽ xoá toàn bộ {campaignToDelete?.productCount ?? 0} sản phẩm trong đợt sale này.
            </p>
          </div>
        }
        cancelBtnText='Huỷ'
        confirmText='Xóa flash sale'
        destructive
        isLoading={Boolean(deletingCampaignId)}
        handleConfirm={handleDeleteCampaign}
      />
    </Layout>
  )
}
