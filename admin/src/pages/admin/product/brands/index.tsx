import { useEffect, useState } from 'react'
import { Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/custom/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
import { createBrand, listBrands, restoreBrand, softDeleteBrand, updateBrand } from '@/services/brandApi'
import type { BrandItem, BrandUpsertPayload } from '@/types/catalog'

type FilterMode = 'active' | 'deleted' | 'all'

const PRODUCT_TAB_LIST_SIZE = 10

type BrandForm = {
  name: string
  parentBrandId: string
  logoUrl: string
}

const initialForm: BrandForm = {
  name: '',
  parentBrandId: '',
  logoUrl: '',
}

export default function ProductBrandsTab() {
  const [brands, setBrands] = useState<BrandItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [saving, setSaving] = useState<boolean>(false)
  const [actingId, setActingId] = useState<string | null>(null)
  const [filterMode, setFilterMode] = useState<FilterMode>('all')
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
  const [editingBrand, setEditingBrand] = useState<BrandItem | null>(null)
  const [form, setForm] = useState<BrandForm>(initialForm)

  const fetchBrands = async () => {
    try {
      setLoading(true)
      const result = await listBrands({ includeDeleted: true, size: PRODUCT_TAB_LIST_SIZE })
      setBrands(result)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Load brands failed'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBrands()
  }, [])

  const filteredBrands = brands.filter((brand) => {
    if (filterMode === 'active') return brand.active
    if (filterMode === 'deleted') return !brand.active
    return true
  })
  const visibleBrands = filteredBrands.slice(0, PRODUCT_TAB_LIST_SIZE)

  const openCreateDialog = () => {
    setEditingBrand(null)
    setForm(initialForm)
    setIsDialogOpen(true)
  }

  const openEditDialog = (brand: BrandItem) => {
    setEditingBrand(brand)
    setForm({
      name: brand.name,
      parentBrandId: brand.parentBrandId ?? '',
      logoUrl: brand.logoUrl ?? '',
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!form.name.trim()) {
      toast.error('Brand name is required')
      return
    }

    const payload: BrandUpsertPayload = {
      name: form.name.trim(),
      parentBrandId: form.parentBrandId || null,
      logoUrl: form.logoUrl.trim() || undefined,
    }

    try {
      setSaving(true)
      if (editingBrand) {
        await updateBrand(editingBrand.id, payload)
        toast.success('Brand updated')
      } else {
        await createBrand(payload)
        toast.success('Brand created')
      }

      setIsDialogOpen(false)
      setForm(initialForm)
      setEditingBrand(null)
      await fetchBrands()
    } catch (error) {
      toast.error(getApiErrorMessage(error, editingBrand ? 'Update brand failed' : 'Create brand failed'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (brandId: string) => {
    if (!window.confirm('Delete this brand? This action performs soft delete.')) {
      return
    }

    try {
      setActingId(brandId)
      await softDeleteBrand(brandId)
      toast.success('Brand deleted')
      await fetchBrands()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Delete brand failed'))
    } finally {
      setActingId(null)
    }
  }

  const handleRestore = async (brandId: string) => {
    try {
      setActingId(brandId)
      await restoreBrand(brandId)
      toast.success('Brand restored')
      await fetchBrands()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Restore brand failed'))
    } finally {
      setActingId(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <div>
            <CardTitle>Brands</CardTitle>
            <CardDescription>Manage brand list with soft delete and restore.</CardDescription>
          </div>
          <div className='flex items-center gap-2'>
            <Select value={filterMode} onValueChange={(value: FilterMode) => setFilterMode(value)}>
              <SelectTrigger className='w-35'>
                <SelectValue placeholder='Filter' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All</SelectItem>
                <SelectItem value='active'>Active</SelectItem>
                <SelectItem value='deleted'>Deleted</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={openCreateDialog}>
              <Plus className='mr-2 h-4 w-4' />
              Add Brand
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Parent Brand</TableHead>
                <TableHead>Logo URL</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className='h-24 text-center text-muted-foreground'>
                    Loading brands...
                  </TableCell>
                </TableRow>
              ) : filteredBrands.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className='h-24 text-center text-muted-foreground'>
                    No brands found.
                  </TableCell>
                </TableRow>
              ) : (
                visibleBrands.map((brand) => (
                  <TableRow key={brand.id}>
                    <TableCell className='font-medium'>{brand.name}</TableCell>
                    <TableCell>{brand.slug}</TableCell>
                    <TableCell>{brand.parentBrandId ?? '-'}</TableCell>
                    <TableCell className='max-w-65 truncate'>{brand.logoUrl ?? '-'}</TableCell>
                    <TableCell>{brand.active ? 'Active' : 'Deleted'}</TableCell>
                    <TableCell className='text-right'>
                      <div className='flex justify-end gap-2'>
                        <Button variant='outline' size='sm' onClick={() => openEditDialog(brand)}>
                          <Pencil className='mr-2 h-4 w-4' />
                          Edit
                        </Button>
                        {brand.active ? (
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleDelete(brand.id)}
                            disabled={actingId === brand.id}
                          >
                            <Trash2 className='mr-2 h-4 w-4' />
                            Delete
                          </Button>
                        ) : (
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleRestore(brand.id)}
                            disabled={actingId === brand.id}
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
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBrand ? 'Edit Brand' : 'Create Brand'}</DialogTitle>
            <DialogDescription>Fill brand information and submit.</DialogDescription>
          </DialogHeader>

          <form className='space-y-4' onSubmit={handleSubmit}>
            <div className='grid gap-2'>
              <Label htmlFor='brand-name'>Name *</Label>
              <Input
                id='brand-name'
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='brand-parent'>Parent Brand</Label>
              <Select
                value={form.parentBrandId || 'none'}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, parentBrandId: value === 'none' ? '' : value }))
                }
              >
                <SelectTrigger id='brand-parent'>
                  <SelectValue placeholder='Select parent brand' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='none'>No parent</SelectItem>
                  {brands
                    .filter((brand) => brand.active)
                    .filter((brand) => brand.id !== editingBrand?.id)
                    .map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='brand-logo'>Logo URL</Label>
              <Input
                id='brand-logo'
                value={form.logoUrl}
                onChange={(event) => setForm((prev) => ({ ...prev, logoUrl: event.target.value }))}
                placeholder='https://.../brand-logo.png'
              />
            </div>

            <DialogFooter className='px-0 pb-0'>
              <Button type='submit' loading={saving}>
                {editingBrand ? 'Save Changes' : 'Create Brand'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
