import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Order, PageResponse } from '@/types/order';
import { getMyOrders, getOrderById } from '@/lib/orderApi';

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  totalPages: number;
  totalElements: number;
  currentPage: number;
  loading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  totalPages: 0,
  totalElements: 0,
  currentPage: 0,
  loading: false,
  error: null,
};

export const fetchMyOrders = createAsyncThunk(
  'order/fetchMyOrders',
  async ({ page, size }: { page?: number; size?: number }) => {
    return await getMyOrders(page, size);
  },
);

export const fetchOrderById = createAsyncThunk(
  'order/fetchOrderById',
  async (orderId: string) => {
    return await getOrderById(orderId);
  },
);

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearCurrentOrder(state) {
      state.currentOrder = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action: PayloadAction<PageResponse<Order>>) => {
        state.loading = false;
        state.orders = action.payload.content;
        state.totalPages = action.payload.totalPages;
        state.totalElements = action.payload.totalElements;
        state.currentPage = action.payload.number;
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Lỗi khi tải đơn hàng';
      })
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action: PayloadAction<Order>) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Lỗi khi tải đơn hàng';
      });
  },
});

export const { clearCurrentOrder, clearError } = orderSlice.actions;
export default orderSlice.reducer;
