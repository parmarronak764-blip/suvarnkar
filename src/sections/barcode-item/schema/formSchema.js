import * as zod from 'zod';
import { diamond_details_default_values } from '../const/formInitial';
// ----------------------- SUB FORM SCHEMA -----------------------

const GemstoneDetailsSchema = zod.array(
  zod.object({
    main_type: zod.coerce.number().min(1, 'Main Type is required'),
    sub_type: zod.coerce.number().min(1, 'Sub Type is required'),
    code: zod.string().optional(),
    shape: zod.coerce.number().min(1, 'Shape is required'),
    dimension: zod.coerce.number().optional(),
    carat_weight: zod.coerce
      .number({ invalid_type_error: 'Carat/Wt must be a number' })
      .positive('Carat/Wt must be positive')
      .nonnegative("Carat/Wt can't be negative"),
    rate: zod.coerce
      .number({ invalid_type_error: 'Rate must be a number' })
      .positive('Rate must be positive'),
    amount: zod.coerce
      .number({ invalid_type_error: 'Amount must be a number' })
      .nonnegative("Amount can't be negative"),
    certificate_charges: zod.coerce
      .number({ invalid_type_error: 'Cert.Chrg must be a number' })
      .nonnegative("Cert.Chrg can't be negative"),
    pieces: zod
      .number({ invalid_type_error: 'Pieces must be a number' })
      .int('Pieces must be an integer')
      .nonnegative("Pieces can't be negative"),
  })
);

export const GemstoneSchema = zod.object({
  gemstones: GemstoneDetailsSchema,
});

const DiamondDetailsSchema = zod.object({
  diamond_colour_clarity: zod.coerce
    .number({ required_error: 'Diamond colour clarity is required' })
    .min(1, 'Diamond colour clarity is required'),

  diamond_shape: zod
    .number({ required_error: 'Diamond shape is required' })
    .min(1, 'Diamond shape is required'),

  diamond_size_range: zod
    .number({ required_error: 'Diamond size range is required' })
    .min(1, 'Diamond size range is required'),

  diamond_colour: zod.number().optional().nullable(),

  diamond_certificate: zod.number().optional().nullable(),

  diamond_piece: zod
    .number({
      required_error: 'Diamond piece is required',
      invalid_type_error: 'Diamond piece must be a number',
    })
    .min(1, 'Diamond piece must be at least 1'),

  certificate_number: zod.string().optional().nullable(),

  diamond_details: zod.string().optional().nullable(),

  diamond_weight: zod.coerce
    .number({
      required_error: 'Diamond weight is required',
      invalid_type_error: 'Diamond weight must be a number',
    })
    .min(0.001, 'Diamond weight must be greater than 0'),

  diamond_rate: zod.coerce
    .number({
      required_error: 'Diamond rate is required',
      invalid_type_error: 'Diamond rate must be a number',
    })
    .min(1, 'Diamond rate must be greater than 0!'),

  amount: zod.coerce
    .number({
      invalid_type_error: 'Amount must be a number',
    })
    // .min(0.001, 'Amount must be greater than 0')
    .default(0),
});
const DiamondDetailsArraySchema = zod.array(DiamondDetailsSchema);

export const DiamondDetailsFormSchema = zod.object({
  diamond_details: DiamondDetailsArraySchema,
});

