import { z as zod } from 'zod';

/**
 * Payment Type Schema
 */
export const createPaymentTypeSchema = () =>
  zod.object({
    name: zod.string().min(1, 'Name is required').max(100, 'Maximum 100 characters allowed'),
    type: zod.enum(['cash', 'bank'], {
      required_error: 'Type is required',
    }),

    balance: zod
      .string()
      .min(1, 'Balance is required')
      .refine((val) => /^\d+(\.\d{1,2})?$/.test(val), 'Only up to 2 decimal places allowed')
      .transform((val) => Number(val)),

    description: zod.string().nullable().optional(),
  });

export const PaymentTypeSchema = createPaymentTypeSchema();
