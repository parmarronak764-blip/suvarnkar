import { z as zod } from 'zod';

/**
 * Payment Type Schema
 */
export const createPaymentTypeSchema = () =>
  zod.object({
    type: zod.string().min(1, { message: 'Type is required' }),

    balance: zod.number({ invalid_type_error: 'Balance must be a number' }).min(0, {
      message: 'Balance must be at least 0',
    }),

    description: zod.string().nullable().optional(),
  });

export const PaymentTypeSchema = createPaymentTypeSchema();
