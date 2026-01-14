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
import MenuItem from '@mui/material/MenuItem';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Field, Form } from 'src/components/hook-form';
import { DynamicFormFields } from 'src/components/dynamic-form-fields';
import { getApiErrorMessage } from 'src/utils/error-handler';

// ----------------------------------------------------------------------

const OfferSchema = z.object({
  name: z.string().max(255, 'Name must be less than 255 characters').optional(),
  applied_on: z.enum(['MRP', 'MAKING_CHARGE']).optional(),
  offer_type: z.enum(['PERCENTAGE', 'RUPEE_PER_GRAM']).optional(),
  value: z.string().optional(),
  isBulkEntry: z.boolean().default(false),
});

// ----------------------------------------------------------------------

export function OfferFormModal({ open, onClose, currentItem, onSave, loading = false }) {
  const isEdit = Boolean(currentItem);
  const [dynamicItems, setDynamicItems] = useState([
    {
      name: '',
      applied_on: 'MRP',
      offer_type: 'PERCENTAGE',
      value: '',
    },
  ]);

  const methods = useForm({
    resolver: zodResolver(OfferSchema),
    defaultValues: {
      name: '',
      applied_on: 'MRP',
      offer_type: 'PERCENTAGE',
      value: '',
      isBulkEntry: false,
    },
  });

  const {
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isSubmitting },
  } = methods;

  const watchedValues = watch();
  const isBulkEntry = watchedValues.isBulkEntry;
  const appliedOn = watchedValues.applied_on;

  // Initialize dynamic items when bulk entry is toggled
  useEffect(() => {
    if (isBulkEntry && dynamicItems.length === 0) {
      setDynamicItems([
        {
          name: '',
          applied_on: 'MRP',
          offer_type: 'PERCENTAGE',
          value: '',
        },
      ]);
    }
  }, [isBulkEntry, dynamicItems.length]);

  // Handle conditional dropdown logic for single entry
  useEffect(() => {
    if (!isBulkEntry && appliedOn === 'MRP') {
      // If MRP is selected, force offer_type to PERCENTAGE
      setValue('offer_type', 'PERCENTAGE');
    }
  }, [appliedOn, isBulkEntry, setValue]);

  // Handle conditional dropdown logic for bulk entry
  const handleDynamicItemsChange = (updatedItems) => {
    const processedItems = updatedItems.map((item, index) => {
      // If applied_on is MRP, force offer_type to PERCENTAGE
      if (item.applied_on === 'MRP' && item.offer_type !== 'PERCENTAGE') {
        // This should rarely happen now since the dropdown will hide invalid options
        // But we keep this as a safety check
        return {
          ...item,
          offer_type: 'PERCENTAGE',
        };
      }
      return item;
    });
    setDynamicItems(processedItems);
  };

  // Create dynamic fields with conditional options for bulk entry
  const getDynamicFields = () => [
    {
      name: 'name',
      label: 'Offer Name',
      type: 'text',
      defaultValue: '',
      flex: 2,
    },
    {
      name: 'applied_on',
      label: 'Applied On',
      type: 'select',
      defaultValue: 'MRP',
      options: [
        { value: 'MRP', label: 'MRP' },
        { value: 'MAKING_CHARGE', label: 'Making Charge' },
      ],
      flex: 1,
    },
    {
      name: 'offer_type',
      label: 'Offer Type',
      type: 'select',
      defaultValue: 'PERCENTAGE',
      options: (item) => getOfferTypeOptions(item.applied_on),
      flex: 1,
    },
    {
      name: 'value',
      label: 'Value',
      type: 'text',
      defaultValue: '',
      flex: 1,
    },
  ];

  // Get available offer type options based on applied_on value
  const getOfferTypeOptions = (appliedOnValue) => {
    if (appliedOnValue === 'MRP') {
      return [{ value: 'PERCENTAGE', label: 'Percentage' }];
    }
    return [
      { value: 'PERCENTAGE', label: 'Percentage' },
      { value: 'RUPEE_PER_GRAM', label: 'Rupee Per Gram' },
    ];
  };

  // Reset form when modal opens/closes or item changes
  useEffect(() => {
    if (open) {
      if (currentItem) {
        reset({
          name: currentItem.name || '',
          applied_on: currentItem.applied_on || 'MRP',
          offer_type: currentItem.offer_type || 'PERCENTAGE',
          value: currentItem.value || '',
          isBulkEntry: false, // Always single entry for editing
        });
        setDynamicItems([
          {
            name: '',
            applied_on: 'MRP',
            offer_type: 'PERCENTAGE',
            value: '',
          },
        ]);
      } else {
        reset({
          name: '',
          applied_on: 'MRP',
          offer_type: 'PERCENTAGE',
          value: '',
          isBulkEntry: false,
        });
        setDynamicItems([
          {
            name: '',
            applied_on: 'MRP',
            offer_type: 'PERCENTAGE',
            value: '',
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
          (item) => item.name?.trim() && item.applied_on && item.offer_type && item.value?.trim()
        );

        if (validItems.length === 0) {
          toast.error('Please fill in all fields for at least one offer');
          return;
        }

        // Create bulk data object
        const bulkData = {
          isBulkEntry: true,
          offers: validItems.map((item) => ({
            name: item.name.trim(),
            applied_on: item.applied_on,
            offer_type: item.offer_type,
            value: item.value.trim(),
          })),
        };

        const result = await onSave(bulkData);

        if (result?.success) {
          reset();
          setDynamicItems([
            {
              name: '',
              applied_on: 'MRP',
              offer_type: 'PERCENTAGE',
              value: '',
            },
          ]);
          onClose();
        }
      } else {
        // Single entry
        if (!data.name || !data.name.trim()) {
          toast.error('Please enter an offer name');
          return;
        }
        if (!data.applied_on) {
          toast.error('Please select applied on');
          return;
        }
        if (!data.offer_type) {
          toast.error('Please select offer type');
          return;
        }
        if (!data.value || !data.value.trim()) {
          toast.error('Please enter a value');
          return;
        }
        if (isNaN(Number(data.value)) || Number(data.value) <= 0) {
          toast.error('Value must be a positive number');
          return;
        }

        const result = await onSave(data);

        if (result?.success) {
          reset();
          setDynamicItems([
            {
              name: '',
              applied_on: 'MRP',
              offer_type: 'PERCENTAGE',
              value: '',
            },
          ]);
          onClose();
        } else {
          toast.error(result?.message || 'Failed to save offer');
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
      const errorMessage = getApiErrorMessage(null, error, 'Failed to save offer');
      toast.error(errorMessage);
    }
  });

  const handleClose = () => {
    reset();
    setDynamicItems([{ name: '' }]);
    onClose();
  };

  const title = isEdit ? 'Edit Offer' : 'Add Offer';

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
                title="Offers"
                fields={getDynamicFields()}
                values={dynamicItems}
                onChange={handleDynamicItemsChange}
                disabled={isSubmitting}
                minItems={1}
                maxItems={15}
              />
            ) : (
              <>
                <Field.Text
                  name="name"
                  label="Offer Name"
                  placeholder="Enter offer name"
                  required
                />

                <Field.Select name="applied_on" label="Applied On" required>
                  <MenuItem value="MRP">MRP</MenuItem>
                  <MenuItem value="MAKING_CHARGE">Making Charge</MenuItem>
                </Field.Select>

                <Field.Select name="offer_type" label="Offer Type" required>
                  {getOfferTypeOptions(appliedOn).map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Field.Select>

                <Field.Text name="value" label="Value" placeholder="Enter offer value" required />
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
