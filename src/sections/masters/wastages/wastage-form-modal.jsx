import { z as zod } from 'zod';
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
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

import { toast } from 'src/components/snackbar';
import { Field, Form } from 'src/components/hook-form';
import { DynamicFormFields } from 'src/components/dynamic-form-fields';

// ----------------------------------------------------------------------

const WastageSchema = zod.object({
  wastage_code: zod
    .string()
    .min(1, { message: 'Wastage code is required!' })
    .max(10, { message: 'Wastage code must be less than 10 characters!' }),
  charge_type: zod.enum(['ADD', 'LESS'], {
    message: 'Please select a valid charge type!',
  }),
  wastage_percentage: zod
    .number({
      required_error: 'Wastage percentage is required!',
      invalid_type_error: 'Wastage percentage must be a number!',
    })
    .min(0, { message: 'Wastage percentage must be at least 0!' })
    .max(100, { message: 'Wastage percentage must not exceed 100!' }),
});

const BulkWastageSchema = zod.object({
  wastages: zod
    .array(
      zod.object({
        wastage_code: zod.string().min(1, { message: 'Wastage code is required!' }),
        charge_type: zod.enum(['ADD', 'LESS'], { message: 'Please select a valid charge type!' }),
        wastage_percentage: zod.string().min(1, { message: 'Wastage percentage is required!' }),
      })
    )
    .min(1, { message: 'Please add at least one wastage!' }),
});

// Charge type options
const CHARGE_TYPE_OPTIONS = [
  { value: 'ADD', label: 'Add' },
  { value: 'LESS', label: 'Less' },
];

// ----------------------------------------------------------------------

export function WastageFormModal({ open, onClose, currentItem, onSave, loading }) {
  const [isBulkEntry, setIsBulkEntry] = useState(false);

  const isEdit = !!currentItem;

  // Single entry form
  const methods = useForm({
    resolver: zodResolver(WastageSchema),
    defaultValues: {
      wastage_code: '',
      charge_type: 'ADD',
      wastage_percentage: 0,
    },
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  // Bulk entry form
  const bulkMethods = useForm({
    resolver: zodResolver(BulkWastageSchema),
    defaultValues: {
      wastages: [{ wastage_code: '', charge_type: 'ADD', wastage_percentage: '' }],
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
          wastage_code: currentItem.wastage_code || '',
          charge_type: currentItem.charge_type || 'ADD',
          wastage_percentage: parseFloat(currentItem.wastage_percentage) || 0,
        });
        setIsBulkEntry(false); // Disable bulk entry for edit mode
      } else {
        reset({
          wastage_code: '',
          charge_type: 'ADD',
          wastage_percentage: 0,
        });
      }
      resetBulk({
        wastages: [{ wastage_code: '', charge_type: 'ADD', wastage_percentage: '' }],
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

  // Handle bulk form submission
  const onBulkSubmit = handleBulkSubmit(async (data) => {
    try {
      // Validate wastages
      const wastages = data.wastages.filter((w) => w.wastage_code.trim());

      if (wastages.length === 0) {
        toast.error('Please add at least one wastage with a valid code.');
        return;
      }

      // Check for duplicate codes
      const codes = wastages.map((w) => w.wastage_code.trim());
      const uniqueCodes = [...new Set(codes)];

      if (codes.length !== uniqueCodes.length) {
        toast.error('Duplicate wastage codes found. Please remove duplicates.');
        return;
      }

      // Format the data
      const formattedWastages = wastages.map((wastage) => ({
        wastage_code: wastage.wastage_code.trim(),
        charge_type: wastage.charge_type,
        wastage_percentage: parseFloat(wastage.wastage_percentage),
      }));

      const response = await onSave({
        isBulkEntry: true,
        wastages: formattedWastages,
      });

      if (response.success) {
        const { bulkDetails } = response;

        if (bulkDetails) {
          const successMsg = `Successfully created ${bulkDetails.totalCreated} wastages.${
            bulkDetails.totalExisting > 0 ? ` ${bulkDetails.totalExisting} already existed.` : ''
          }`;
          toast.success(successMsg);
        } else {
          toast.success('Wastages created successfully!');
        }

        onClose();
      } else {
        toast.error(response.message || 'Bulk creation failed!');
      }
    } catch {
      toast.error('Something went wrong!');
    }
  });

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
        sx: { overflow: 'visible' },
      }}
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">{isEdit ? 'Edit Wastage' : 'Add Wastage'}</Typography>

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
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ overflow: 'visible' }}>
        {!isBulkEntry ? (
          // Single Entry Form
          <Form methods={methods} onSubmit={onSubmit}>
            <Stack spacing={3}>
              <Field.Text
                name="wastage_code"
                label="Wastage Code"
                placeholder="Enter unique wastage code (e.g., WSTG01, WSTG02)"
                InputLabelProps={{ shrink: true }}
              />

              <Field.Select
                name="charge_type"
                label="Charge Type"
                InputLabelProps={{ shrink: true }}
              >
                {CHARGE_TYPE_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Field.Select>

              <Field.Text
                name="wastage_percentage"
                label="Wastage Percentage"
                placeholder="Enter wastage percentage (0.00 to 100.00)"
                type="number"
                inputProps={{ step: '0.01', min: '0', max: '100' }}
                InputLabelProps={{ shrink: true }}
                valueAsNumber
              />
            </Stack>
          </Form>
        ) : (
          // Bulk Entry Form
          <Form methods={bulkMethods} onSubmit={onBulkSubmit}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Bulk Wastages Entry
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Add multiple wastages with individual settings for each entry.
                </Typography>
              </Box>

              <Controller
                name="wastages"
                control={bulkMethods.control}
                render={({ field }) => (
                  <DynamicFormFields
                    title="Wastages"
                    fields={[
                      {
                        name: 'wastage_code',
                        label: 'Wastage Code',
                        type: 'text',
                        flex: 1,
                      },
                      {
                        name: 'charge_type',
                        label: 'Charge Type',
                        type: 'select',
                        flex: 1,
                        options: CHARGE_TYPE_OPTIONS,
                        defaultValue: 'ADD',
                      },
                      {
                        name: 'wastage_percentage',
                        label: 'Wastage %',
                        type: 'number',
                        flex: 1,
                        inputProps: { step: '0.01', min: '0', max: '100' },
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
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>

        <LoadingButton
          type="submit"
          variant="contained"
          loading={loading || isSubmitting || isBulkSubmitting}
          onClick={!isBulkEntry ? onSubmit : onBulkSubmit}
        >
          {isEdit ? 'Update' : 'Create'}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
