import { NavLink, Outlet } from 'react-router-dom'
import { Layout } from '@/components/custom/layout'
import { cn } from '@/lib/utils'

const productTabs = [
  { to: '/admin/product/products', label: 'Products' },
  { to: '/admin/product/categories', label: 'Categories' },
  { to: '/admin/product/brands', label: 'Brands' },
]

export default function ProductManagementLayout() {
  return (
    <Layout fixed>
      <Layout.Body className='flex flex-col'>
        <div className='mb-4 flex flex-col gap-3'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Product Management</h1>
            <p className='text-muted-foreground'>Manage products, categories, and brands.</p>
          </div>
          <div className='inline-flex w-fit items-center gap-1 rounded-lg bg-muted p-1'>
            {productTabs.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )
                }
              >
                {tab.label}
              </NavLink>
            ))}
          </div>
        </div>
        <Outlet />
      </Layout.Body>
    </Layout>
  )
}
