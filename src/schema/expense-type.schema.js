import { z as zod } from 'zod';

export const createExpenseTypeSchema = () =>
  zod.object({
    name: zod
      .string()
      .min(1, { message: 'Name is required' })
      .max(100, { message: 'Maximum 100 characters allowed' }),
  });

export const ExpenseTypeSchema = createExpenseTypeSchema();
