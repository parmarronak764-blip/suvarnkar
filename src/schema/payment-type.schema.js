import { z } from 'zod';

export const PaymentTypeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Maximum 100 characters allowed'),

  type: z.enum(['cash', 'bank'], {
    required_error: 'Type is required',
  }),

  balance: z.coerce
    .number()
    .min(1, 'Balance is required')
    .refine((val) => Number(val.toFixed(2)) === val, 'Only up to 2 decimal places allowed'),

  description: z.string().nullable().optional(),
});