// ---------------------- UNWANTED KEYS IN PAYLOAD ----------------------
export const unwantedKeys = [
  'carat',
  'total_charges',
  'gemstone',
  'gemstone_details_str',
  'huid_details_str',
  'purchase_details_str',
  'total_charges',
  'gemstone_details', // as depends on the gemstone flag
  'net_weight',
  'item_code',
  'success',
  'metal_category_name',
  'having_diamond',
];
// ---------------------- MAIN TAG ITEM SCHEMA ----------------------
export const TagItemSchema = zod
  .object({
    item_code: zod.string().min(1, { message: 'Item code is required!' }),
    quantity: zod
      .number({
        required_error: 'Quantity is required!',
        invalid_type_error: 'Quantity must be a number!',
      })
      .positive({ message: 'Quantity must be greater than 0!' }),
    product_type: zod.coerce.number().min(1, { message: 'Product type is required!' }),

    dealer: zod.coerce.string().min(1, { message: 'Dealer is required!' }),
    dealer_code: zod.string().optional(),
    show_e_showroom: zod.boolean().default(true),
    stock_type: zod.coerce.number().min(1, { message: 'Stock Type is required!' }),
    metal_category: zod.coerce.number().min(1, { message: 'Metal Category is required!' }),
    metal_category_name: zod.coerce.string().optional(),
    box_counter: zod.coerce.number().min(1, { message: 'Box/Counter is required!' }),
    carat: zod.coerce.string().optional(), //.min(1, { message: 'Carat is required!' }), // Not required in payload

    remarks: zod.string().optional(),
    design_code: zod.string().optional(),
    certificate_number: zod.string().optional(),
    gross_weight: zod.coerce
      .number({
        required_error: 'Gross weight is required!',
        invalid_type_error: 'Gross weight must be a number!',
      })
      .positive({ message: 'Gross weight must be greater than 0!' })
      .refine((val) => /^\d+(\.\d{1,3})?$/.test(val.toString()), {
        message: 'Max 3 decimal places allowed!',
      }),

    less_weight: zod.coerce
      .number({
        invalid_type_error: 'Less weight must be a number!',
      })
      .min(0, { message: 'Less weight must be 0 or greater!' })
      .refine((val) => /^\d+(\.\d{1,3})?$/.test(val.toString()), {
        message: 'Max 3 decimal places allowed!',
      })
      .default(0),
    net_weight: zod.coerce
      .number({
        required_error: 'Net weight is required!',
        invalid_type_error: 'Net weight must be a number!',
      })
      .positive({ message: 'Net weight must be greater than 0!' })
      .optional(),
    platinum_net_weight: zod.coerce
      .number({
        required_error: 'Platinum net weight is required!',
        invalid_type_error: 'Platinum net weight must be a number!',
      })
      .min(0.001, { message: 'Platinum net weight must be 0 or greater!' })
      .refine((val) => !val || /^\d+(\.\d{1,3})?$/.test(val.toString()), {
        message: 'Max 3 decimal places allowed!',
      })
      .nullable()
      .optional()
      .default(0),
    wastage_percentage: zod.coerce
      .number({
        invalid_type_error: 'Wastage percentage must be a number!',
      })
      .min(0, { message: 'Wastage percentage must be 0 or greater!' })
      .max(100, { message: 'Wastage percentage must not exceed 100!' })
      .refine((val) => /^\d+(\.\d{1,3})?$/.test(val.toString()), {
        message: 'Max 3 decimal places allowed!',
      })
      .default(0),
    wastage_gram: zod.coerce
      .number({
        invalid_type_error: 'Wastage gram must be a number!',
      })
      .min(0, { message: 'Wastage gram must be 0 or greater!' })
      .refine((val) => /^\d+(\.\d{1,3})?$/.test(val.toString()), {
        message: 'Max 3 decimal places allowed!',
      })
      .default(0),
    wastage_type: zod.enum(['percentage', 'total_amount', 'per_gram']).default('percentage'),
    value: zod
      .number({
        invalid_type_error: 'Percentage must be a number!',
      })
      .min(0, { message: 'Value must be 0 or greater!' })
      .max(100, { message: 'Value must not exceed 100!' })
      .refine((val) => /^\d+(\.\d{1,3})?$/.test(val.toString()), {
        message: 'Max 3 decimal places allowed!',
      })
      .default(0),
    per_gram_value: zod
      .number({
        invalid_type_error: 'Per gram value must be a number!',
      })
      .min(0, { message: 'Per gram value must be 0 or greater!' })
      .refine((val) => /^\d+(\.\d{1,3})?$/.test(val.toString()), {
        message: 'Max 3 decimal places allowed!',
      })
      .default(0),
    size: zod.string().optional(),
    diamond_details: zod.array(DiamondDetailsSchema).optional().nullable().default([]),
    having_diamond: zod.boolean().default(false),
    other_charges: zod
      .array(
        zod.object({
          charge_type: zod.string().min(1, { message: 'Charge type is required!' }),
          charge_amount: zod.coerce
            .number({
              invalid_type_error: 'Charge value must be a number!',
            })
            .min(0, { message: 'Charge value must be 0 or greater!' })
            .refine((val) => !val || /^\d+(\.\d{1,3})?$/.test(val.toString()), {
              message: 'Max 3 decimal places allowed!',
            })
            .optional(),
        })
      )
      .optional()
      .default([]),
    total_charges: zod
      .number({
        invalid_type_error: 'Total charges must be a number!',
      })
      .min(0, { message: 'Total charges must be 0 or greater!' })
      .optional()
      .default(0),

    huid_details: zod.object({}).optional(),
    huid_details_str: zod.string().optional(), //object({}).optional(),

    purchase_details: zod.array(zod.object({})).optional(), /// Object on data === TODO: Array
    purchase_details_str: zod.string().optional(), //.optional(), /// Object on data
    mrp: zod
      .number({
        invalid_type_error: 'MRP must be a number!',
      })
      .min(0, { message: 'MRP must be 0 or greater!' })
      .refine((val) => !val || /^\d+(\.\d{1,3})?$/.test(val.toString()), {
        message: 'Max 3 decimal places allowed!',
      })
      .optional(),
    gemstone: zod.boolean().default(false), // Not to pass in payload
    gemstone_details_str: zod.string().optional(),
    gemstone_details: GemstoneDetailsSchema.default([]),
    // media_ids: zod.array(zod.number()).optional().default([]),
    media_ids: zod.array(zod.any()).optional().default([]),
    // is_variant: zod.boolean().default(false),
    // variants: zod.array(zod.any()).optional().nullable().default([]),
  })
  .superRefine((data, ctx) => {
    if (data.having_diamond) {
      if (!data.diamond_details || data.diamond_details.length === 0) {
        ctx.addIssue({
          path: ['diamond_details'],
          code: zod.ZodIssueCode.custom,
          message: 'At least one diamond detail is required when diamond details are enabled',
        });
      }
    }
    // if (data.is_variant) {
    //   if (!data.variants || data.variants.length === 0) {
    //     ctx.addIssue({
    //       path: ['variants'],
    //       code: zod.ZodIssueCode.custom,
    //       message: 'At least one variant is required.',
    //     });
    //   }
    // }
  });

