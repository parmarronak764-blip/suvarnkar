import { z } from 'zod';

export const ExpenseTypeSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Name is required' })
    .max(100, { message: 'Maximum 100 characters allowed' }),
});
