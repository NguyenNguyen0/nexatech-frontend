import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Payment } from '@/types/payment';
import type { PageResponse } from '@/types/api';
import { getMyPayments, getPaymentById } from '@/lib/paymentApi';

interface PaymentState {
  payments: Payment[];
  currentPayment: Payment | null;
  totalPages: number;
  totalElements: number;
  currentPage: number;
  loading: boolean;
  error: string | null;
}

const initialState: PaymentState = {
  payments: [],
  currentPayment: null,
  totalPages: 0,
  totalElements: 0,
  currentPage: 0,
  loading: false,
  error: null,
};

export const fetchMyPayments = createAsyncThunk(
  'payment/fetchMyPayments',
  async ({ page, size }: { page?: number; size?: number }) => {
    return await getMyPayments(page, size);
  },
);

export const fetchPaymentById = createAsyncThunk(
  'payment/fetchPaymentById',
  async (paymentId: string) => {
    return await getPaymentById(paymentId);
  },
);

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    clearCurrentPayment(state) {
      state.currentPayment = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyPayments.fulfilled, (state, action: PayloadAction<PageResponse<Payment>>) => {
        state.loading = false;
        state.payments = action.payload.content;
        state.totalPages = action.payload.totalPages;
        state.totalElements = action.payload.totalElements;
        state.currentPage = action.payload.page;
      })
      .addCase(fetchMyPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Lỗi khi tải lịch sử thanh toán';
      })
      .addCase(fetchPaymentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentById.fulfilled, (state, action: PayloadAction<Payment>) => {
        state.loading = false;
        state.currentPayment = action.payload;
      })
      .addCase(fetchPaymentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Lỗi khi tải chi tiết thanh toán';
      });
  },
});

export const { clearCurrentPayment, clearError } = paymentSlice.actions;
export default paymentSlice.reducer;
