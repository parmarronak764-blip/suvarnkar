import { createSlice, createAsyncThunk, current } from '@reduxjs/toolkit';
import axiosInstance from 'src/lib/axios';

export const getExpenseById = createAsyncThunk(
  'expense/getExpenseById',
  async ({ id, company_id }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/expenses/${id}/`, {
        params: { company_id },
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch expense');
    }
  }
);

/**
 * CREATE Expense API
 */
export const createExpense = createAsyncThunk(
  'expense/createExpense',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/expenses/', payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create expense');
    }
  }
);

/**
 * GET Expenses API (with filters)
 */
export const getExpenses = createAsyncThunk(
  'expense/getExpenses',
  async (params, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/expenses/', {
        params,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch expenses');
    }
  }
);

export const updateExpenseById = createAsyncThunk(
  'expense/updateExpenseById',
  async ({ id, company_id, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/expenses/${id}/`, data, {
        params: { company_id },
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update expense');
    }
  }
);

/**
 * Delete Expense API
 * DELETE /expenses/{id}/
 * body: { company_id }
 */
export const deleteExpense = createAsyncThunk(
  'expense/deleteExpense',
  async ({ id, company_id }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/expenses/${id}/`, {
        data: { company_id }, // 👈 axios delete body
      });

      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to delete expense');
    }
  }
);

const expenseSlice = createSlice({
  name: 'expense',
  initialState: {
    loading: false,
    error: null,

    // create
    expenseById: null,

    // list
    expenses: [],
    pagination: {
      count: 0,
      page: 1,
      page_size: 10,
    },
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ---------------- CREATE ----------------
      .addCase(createExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createExpense.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses.unshift(action.payload);
      })
      .addCase(createExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ---------------- GET ----------------
      .addCase(getExpenses.pending, (state) => {
        state.loading = true;
      })
      .addCase(getExpenses.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = action.payload.results;
        state.pagination.count = action.payload.count;
      })
      .addCase(getExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getExpenseById.pending, (state) => {
        state.loading = true;
        state.expenseById = null;
      })
      .addCase(getExpenseById.fulfilled, (state, action) => {
        state.loading = false;
        state.expenseById = action.payload;
      })
      .addCase(getExpenseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateExpenseById.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateExpenseById.fulfilled, (state, action) => {
        state.loading = false;

        state.expenseById = {
          ...state.expenseById,
          ...action.payload,
        };
      })

      .addCase(updateExpenseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // ---------------- DELETE ----------------
      .addCase(deleteExpense.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = state.expenses.filter((item) => item.id !== action.payload.id);
      })
      .addCase(deleteExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default expenseSlice.reducer;
