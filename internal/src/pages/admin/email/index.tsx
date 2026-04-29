import { Layout } from '@/components/custom/layout'
import { Outlet } from 'react-router-dom'

export default function EmailMarketing() {
  return (
    <Layout>
      <Layout.Body>
          <Outlet />
      </Layout.Body>
    </Layout>
  )
}
