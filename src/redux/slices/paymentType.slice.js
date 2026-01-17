import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from 'src/lib/axios';

/**
 * ============================================================
 * CREATE PAYMENT TYPE
 * ============================================================
 */
export const createPaymentType = createAsyncThunk(
  'paymentType/createPaymentType',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/expenses/payment-types/', payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create payment type');
    }
  }
);

/**
 * ============================================================
 * GET PAYMENT TYPES LIST
 * ============================================================
 */
export const getPaymentTypes = createAsyncThunk(
  'paymentType/getPaymentTypes',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const companyId = state.user?.selectedCompany?.company?.id;

      const response = await axiosInstance.get(`/expenses/payment-types/?company_id=${companyId}`);

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch payment types');
    }
  }
);

/**
 * ============================================================
 * GET PAYMENT TYPE BY ID
 * ============================================================
 */
export const getPaymentTypeById = createAsyncThunk(
  'paymentType/getPaymentTypeById',
  async (typeId, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const companyId = state.user?.selectedCompany?.company?.id;

      const response = await axiosInstance.get(
        `/expenses/payment-types/${typeId}/?company_id=${companyId}`
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch payment type');
    }
  }
);

/**
 * ============================================================
 * UPDATE PAYMENT TYPE
 * ============================================================
 */
export const updatePaymentType = createAsyncThunk(
  'paymentType/updatePaymentType',
  async ({ typeId, payload }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/expenses/payment-types/${typeId}/`, payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update payment type');
    }
  }
);

/**
 * ============================================================
 * DELETE PAYMENT TYPE
 * ============================================================
 */
export const deletePaymentType = createAsyncThunk(
  'paymentType/deletePaymentType',
  async (typeId, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const companyId = state.user?.selectedCompany?.company?.id;

      await axiosInstance.delete(`/expenses/payment-types/${typeId}/?company_id=${companyId}`);

      return typeId;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to delete payment type');
    }
  }
);

/**
 * ============================================================
 * SLICE
 * ============================================================
 */
const paymentTypeSlice = createSlice({
  name: 'paymentType',

  initialState: {
    loading: false,
    error: null,

    paymentType: null,
    paymentTypes: [],

    count: 0,
    next: null,
    previous: null,
  },

  reducers: {
    clearPaymentType(state) {
      state.paymentType = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // CREATE
      .addCase(createPaymentType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPaymentType.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentType = action.payload;
      })
      .addCase(createPaymentType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // LIST
      .addCase(getPaymentTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPaymentTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentTypes = action.payload.results;
        state.count = action.payload.count;
        state.next = action.payload.next;
        state.previous = action.payload.previous;
      })
      .addCase(getPaymentTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // GET BY ID
      .addCase(getPaymentTypeById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPaymentTypeById.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentType = action.payload;
      })
      .addCase(getPaymentTypeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // UPDATE
      .addCase(updatePaymentType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePaymentType.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentType = action.payload;
      })
      .addCase(updatePaymentType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // DELETE
      .addCase(deletePaymentType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePaymentType.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentTypes = state.paymentTypes.filter((item) => item.id !== action.payload);
        state.count -= 1;
      })
      .addCase(deletePaymentType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearPaymentType } = paymentTypeSlice.actions;

export default paymentTypeSlice.reducer;
