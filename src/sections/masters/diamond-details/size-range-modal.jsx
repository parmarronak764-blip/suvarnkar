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
import { useDiamondDetails } from 'src/hooks/useDiamondDetails';
import { DynamicFormFields } from 'src/components/dynamic-form-fields';

// ----------------------------------------------------------------------

const SizeRangeSchema = z.object({
  range_value: z.string().max(100, 'Range value must be less than 100 characters').optional(),
  shape_id: z.number().optional(),
  isBulkEntry: z.boolean().default(false),
});

// ----------------------------------------------------------------------

export function SizeRangeModal({ open, onClose, currentItem, onSave, loading = false }) {
  const isEdit = Boolean(currentItem);
  const [dynamicItems, setDynamicItems] = useState([{ range_value: '', shape_id: 0 }]);

  // Fetch shapes for dropdown
  const { data: shapes, fetchItems: fetchShapes } = useDiamondDetails('shape');

  // Fetch shapes when modal opens
  useEffect(() => {
    if (open) {
      // Fetch all shapes without pagination
      fetchShapes(1, 100, '', 'all', { pagination: false });
    }
  }, [open, fetchShapes]);

  const methods = useForm({
    resolver: zodResolver(SizeRangeSchema),
    defaultValues: {
      range_value: '',
      shape_id: 0,
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
      setDynamicItems([{ range_value: '', shape_id: 0 }]);
    }
  }, [isBulkEntry, dynamicItems.length]);

  // Reset form when modal opens/closes or item changes
  useEffect(() => {
    if (open) {
      if (currentItem) {
        // For editing, find the shape_id from the shapes list if not directly available
        let shapeId = currentItem.shape_id || 0;

        // If shape_id is not available but shape_name is, find it from shapes list
        if (!shapeId && currentItem.shape_name && shapes?.length > 0) {
          const matchingShape = shapes.find(
            (shape) => (shape.name || shape.shape_name) === currentItem.shape_name
          );
          if (matchingShape) {
            shapeId = matchingShape.id;
          }
        }

        reset({
          range_value: currentItem.range_value || '',
          shape_id: shapeId,
          isBulkEntry: false, // Always single entry for editing
        });
      } else {
        reset({
          range_value: '',
          shape_id: 0,
          isBulkEntry: false,
        });
      }
    }
  }, [open, currentItem, reset, shapes]);

  const onSubmit = async (data) => {
    try {
      if (data.isBulkEntry) {
        // Process bulk entry from dynamic items
        const validItems = dynamicItems.filter(
          (item) => item.range_value?.trim() && item.shape_id > 0
        );

        if (validItems.length === 0) {
          toast.error('Please enter at least one valid range value with shape');
          return;
        }

        // Create bulk data object
        const bulkData = {
          ...data,
          range_values: validItems.map((item) => item.range_value.trim()),
          shape_id: validItems[0].shape_id, // Use the first shape_id (all should be same)
        };

        await onSave(bulkData);
      } else {
        // Single entry
        if (!data.range_value || !data.range_value.trim()) {
          toast.error('Please enter a range value');
          return;
        }
        if (!data.shape_id) {
          toast.error('Please select a shape');
          return;
        }
        await onSave(data);
      }

      reset();
      setDynamicItems([{ range_value: '', shape_id: 0 }]);
      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Failed to save size range');
    }
  };

  const handleClose = () => {
    reset();
    setDynamicItems([{ range_value: '', shape_id: 0 }]);
    onClose();
  };

  const title = isEdit ? 'Edit Size Range' : 'Add Size Range';

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
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

      <Form methods={methods} onSubmit={handleSubmit(onSubmit)}>
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
                title="Size Ranges"
                fields={[
                  {
                    name: 'shape_id',
                    label: 'Shape',
                    type: 'select',
                    defaultValue: 0,
                    options:
                      shapes?.map((shape) => ({
                        value: shape.id,
                        label: shape.name || shape.shape_name,
                      })) || [],
                    flex: 1,
                  },
                  {
                    name: 'range_value',
                    label: 'Range Value',
                    type: 'text',
                    defaultValue: '',
                    flex: 2,
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
                <Field.Select name="shape_id" label="Shape" required>
                  <MenuItem value={0} disabled>
                    Select a shape
                  </MenuItem>
                  {shapes?.map((shape) => (
                    <MenuItem key={shape.id} value={shape.id}>
                      {shape.name || shape.shape_name}
                    </MenuItem>
                  ))}
                </Field.Select>

                <Field.Text
                  name="range_value"
                  label="Size Range"
                  placeholder="Enter size range (e.g., 0.01-0.03, 0.50-1.00)"
                  required
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
