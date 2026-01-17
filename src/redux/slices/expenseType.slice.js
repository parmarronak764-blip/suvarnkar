import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from 'src/lib/axios';

/**
 * Create Expense Type
 */
export const createExpenseType = createAsyncThunk(
  'expenseType/createExpenseType',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/expenses/categories/', payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create expense type');
    }
  }
);

/**
 * Get Expense Types
 */
export const getExpenseTypes = createAsyncThunk(
  'expenseType/getExpenseTypes',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState();

      const selectedCompany = state.user?.selectedCompany?.company?.id;

      const response = await axiosInstance.get(
        `/expenses/categories/?company_id=${selectedCompany}`
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch expense types');
    }
  }
);

// ----------------------------------------------------------------------

const expenseTypeSlice = createSlice({
  name: 'expenseType',
  initialState: {
    loading: false,
    error: null,

    // single create/update response
    expenseType: null,

    // list
    expenseTypes: [],

    // pagination
    count: 0,
    next: null,
    previous: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder
      // ---------------- CREATE ----------------
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

      // ---------------- GET LIST ----------------
      .addCase(getExpenseTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getExpenseTypes.fulfilled, (state, action) => {
        state.loading = false;

        // ✅ IMPORTANT FIX
        state.expenseTypes = action.payload.results;

        // pagination
        state.count = action.payload.count;
        state.next = action.payload.next;
        state.previous = action.payload.previous;
      })
      .addCase(getExpenseTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default expenseTypeSlice.reducer;
