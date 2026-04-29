import { Layout } from '@/components/custom/layout'
import ListEmail from '../components/ListEmail'

export default function EmailMarketing() {
  return (
    <Layout>
      <Layout.Body>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
          <ListEmail />
        </div>
      </Layout.Body>
    </Layout>
  )
}
