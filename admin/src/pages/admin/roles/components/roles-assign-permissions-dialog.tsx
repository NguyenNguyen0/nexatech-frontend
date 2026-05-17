import { useEffect, useState, useMemo } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/custom/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useRoles } from '../context/roles-context'
import { listPermissions } from '@/services/permissionApi'
import { getRolePermissions, assignRolePermissions, removeRolePermissions, type RoleItem } from '@/services/roleApi'
import { getApiErrorMessage } from '@/services/authApi'

export function RolesAssignPermissionsDialog() {
  const { open, setOpen, currentRow } = useRoles()
  const isOpen = open === 'assign_permissions'

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [allPermissions, setAllPermissions] = useState<RoleItem[]>([])
  const [initialSelectedIds, setInitialSelectedIds] = useState<Set<string>>(new Set())
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (isOpen && currentRow?.name) {
      loadData(currentRow.name)
    } else {
      setAllPermissions([])
      setInitialSelectedIds(new Set())
      setSelectedIds(new Set())
    }
  }, [isOpen, currentRow])

  const loadData = async (roleName: string) => {
    setLoading(true)
    try {
      const [allPerms, assignedPerms] = await Promise.all([
        listPermissions(),
        getRolePermissions(roleName).catch((err) => {
          // If error occurs (e.g. 404 if no composites), default to empty
          console.warn("Failed to get assigned permissions, defaulting to empty:", err);
          return [] as RoleItem[];
        })
      ])
      
      setAllPermissions(allPerms)
      
      const assignedIds = new Set(assignedPerms.map(p => p.id as string).filter(Boolean))
      setInitialSelectedIds(assignedIds)
      setSelectedIds(new Set(assignedIds))
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load permissions'))
    } finally {
      setLoading(false)
    }
  }

  const groupedPermissions = useMemo(() => {
    const groups: Record<string, RoleItem[]> = {}
    allPermissions.forEach((perm) => {
      const module = perm.name.split('_')[0] || 'OTHER'
      if (!groups[module]) {
        groups[module] = []
      }
      groups[module].push(perm)
    })
    return groups
  }, [allPermissions])

  const handleToggle = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleSave = async () => {
    if (!currentRow?.name) return

    setSaving(true)
    try {
      const addedIds = Array.from(selectedIds).filter(id => !initialSelectedIds.has(id))
      const removedIds = Array.from(initialSelectedIds).filter(id => !selectedIds.has(id))

      const addedPerms = allPermissions.filter(p => p.id && addedIds.includes(p.id))
      const removedPerms = allPermissions.filter(p => p.id && removedIds.includes(p.id))

      // Execute sequentially to avoid concurrent modification issues if any
      if (addedPerms.length > 0) {
        await assignRolePermissions(currentRow.name, addedPerms)
      }
      
      if (removedPerms.length > 0) {
        await removeRolePermissions(currentRow.name, removedPerms)
      }

      toast.success('Permissions updated successfully')
      setOpen(null)
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update permissions'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && setOpen(null)}>
      <DialogContent className='sm:max-w-4xl max-h-[90vh] flex flex-col'>
        <DialogHeader>
          <DialogTitle>Assign Permissions</DialogTitle>
          <DialogDescription>
            Manage permissions for role <strong className="text-primary">{currentRow?.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className='flex-1 pr-4 -mr-4'>
          {loading ? (
            <div className='flex items-center justify-center h-32'>
              <span className='text-sm text-muted-foreground'>Loading...</span>
            </div>
          ) : (
            <div className='space-y-6'>
              {Object.entries(groupedPermissions).map(([module, perms]) => (
                <div key={module} className='space-y-3'>
                  <h3 className='font-semibold tracking-tight border-b pb-2 mb-3 text-lg'>
                    {module}
                  </h3>
                  <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
                    {perms.map((perm) => (
                      <div key={perm.id} className='flex items-start space-x-2'>
                        <Checkbox
                          id={perm.id}
                          checked={perm.id ? selectedIds.has(perm.id) : false}
                          onCheckedChange={() => perm.id && handleToggle(perm.id)}
                        />
                        <div className='grid gap-1.5 leading-none flex-1'>
                          <label
                            htmlFor={perm.id}
                            className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer break-words'
                          >
                            {perm.name}
                          </label>
                          {perm.description && (
                            <p className='text-[0.8rem] text-muted-foreground'>
                              {perm.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <DialogFooter className='pt-4'>
          <Button variant='outline' onClick={() => setOpen(null)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading || saving}>
            {saving ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
