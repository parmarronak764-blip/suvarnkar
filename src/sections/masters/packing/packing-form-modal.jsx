import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import FormControlLabel from '@mui/material/FormControlLabel';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Field, Form } from 'src/components/hook-form';
import { DynamicFormFields } from 'src/components/dynamic-form-fields';
import { getApiErrorMessage } from 'src/utils/error-handler';

// ----------------------------------------------------------------------

const PackingSchema = z.object({
  material_name: z.string().max(255, 'Material name must be less than 255 characters').optional(),
  material_weight: z.string().optional(),
  material_code: z.string().max(100, 'Material code must be less than 100 characters').optional(),
  remarks: z.string().optional(),
  isBulkEntry: z.boolean().default(false),
});

// ----------------------------------------------------------------------

export function PackingFormModal({
  open,
  onClose,
  currentItem,
  onSave,
  loading = false,
}) {
  const isEdit = Boolean(currentItem);
  const [dynamicItems, setDynamicItems] = useState([
    {
      material_name: '',
      material_weight: '',
      material_code: '',
      remarks: '',
    },
  ]);

  const methods = useForm({
    resolver: zodResolver(PackingSchema),
    defaultValues: {
      material_name: '',
      material_weight: '',
      material_code: '',
      remarks: '',
      isBulkEntry: false,
    },
  });

  const {
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting },
  } = methods;

  const watchedValues = watch();
  const isBulkEntry = watchedValues.isBulkEntry;

  // Initialize dynamic items when bulk entry is toggled
  useEffect(() => {
    if (isBulkEntry && dynamicItems.length === 0) {
      setDynamicItems([
        {
          material_name: '',
          material_weight: '',
          material_code: '',
          remarks: '',
        },
      ]);
    }
  }, [isBulkEntry, dynamicItems.length]);

  // Reset form when modal opens/closes or item changes
  useEffect(() => {
    if (open) {
      if (currentItem) {
        reset({
          material_name: currentItem.material_name || '',
          material_weight: currentItem.material_weight || '',
          material_code: currentItem.material_code || '',
          remarks: currentItem.remarks || '',
          isBulkEntry: false, // Always single entry for editing
        });
        setDynamicItems([
          {
            material_name: '',
            material_weight: '',
            material_code: '',
            remarks: '',
          },
        ]);
      } else {
        reset({
          material_name: '',
          material_weight: '',
          material_code: '',
          remarks: '',
          isBulkEntry: false,
        });
        setDynamicItems([
          {
            material_name: '',
            material_weight: '',
            material_code: '',
            remarks: '',
          },
        ]);
      }
    }
  }, [open, currentItem, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (data.isBulkEntry) {
        // Process bulk entry from dynamic items
        const validItems = dynamicItems.filter(
          (item) => item.material_name?.trim() && item.material_weight?.trim() && item.material_code?.trim()
        );

        if (validItems.length === 0) {
          toast.error('Please fill in all required fields for at least one packing material');
          return;
        }

        // Validate weights are numbers
        const invalidItems = validItems.filter(
          (item) => isNaN(Number(item.material_weight)) || Number(item.material_weight) <= 0
        );
        if (invalidItems.length > 0) {
          toast.error('All material weights must be positive numbers');
          return;
        }

        // Create bulk data object
        const bulkData = {
          isBulkEntry: true,
          packings: validItems.map((item) => ({
            material_name: item.material_name.trim(),
            material_weight: Number(item.material_weight),
            material_code: item.material_code.trim(),
            remarks: item.remarks?.trim() || '',
          })),
        };

        const result = await onSave(bulkData);
        if (result?.success) {
          reset();
          setDynamicItems([
            {
              material_name: '',
              material_weight: '',
              material_code: '',
              remarks: '',
            },
          ]);
          onClose();
        }
      } else {
        // Single entry
        if (!data.material_name || !data.material_name.trim()) {
          toast.error('Please enter a material name');
          return;
        }
        if (!data.material_weight || !data.material_weight.trim()) {
          toast.error('Please enter material weight');
          return;
        }
        if (!data.material_code || !data.material_code.trim()) {
          toast.error('Please enter material code');
          return;
        }
        if (isNaN(Number(data.material_weight)) || Number(data.material_weight) <= 0) {
          toast.error('Material weight must be a positive number');
          return;
        }

        const result = await onSave({
          ...data,
          material_weight: Number(data.material_weight),
        });

        if (result?.success) {
          reset();
          setDynamicItems([
            {
              material_name: '',
              material_weight: '',
              material_code: '',
              remarks: '',
            },
          ]);
          onClose();
        } else {
          toast.error(result?.message || 'Failed to save packing material');
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
      const errorMessage = getApiErrorMessage(null, error, 'Failed to save packing material');
      toast.error(errorMessage);
    }
  });

  const handleClose = () => {
    reset();
    setDynamicItems([{ material_name: '', material_weight: '', material_code: '', remarks: '' }]);
    onClose();
  };

  const title = isEdit ? 'Edit Packing Material' : 'Add Packing Material';

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </Box>
      </DialogTitle>

      <Form methods={methods} onSubmit={onSubmit}>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={3} sx={{ pt: 1 }}>
            {/* Bulk Entry Toggle - Only show for new items */}
            {!isEdit && (
              <FormControlLabel
                control={<Field.Switch name="isBulkEntry" />}
                label="Bulk Entry"
                labelPlacement="start"
                sx={{
                  justifyContent: 'space-between',
                  ml: 0,
                  '& .MuiFormControlLabel-label': {
                    fontWeight: 600,
                  },
                }}
              />
            )}

            {/* Conditional Content Based on Entry Type */}
            {isBulkEntry ? (
              <DynamicFormFields
                title="Packing Materials"
                fields={[
                  {
                    name: 'material_name',
                    label: 'Material Name',
                    type: 'text',
                    defaultValue: '',
                    flex: 2,
                  },
                  {
                    name: 'material_weight',
                    label: 'Weight',
                    type: 'text',
                    defaultValue: '',
                    flex: 1,
                  },
                  {
                    name: 'material_code',
                    label: 'Material Code',
                    type: 'text',
                    defaultValue: '',
                    flex: 1,
                  },
                  {
                    name: 'remarks',
                    label: 'Remarks',
                    type: 'text',
                    defaultValue: '',
                    flex: 1,
                  },
                ]}
                values={dynamicItems}
                onChange={setDynamicItems}
                disabled={isSubmitting}
                minItems={1}
                maxItems={15}
              />
            ) : (
              <>
                <Field.Text
                  name="material_name"
                  label="Material Name"
                  placeholder="Enter material name"
                  required
                />

                <Field.Text
                  name="material_weight"
                  label="Material Weight"
                  placeholder="Enter weight (decimal)"
                  required
                />

                <Field.Text
                  name="material_code"
                  label="Material Code"
                  placeholder="Enter material code"
                  required
                />

                <Field.Text
                  name="remarks"
                  label="Remarks"
                  placeholder="Enter remarks (optional)"
                  multiline
                  rows={3}
                />
              </>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose} variant="outlined" disabled={isSubmitting || loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || loading}
            startIcon={
              isSubmitting || loading ? (
                <Iconify icon="svg-spinners:8-dots-rotate" width={16} />
              ) : (
                <Iconify icon="mingcute:check-line" />
              )
            }
          >
            {isSubmitting || loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
