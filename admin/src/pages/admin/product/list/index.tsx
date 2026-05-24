import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Plus,
  RotateCcw,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/services/authApi'
import { listBrands } from '@/services/brandApi'
import { listCategories } from '@/services/categoryApi'
import { listProducts, restoreProduct, softDeleteProduct } from '@/services/productApi'
import type { BrandItem, CategoryItem, ProductItem, ProductPageResponse } from '@/types/catalog'
import { Button } from '@/components/custom/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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

type ProductStatusFilter = 'active' | 'deleted' | 'all'
type ProductSortField = 'price' | 'name' | 'createdAt' | 'updatedAt' | 'sku'
type ProductSortDirection = 'asc' | 'desc'

const DEFAULT_PAGE = 0
const DEFAULT_SIZE = 20
const DEFAULT_SORT_FIELD: ProductSortField = 'updatedAt'
const DEFAULT_SORT_DIRECTION: ProductSortDirection = 'desc'

function parseNumber(input: string | null, fallback: number): number {
  const value = Number(input)
  if (Number.isNaN(value) || value < 0) {
    return fallback
  }
  return value
}

function parseOptionalNumber(input: string | null): number | undefined {
  if (!input) return undefined
  const value = Number(input)
  if (Number.isNaN(value) || value < 0) return undefined
  return value
}

