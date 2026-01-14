import dayjs from 'dayjs';
import { gstRegex } from 'src/auth/utils/regex';
import { z as zod } from 'zod';

// ----------------------------------------------------------------------

export const schemaHelper = {
  /**
   * Phone number
   * Apply for phone number input.
   */
  phoneNumber: (props, isRequired, label = 'Phone number') =>
    zod
      .string({
        required_error: isRequired ? `${label} is required` : undefined,
        // ...props?.message,
      })
      .min(isRequired ? 1 : 0, { message: isRequired ? `${label} is required` : undefined })
      .refine(
        (data) => {
          // For optional, allow empty string
          if (!isRequired && !data && data.trim() === '') return true; // Allow empty string when not required
          // Validate using custom function if provided
          return props?.isValid?.(data);
        },
        {
          message: props?.message?.invalid_type ?? `Invalid ${label}!`,
        }
      )
      .default('')
      // When required, enforce that the field shouldn't be empty
      .pipe(
        isRequired
          ? zod.string().min(1, { message: `${label} is required!` })
          : zod.string().optional()
      ),

  /**
   * Date
   * Apply for date pickers.
   */
  date: (props) =>
    zod.union([zod.string(), zod.number(), zod.date(), zod.null()]).transform((value, ctx) => {
      if (value === null || value === undefined || value === '') {
        ctx.addIssue({
          code: zod.ZodIssueCode.custom,
          message: props?.message?.required ?? 'Date is required!',
        });

        return null;
      }

      const isValid = dayjs(value).isValid();

      if (!isValid) {
        ctx.addIssue({
          code: zod.ZodIssueCode.invalid_date,
          message: props?.message?.invalid_type ?? 'Invalid date!',
        });
      }

      return value;
    }),
  /**
   * Editor
   * defaultValue === '' | <p></p>
   * Apply for editor
   */
  editor: (props) => zod.string().min(8, { message: props?.message ?? 'Content is required!' }),
  /**
   * Nullable Input
   * Apply for input, select... with null value.
   */
  nullableInput: (schema, options) =>
    schema.nullable().transform((val, ctx) => {
      if (val === null || val === undefined) {
        ctx.addIssue({
          code: zod.ZodIssueCode.custom,
          message: options?.message ?? 'Field is required!',
        });
        return val;
      }
      return val;
    }),
  /**
   * Boolean
   * Apply for checkbox, switch...
   */
  boolean: (props) =>
    zod.boolean().refine((val) => val, {
      message: props?.message ?? 'Field is required!',
    }),
  /**
   * Slider
   * Apply for slider with range [min, max].
   */
  sliderRange: (props) =>
    zod
      .number()
      .array()
      .refine((data) => data[0] >= props?.min && data[1] <= props?.max, {
        message: props.message ?? `Range must be between ${props?.min} and ${props?.max}`,
      }),
  /**
   * File
   * Apply for upload single file.
   */
  file: (props) =>
    zod.custom().transform((data, ctx) => {
      const hasFile = data instanceof File || (typeof data === 'string' && !!data.length);

      if (!hasFile) {
        ctx.addIssue({
          code: zod.ZodIssueCode.custom,
          message: props?.message ?? 'File is required!',
        });
        return null;
      }

      return data;
    }),
  /**
   * Files
   * Apply for upload multiple files.
   */
  files: (props) =>
    zod.array(zod.custom()).transform((data, ctx) => {
      const minFiles = props?.minFiles ?? 2;

      if (!data.length) {
        ctx.addIssue({
          code: zod.ZodIssueCode.custom,
          message: props?.message ?? 'Files is required!',
        });
      } else if (data.length < minFiles) {
        ctx.addIssue({
          code: zod.ZodIssueCode.custom,
          message: `Must have at least ${minFiles} items!`,
        });
      }

      return data;
    }),

  gstNumber: (isRequired, label = 'GST number') =>
    zod
      .string({
        required_error: isRequired ? `${label} is required` : undefined,
      })
      .refine(
        (val) => {
          if ((!val || val.trim() === '') && !isRequired) return true; // empty → valid
          return val.length === 15;
        },
        { message: 'GST number must be exactly 15 characters' }
      )
      .refine(
        (val) => {
          if ((!val || val.trim() === '') && !isRequired) return true; // empty → valid
          return gstRegex.test(val);
        },
        { message: 'Invalid GST number' }
      )
      .default('')
      // When required, enforce that the field shouldn't be empty
      .pipe(
        isRequired
          ? zod.string().min(1, { message: `${label} is required!` })
          : zod.string().optional()
      ),
};

// ----------------------------------------------------------------------

/**
 * Test one or multiple values against a Zod schema.
 */
export function testCase(schema, inputs) {
  const textGreen = (text) => `\x1b[32m${text}\x1b[0m`;
  const textRed = (text) => `\x1b[31m${text}\x1b[0m`;
  const textGray = (text) => `\x1b[90m${text}\x1b[0m`;

  inputs.forEach((input) => {
    const result = schema.safeParse(input);
    const type = textGray(`(${typeof input})`);
    const value = JSON.stringify(input);

    const successValue = textGreen(`✅ Valid - ${value}`);
    const errorValue = textRed(`❌ Error - ${value}`);

    if (!result.success) {
      console.info(`${errorValue} ${type}:`, JSON.stringify(result.error.format(), null, 2));
    } else {
      console.info(`${successValue} ${type}:`, JSON.stringify(result.data, null, 2));
    }
  });
}

// Example usage:
// testCase(schemaHelper.boolean(), [true, false, 'true', 'false', '', 1, 0, null, undefined]);

// testCase(schemaHelper.date(), [
//   '2025-04-10',
//   1712736000000,
//   new Date(),
//   '2025-02-30',
//   '04/10/2025',
//   'not-a-date',
//   '',
//   null,
//   undefined,
// ]);

// testCase(
//   schemaHelper.nullableInput(
//     zod
//       .number({ coerce: true })
//       .int()
//       .min(1, { message: 'Age is required!' })
//       .max(80, { message: 'Age must be between 1 and 80' })
//   ),
//   [2, '2', 79, '79', 81, '81', null, undefined]
// );
