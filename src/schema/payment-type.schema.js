import { z } from 'zod';

export const PaymentTypeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Maximum 100 characters allowed'),

  type: z.enum(['cash', 'bank'], {
    required_error: 'Type is required',
  }),

  balance: z
    .number({
      invalid_type_error: 'Balance must be a number!',
    })
    .min(0, { message: 'Balance must be 0 or greater!' })
    .refine((val) => !val || /^\d+(\.\d{1,3})?$/.test(val.toString()), {
      message: 'Max 3 decimal places allowed!',
    }),

  description: z.string().nullable().optional(),
});
