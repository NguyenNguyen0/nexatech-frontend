import { Layout } from '@/components/custom/layout';
import { PaymentManagement } from './components/PaymentManagement';

export default function PaymentPage() {
  return (
    <Layout fixed>
      <Layout.Body className="flex flex-col">
        <PaymentManagement />
      </Layout.Body>
    </Layout>
  );
}
