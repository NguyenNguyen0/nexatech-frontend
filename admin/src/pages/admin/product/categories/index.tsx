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
import { Textarea } from '@/components/ui/textarea'
import { getApiErrorMessage } from '@/services/authApi'
import {
  createCategory,
  listCategories,
  restoreCategory,
  softDeleteCategory,
  updateCategory,
} from '@/services/categoryApi'
import type { CategoryItem, CategoryUpsertPayload } from '@/types/catalog'

type FilterMode = 'active' | 'deleted' | 'all'

type CategoryForm = {
  name: string
  description: string
  parentId: string
  sortOrder: string
}

const initialForm: CategoryForm = {
  name: '',
  description: '',
  parentId: '',
  sortOrder: '',
}

export default function ProductCategoriesTab() {
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [saving, setSaving] = useState<boolean>(false)
  const [actingId, setActingId] = useState<string | null>(null)
  const [filterMode, setFilterMode] = useState<FilterMode>('all')
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null)
  const [form, setForm] = useState<CategoryForm>(initialForm)

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const result = await listCategories({ includeDeleted: true })
      setCategories(result)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Load categories failed'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const filteredCategories = categories.filter((category) => {
    if (filterMode === 'active') return category.active
    if (filterMode === 'deleted') return !category.active
    return true
  })

  const openCreateDialog = () => {
    setEditingCategory(null)
    setForm(initialForm)
    setIsDialogOpen(true)
  }

  const openEditDialog = (category: CategoryItem) => {
    setEditingCategory(category)
    setForm({
      name: category.name,
      description: category.description ?? '',
      parentId: category.parentId ?? '',
      sortOrder: category.sortOrder != null ? String(category.sortOrder) : '',
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!form.name.trim()) {
      toast.error('Category name is required')
      return
    }

    const payload: CategoryUpsertPayload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      parentId: form.parentId || null,
      sortOrder: form.sortOrder ? Number(form.sortOrder) : undefined,
    }

    try {
      setSaving(true)
      if (editingCategory) {
        await updateCategory(editingCategory.id, payload)
        toast.success('Category updated')
      } else {
        await createCategory(payload)
        toast.success('Category created')
      }

      setIsDialogOpen(false)
      setForm(initialForm)
      setEditingCategory(null)
      await fetchCategories()
    } catch (error) {
      toast.error(getApiErrorMessage(error, editingCategory ? 'Update category failed' : 'Create category failed'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (categoryId: string) => {
    if (!window.confirm('Delete this category? This action performs soft delete.')) {
      return
    }

    try {
      setActingId(categoryId)
      await softDeleteCategory(categoryId)
      toast.success('Category deleted')
      await fetchCategories()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Delete category failed'))
    } finally {
      setActingId(null)
    }
  }

  const handleRestore = async (categoryId: string) => {
    try {
      setActingId(categoryId)
      await restoreCategory(categoryId)
      toast.success('Category restored')
      await fetchCategories()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Restore category failed'))
    } finally {
      setActingId(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <div>
            <CardTitle>Categories</CardTitle>
            <CardDescription>Manage category list with soft delete and restore.</CardDescription>
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
              Add Category
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
                <TableHead>Parent</TableHead>
                <TableHead>Sort</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className='h-24 text-center text-muted-foreground'>
                    Loading categories...
                  </TableCell>
                </TableRow>
              ) : filteredCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className='h-24 text-center text-muted-foreground'>
                    No categories found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className='font-medium'>{category.name}</TableCell>
                    <TableCell>{category.slug}</TableCell>
                    <TableCell>{category.parentId ?? '-'}</TableCell>
                    <TableCell>{category.sortOrder ?? '-'}</TableCell>
                    <TableCell>{category.active ? 'Active' : 'Deleted'}</TableCell>
                    <TableCell className='text-right'>
                      <div className='flex justify-end gap-2'>
                        <Button variant='outline' size='sm' onClick={() => openEditDialog(category)}>
                          <Pencil className='mr-2 h-4 w-4' />
                          Edit
                        </Button>
                        {category.active ? (
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleDelete(category.id)}
                            disabled={actingId === category.id}
                          >
                            <Trash2 className='mr-2 h-4 w-4' />
                            Delete
                          </Button>
                        ) : (
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleRestore(category.id)}
                            disabled={actingId === category.id}
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
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Create Category'}</DialogTitle>
            <DialogDescription>Fill category information and submit.</DialogDescription>
          </DialogHeader>

          <form className='space-y-4' onSubmit={handleSubmit}>
            <div className='grid gap-2'>
              <Label htmlFor='category-name'>Name *</Label>
              <Input
                id='category-name'
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='category-description'>Description</Label>
              <Textarea
                id='category-description'
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                className='min-h-24'
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='category-parent'>Parent Category</Label>
              <Select
                value={form.parentId || 'none'}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, parentId: value === 'none' ? '' : value }))
                }
              >
                <SelectTrigger id='category-parent'>
                  <SelectValue placeholder='Select parent category' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='none'>No parent</SelectItem>
                  {categories
                    .filter((category) => category.active)
                    .filter((category) => category.id !== editingCategory?.id)
                    .map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='category-sort'>Sort Order</Label>
              <Input
                id='category-sort'
                type='number'
                min={0}
                value={form.sortOrder}
                onChange={(event) => setForm((prev) => ({ ...prev, sortOrder: event.target.value }))}
              />
            </div>

            <DialogFooter className='px-0 pb-0'>
              <Button type='submit' loading={saving}>
                {editingCategory ? 'Save Changes' : 'Create Category'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
