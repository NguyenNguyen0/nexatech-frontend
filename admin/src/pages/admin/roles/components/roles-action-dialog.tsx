import { useState } from 'react'
import { toast } from 'sonner'
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
import { Button } from '@/components/custom/button'
import { Textarea } from '@/components/ui/textarea'
import axiosClient from '@/lib/axiosClient'
import type { RoleItem } from '@/services/roleApi'

interface Props {
  currentRow?: RoleItem
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function RolesActionDialog({ currentRow, open, onOpenChange, onSuccess }: Props) {
  const isEdit = !!currentRow
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(currentRow?.name || '')
  const [description, setDescription] = useState(currentRow?.description || '')

  const handleSave = async () => {
    if (!name) {
      toast.error('Name is required')
      return
    }

    setLoading(true)
    try {
      if (isEdit) {
        // API Gateway might not have role edit endpoint yet, but leaving placeholder
        toast.error('Editing roles is not supported yet')
      } else {
        await axiosClient.post('/api/v1/roles', { name, description })
        toast.success('Role created successfully')
        if (onSuccess) onSuccess()
        onOpenChange(false)
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Action failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Role' : 'Add Role'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the role details.' : 'Create a new role in the system.'}
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid gap-2'>
            <Label htmlFor='name'>Role Name</Label>
            <Input
              id='name'
              value={name}
              onChange={(e) => setName(e.target.value.toUpperCase())}
              disabled={isEdit}
              placeholder='e.g., MANAGER'
            />
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='description'>Description</Label>
            <Textarea
              id='description'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='Role description...'
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={loading}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
