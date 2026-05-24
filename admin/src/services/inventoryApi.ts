import axiosClient from '@/lib/axiosClient'
import { buildQueryParams } from '@/lib/queryParams'
import { unwrapApiEnvelope } from '@/services/apiUtils'
import type { ApiEnvelope } from '@/types/api-envelope'
import type {
  InventoryBulkImportItem,
  InventoryBulkImportResponse,
  InventoryCsvImportResponse,
  InventoryItem,
  InventoryListParams,
  InventoryMovementListParams,
  InventoryMovementPageResponse,
  InventoryPageResponse,
  InventoryUpsertPayload,
  InventoryWarehousePatchPayload,
} from '@/types/catalog'

const INVENTORY_BASE = '/api/v1/inventory'

export async function listInventory(params: InventoryListParams = {}): Promise<InventoryPageResponse> {
  const queryParams = buildQueryParams({
    sku: params.sku,
    status: params.status,
    keyword: params.keyword,
    warehouseLocation: params.warehouseLocation,
    page: params.page,
    size: params.size,
    sort: params.sort,
  })

  const { data } = await axiosClient.get<ApiEnvelope<InventoryPageResponse>>(`${INVENTORY_BASE}/list`, {
    params: queryParams,
  })

  return unwrapApiEnvelope(data, 'Failed to fetch inventory list')
}

export async function getInventoryByProduct(productId: string): Promise<InventoryItem> {
  const { data } = await axiosClient.get<ApiEnvelope<InventoryItem>>(`${INVENTORY_BASE}/${productId}`)
  return unwrapApiEnvelope(data, 'Failed to fetch inventory details')
}

export async function updateInventoryStock(payload: InventoryUpsertPayload): Promise<InventoryItem> {
  const { data } = await axiosClient.put<ApiEnvelope<InventoryItem>>(INVENTORY_BASE, payload)
  return unwrapApiEnvelope(data, 'Failed to update stock')
}

export async function patchInventoryWarehouse(
  productId: string,
  payload: InventoryWarehousePatchPayload
): Promise<InventoryItem> {
  const { data } = await axiosClient.patch<ApiEnvelope<InventoryItem>>(
    `${INVENTORY_BASE}/${productId}/warehouse`,
    payload
  )

  return unwrapApiEnvelope(data, 'Failed to update warehouse info')
}

export async function getLowStockInventory(): Promise<InventoryItem[]> {
  const { data } = await axiosClient.get<ApiEnvelope<InventoryItem[]>>(`${INVENTORY_BASE}/low-stock`)
  return unwrapApiEnvelope(data, 'Failed to fetch low stock inventory')
}

export async function listInventoryMovements(
  productId: string,
  params: InventoryMovementListParams = {}
): Promise<InventoryMovementPageResponse> {
  const queryParams = buildQueryParams({
    page: params.page,
    size: params.size,
    sort: params.sort,
  })

  const { data } = await axiosClient.get<ApiEnvelope<InventoryMovementPageResponse>>(
    `${INVENTORY_BASE}/${productId}/movements`,
    {
      params: queryParams,
    }
  )

  return unwrapApiEnvelope(data, 'Failed to fetch stock movement history')
}

export async function bulkImportInventory(
  payload: InventoryBulkImportItem[]
): Promise<InventoryBulkImportResponse> {
  const { data } = await axiosClient.post<ApiEnvelope<InventoryBulkImportResponse>>(
    `${INVENTORY_BASE}/bulk-import`,
    payload
  )

  return unwrapApiEnvelope(data, 'Failed to import inventory in bulk')
}

export async function importInventoryCsv(file: File): Promise<InventoryCsvImportResponse> {
  const formData = new FormData()
  formData.append('file', file)

  const { data } = await axiosClient.post<ApiEnvelope<InventoryCsvImportResponse>>(
    `${INVENTORY_BASE}/import`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  )

  return unwrapApiEnvelope(data, 'Failed to import inventory CSV')
}
