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
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Field, Form } from 'src/components/hook-form';

// ----------------------------------------------------------------------

const DiamondFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(1000, 'Name must be less than 1000 characters'), // Increased for bulk entry
  isBulkEntry: z.boolean().default(false),
});

// ----------------------------------------------------------------------

export function DiamondFormModal({
  open,
  onClose,
  currentItem,
  onSave,
  loading = false,
  categoryLabel = 'Diamond Item',
}) {
  const isEdit = Boolean(currentItem);
  const [bulkPreview, setBulkPreview] = useState([]);

  const methods = useForm({
    resolver: zodResolver(DiamondFormSchema),
    defaultValues: {
      name: '',
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
  const nameValue = watchedValues.name;

  // Update bulk preview when name changes in bulk mode
  useEffect(() => {
    if (isBulkEntry && nameValue) {
      const items = nameValue
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
      setBulkPreview(items);
    } else {
      setBulkPreview([]);
    }
  }, [isBulkEntry, nameValue]);

  // Reset form when modal opens/closes or item changes
  useEffect(() => {
    if (open) {
      if (currentItem) {
        reset({
          name: currentItem.name || '',
          isBulkEntry: false, // Always single entry for editing
        });
      } else {
        reset({
          name: '',
          isBulkEntry: false,
        });
      }
      setBulkPreview([]);
    }
  }, [open, currentItem, reset]);

  const onSubmit = async (data) => {
    try {
      if (data.isBulkEntry) {
        // Process bulk entry
        const items = data.name
          .split(',')
          .map((item) => item.trim())
          .filter((item) => item.length > 0);

        if (items.length === 0) {
          toast.error('Please enter at least one item name');
          return;
        }

        // Create bulk data object
        const bulkData = {
          ...data,
          names: items, // Array of names for bulk processing
        };

        await onSave(bulkData);
      } else {
        // Single entry
        await onSave(data);
      }

      reset();
      setBulkPreview([]);
      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Failed to save item');
    }
  };

  const handleClose = () => {
    reset();
    setBulkPreview([]);
    onClose();
  };

  const title = isEdit ? `Edit ${categoryLabel}` : `Add ${categoryLabel}`;

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

            {/* Bulk Entry Instructions */}
            {isBulkEntry && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Bulk Entry:</strong> Enter multiple {categoryLabel.toLowerCase()} names
                  separated by commas. Example: &quot;Red, Blue, Green, Yellow&quot;
                </Typography>
              </Alert>
            )}

            <Field.Text
              name="name"
              label={isBulkEntry ? `${categoryLabel} Names (comma-separated)` : 'Name'}
              placeholder={
                isBulkEntry
                  ? `Enter multiple ${categoryLabel.toLowerCase()} names separated by commas`
                  : `Enter ${categoryLabel.toLowerCase()} name`
              }
              required
              multiline={isBulkEntry}
              rows={isBulkEntry ? 3 : 1}
            />

            {/* Bulk Preview */}
            {isBulkEntry && bulkPreview.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Preview ({bulkPreview.length} items):
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {bulkPreview.map((item, index) => (
                    <Chip
                      key={index}
                      label={item}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                  ))}
                </Box>
              </Box>
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
