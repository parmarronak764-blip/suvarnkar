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

const LessTypeSchema = zod.object({
  less_type_name: zod.string().min(1, { message: 'Less type name is required!' }),
  variation_type: zod.enum(['ADD', 'LESS'], {
    message: 'Please select a variation type!',
  }),
  variation_percentage: zod
    .number({
      required_error: 'Variation percentage is required!',
      invalid_type_error: 'Variation percentage must be a number!',
    })
    .min(0, { message: 'Variation percentage must be at least 0!' })
    .max(100, { message: 'Variation percentage must not exceed 100!' }),
});

const BulkLessTypeSchema = zod.object({
  lessTypes: zod
    .array(
      zod.object({
        less_type_name: zod.string().min(1, { message: 'Less type name is required!' }),
        variation_type: zod.enum(['ADD', 'LESS'], {
          message: 'Please select a valid variation type!',
        }),
        variation_percentage: zod.string().min(1, { message: 'Variation percentage is required!' }),
      })
    )
    .min(1, { message: 'Please add at least one less type!' }),
});

// Variation type options
const VARIATION_TYPE_OPTIONS = [
  { value: 'ADD', label: 'Add' },
  { value: 'LESS', label: 'Less' },
];

// ----------------------------------------------------------------------

export function LessTypeFormModal({ open, onClose, currentItem, onSave, loading }) {
  const [isBulkEntry, setIsBulkEntry] = useState(false);

  const isEdit = !!currentItem;

  // Single entry form
  const methods = useForm({
    resolver: zodResolver(LessTypeSchema),
    defaultValues: {
      less_type_name: '',
      variation_type: 'ADD',
      variation_percentage: 0,
    },
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  // Bulk entry form
  const bulkMethods = useForm({
    resolver: zodResolver(BulkLessTypeSchema),
    defaultValues: {
      lessTypes: [{ less_type_name: '', variation_type: 'ADD', variation_percentage: '' }],
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
          less_type_name: currentItem.less_type_name || '',
          variation_type: currentItem.variation_type || 'ADD',
          variation_percentage: parseFloat(currentItem.variation_percentage) || 0,
        });
      } else {
        reset({
          less_type_name: '',
          variation_type: 'ADD',
          variation_percentage: 0,
        });
      }
      resetBulk({
        lessTypes: [{ less_type_name: '', variation_type: 'ADD', variation_percentage: '' }],
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
        toast.error(response.message || 'Failed to save less type!');
      }
    } catch {
      toast.error('Something went wrong!');
    }
  });

  // Handle bulk form submission
  const onBulkSubmit = handleBulkSubmit(async (data) => {
    try {
      // Validate less types
      const lessTypes = data.lessTypes.filter((lt) => lt.less_type_name.trim());

      if (lessTypes.length === 0) {
        toast.error('Please add at least one less type with a valid name.');
        return;
      }

      // Check for duplicate names
      const names = lessTypes.map((lt) => lt.less_type_name.trim().toLowerCase());
      const uniqueNames = [...new Set(names)];

      if (names.length !== uniqueNames.length) {
        toast.error('Duplicate less type names found. Please remove duplicates.');
        return;
      }

      // Format the data
      const formattedLessTypes = lessTypes.map((lessType) => ({
        less_type_name: lessType.less_type_name.trim(),
        variation_type: lessType.variation_type,
        variation_percentage: parseFloat(lessType.variation_percentage),
      }));

      const response = await onSave({
        isBulkEntry: true,
        lessTypes: formattedLessTypes,
      });

      if (response.success) {
        const { bulkDetails } = response;
        if (bulkDetails && (bulkDetails.created_less_types || bulkDetails.existing_less_types)) {
          const created = bulkDetails.created_less_types?.length || 0;
          const existing = bulkDetails.existing_less_types?.length || 0;
          const successMsg = `Success! Created: ${created}, Already existed: ${existing}`;
          toast.success(successMsg);
        } else {
          toast.success('Less types created successfully!');
        }

        onClose();
      } else {
        toast.error(response.message || 'Bulk creation failed!');
      }
    } catch {
      toast.error('Something went wrong!');
    }
  });

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
          <Typography variant="h6">{isEdit ? 'Edit Less Type' : 'Add Less Type'}</Typography>

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
                name="less_type_name"
                label="Less Type Name"
                placeholder="Enter less type name (e.g., Stone, Moti)"
                InputLabelProps={{ shrink: true }}
              />

              <Field.Select
                name="variation_type"
                label="Variation Type"
                InputLabelProps={{ shrink: true }}
              >
                {VARIATION_TYPE_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Field.Select>

              <Field.Text
                name="variation_percentage"
                label="Variation Percentage"
                placeholder="Enter variation percentage (0.00 to 100.00)"
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
                  Bulk Less Types Entry
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Add multiple less types with individual settings for each entry.
                </Typography>
              </Box>

              <Controller
                name="lessTypes"
                control={bulkMethods.control}
                render={({ field }) => (
                  <DynamicFormFields
                    title="Less Types"
                    fields={[
                      {
                        name: 'less_type_name',
                        label: 'Less Type Name',
                        type: 'text',
                        flex: 1,
                      },
                      {
                        name: 'variation_type',
                        label: 'Variation Type',
                        type: 'select',
                        flex: 1,
                        options: VARIATION_TYPE_OPTIONS,
                        defaultValue: 'ADD',
                      },
                      {
                        name: 'variation_percentage',
                        label: 'Variation %',
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
          loading={isSubmitting || isBulkSubmitting || loading}
          onClick={!isBulkEntry ? onSubmit : onBulkSubmit}
        >
          {isEdit ? 'Update' : 'Create'}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
