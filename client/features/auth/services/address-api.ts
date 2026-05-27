import axiosClient from '@/lib/axios-client';
import type { ApiResponse } from '@/types/auth';

const ADDRESS_BASE = '/api/v1/users/me/addresses';

export type AddressType = 'HOME' | 'WORK' | 'OTHER';

export interface AddressDto {
  id: string;
  userId?: string;
  receiverName: string;
  phone: string;
  province: string;
  district?: string;
  ward?: string;
  detail: string;
  latitude?: number;
  longitude?: number;
  addressType: AddressType;
  isDefault: boolean;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

type AddressDtoRaw = Omit<AddressDto, 'isDefault' | 'id'> & {
  id: string | number;
  isDefault?: boolean;
  is_default?: boolean;
  defaultAddress?: boolean;
};

export function normalizeAddress(raw: AddressDtoRaw): AddressDto {
  const isDefault =
    raw.isDefault === true || raw.is_default === true || raw.defaultAddress === true;

  return {
    id: String(raw.id),
    userId: raw.userId,
    receiverName: raw.receiverName,
    phone: raw.phone,
    province: raw.province,
    district: raw.district,
    ward: raw.ward,
    detail: raw.detail,
    latitude: raw.latitude,
    longitude: raw.longitude,
    addressType: raw.addressType,
    isDefault,
    active: raw.active,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

function normalizeList(list: AddressDtoRaw[]): AddressDto[] {
  const normalized = list.map(normalizeAddress);
  const defaultCount = normalized.filter((a) => a.isDefault).length;
  if (defaultCount <= 1) {
    return sortByDefault(normalized);
  }
  const lastDefault = [...normalized].reverse().find((a) => a.isDefault);
  const keepId = lastDefault?.id ?? null;
  return sortByDefault(
    normalized.map((a) => ({
      ...a,
      isDefault: keepId != null && a.id === keepId,
    })),
  );
}

function sortByDefault(list: AddressDto[]): AddressDto[] {
  return [...list].sort((a, b) => {
    if (a.isDefault === b.isDefault) return 0;
    return a.isDefault ? -1 : 1;
  });
}

export interface AddressPayload {
  receiverName: string;
  phone: string;
  province: string;
  district?: string;
  ward?: string;
  detail: string;
  latitude?: number;
  longitude?: number;
  addressType: AddressType;
  isDefault?: boolean;
}

export const ADDRESS_TYPE_LABELS: Record<AddressType, string> = {
  HOME: 'Nhà riêng',
  WORK: 'Cơ quan',
  OTHER: 'Khác',
};

export const DEFAULT_ADDRESS_COORDS = {
  latitude: 10.77692,
  longitude: 106.70092,
};

function assertOk<T>(data: ApiResponse<T>, fallback: string): T {
  if (data.code !== 1000) {
    throw new Error(data.message || fallback);
  }
  return data.result as T;
}

export function formatAddressLine(addr: Pick<AddressDto, 'detail' | 'ward' | 'district' | 'province'>): string {
  return [addr.detail, addr.ward, addr.district, addr.province].filter(Boolean).join(', ');
}

export async function listMyAddresses(): Promise<AddressDto[]> {
  const { data } = await axiosClient.get<ApiResponse<AddressDtoRaw[]>>(ADDRESS_BASE);
  const list = assertOk(data, 'Không thể tải danh sách địa chỉ');
  return list ? normalizeList(list) : [];
}

export async function getMyAddressById(id: string): Promise<AddressDto> {
  const { data } = await axiosClient.get<ApiResponse<AddressDtoRaw>>(`${ADDRESS_BASE}/${id}`);
  const result = assertOk(data, 'Không tìm thấy địa chỉ');
  if (!result) throw new Error('Không tìm thấy địa chỉ');
  return normalizeAddress(result);
}

export async function createAddress(payload: AddressPayload): Promise<AddressDto> {
  const body = {
    ...payload,
    latitude: payload.latitude ?? DEFAULT_ADDRESS_COORDS.latitude,
    longitude: payload.longitude ?? DEFAULT_ADDRESS_COORDS.longitude,
  };
  const { data } = await axiosClient.post<ApiResponse<AddressDtoRaw>>(ADDRESS_BASE, body);
  const result = assertOk(data, 'Không thể thêm địa chỉ');
  if (!result) throw new Error('Không thể thêm địa chỉ');
  return normalizeAddress(result);
}

export async function updateAddress(id: string, payload: AddressPayload): Promise<AddressDto> {
  const body = {
    ...payload,
    latitude: payload.latitude ?? DEFAULT_ADDRESS_COORDS.latitude,
    longitude: payload.longitude ?? DEFAULT_ADDRESS_COORDS.longitude,
  };
  const { data } = await axiosClient.put<ApiResponse<AddressDtoRaw>>(`${ADDRESS_BASE}/${id}`, body);
  const result = assertOk(data, 'Không thể cập nhật địa chỉ');
  if (!result) throw new Error('Không thể cập nhật địa chỉ');
  return normalizeAddress(result);
}

/** PUT /{id}/default — API trả về toàn bộ danh sách đã đồng bộ is_default. */
export async function setDefaultAddress(id: string): Promise<AddressDto[]> {
  const { data } = await axiosClient.put<ApiResponse<AddressDtoRaw[]>>(
    `${ADDRESS_BASE}/${id}/default`,
  );
  const list = assertOk(data, 'Không thể đặt địa chỉ mặc định');
  return list ? normalizeList(list) : [];
}

export async function deleteAddress(id: string): Promise<void> {
  const { data } = await axiosClient.delete<ApiResponse<void>>(`${ADDRESS_BASE}/${id}`);
  assertOk(data, 'Không thể xóa địa chỉ');
}
