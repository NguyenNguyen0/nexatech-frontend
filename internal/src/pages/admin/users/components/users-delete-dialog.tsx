import { useState } from 'react'
import { IconAlertTriangle } from '@tabler/icons-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User } from '../data/schema'
import { toast } from 'sonner'
import { AlertDialog, AlertDialogDescription, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { deleteUser } from '@/services/userApi'
import { getApiErrorMessage } from '@/services/authApi'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: User
  onSuccess?: () => Promise<void> | void
}

export function UsersDeleteDialog({ open, onOpenChange, currentRow, onSuccess }: Props) {
  const [value, setValue] = useState('')

  const handleDelete = async () => {
    if (value.trim() !== currentRow.username) return

    try {
      await deleteUser(currentRow.id)
      await onSuccess?.()
      onOpenChange(false)
      setValue('')
      toast.success('User deleted successfully')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Delete user failed'))
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== currentRow.username}
      title={
        <span className='text-destructive'>
          <IconAlertTriangle
            className='mr-1 inline-block stroke-destructive'
            size={18}
          />{' '}
          Delete User
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            Are you sure you want to delete{' '}
            <span className='font-bold'>{currentRow.username}</span>?
            <br />
            This action will permanently remove the user with the role of{' '}
            <span className='font-bold'>
              {currentRow.role.toUpperCase()}
            </span>{' '}
            from the system. This cannot be undone.
          </p>

          <Label className='my-2'>
            Username:
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder='Enter username to confirm deletion.'
            />
          </Label>

          <AlertDialog>
            <AlertDialogTitle>Warning!</AlertDialogTitle>
            <AlertDialogDescription>
              Please be carefull, this operation can not be rolled back.
            </AlertDialogDescription>
          </AlertDialog>
        </div>
      }
      confirmText='Delete'
      destructive
    />
  )
}
