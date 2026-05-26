import { Layout } from '@/components/custom/layout';
import { AuditTrace } from './components/AuditTrace';

export default function AuditPage() {
  return (
    <Layout fixed>
      <Layout.Body className="flex flex-col">
        <AuditTrace />
      </Layout.Body>
    </Layout>
  );
}
