import { useEffect, useMemo, useState } from 'react'
import { Plus, Upload } from 'lucide-react'
import { toast } from 'sonner'
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'
import { Button } from '@/components/custom/button'
import { Badge } from '@/components/ui/badge'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { getApiErrorMessage } from '@/services/authApi'
import { listProducts } from '@/services/productApi'
import {
    importInventoryCsv,
    listInventory,
    listInventoryMovements,
    patchInventoryWarehouse,
    updateInventoryStock,
} from '@/services/inventoryApi'
import type {
    InventoryCsvImportResponse,
    InventoryItem,
    InventoryMovementItem,
    InventoryStatus,
    ProductMinimal,
} from '@/types/catalog'

type InventoryFilterStatus = InventoryStatus | 'ALL'

const WAREHOUSE_PAGE_SIZE = 10

function formatDateTime(value?: string): string {
    if (!value) return '-'
    return new Date(value).toLocaleString('vi-VN')
}

function statusBadgeVariant(status: InventoryStatus) {
    if (status === 'OUT_OF_STOCK') return 'destructive'
    if (status === 'LOW_STOCK') return 'outline'
    return 'secondary'
}

export default function WarehouseDashboard() {
    const [items, setItems] = useState<InventoryItem[]>([])
    const [loading, setLoading] = useState<boolean>(true)

    const [keyword, setKeyword] = useState<string>('')
    const [status, setStatus] = useState<InventoryFilterStatus>('ALL')
    const [page, setPage] = useState<number>(0)
    const size = WAREHOUSE_PAGE_SIZE
    const [sort, setSort] = useState<string>('quantity,asc')

    const [totalElements, setTotalElements] = useState<number>(0)
    const [totalPages, setTotalPages] = useState<number>(0)

    const [selectedInventory, setSelectedInventory] = useState<InventoryItem | null>(null)
    const [movementLoading, setMovementLoading] = useState<boolean>(false)
    const [movements, setMovements] = useState<InventoryMovementItem[]>([])

    const [csvFile, setCsvFile] = useState<File | null>(null)
    const [csvReport, setCsvReport] = useState<InventoryCsvImportResponse | null>(null)
    const [csvUploading, setCsvUploading] = useState<boolean>(false)

    const [addModalOpen, setAddModalOpen] = useState<boolean>(false)
    const [productSearch, setProductSearch] = useState<string>('')
    const [productSearchLoading, setProductSearchLoading] = useState<boolean>(false)
    const [productResults, setProductResults] = useState<ProductMinimal[]>([])
    const [selectedProduct, setSelectedProduct] = useState<ProductMinimal | null>(null)
    const [manualQuantity, setManualQuantity] = useState<string>('')
    const [manualReorderLevel, setManualReorderLevel] = useState<string>('')
    const [manualWarehouseLocation, setManualWarehouseLocation] = useState<string>('')
    const [manualReason, setManualReason] = useState<string>('Manual inventory creation')
    const [manualSubmitting, setManualSubmitting] = useState<boolean>(false)

    const productSearchTerm = productSearch.trim()

    const fetchInventory = async () => {
        try {
            setLoading(true)
            const response = await listInventory({
                keyword: keyword || undefined,
                status: status === 'ALL' ? undefined : status,
                page,
                size,
                sort,
            })

            setItems(response.content)
            setTotalElements(response.totalElements)
            setTotalPages(response.totalPages)

            if (response.content.length === 0) {
                setSelectedInventory(null)
                setMovements([])
            } else if (!selectedInventory) {
                setSelectedInventory(response.content[0])
            } else {
                const stillExists = response.content.find((item) => item.productId === selectedInventory.productId)
                if (!stillExists) {
                    setSelectedInventory(response.content[0])
                }
            }
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'Load inventory failed'))
            setItems([])
            setTotalElements(0)
            setTotalPages(0)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchInventory()
    }, [keyword, status, page, size, sort])

    useEffect(() => {
        if (!selectedInventory) {
            setMovements([])
            return
        }

        let mounted = true

        ;(async () => {
            try {
                setMovementLoading(true)
                const response = await listInventoryMovements(selectedInventory.productId, {
                    page: 0,
                    size: WAREHOUSE_PAGE_SIZE,
                    sort: 'createdAt,desc',
                })

                if (!mounted) return
                setMovements(response.content)
            } catch (error) {
                if (!mounted) return
                toast.error(getApiErrorMessage(error, 'Load stock movement failed'))
                setMovements([])
            } finally {
                if (mounted) setMovementLoading(false)
            }
        })()

        return () => {
            mounted = false
        }
    }, [selectedInventory?.productId])

    useEffect(() => {
        if (!addModalOpen) return

        let mounted = true
        const timer = setTimeout(() => {
            ;(async () => {
                try {
                    setProductSearchLoading(true)
                    const response = await listProducts({
                        keyword: productSearchTerm || undefined,
                        active: true,
                        page: 0,
                        size: WAREHOUSE_PAGE_SIZE,
                        sort: 'updatedAt,desc',
                    })

                    if (!mounted) return
                    setProductResults(response.content)
                } catch (error) {
                    if (!mounted) return
                    toast.error(getApiErrorMessage(error, 'Load products failed'))
                    setProductResults([])
                } finally {
                    if (mounted) setProductSearchLoading(false)
                }
            })()
        }, 300)

        return () => {
            mounted = false
            clearTimeout(timer)
        }
    }, [addModalOpen, productSearchTerm])

    const handleFilterQuickStatus = (value: InventoryFilterStatus) => {
        setPage(0)
        setStatus(value)
    }

    const handleCsvImport = async () => {
        if (!csvFile) {
            toast.error('Please select a CSV file first')
            return
        }

        try {
            setCsvUploading(true)
            const report = await importInventoryCsv(csvFile)
            setCsvReport(report)
            toast.success('CSV import completed')
            await fetchInventory()
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'CSV import failed'))
        } finally {
            setCsvUploading(false)
        }
    }

    const openAddModal = () => {
        setAddModalOpen(true)
        setProductSearch('')
        setProductResults([])
        setSelectedProduct(null)
        setManualQuantity('')
        setManualReorderLevel('')
        setManualWarehouseLocation('')
        setManualReason('Manual inventory creation')
    }

    const handleSelectProduct = (product: ProductMinimal) => {
        setSelectedProduct(product)
        setManualQuantity(String(Math.max(product.stockQuantity ?? 0, 0)))
        setManualReorderLevel(String(Math.max(product.stockQuantity ?? 0, 10)))
        setManualWarehouseLocation(product.brandSlug ? `${product.brandSlug.toUpperCase()}-WH` : '')
    }

    const handleManualAddSubmit = async () => {
        if (!selectedProduct) {
            toast.error('Please select a product first')
            return
        }

        const quantity = Number(manualQuantity)
        const reorderLevel = Number(manualReorderLevel)

        if (!Number.isFinite(quantity) || quantity < 0) {
            toast.error('Quantity must be a valid number')
            return
        }

        if (!Number.isFinite(reorderLevel) || reorderLevel < 0) {
            toast.error('Reorder level must be a valid number')
            return
        }

        try {
            setManualSubmitting(true)
            await updateInventoryStock({
                productId: selectedProduct.id,
                sku: selectedProduct.sku,
                quantity,
                reason: manualReason.trim() || 'Manual inventory creation',
            })

            await patchInventoryWarehouse(selectedProduct.id, {
                reorderLevel,
                warehouseLocation: manualWarehouseLocation.trim() || undefined,
            })

            toast.success('Inventory item added')
            setAddModalOpen(false)
            await fetchInventory()
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'Add inventory item failed'))
        } finally {
            setManualSubmitting(false)
        }
    }

    const statusChartData = useMemo(() => {
        const map: Record<InventoryStatus, number> = {
            IN_STOCK: 0,
            LOW_STOCK: 0,
            OUT_OF_STOCK: 0,
        }

        items.forEach((item) => {
            map[item.status] += 1
        })

        return [
            { status: 'IN_STOCK', count: map.IN_STOCK },
            { status: 'LOW_STOCK', count: map.LOW_STOCK },
            { status: 'OUT_OF_STOCK', count: map.OUT_OF_STOCK },
        ]
    }, [items])

    const movementTrendData = useMemo(() => {
        const grouped: Record<string, number> = {}

        movements.forEach((movement) => {
            const key = new Date(movement.createdAt).toLocaleDateString('vi-VN')
            grouped[key] = (grouped[key] ?? 0) + Math.abs(movement.quantity)
        })

        return Object.entries(grouped).map(([date, quantity]) => ({ date, quantity }))
    }, [movements])

    return (
        <div className='space-y-4 p-4 md:p-6'>
            <div className='flex flex-wrap items-start justify-between gap-3'>
                <div>
                    <h1 className='text-2xl font-bold tracking-tight'>Warehouse Inventory Dashboard</h1>
                    <p className='text-muted-foreground'>
                        Inventory list, stock movement history, CSV import report, and trend charts.
                    </p>
                </div>

                <Button onClick={openAddModal}>
                    <Plus className='mr-2 h-4 w-4' />
                    Add Inventory
                </Button>
            </div>

            <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
                <DialogContent className='sm:max-w-4xl'>
                    <DialogHeader>
                        <DialogTitle>Add Inventory Manually</DialogTitle>
                        <DialogDescription>
                            Search a product, select it, then set quantity and warehouse details.
                        </DialogDescription>
                    </DialogHeader>

                    <div className='grid gap-4 md:grid-cols-[1.1fr_0.9fr]'>
                        <div className='space-y-3'>
                            <Label>Search Product</Label>
                            <Command className='rounded-lg border'>
                                <CommandInput
                                    placeholder='Search by name, sku, or description...'
                                    value={productSearch}
                                    onValueChange={setProductSearch}
                                />
                                <CommandList className='max-h-80'>
                                    <CommandEmpty>
                                        {productSearchLoading ? 'Searching...' : 'No product found.'}
                                    </CommandEmpty>
                                    <CommandGroup heading='Products'>
                                        {productResults.map((product) => (
                                            <CommandItem
                                                key={product.id}
                                                value={`${product.name} ${product.sku ?? ''} ${product.id}`}
                                                onSelect={() => handleSelectProduct(product)}
                                                className='flex flex-col items-start gap-1'
                                            >
                                                <span className='font-medium'>{product.name}</span>
                                                <span className='text-xs text-muted-foreground'>
                                                    ID: {product.id} | SKU: {product.sku ?? '-'}
                                                </span>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </div>

                        <div className='space-y-3 rounded-md border p-4'>
                            <div className='grid gap-2'>
                                <Label>Selected Product</Label>
                                <div className='rounded-md bg-muted p-3 text-sm'>
                                    <p className='font-medium'>{selectedProduct?.name ?? 'No product selected'}</p>
                                    <p className='text-xs text-muted-foreground'>ID: {selectedProduct?.id ?? '-'}</p>
                                    <p className='text-xs text-muted-foreground'>SKU: {selectedProduct?.sku ?? '-'}</p>
                                </div>
                            </div>

                            <div className='grid gap-2'>
                                <Label htmlFor='manual-quantity'>Quantity</Label>
                                <Input
                                    id='manual-quantity'
                                    type='number'
                                    min={0}
                                    value={manualQuantity}
                                    onChange={(event) => setManualQuantity(event.target.value)}
                                />
                            </div>

                            <div className='grid gap-2'>
                                <Label htmlFor='manual-reorder'>Reorder Level</Label>
                                <Input
                                    id='manual-reorder'
                                    type='number'
                                    min={0}
                                    value={manualReorderLevel}
                                    onChange={(event) => setManualReorderLevel(event.target.value)}
                                />
                            </div>

                            <div className='grid gap-2'>
                                <Label htmlFor='manual-location'>Warehouse Location</Label>
                                <Input
                                    id='manual-location'
                                    value={manualWarehouseLocation}
                                    onChange={(event) => setManualWarehouseLocation(event.target.value)}
                                    placeholder='WH-A1'
                                />
                            </div>

                            <div className='grid gap-2'>
                                <Label htmlFor='manual-reason'>Reason</Label>
                                <Input
                                    id='manual-reason'
                                    value={manualReason}
                                    onChange={(event) => setManualReason(event.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant='outline' type='button' onClick={() => setAddModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type='button' loading={manualSubmitting} onClick={handleManualAddSubmit}>
                            Save Inventory
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Card>
                <CardHeader>
                    <CardTitle>Inventory Filters</CardTitle>
                </CardHeader>
                <CardContent className='grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-6'>
                    <Input
                        value={keyword}
                        onChange={(event) => {
                            setKeyword(event.target.value)
                            setPage(0)
                        }}
                        placeholder='Search by product, sku, location...'
                        className='lg:col-span-2'
                    />

                    <Select
                        value={status}
                        onValueChange={(value: InventoryFilterStatus) => {
                            setStatus(value)
                            setPage(0)
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder='Status' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='ALL'>All status</SelectItem>
                            <SelectItem value='IN_STOCK'>In stock</SelectItem>
                            <SelectItem value='LOW_STOCK'>Low stock</SelectItem>
                            <SelectItem value='OUT_OF_STOCK'>Out of stock</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={sort}
                        onValueChange={(value) => {
                            setSort(value)
                            setPage(0)
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder='Sort' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='quantity,asc'>Quantity asc</SelectItem>
                            <SelectItem value='quantity,desc'>Quantity desc</SelectItem>
                            <SelectItem value='availableQuantity,asc'>Available asc</SelectItem>
                            <SelectItem value='availableQuantity,desc'>Available desc</SelectItem>
                            <SelectItem value='productName,asc'>Product name asc</SelectItem>
                            <SelectItem value='productName,desc'>Product name desc</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className='flex items-center gap-2'>
                        <Button variant='outline' onClick={() => handleFilterQuickStatus('LOW_STOCK')}>
                            Low stock
                        </Button>
                        <Button variant='outline' onClick={() => handleFilterQuickStatus('OUT_OF_STOCK')}>
                            Out
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Inventory Table</CardTitle>
                    <CardDescription>
                        Total {totalElements} items | Page {Math.min(page + 1, totalPages || 1)} of {totalPages || 1}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className='rounded-md border'>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>SKU</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Available</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Location</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className='h-24 text-center text-muted-foreground'>
                                            Loading inventory...
                                        </TableCell>
                                    </TableRow>
                                ) : items.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className='h-24 text-center text-muted-foreground'>
                                            No inventory records found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    items.map((item) => (
                                        <TableRow
                                            key={item.id}
                                            className={selectedInventory?.id === item.id ? 'bg-muted/40' : ''}
                                            onClick={() => setSelectedInventory(item)}
                                        >
                                            <TableCell className='font-medium'>{item.productName}</TableCell>
                                            <TableCell>{item.sku}</TableCell>
                                            <TableCell>{item.quantity}</TableCell>
                                            <TableCell>{item.availableQuantity}</TableCell>
                                            <TableCell>
                                                <Badge variant={statusBadgeVariant(item.status)}>{item.status}</Badge>
                                            </TableCell>
                                            <TableCell>{item.warehouseLocation ?? '-'}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className='mt-3 flex items-center justify-end gap-2'>
                        <Button
                            variant='outline'
                            size='sm'
                            onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                            disabled={page <= 0 || loading}
                        >
                            Prev
                        </Button>
                        <Button
                            variant='outline'
                            size='sm'
                            onClick={() => setPage((prev) => prev + 1)}
                            disabled={loading || (totalPages > 0 && page >= totalPages - 1)}
                        >
                            Next
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className='grid grid-cols-1 gap-4 xl:grid-cols-2'>
                <Card>
                    <CardHeader>
                        <CardTitle>Stock Movement History</CardTitle>
                        <CardDescription>
                            {selectedInventory
                                ? `Latest movements for ${selectedInventory.productName} (${selectedInventory.sku})`
                                : 'Select an inventory row to view movement timeline'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {movementLoading ? (
                            <p className='text-sm text-muted-foreground'>Loading movements...</p>
                        ) : movements.length === 0 ? (
                            <p className='text-sm text-muted-foreground'>No movement history found.</p>
                        ) : (
                            <div className='space-y-3'>
                                {movements.map((movement) => (
                                    <div key={movement.id} className='rounded-md border p-3'>
                                        <div className='flex items-center justify-between gap-2'>
                                            <Badge variant='outline'>{movement.type}</Badge>
                                            <span className='text-xs text-muted-foreground'>
                                                {formatDateTime(movement.createdAt)}
                                            </span>
                                        </div>
                                        <p className='mt-2 text-sm'>
                                            Quantity: <span className='font-medium'>{movement.quantity}</span>
                                        </p>
                                        <p className='text-sm text-muted-foreground'>
                                            Reason: {movement.reason || movement.reference || '-'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>CSV Import</CardTitle>
                        <CardDescription>
                            Upload inventory CSV and review success/failure report.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-3'>
                        <div className='grid gap-2'>
                            <Label htmlFor='inventory-csv'>CSV file</Label>
                            <Input
                                id='inventory-csv'
                                type='file'
                                accept='.csv,text/csv'
                                onChange={(event) => setCsvFile(event.target.files?.[0] ?? null)}
                            />
                        </div>

                        <Button onClick={handleCsvImport} loading={csvUploading}>
                            <Upload className='mr-2 h-4 w-4' />
                            Upload CSV
                        </Button>

                        {csvReport && (
                            <div className='rounded-md border p-3 text-sm'>
                                <p>
                                    Success: <span className='font-medium'>{csvReport.successCount}</span>
                                </p>
                                <p>
                                    Failure: <span className='font-medium'>{csvReport.failureCount}</span>
                                </p>
                                <p>
                                    Total lines: <span className='font-medium'>{csvReport.totalLines}</span>
                                </p>

                                {csvReport.errorLines.length > 0 && (
                                    <div className='mt-2 space-y-1'>
                                        <p className='font-medium'>Error lines</p>
                                        {csvReport.errorLines.slice(0, 10).map((line) => (
                                            <p key={`${line.lineNumber}-${line.sku}`} className='text-xs text-muted-foreground'>
                                                Line {line.lineNumber} ({line.sku || 'N/A'}): {line.reason}
                                            </p>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className='grid grid-cols-1 gap-4 xl:grid-cols-2'>
                <Card>
                    <CardHeader>
                        <CardTitle>Stock Status Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width='100%' height={260}>
                            <BarChart data={statusChartData}>
                                <CartesianGrid strokeDasharray='3 3' vertical={false} />
                                <XAxis dataKey='status' />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Bar dataKey='count' fill='hsl(var(--chart-1))' radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Movement Trend (Selected Product)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width='100%' height={260}>
                            <BarChart data={movementTrendData}>
                                <CartesianGrid strokeDasharray='3 3' vertical={false} />
                                <XAxis dataKey='date' />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Bar dataKey='quantity' fill='hsl(var(--chart-2))' radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
