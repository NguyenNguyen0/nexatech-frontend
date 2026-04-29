import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { columns } from './components/users-columns'
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersTable } from './components/users-table'
import UsersProvider from './context/users-context'
import { Layout } from '@/components/custom/layout'
import { getApiErrorMessage } from '@/services/authApi'
import { getUsers, type UsersPageResult } from '@/services/userApi'
import type { User } from './data/schema'

export default function Users() {
  const [data, setData] = useState<UsersPageResult | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  const loadUsers = async () => {
    try {
      const result = await getUsers(1, 100)
      setData(result)
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Load users failed'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const result = await getUsers(1, 100)
        if (!mounted) return
        setData(result)
      } catch (err) {
        if (!mounted) return
        toast.error(getApiErrorMessage(err, 'Load users failed'))
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const userList: User[] = useMemo(
    () =>
      (data?.content ?? []).map((user) => ({
        id: user.id,
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        username: user.username ?? '',
        email: user.email ?? '',
        phoneNumber: user.phone ?? '',
        status: user.active ? 'active' : 'inactive',
        role: (user.role ?? 'UNASSIGNED').toUpperCase() as User['role'],
        avatarUrl: user.avatarUrl,
        dob: user.dob,
        gender: user.gender,
        onBoarded: user.onBoarded,
        active: user.active,
        createdBy: user.createdBy,
        updatedBy: user.updatedBy,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
      })),
    [data]
  )

  return (
    <UsersProvider>
      <Layout fixed>
        <Layout.Body className='flex flex-col'>
          <div className='mb-2 flex items-center justify-between space-y-2 flex-wrap'>
            <div>
              <h2 className='text-2xl font-bold tracking-tight'>User List</h2>
              <p className='text-muted-foreground'>
                {loading
                  ? 'Loading users...'
                  : `Manage your users and their roles here. Total records: ${data?.totalElements ?? 0}`}
              </p>
            </div>
            <UsersPrimaryButtons />
          </div>
          <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
            <UsersTable data={userList} columns={columns} />
          </div>
          <UsersDialogs onDataChanged={loadUsers} />
        </Layout.Body>
      </Layout>
    </UsersProvider>
  )
}