// All Charges Modal Schema
export const AllChargesSchema = zod.object({
  charges: zod.array(
    zod.object({
      charge_type: zod.string().min(1, { message: 'Charge type is required!' }),
      charge_amount: zod
        .number({
          invalid_type_error: 'Charge value must be a number!',
        })
        .min(0, { message: 'Charge value must be 0 or greater!' })
        .optional(),
    })
  ),
});

export const HuIdDetailsSchema = zod.object({
  huid: zod
    .string()
    .optional()
    .refine((val) => !val || val.length === 6, {
      message: 'HU ID must be exactly 6 characters',
    }),
  huid2: zod
    .string()
    .optional()
    .refine((val) => !val || val.length === 6, {
      message: 'HU ID 2 must be exactly 6 characters',
    }),
  huid3: zod
    .string()
    .optional()
    .refine((val) => !val || val.length === 6, {
      message: 'HU ID 3 must be exactly 6 characters',
    }),
  gram_option_1: zod.coerce.string().optional(),
  gram_option_2: zod.coerce.string().optional(),
});

// Purchase Details Modal Schema
export const PurchaseDetailsSchema = zod.object({
  gold_wastage_charges: zod
    .number({ invalid_type_error: 'Gold wastage charges must be a number!' })
    .min(0, { message: 'Gold wastage charges must be 0 or greater!' })
    .optional(),
  purchase_gold_rate: zod
    .number({ invalid_type_error: 'Purchase gold rate must be a number!' })
    .min(0, { message: 'Purchase gold rate must be 0 or greater!' })
    .optional(),
  gold_purchase_making_charges: zod
    .number({ invalid_type_error: 'Gold purchase making charges must be a number!' })
    .min(0, { message: 'Gold purchase making charges must be 0 or greater!' })
    .optional(),
  gold_purchase_value: zod
    .number({ invalid_type_error: 'Gold purchase value must be a number!' })
    .min(0, { message: 'Gold purchase value must be 0 or greater!' })
    .optional(),
  gold_purchase_mrp: zod
    .number({ invalid_type_error: 'Gold purchase MRP must be a number!' })
    .min(0, { message: 'Gold purchase MRP must be 0 or greater!' })
    .optional(),
  platinum_wastage_charges: zod
    .number({ invalid_type_error: 'Platinum wastage charges must be a number!' })
    .min(0, { message: 'Platinum wastage charges must be 0 or greater!' })
    .optional(),
  purchase_platinum_rate: zod
    .number({ invalid_type_error: 'Purchase platinum rate must be a number!' })
    .min(0, { message: 'Purchase platinum rate must be 0 or greater!' })
    .optional(),
  purchase_making_charges: zod
    .number({ invalid_type_error: 'Purchase making charges must be a number!' })
    .min(0, { message: 'Purchase making charges must be 0 or greater!' })
    .optional(),
  purchase_platinum_value: zod
    .number({ invalid_type_error: 'Purchase platinum value must be a number!' })
    .min(0, { message: 'Purchase platinum value must be 0 or greater!' })
    .optional(),
  purchase_platinum_mrp: zod
    .number({ invalid_type_error: 'Purchase platinum MRP must be a number!' })
    .min(0, { message: 'Purchase platinum MRP must be 0 or greater!' })
    .optional(),
});

