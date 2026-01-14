import { z as zod } from 'zod';
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Switch from '@mui/material/Switch';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Field, Form } from 'src/components/hook-form';
import { getApiErrorMessage } from 'src/utils/error-handler';
import { DynamicFormFields } from 'src/components/dynamic-form-fields';

// ----------------------------------------------------------------------

const MakingChargeSchema = zod.object({
  charge_name: zod
    .string()
    .min(1, { message: 'Charge name is required!' })
    .max(100, { message: 'Charge name must be less than 100 characters!' }),
  charge_code: zod
    .string()
    .min(1, { message: 'Charge code is required!' })
    .max(10, { message: 'Charge code must be less than 10 characters!' }),
  labour_charge: zod.enum(['PER_GRAM', 'PERCENTAGE', 'TOTAL_VALUE'], {
    message: 'Please select a valid labour charge type!',
  }),
  charge_value: zod
    .number()
    .min(1, { message: 'Charge value is required!' })
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
      message: 'Charge value must be a valid positive number!',
    }),
});

const BulkMakingChargeSchema = zod.object({
  makingCharges: zod
    .array(
      zod.object({
        charge_name: zod.string().min(1, { message: 'Charge name is required!' }),
        charge_code: zod.string().min(1, { message: 'Charge code is required!' }),
        labour_charge: zod.enum(['PER_GRAM', 'PERCENTAGE', 'TOTAL_VALUE'], {
          message: 'Please select a valid labour charge type!',
        }),
        charge_value: zod.string().min(1, { message: 'Charge value is required!' }),
      })
    )
    .min(1, { message: 'Please add at least one making charge!' }),
});

// Labour charge options
const LABOUR_CHARGE_OPTIONS = [
  { value: 'PER_GRAM', label: 'Per Gram' },
  { value: 'PERCENTAGE', label: 'Percentage' },
  { value: 'TOTAL_VALUE', label: 'Total Value' },
];

// ----------------------------------------------------------------------

