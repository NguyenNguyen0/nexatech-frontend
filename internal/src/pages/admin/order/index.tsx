
import { Layout } from '@/components/custom/layout'
import { EnhancedOrderManagement } from './components/reports'

export default function Order() {
    return (
        <Layout fixed>
        <Layout.Body className='flex flex-col'>
          <EnhancedOrderManagement />
        </Layout.Body>
      </Layout>
    )
}