function formatCurrency(value?: number): string {
  if (value == null) return '-'
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDateTime(value?: string): string {
  if (!value) return '-'
  return new Date(value).toLocaleString('vi-VN')
}

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [productsPage, setProductsPage] = useState<ProductPageResponse | null>(null)
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [brands, setBrands] = useState<BrandItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null)

  const keyword = searchParams.get('keyword') ?? ''
  const sku = searchParams.get('sku') ?? ''
  const minPrice = searchParams.get('minPrice') ?? ''
  const maxPrice = searchParams.get('maxPrice') ?? ''

  const [keywordInput, setKeywordInput] = useState(keyword)
  const [skuInput, setSkuInput] = useState(sku)
  const [minPriceInput, setMinPriceInput] = useState(minPrice)
  const [maxPriceInput, setMaxPriceInput] = useState(maxPrice)

  const page = parseNumber(searchParams.get('page'), DEFAULT_PAGE)
  const size = parseNumber(searchParams.get('size'), DEFAULT_SIZE)
  const rawStatus = searchParams.get('status')
  const statusFilter: ProductStatusFilter =
    rawStatus === 'deleted' || rawStatus === 'all' || rawStatus === 'active'
      ? rawStatus
      : 'active'
  const categoryId = searchParams.get('categoryId') ?? ''
  const brandId = searchParams.get('brandId') ?? ''

  const rawSortField = searchParams.get('sortField')
  const sortField: ProductSortField =
    rawSortField === 'price' ||
    rawSortField === 'name' ||
    rawSortField === 'createdAt' ||
    rawSortField === 'updatedAt' ||
    rawSortField === 'sku'
      ? rawSortField
      : DEFAULT_SORT_FIELD

  const rawSortDirection = searchParams.get('sortDirection')
  const sortDirection: ProductSortDirection =
    rawSortDirection === 'asc' || rawSortDirection === 'desc'
      ? rawSortDirection
      : DEFAULT_SORT_DIRECTION

  const totalPages = productsPage?.totalPages ?? 0
  const products = productsPage?.content ?? []

  const setParams = (updates: Record<string, string | number | undefined | null>) => {
    const next = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        next.delete(key)
      } else {
        next.set(key, String(value))
      }
    })
    setSearchParams(next)
  }

  useEffect(() => {
    setKeywordInput(keyword)
  }, [keyword])

  useEffect(() => {
    setSkuInput(sku)
  }, [sku])

  useEffect(() => {
    setMinPriceInput(minPrice)
  }, [minPrice])

  useEffect(() => {
    setMaxPriceInput(maxPrice)
  }, [maxPrice])

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (keywordInput === keyword) {
        return
      }
      setParams({ keyword: keywordInput, page: DEFAULT_PAGE })
    }, 350)

    return () => clearTimeout(timeout)
  }, [keywordInput, keyword])

  const productQuery = useMemo(() => {
    const query: {
      keyword?: string
      sku?: string
      minPrice?: number
      maxPrice?: number
      categoryId?: string
      brandId?: string
      page: number
      size: number
      sort: string
      active?: boolean
      includeDeleted?: boolean
    } = {
      keyword: keyword || undefined,
      sku: sku || undefined,
      minPrice: parseOptionalNumber(minPrice),
      maxPrice: parseOptionalNumber(maxPrice),
      categoryId: categoryId || undefined,
      brandId: brandId || undefined,
      page,
      size,
      sort: `${sortField},${sortDirection}`,
    }

    if (statusFilter === 'active') {
      query.active = true
    } else if (statusFilter === 'deleted') {
      query.active = false
    } else {
      query.includeDeleted = true
    }

    return query
  }, [keyword, sku, minPrice, maxPrice, categoryId, brandId, page, size, sortField, sortDirection, statusFilter])

  useEffect(() => {
    if (!productsPage) return

    if (productsPage.totalPages > 0 && page > productsPage.totalPages - 1) {
      setParams({ page: Math.max(productsPage.totalPages - 1, 0) })
    }
  }, [productsPage, page])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const result = await listProducts(productQuery)
      setProductsPage(result)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Load products failed'))
      setProductsPage(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [productQuery])

  useEffect(() => {
    let mounted = true

    ;(async () => {
      try {
        const [categoriesResult, brandsResult] = await Promise.all([
          listCategories({ includeDeleted: true }),
          listBrands({ includeDeleted: true }),
        ])

        if (!mounted) return
        setCategories(categoriesResult)
        setBrands(brandsResult)
      } catch (error) {
        if (!mounted) return
        toast.error(getApiErrorMessage(error, 'Load categories/brands failed'))
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  const handleToggleSort = (field: ProductSortField) => {
    if (sortField === field) {
      setParams({
        sortDirection: sortDirection === 'asc' ? 'desc' : 'asc',
        page: DEFAULT_PAGE,
      })
      return
    }

    setParams({
      sortField: field,
      sortDirection: 'asc',
      page: DEFAULT_PAGE,
    })
  }

  const handleSoftDelete = async (productId: string) => {
    if (!window.confirm('Delete this product? This action performs soft delete.')) {
      return
    }

    try {
      setActionLoadingId(productId)
      await softDeleteProduct(productId)
      toast.success('Product deleted')
      await fetchProducts()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Delete product failed'))
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleRestore = async (productId: string) => {
    try {
      setActionLoadingId(productId)
      await restoreProduct(productId)
      toast.success('Product restored')
      await fetchProducts()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Restore product failed'))
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleApplyAdvancedFilters = () => {
    setParams({
      sku: skuInput,
      minPrice: minPriceInput,
      maxPrice: maxPriceInput,
      page: DEFAULT_PAGE,
    })
  }

  const handleResetFilters = () => {
    setKeywordInput('')
    setSkuInput('')
    setMinPriceInput('')
    setMaxPriceInput('')
    setParams({
      keyword: '',
      sku: '',
      minPrice: '',
      maxPrice: '',
      categoryId: '',
      brandId: '',
      status: 'active',
      sortField: DEFAULT_SORT_FIELD,
      sortDirection: DEFAULT_SORT_DIRECTION,
      page: DEFAULT_PAGE,
    })
  }

  const emptyStateMessage = loading
    ? 'Loading products...'
    : 'No products match your filters.'

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Products</h2>
          <p className='text-muted-foreground'>
            Manage product catalog with server-side filters and sorting.
          </p>
        </div>
        <Button asChild>
          <Link to='/admin/product/add-product'>
            <Plus className='mr-2 h-4 w-4' />
            Add Product
          </Link>
        </Button>
      </div>

      <div className='grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-8'>
        <Input
          value={keywordInput}
          onChange={(event) => setKeywordInput(event.target.value)}
          placeholder='Search by name, sku, description...'
          className='lg:col-span-2'
        />

        <Input
          value={skuInput}
          onChange={(event) => setSkuInput(event.target.value)}
          placeholder='SKU exact/partial'
        />

        <Input
          value={minPriceInput}
          onChange={(event) => setMinPriceInput(event.target.value)}
          placeholder='Min price'
          type='number'
          min={0}
        />

        <Input
          value={maxPriceInput}
          onChange={(event) => setMaxPriceInput(event.target.value)}
          placeholder='Max price'
          type='number'
          min={0}
        />

        <Select
          value={statusFilter}
          onValueChange={(value: ProductStatusFilter) =>
            setParams({ status: value, page: DEFAULT_PAGE })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder='Status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='active'>Active</SelectItem>
            <SelectItem value='deleted'>Deleted</SelectItem>
            <SelectItem value='all'>All</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={categoryId || 'all'}
          onValueChange={(value) =>
            setParams({ categoryId: value === 'all' ? '' : value, page: DEFAULT_PAGE })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder='Category' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={brandId || 'all'}
          onValueChange={(value) =>
            setParams({ brandId: value === 'all' ? '' : value, page: DEFAULT_PAGE })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder='Brand' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All brands</SelectItem>
            {brands.map((brand) => (
              <SelectItem key={brand.id} value={brand.id}>
                {brand.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={String(size)}
          onValueChange={(value) => setParams({ size: value, page: DEFAULT_PAGE })}
        >
          <SelectTrigger>
            <SelectValue placeholder='Rows' />
          </SelectTrigger>
          <SelectContent>
            {[10, 20, 30, 50].map((option) => (
              <SelectItem key={option} value={String(option)}>
                {option} rows
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={sortField}
          onValueChange={(value: ProductSortField) =>
            setParams({ sortField: value, page: DEFAULT_PAGE })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder='Sort field' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='updatedAt'>updatedAt</SelectItem>
            <SelectItem value='createdAt'>createdAt</SelectItem>
            <SelectItem value='name'>name</SelectItem>
            <SelectItem value='price'>price</SelectItem>
            <SelectItem value='sku'>sku</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={sortDirection}
          onValueChange={(value: ProductSortDirection) =>
            setParams({ sortDirection: value, page: DEFAULT_PAGE })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder='Sort direction' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='asc'>asc</SelectItem>
            <SelectItem value='desc'>desc</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className='flex items-center gap-2'>
        <Button variant='outline' onClick={handleApplyAdvancedFilters}>
          Apply Filters
        </Button>
        <Button variant='ghost' onClick={handleResetFilters}>
          Reset
        </Button>
      </div>

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button variant='ghost' className='h-8 px-0' onClick={() => handleToggleSort('name')}>
                  Name
                  <ArrowUpDown className='ml-2 h-4 w-4' />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant='ghost' className='h-8 px-0' onClick={() => handleToggleSort('sku')}>
                  SKU
                  <ArrowUpDown className='ml-2 h-4 w-4' />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant='ghost' className='h-8 px-0' onClick={() => handleToggleSort('price')}>
                  Price
                  <ArrowUpDown className='ml-2 h-4 w-4' />
                </Button>
              </TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Stock Status</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <Button
                  variant='ghost'
                  className='h-8 px-0'
                  onClick={() => handleToggleSort('updatedAt')}
                >
                  Updated
                  <ArrowUpDown className='ml-2 h-4 w-4' />
                </Button>
              </TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className='h-24 text-center text-muted-foreground'>
                  {emptyStateMessage}
                </TableCell>
              </TableRow>
            ) : (
              products.map((product: ProductItem) => (
                <TableRow key={product.id}>
                  <TableCell className='font-medium'>{product.name}</TableCell>
                  <TableCell>{product.sku ?? '-'}</TableCell>
                  <TableCell>{formatCurrency(product.price)}</TableCell>
                  <TableCell>{product.primaryCategoryName ?? '-'}</TableCell>
                  <TableCell>{product.brandName ?? '-'}</TableCell>
                  <TableCell>
                    <Badge variant='outline'>{product.stockStatus ?? '-'}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.active ? 'secondary' : 'destructive'}>
                      {product.active ? 'Active' : 'Deleted'}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDateTime(product.updatedAt)}</TableCell>
                  <TableCell className='text-right'>
                    <div className='flex justify-end gap-2'>
                      <Button variant='ghost' size='sm' onClick={() => setSelectedProduct(product)}>
                        <Eye className='mr-2 h-4 w-4' />
                        View
                      </Button>
                    {product.active ? (
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleSoftDelete(product.id)}
                        disabled={actionLoadingId === product.id}
                      >
                        <Trash2 className='mr-2 h-4 w-4' />
                        Delete
                      </Button>
                    ) : (
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleRestore(product.id)}
                        disabled={actionLoadingId === product.id}
                      >
                        <RotateCcw className='mr-2 h-4 w-4' />
                        Restore
                      </Button>
                    )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className='flex flex-wrap items-center justify-between gap-3'>
        <p className='text-sm text-muted-foreground'>
          Page {productsPage ? productsPage.page + 1 : 1} of {totalPages || 1} - Total{' '}
          {productsPage?.totalElements ?? 0} products
        </p>
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setParams({ page: Math.max(page - 1, 0) })}
            disabled={loading || page <= 0}
          >
            <ChevronLeft className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setParams({ page: page + 1 })}
            disabled={loading || (totalPages > 0 && page >= totalPages - 1)}
          >
            <ChevronRight className='h-4 w-4' />
          </Button>
        </div>
      </div>

      <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedProduct?.name ?? 'Product Detail'}</DialogTitle>
            <DialogDescription>Quick detail view from current list data.</DialogDescription>
          </DialogHeader>

          {selectedProduct && (
            <div className='grid grid-cols-2 gap-3 text-sm'>
              <div>
                <p className='text-muted-foreground'>ID</p>
                <p>{selectedProduct.id}</p>
              </div>
              <div>
                <p className='text-muted-foreground'>SKU</p>
                <p>{selectedProduct.sku ?? '-'}</p>
              </div>
              <div>
                <p className='text-muted-foreground'>Price</p>
                <p>{formatCurrency(selectedProduct.price)}</p>
              </div>
              <div>
                <p className='text-muted-foreground'>Category</p>
                <p>{selectedProduct.primaryCategoryName ?? '-'}</p>
              </div>
              <div>
                <p className='text-muted-foreground'>Brand</p>
                <p>{selectedProduct.brandName ?? '-'}</p>
              </div>
              <div>
                <p className='text-muted-foreground'>Stock Status</p>
                <p>{selectedProduct.stockStatus ?? '-'}</p>
              </div>
              <div>
                <p className='text-muted-foreground'>Active</p>
                <p>{selectedProduct.active ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <p className='text-muted-foreground'>Updated At</p>
                <p>{formatDateTime(selectedProduct.updatedAt)}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}


