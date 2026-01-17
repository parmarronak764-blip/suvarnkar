import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from 'src/lib/axios';

/**
 * Create Expense API
 */
export const createExpense = createAsyncThunk(
  'expense/createExpense',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/expenses', payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create expense');
    }
  }
);

const expenseSlice = createSlice({
  name: 'expense',
  initialState: {
    loading: false,
    error: null,
    expense: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createExpense.fulfilled, (state, action) => {
        state.loading = false;
        state.expense = action.payload;
      })
      .addCase(createExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default expenseSlice.reducer;
