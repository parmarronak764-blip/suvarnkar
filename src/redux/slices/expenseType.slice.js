import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from 'src/lib/axios';

/**
 * ============================================================
 * CREATE EXPENSE TYPE
 * ============================================================
 */
export const createExpenseType = createAsyncThunk(
  'expenseType/createExpenseType',
  async (payload, { rejectWithValue }) => {
    console.log(payload, 'dsdfdfdf');
    try {
      const response = await axiosInstance.post('/expenses/categories/', payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create expense type');
    }
  }
);

/**
 * ============================================================
 * GET EXPENSE TYPE LIST
 * ============================================================
 */
export const getExpenseTypes = createAsyncThunk(
  'expenseType/getExpenseTypes',
  async ({ page = 1, page_size = 10 } = {}, { rejectWithValue, getState }) => {
    try {
      const state = getState();

      const companyId = state.user?.selectedCompany?.company?.id;

      const response = await axiosInstance.get(`/expenses/categories/`, {
        params: {
          company_id: companyId,
          page,
          page_size,
        },
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch expense types');
    }
  }
);

/**
 * ============================================================
 * GET EXPENSE TYPE BY ID
 * ============================================================
 */
export const getExpenseTypeById = createAsyncThunk(
  'expenseType/getExpenseTypeById',
  async (typeId, { rejectWithValue, getState }) => {
    try {
      const state = getState();

      const companyId = state.user?.selectedCompany?.company?.id;

      const response = await axiosInstance.get(
        `/expenses/categories/${typeId}/?company_id=${companyId}`
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch expense type');
    }
  }
);

/**
 * ============================================================
 * UPDATE EXPENSE TYPE
 * ============================================================
 */
export const updateExpenseType = createAsyncThunk(
  'expenseType/updateExpenseType',
  async ({ typeId, payload }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/expenses/categories/${typeId}/`, payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update expense type');
    }
  }
);

/**
 * ============================================================
 * DELETE EXPENSE TYPE
 * ============================================================
 */
export const deleteExpenseType = createAsyncThunk(
  'expenseType/deleteExpenseType',
  async (typeId, { rejectWithValue, getState }) => {
    try {
      const state = getState();

      const companyId = state.user?.selectedCompany?.company?.id;

      await axiosInstance.delete(`/expenses/categories/${typeId}/?company_id=${companyId}`);

      return typeId;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to delete expense type');
    }
  }
);

/**
 * ============================================================
 * SLICE
 * ============================================================
 */
const expenseTypeSlice = createSlice({
  name: 'expenseType',

  initialState: {
    loading: false,
    error: null,
    expenseType: null,
    expenseTypes: [],
    count: 0,
    next: null,
    previous: null,
  },

  reducers: {
    clearExpenseType(state) {
      state.expenseType = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // ================= CREATE =================
      .addCase(createExpenseType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createExpenseType.fulfilled, (state, action) => {
        state.loading = false;
        state.expenseType = action.payload;
      })
      .addCase(createExpenseType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ================= GET LIST =================
      .addCase(getExpenseTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getExpenseTypes.fulfilled, (state, action) => {
        state.loading = false;

        state.expenseTypes = action.payload.results;
        state.count = action.payload.count;
        state.next = action.payload.next;
        state.previous = action.payload.previous;
      })
      .addCase(getExpenseTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ================= GET BY ID =================
      .addCase(getExpenseTypeById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getExpenseTypeById.fulfilled, (state, action) => {
        state.loading = false;
        state.expenseType = action.payload;
      })
      .addCase(getExpenseTypeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ================= UPDATE =================
      .addCase(updateExpenseType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExpenseType.fulfilled, (state, action) => {
        state.loading = false;
        state.expenseType = action.payload;
      })
      .addCase(updateExpenseType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ================= DELETE =================
      .addCase(deleteExpenseType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteExpenseType.fulfilled, (state, action) => {
        state.loading = false;

        state.expenseTypes = state.expenseTypes.filter((item) => item.id !== action.payload);

        state.count -= 1;
      })
      .addCase(deleteExpenseType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearExpenseType } = expenseTypeSlice.actions;

export default expenseTypeSlice.reducer;