// ------------------------------- Diamond Details Form Fields  -------------------------------
export const diamondFields = [
  {
    name: 'diamond_colour_clarity',
    label: 'Color Clarity',
    type: 'select',
    required: true,
    options: [],
    optionValue: 'carat',
    optionLabel: 'carat_name',
  },
  {
    name: 'diamond_shape',
    label: 'Shape',
    type: 'select',
    required: true,
    options: [],
    optionValue: 'id',
    optionLabel: 'name',
  },
  {
    name: 'diamond_size_range',
    label: 'Size Range',
    type: 'select',
    required: true,
    options: [],
    optionValue: 'id',
    optionLabel: 'range_value',
    optionsDependsOn: {
      field_name: 'diamond_shape',
      key: 'name',
      compareKey: 'shape_name',
    },
  },
  {
    name: 'diamond_colour',
    label: 'Color',
    type: 'select',
    options: [],
    optionValue: 'id',
    optionLabel: 'name',
  },
  {
    name: 'diamond_certificate',
    label: 'Certificate Type',
    type: 'select',
    options: [],
    optionValue: 'id',
    optionLabel: 'name',
  },

  {
    name: 'certificate_number',
    label: 'Certificate Number',
    type: 'text',
  },
  {
    name: 'diamond_weight',
    label: 'Weight',
    type: 'number',
    required: true,
    returnType: 'number',
  },
  {
    name: 'diamond_rate',
    label: 'Rate',
    type: 'number',
    required: true,
    returnType: 'number',
  },
  {
    name: 'amount',
    label: 'Amount',
    type: 'number',
    required: true,
    readOnly: true,
    returnType: 'number',
    formula: {
      type: 'multiplication',
      fields: ['diamond_rate', 'diamond_weight'],
    },
  },
  {
    name: 'diamond_details',
    label: 'Details',
    type: 'text',
  },
  {
    name: 'diamond_piece',
    label: 'Piece',
    type: 'number',
    returnType: 'number',
  },
];

