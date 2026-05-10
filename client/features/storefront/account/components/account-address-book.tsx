import { MapPin } from 'lucide-react';
import { StorefrontEmptyState } from '@/features/storefront/shared/components/storefront-empty-state';

type AccountAddressItem = {
  id: string;
  label: string;
  receiver: string;
  phone: string;
  addressLine: string;
  isDefault?: boolean;
};

type AccountAddressBookProps = {
  addresses: AccountAddressItem[];
};

export function AccountAddressBook({ addresses }: AccountAddressBookProps) {
  return (
    <section id="addresses" className="rounded-4xl border border-border bg-bg-elevated p-6 shadow-sm">
      <h3 className="text-lg font-bold text-text-primary">Sổ địa chỉ</h3>

      {addresses.length === 0 ? (
        <StorefrontEmptyState
          className="mt-4 bg-bg-base"
          title="Chưa có địa chỉ giao hàng"
          description="Thêm địa chỉ để rút ngắn thời gian thanh toán ở những đơn hàng tiếp theo."
        />
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {addresses.map((address) => (
            <article key={address.id} className="rounded-2xl border border-border bg-bg-base px-4 py-3">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-text-primary">
                <MapPin className="h-4 w-4 text-primary" />
                {address.label}
                {address.isDefault ? (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">Mặc định</span>
                ) : null}
              </p>
              <p className="mt-2 text-sm text-text-primary">{address.receiver} - {address.phone}</p>
              <p className="mt-1 text-sm text-text-secondary">{address.addressLine}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