export function MakingChargeFormModal({ open, onClose, currentItem, onSave, loading }) {
  const [isBulkEntry, setIsBulkEntry] = useState(false);

  const isEdit = !!currentItem;

  // Single entry form
  const methods = useForm({
    resolver: zodResolver(MakingChargeSchema),
    defaultValues: {
      charge_name: '',
      charge_code: '',
      labour_charge: 'PER_GRAM',
      charge_value: null,
    },
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  // Bulk entry form
  const bulkMethods = useForm({
    resolver: zodResolver(BulkMakingChargeSchema),
    defaultValues: {
      makingCharges: [
        { charge_name: '', charge_code: '', labour_charge: 'PER_GRAM', charge_value: null },
      ],
    },
  });

  const {
    reset: resetBulk,
    handleSubmit: handleBulkSubmit,
    formState: { isSubmitting: isBulkSubmitting },
  } = bulkMethods;

  // Reset form when modal opens/closes or currentItem changes
  useEffect(() => {
    if (open) {
      if (currentItem) {
        reset({
          charge_name: currentItem.charge_name || '',
          charge_code: currentItem.charge_code || '',
          labour_charge: currentItem.labour_charge || 'PER_GRAM',
          charge_value: currentItem.charge_value ? Number(currentItem.charge_value) : null,
        });
        setIsBulkEntry(false); // Disable bulk entry for edit mode
      } else {
        reset({
          charge_name: '',
          charge_code: '',
          labour_charge: 'PER_GRAM',
          charge_value: null,
        });
      }
      resetBulk({
        makingCharges: [
          { charge_name: '', charge_code: '', labour_charge: 'PER_GRAM', charge_value: null },
        ],
      });
    }
  }, [open, currentItem, reset, resetBulk]);

  // Handle single form submission
  const onSubmit = handleSubmit(async (data) => {
    try {
      const response = await onSave(data);
      if (response.success) {
        onClose();
      } else {
        toast.error(response.message || 'Operation failed!');
      }
    } catch {
      toast.error('Something went wrong!');
    }
  });

  // Handle form validation errors
  const onInvalid = (errors) => {
    const errorMessages = Object.entries(errors).map(
      ([field, error]) => `${field}: ${error.message}`
    );
    toast.error(`Please fix the following errors:\n${errorMessages.join('\n')}`);
  };

  // Handle bulk form submission
  const onBulkSubmit = handleBulkSubmit(async (data) => {
    try {
      // Validate making charges
      const makingCharges = data.makingCharges.filter(
        (mc) => mc.charge_name.trim() && mc.charge_code.trim()
      );

      if (makingCharges.length === 0) {
        toast.error('Please add at least one making charge with valid name and code.');
        return;
      }

      // Check for duplicate codes
      const codes = makingCharges.map((mc) => mc.charge_code.trim());
      const uniqueCodes = [...new Set(codes)];

      if (codes.length !== uniqueCodes.length) {
        toast.error('Duplicate charge codes found. Please remove duplicates.');
        return;
      }

      // Format the data
      const formattedCharges = makingCharges.map((charge) => ({
        charge_name: charge.charge_name.trim(),
        charge_code: charge.charge_code.trim(),
        labour_charge: charge.labour_charge,
        charge_value: parseFloat(charge.charge_value),
      }));

      const response = await onSave({
        isBulkEntry: true,
        makingCharges: formattedCharges,
      });

      if (response.success) {
        const { bulkDetails } = response;

        if (bulkDetails) {
          const successMsg = `Successfully created ${bulkDetails.totalCreated} making charges.${
            bulkDetails.totalExisting > 0 ? ` ${bulkDetails.totalExisting} already existed.` : ''
          }`;
          toast.success(successMsg);
        } else {
          toast.success('Making charges created successfully!');
        }

        onClose();
      } else {
        toast.error(response.message || 'Bulk creation failed!');
      }
    } catch (error) {
      console.error('Bulk form submission error:', error);
      const errorMessage = getApiErrorMessage(null, error, 'Failed to save making charges');
      toast.error(errorMessage);
    }
  });

  // Handle bulk form validation errors
  const onBulkInvalid = (errors) => {
    const errorMessages = Object.entries(errors).map(
      ([field, error]) => `${field}: ${error.message}`
    );
    toast.error(`Please fix the following errors:\n${errorMessages.join('\n')}`);
  };

  // Handle modal close
  const handleClose = () => {
    setIsBulkEntry(false);
    onClose();
  };

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          overflow: 'visible',
          maxHeight: '90vh', // Limit dialog height
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div">
            {isEdit ? 'Edit Making Charge' : 'Add Making Charge'}
          </Typography>

          <Stack direction="row" alignItems="center" spacing={2}>
            {!isEdit && (
              <FormControlLabel
                control={
                  <Switch
                    checked={isBulkEntry}
                    onChange={(e) => setIsBulkEntry(e.target.checked)}
                    color="primary"
                  />
                }
                label="Bulk Entry"
                labelPlacement="start"
                sx={{ mr: 0 }}
              />
            )}

            <IconButton onClick={handleClose} size="small">
              <Iconify icon="mingcute:close-line" />
            </IconButton>
          </Stack>
        </Box>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          overflow: 'auto', // Enable scrolling
          maxHeight: '60vh', // Limit content height to enable scrolling
          minHeight: '200px', // Minimum height for better UX
        }}
      >
        {!isBulkEntry ? (
          // Single Entry Form
          <Form methods={methods} onSubmit={handleSubmit(onSubmit, onInvalid)}>
            <Stack spacing={3}>
              <Field.Text
                name="charge_name"
                label="Charge Name"
                placeholder="Enter charge name (e.g., Simple, Premium)"
                required
              />

              <Field.Text
                name="charge_code"
                label="Charge Code"
                placeholder="Enter unique charge code (e.g., SMP, PMU)"
                required
              />

              <Field.Select name="labour_charge" label="Labour Charge Type" required>
                <MenuItem value="" disabled>
                  Select labour charge type
                </MenuItem>
                {LABOUR_CHARGE_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Field.Select>

              <Field.Text
                name="charge_value"
                label="Charge Value"
                placeholder="Enter charge value"
                type="number"
                inputProps={{ step: '0.01', min: '0' }}
                required
              />
            </Stack>
          </Form>
        ) : (
          // Bulk Entry Form
          <Form methods={bulkMethods} onSubmit={handleBulkSubmit(onBulkSubmit, onBulkInvalid)}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Bulk Making Charges Entry
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Add multiple making charges with individual settings for each entry.
                </Typography>
              </Box>

              <Controller
                name="makingCharges"
                control={bulkMethods.control}
                render={({ field }) => (
                  <DynamicFormFields
                    title="Making Charges"
                    fields={[
                      {
                        name: 'charge_name',
                        label: 'Charge Name',
                        type: 'text',
                        flex: 1,
                      },
                      {
                        name: 'charge_code',
                        label: 'Charge Code',
                        type: 'text',
                        flex: 1,
                      },
                      {
                        name: 'labour_charge',
                        label: 'Labour Charge',
                        type: 'select',
                        flex: 1,
                        options: LABOUR_CHARGE_OPTIONS,
                        defaultValue: 'PER_GRAM',
                      },
                      {
                        name: 'charge_value',
                        label: 'Charge Value',
                        type: 'number',
                        flex: 1,
                        inputProps: { step: '0.01', min: '0' },
                      },
                    ]}
                    values={field.value}
                    onChange={field.onChange}
                    minItems={1}
                    maxItems={20}
                  />
                )}
              />
            </Stack>
          </Form>
        )}
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            disabled={isSubmitting || isBulkSubmitting || loading}
          >
            Cancel
          </Button>

          <LoadingButton
            type="submit"
            variant="contained"
            loading={loading || isSubmitting || isBulkSubmitting}
            onClick={!isBulkEntry ? onSubmit : onBulkSubmit}
            startIcon={
              loading || isSubmitting || isBulkSubmitting ? (
                <Iconify icon="svg-spinners:8-dots-rotate" width={16} />
              ) : (
                <Iconify icon="mingcute:check-line" />
              )
            }
          >
            {loading || isSubmitting || isBulkSubmitting
              ? 'Saving...'
              : isEdit
                ? 'Update'
                : 'Create'}
          </LoadingButton>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
}