// ---------------------------  Tag Variant Item  ---------------------------
export const TagVariantItemSchema = zod.object({
  item_code: zod.string().min(1, { message: 'Item code is required!' }),
  show_e_showroom: zod.boolean().default(true),
  metal_category: zod.coerce.number().min(1, { message: 'Metal Category is required!' }),
  metal_category_name: zod.coerce.string().optional(),
  metal_colour: zod.coerce.number().optional(),
  carat: zod.coerce.string().optional(),
  remarks: zod.string().optional(),
  design_code: zod.string().optional(),
  certificate_number: zod.string().optional(),
  gross_weight: zod.coerce
    .number({
      required_error: 'Gross weight is required!',
      invalid_type_error: 'Gross weight must be a number!',
    })
    .positive({ message: 'Gross weight must be greater than 0!' })
    .refine((val) => /^\d+(\.\d{1,3})?$/.test(val.toString()), {
      message: 'Max 3 decimal places allowed!',
    }),
  less_weight: zod.coerce
    .number({
      invalid_type_error: 'Less weight must be a number!',
    })
    .min(0, { message: 'Less weight must be 0 or greater!' })
    .refine((val) => /^\d+(\.\d{1,3})?$/.test(val.toString()), {
      message: 'Max 3 decimal places allowed!',
    })
    .default(0),
  net_weight: zod.coerce
    .number({
      required_error: 'Net weight is required!',
      invalid_type_error: 'Net weight must be a number!',
    })
    .positive({ message: 'Net weight must be greater than 0!' })
    .optional(),
  platinum_net_weight: zod.coerce
    .number({
      required_error: 'Platinum net weight is required!',
      invalid_type_error: 'Platinum net weight must be a number!',
    })
    .min(0.001, { message: 'Platinum net weight must be 0 or greater!' })
    .refine((val) => !val || /^\d+(\.\d{1,3})?$/.test(val.toString()), {
      message: 'Max 3 decimal places allowed!',
    })
    .nullable()
    .optional()
    .default(0),
  wastage_percentage: zod.coerce
    .number({
      invalid_type_error: 'Wastage percentage must be a number!',
    })
    .min(0, { message: 'Wastage percentage must be 0 or greater!' })
    .max(100, { message: 'Wastage percentage must not exceed 100!' })
    .refine((val) => /^\d+(\.\d{1,3})?$/.test(val.toString()), {
      message: 'Max 3 decimal places allowed!',
    })
    .default(0),
  wastage_gram: zod.coerce
    .number({
      invalid_type_error: 'Wastage gram must be a number!',
    })
    .min(0, { message: 'Wastage gram must be 0 or greater!' })
    .refine((val) => /^\d+(\.\d{1,3})?$/.test(val.toString()), {
      message: 'Max 3 decimal places allowed!',
    })
    .default(0),
  wastage_type: zod.enum(['percentage', 'total_amount', 'per_gram']).default('percentage'),
  value: zod
    .number({
      invalid_type_error: 'Percentage must be a number!',
    })
    .min(0, { message: 'Value must be 0 or greater!' })
    .max(100, { message: 'Value must not exceed 100!' })
    .refine((val) => /^\d+(\.\d{1,3})?$/.test(val.toString()), {
      message: 'Max 3 decimal places allowed!',
    })
    .default(0),
  per_gram_value: zod
    .number({
      invalid_type_error: 'Per gram value must be a number!',
    })
    .min(0, { message: 'Per gram value must be 0 or greater!' })
    .refine((val) => /^\d+(\.\d{1,3})?$/.test(val.toString()), {
      message: 'Max 3 decimal places allowed!',
    })
    .default(0),
  size: zod.string().optional(),
  diamond_details: zod.array(DiamondDetailsSchema).optional().nullable().default([]),
  having_diamond: zod.boolean().default(false),
  other_charges: zod
    .array(
      zod.object({
        charge_type: zod.string().min(1, { message: 'Charge type is required!' }),
        charge_amount: zod.coerce
          .number({
            invalid_type_error: 'Charge value must be a number!',
          })
          .min(0, { message: 'Charge value must be 0 or greater!' })
          .refine((val) => !val || /^\d+(\.\d{1,3})?$/.test(val.toString()), {
            message: 'Max 3 decimal places allowed!',
          })
          .optional(),
      })
    )
    .optional()
    .default([]),
  total_charges: zod
    .number({
      invalid_type_error: 'Total charges must be a number!',
    })
    .min(0, { message: 'Total charges must be 0 or greater!' })
    .refine((val) => !val || /^\d+(\.\d{1,3})?$/.test(val.toString()), {
      message: 'Max 3 decimal places allowed!',
    })
    .optional()
    .default(0),

  huid_details: zod.object({}).optional(),
  huid_details_str: zod.string().optional(), //object({}).optional(),

  purchase_details: zod.array(zod.object({})).optional(), /// Object on data === TODO: Array
  purchase_details_str: zod.string().optional(), //.optional(), /// Object on data
  mrp: zod
    .number({
      invalid_type_error: 'MRP must be a number!',
    })
    .min(0, { message: 'MRP must be 0 or greater!' })
    .refine((val) => !val || /^\d+(\.\d{1,3})?$/.test(val.toString()), {
      message: 'Max 3 decimal places allowed!',
    })
    .optional(),
  gemstone: zod.boolean().default(false), // Not to pass in payload
  gemstone_details_str: zod.string().optional(),
  gemstone_details: GemstoneDetailsSchema.default([]),
});
