import { z } from 'zod';

export const ExpenseSchema = z.object({
  category: z.number().min(1, 'Category is required'),

  paymentType: z.number().min(1, 'Payment type is required'),

  amount: z.coerce
    .number({
      required_error: 'Amount is required',
      invalid_type_error: 'Amount must be a number',
    })
    .min(1, 'Amount must be greater than 0'),

  description: z.string().min(5, 'Description is required'),
});
