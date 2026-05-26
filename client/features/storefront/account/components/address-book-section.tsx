'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Check, Loader2, MapPin, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ADDRESS_TYPE_LABELS,
  createAddress,
  deleteAddress,
  formatAddressLine,
  listMyAddresses,
  setDefaultAddress,
  updateAddress,
  type AddressDto,
  type AddressPayload,
  type AddressType,
} from '@/features/auth/services/address-api';
import { getApiErrorMessage } from '@/features/auth/services/auth-api';
import { StorefrontEmptyState } from '@/features/storefront/shared/components/storefront-empty-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const EMPTY_FORM: AddressPayload = {
  receiverName: '',
  phone: '',
  province: '',
  ward: '',
  detail: '',
  addressType: 'HOME',
  isDefault: false,
};

type AddressBookSectionProps = {
  enabled?: boolean;
};

export function AddressBookSection({ enabled = true }: AddressBookSectionProps) {
  const [addresses, setAddresses] = useState<AddressDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AddressPayload>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [defaultingId, setDefaultingId] = useState<string | null>(null);

  const loadAddresses = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const list = await listMyAddresses();
      setAddresses(list);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Không thể tải địa chỉ'));
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void loadAddresses();
  }, [loadAddresses]);

  function openCreate() {
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
      isDefault: addresses.length === 0,
    });
    setDialogOpen(true);
  }

  function openEdit(addr: AddressDto) {
    setEditingId(addr.id);
    setForm({
      receiverName: addr.receiverName,
      phone: addr.phone,
      province: addr.province,
      ward: addr.ward ?? '',
      detail: addr.detail,
      addressType: addr.addressType,
      isDefault: addr.isDefault,
      latitude: addr.latitude,
      longitude: addr.longitude,
    });
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.receiverName.trim() || !form.phone.trim() || !form.province.trim() || !form.detail.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    setSubmitting(true);
    try {
      const payload: AddressPayload = {
        receiverName: form.receiverName.trim(),
        phone: form.phone.trim(),
        province: form.province.trim(),
        ward: form.ward?.trim() || undefined,
        detail: form.detail.trim(),
        addressType: form.addressType,
        isDefault: form.isDefault,
        latitude: form.latitude,
        longitude: form.longitude,
      };

      if (editingId) {
        await updateAddress(editingId, payload);
        toast.success('Cập nhật địa chỉ thành công');
      } else {
        await createAddress(payload);
        toast.success('Thêm địa chỉ thành công');
      }
      setDialogOpen(false);
      await loadAddresses();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Lưu địa chỉ thất bại'));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Xóa địa chỉ này?')) return;
    setDeletingId(id);
    try {
      await deleteAddress(id);
      toast.success('Đã xóa địa chỉ');
      await loadAddresses();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Xóa địa chỉ thất bại'));
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSetDefault(id: string) {
    setDefaultingId(id);
    try {
      const list = await setDefaultAddress(id);
      setAddresses(list);
      toast.success('Đã đặt làm địa chỉ mặc định');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Không thể đặt mặt định'));
      await loadAddresses();
    } finally {
      setDefaultingId(null);
    }
  }

  return (
    <section id="addresses" className="rounded-md border border-border bg-bg-elevated p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Địa chỉ</p>
          <h3 className="mt-1 text-lg font-bold text-text-primary">Sổ địa chỉ giao hàng</h3>
        </div>
        <Button type="button" onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Thêm địa chỉ
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : addresses.length === 0 ? (
        <div className="mt-4 space-y-3">
          <StorefrontEmptyState
            className="bg-bg-base"
            title="Chưa có địa chỉ giao hàng"
            description="Thêm địa chỉ để rút ngắn thời gian thanh toán ở những đơn hàng tiếp theo."
          />
          <div className="flex justify-center">
            <Button type="button" onClick={openCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              Thêm địa chỉ
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {addresses.map((addr) => (
            <article
              key={addr.id}
              className={cn(
                'flex flex-col rounded-md border px-4 py-3 transition-all',
                addr.isDefault
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/25 shadow-sm'
                  : 'border-border bg-bg-base hover:border-primary/30',
              )}
            >
              <p className="inline-flex flex-wrap items-center gap-2 text-sm font-semibold text-text-primary">
                <MapPin
                  className={cn('h-4 w-4 shrink-0', addr.isDefault ? 'text-primary' : 'text-text-tertiary')}
                />
                {ADDRESS_TYPE_LABELS[addr.addressType]}
                {addr.isDefault ? (
                  <span className="inline-flex items-center gap-1 rounded-sm bg-primary px-2 py-0.5 text-[11px] font-semibold text-white">
                    <Check className="h-3 w-3" />
                    Mặc định
                  </span>
                ) : null}
              </p>
              <p className="mt-2 text-sm text-text-primary">
                {addr.receiverName} · {addr.phone}
              </p>
              <p className="mt-1 flex-1 text-sm text-text-secondary">{formatAddressLine(addr)}</p>
              <div className="mt-3 flex flex-wrap gap-2 border-t border-border/60 pt-3">
                {addr.isDefault ? (
                  <span className="inline-flex items-center gap-1 rounded-sm bg-primary/15 px-2.5 py-1.5 text-xs font-semibold text-primary">
                    <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                    Đang là địa chỉ mặc định
                  </span>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={defaultingId === addr.id}
                    onClick={() => void handleSetDefault(addr.id)}
                    className="gap-1 text-xs border-primary/40 text-primary hover:bg-primary/10"
                  >
                    {defaultingId === addr.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Star className="h-3 w-3" />
                    )}
                    Đặt mặc định
                  </Button>
                )}
                <Button type="button" variant="outline" size="sm" onClick={() => openEdit(addr)} className="gap-1 text-xs">
                  <Pencil className="h-3 w-3" />
                  Sửa
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={deletingId === addr.id}
                  onClick={() => void handleDelete(addr.id)}
                  className="gap-1 text-xs text-error hover:text-error"
                >
                  {deletingId === addr.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Trash2 className="h-3 w-3" />
                  )}
                  Xóa
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      <AddressFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingId={editingId}
        form={form}
        setForm={setForm}
        submitting={submitting}
        onSubmit={handleSubmit}
      />
    </section>
  );
}

type AddressFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingId: string | null;
  form: AddressPayload;
  setForm: React.Dispatch<React.SetStateAction<AddressPayload>>;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
};

function AddressFormDialog({
  open,
  onOpenChange,
  editingId,
  form,
  setForm,
  submitting,
  onSubmit,
}: AddressFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{editingId ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}</DialogTitle>
          <DialogDescription>
            Thông tin dùng cho giao hàng và thanh toán trên NexaTech.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="addr-receiver">Người nhận *</Label>
              <Input
                id="addr-receiver"
                value={form.receiverName}
                onChange={(e) => setForm((f) => ({ ...f, receiverName: e.target.value }))}
                placeholder="Nguyễn Văn A"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addr-phone">Số điện thoại *</Label>
              <Input
                id="addr-phone"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="09xx xxx xxx"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addr-type">Loại địa chỉ *</Label>
              <select
                id="addr-type"
                value={form.addressType}
                onChange={(e) =>
                  setForm((f) => ({ ...f, addressType: e.target.value as AddressType }))
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {(Object.keys(ADDRESS_TYPE_LABELS) as AddressType[]).map((key) => (
                  <option key={key} value={key}>
                    {ADDRESS_TYPE_LABELS[key]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="addr-province">Tỉnh / Thành phố *</Label>
              <Input
                id="addr-province"
                value={form.province}
                onChange={(e) => setForm((f) => ({ ...f, province: e.target.value }))}
                placeholder="TP. Hồ Chí Minh"
                required
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="addr-ward">Phường / Xã</Label>
              <Input
                id="addr-ward"
                value={form.ward ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, ward: e.target.value }))}
                placeholder="Phường 1"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="addr-detail">Địa chỉ chi tiết *</Label>
              <Input
                id="addr-detail"
                value={form.detail}
                onChange={(e) => setForm((f) => ({ ...f, detail: e.target.value }))}
                placeholder="Số nhà, tên đường"
                required
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={form.isDefault ?? false}
              onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
              className="rounded border-border"
            />
            Đặt làm địa chỉ mặc định
          </label>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? 'Lưu' : 'Thêm'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
