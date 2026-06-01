import { useEffect, useState, useMemo } from 'react'
import { CheckSquare, Search, ShieldCheck, Square } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { useRoles } from '../context/roles-context'
import { listPermissions } from '@/services/permissionApi'
import { getRolePermissions, assignRolePermissions, removeRolePermissions, type RoleItem } from '@/services/roleApi'
import { getApiErrorMessage } from '@/services/authApi'
import { cn } from '@/lib/utils'

const MODULE_LABELS: Record<string, string> = {
  AUDIT: 'Audit logs',
  BRAND: 'Brands',
  CATEGORY: 'Categories',
  INVENTORY: 'Inventory',
  NEWS: 'News content',
  NOTIFICATION: 'Notifications',
  PERMISSION: 'Permission catalog',
  PRODUCT: 'Products',
  ROLE: 'Roles',
  STORAGE: 'Storage',
  USER: 'Users',
}

const MODULE_ORDER = [
  'USER',
  'ROLE',
  'PERMISSION',
  'PRODUCT',
  'CATEGORY',
  'BRAND',
  'INVENTORY',
  'NEWS',
  'NOTIFICATION',
  'STORAGE',
  'AUDIT',
]

export function RolesAssignPermissionsDialog() {
  const { open, setOpen, currentRow } = useRoles()
  const isOpen = open === 'assign_permissions'

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [allPermissions, setAllPermissions] = useState<RoleItem[]>([])
  const [initialSelectedIds, setInitialSelectedIds] = useState<Set<string>>(new Set())
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (isOpen && currentRow?.name) {
      loadData(currentRow.name)
    } else {
      setAllPermissions([])
      setInitialSelectedIds(new Set())
      setSelectedIds(new Set())
      setSearchTerm('')
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
    const normalizedSearch = searchTerm.trim().toLowerCase()

    allPermissions.forEach((perm) => {
      const module = perm.name.split('_')[0] || 'OTHER'
      const searchableText = [module, perm.name, perm.description]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      if (normalizedSearch && !searchableText.includes(normalizedSearch)) {
        return
      }

      if (!groups[module]) {
        groups[module] = []
      }
      groups[module].push(perm)
    })

    Object.values(groups).forEach((perms) => {
      perms.sort((a, b) => a.name.localeCompare(b.name))
    })

    return groups
  }, [allPermissions, searchTerm])

  const visibleGroups = useMemo(() => {
    return Object.entries(groupedPermissions).sort(([moduleA], [moduleB]) => {
      const indexA = MODULE_ORDER.indexOf(moduleA)
      const indexB = MODULE_ORDER.indexOf(moduleB)

      if (indexA === -1 && indexB === -1) {
        return moduleA.localeCompare(moduleB)
      }

      if (indexA === -1) return 1
      if (indexB === -1) return -1
      return indexA - indexB
    })
  }, [groupedPermissions])

  const visiblePermissionIds = useMemo(() => {
    return visibleGroups.flatMap(([, perms]) =>
      perms.map((perm) => perm.id).filter((id): id is string => Boolean(id))
    )
  }, [visibleGroups])

  const selectedVisibleCount = visiblePermissionIds.filter((id) => selectedIds.has(id)).length

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

  const handleSelectVisible = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      visiblePermissionIds.forEach((id) => next.add(id))
      return next
    })
  }

  const handleClearVisible = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      visiblePermissionIds.forEach((id) => next.delete(id))
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
      <DialogContent className='flex h-[min(760px,calc(100vh-2rem))] max-h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] max-w-[980px] flex-col gap-0 overflow-hidden p-0 sm:max-w-[980px]'>
        <DialogHeader className='border-b px-5 py-4 sm:px-6'>
          <div className='flex items-start gap-3 pr-10'>
            <div className='mt-0.5 hidden h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary sm:flex'>
              <ShieldCheck className='h-5 w-5' />
            </div>
            <div className='min-w-0 space-y-1'>
              <DialogTitle className='text-lg'>Assign API permissions</DialogTitle>
              <DialogDescription>
                Manage access for role <strong className="text-primary">{currentRow?.name}</strong>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className='border-b bg-muted/20 px-5 py-3 sm:px-6'>
          <div className='flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
            <div className='relative min-w-0 flex-1 lg:max-w-md'>
              <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder='Search permission code or module...'
                className='h-9 rounded-md pl-9'
              />
            </div>
            <div className='flex flex-wrap items-center gap-2'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={handleSelectVisible}
                disabled={loading || visiblePermissionIds.length === 0}
                leftSection={<CheckSquare className='h-4 w-4' />}
              >
                Select visible
              </Button>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={handleClearVisible}
                disabled={loading || selectedVisibleCount === 0}
                leftSection={<Square className='h-4 w-4' />}
              >
                Clear visible
              </Button>
            </div>
          </div>
        </div>

        <ScrollArea className='min-h-0 flex-1'>
          <div className='px-5 py-5 sm:px-6'>
            {loading ? (
              <div className='flex h-40 items-center justify-center rounded-md border border-dashed'>
                <span className='text-sm text-muted-foreground'>Loading permissions...</span>
              </div>
            ) : visibleGroups.length === 0 ? (
              <div className='flex h-40 items-center justify-center rounded-md border border-dashed'>
                <span className='text-sm text-muted-foreground'>No permissions found.</span>
              </div>
            ) : (
              <div className='space-y-5'>
                {visibleGroups.map(([module, perms]) => (
                  <section key={module} className='space-y-3'>
                    <div className='flex items-center justify-between gap-3 border-b pb-2'>
                      <div>
                        <h3 className='text-base font-semibold tracking-tight'>
                          {MODULE_LABELS[module] ?? module}
                        </h3>
                        <p className='text-xs text-muted-foreground'>{module}</p>
                      </div>
                      <Badge variant='secondary' className='rounded-md'>
                        {perms.filter((perm) => perm.id && selectedIds.has(perm.id)).length}/{perms.length}
                      </Badge>
                    </div>
                    <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3'>
                      {perms.map((perm) => {
                        const checkboxId = perm.id ?? perm.name
                        const checked = Boolean(perm.id && selectedIds.has(perm.id))

                        return (
                          <label
                            key={checkboxId}
                            htmlFor={checkboxId}
                            className={cn(
                              'flex min-h-16 cursor-pointer items-start gap-3 rounded-md border bg-background p-3 transition-colors hover:border-primary/40 hover:bg-accent/40',
                              checked && 'border-primary/50 bg-primary/5'
                            )}
                          >
                            <Checkbox
                              id={checkboxId}
                              checked={checked}
                              onCheckedChange={() => perm.id && handleToggle(perm.id)}
                              className='mt-0.5'
                            />
                            <span className='min-w-0 flex-1'>
                              <span className='block break-words text-sm font-medium leading-5'>
                                {perm.name}
                              </span>
                              {perm.description && (
                                <span className='mt-1 block break-words text-xs leading-5 text-muted-foreground'>
                                  {perm.description}
                                </span>
                              )}
                            </span>
                          </label>
                        )
                      })}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className='shrink-0'>
          <Button variant='outline' onClick={() => setOpen(null)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading || saving} loading={saving}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
