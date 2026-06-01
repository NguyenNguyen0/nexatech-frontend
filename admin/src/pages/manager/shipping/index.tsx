import { Layout } from '@/components/custom/layout';
import { ShippingManagement } from './components/ShippingManagement';

export default function ShippingPage() {
  return (
    <Layout fixed>
      <Layout.Body className="flex flex-col">
        <ShippingManagement />
      </Layout.Body>
    </Layout>
  );
}
