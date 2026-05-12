import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { columns } from './components/roles-columns'
import { RolesDialogs } from './components/roles-dialogs'
import { RolesPrimaryButtons } from './components/roles-primary-buttons'
import { RolesTable } from './components/roles-table'
import RolesProvider from './context/roles-context'
import { Layout } from '@/components/custom/layout'
import { getApiErrorMessage } from '@/services/authApi'
import { listRoles, type RoleItem } from '@/services/roleApi'

export default function Roles() {
  const [data, setData] = useState<RoleItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  const loadRoles = async () => {
    setLoading(true)
    try {
      const result = await listRoles()
      setData(result)
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Load roles failed'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const result = await listRoles()
        if (!mounted) return
        setData(result)
      } catch (err) {
        if (!mounted) return
        toast.error(getApiErrorMessage(err, 'Load roles failed'))
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const roleList: RoleItem[] = useMemo(() => data, [data])

  return (
    <RolesProvider>
      <Layout fixed>
        <Layout.Body className='flex flex-col'>
          <div className='mb-2 flex items-center justify-between space-y-2 flex-wrap'>
            <div>
              <h2 className='text-2xl font-bold tracking-tight'>Role List</h2>
              <p className='text-muted-foreground'>
                {loading
                  ? 'Loading roles...'
                  : `Manage your roles here. Total records: ${data?.length ?? 0}`}
              </p>
            </div>
            <RolesPrimaryButtons />
          </div>
          <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
            <RolesTable data={roleList} columns={columns} isLoading={loading} />
          </div>
          <RolesDialogs onDataChanged={loadRoles} />
        </Layout.Body>
      </Layout>
    </RolesProvider>
  )
}
