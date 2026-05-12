import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { columns } from './components/permissions-columns'
import { PermissionsTable } from './components/permissions-table'
import PermissionsProvider from './context/permissions-context'
import { Layout } from '@/components/custom/layout'
import { getApiErrorMessage } from '@/services/authApi'
import { listPermissions } from '@/services/permissionApi'
import type { RoleItem } from '@/services/roleApi'

export default function Permissions() {
  const [data, setData] = useState<RoleItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  const loadPermissions = async () => {
    setLoading(true)
    try {
      const result = await listPermissions()
      setData(result)
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Load permissions failed'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const result = await listPermissions()
        if (!mounted) return
        setData(result)
      } catch (err) {
        if (!mounted) return
        toast.error(getApiErrorMessage(err, 'Load permissions failed'))
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const permissionList: RoleItem[] = useMemo(() => data, [data])

  return (
    <PermissionsProvider>
      <Layout fixed>
        <Layout.Body className='flex flex-col'>
          <div className='mb-2 flex items-center justify-between space-y-2 flex-wrap'>
            <div>
              <h2 className='text-2xl font-bold tracking-tight'>Permission List</h2>
              <p className='text-muted-foreground'>
                {loading
                  ? 'Loading permissions...'
                  : `Manage your permissions here. Total records: ${data?.length ?? 0}`}
              </p>
            </div>
          </div>
          <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
            <PermissionsTable data={permissionList} columns={columns} isLoading={loading} />
          </div>
        </Layout.Body>
      </Layout>
    </PermissionsProvider>
  )
}
