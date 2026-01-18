import { z } from 'zod';

export const ExpenseSchema = z.object({
  category: z.number().min(1, 'Category is required'),

  paymentType: z.number().min(1, 'Payment type is required'),

  amount: z
    .number({
      invalid_type_error: 'Amount must be a number!',
    })
    .min(0, { message: 'Amount must be 0 or greater!' })
    .refine((val) => !val || /^\d+(\.\d{1,3})?$/.test(val.toString()), {
      message: 'Max 3 decimal places allowed!',
    }),

  description: z.string().min(5, 'Description is required'),
});
