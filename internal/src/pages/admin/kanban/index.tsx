import { Layout } from '@/components/custom/layout'
import EnhancedVulnerabilityKanban from './components/kanban'

export default function Kanban() {

  return (
    <Layout>
      <Layout.Body>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
          <EnhancedVulnerabilityKanban />
        </div>
      </Layout.Body>
    </Layout>
  )
}
