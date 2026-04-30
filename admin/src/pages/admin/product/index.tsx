import { Outlet } from 'react-router-dom'
import { Layout } from '@/components/custom/layout'

export default function products() {
  return (
    <Layout fixed>
      <Layout.Body className='flex flex-col'>
        <Outlet />
      </Layout.Body>
    </Layout>
  )
}
