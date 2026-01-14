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

// ----------------------------------------------------------------------

const CertificateTypeSchema = z.object({
  name: z.string().max(100, 'Name must be less than 100 characters').optional(),
  isBulkEntry: z.boolean().default(false),
});

// ----------------------------------------------------------------------

export function CertificateTypeModal({ open, onClose, currentItem, onSave, loading = false }) {
  const isEdit = Boolean(currentItem);
  const [dynamicItems, setDynamicItems] = useState([{ name: '' }]);

  const methods = useForm({
    resolver: zodResolver(CertificateTypeSchema),
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

  // Initialize dynamic items when bulk entry is toggled
  useEffect(() => {
    if (isBulkEntry && dynamicItems.length === 0) {
      setDynamicItems([{ name: '' }]);
    }
  }, [isBulkEntry, dynamicItems.length]);

  // Reset form when modal opens/closes or item changes
  useEffect(() => {
    if (open) {
      if (currentItem) {
        reset({
          name: currentItem.name || '',
          isBulkEntry: false, // Always single entry for editing
        });
        setDynamicItems([{ name: '' }]);
      } else {
        reset({
          name: '',
          isBulkEntry: false,
        });
        setDynamicItems([{ name: '' }]);
      }
    }
  }, [open, currentItem, reset]);

  const onSubmit = async (data) => {
    try {
      if (data.isBulkEntry) {
        // Process bulk entry from dynamic items
        const validItems = dynamicItems.filter((item) => item.name?.trim());

        if (validItems.length === 0) {
          toast.error('Please enter at least one certificate type name');
          return;
        }

        // Create bulk data object
        const bulkData = {
          ...data,
          names: validItems.map((item) => item.name.trim()),
        };

        await onSave(bulkData);
      } else {
        // Single entry
        if (!data.name || !data.name.trim()) {
          toast.error('Please enter a certificate type name');
          return;
        }
        await onSave(data);
      }

      reset();
      setDynamicItems([{ name: '' }]);
      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Failed to save certificate type');
    }
  };

  const handleClose = () => {
    reset();
    setDynamicItems([{ name: '' }]);
    onClose();
  };

  const title = isEdit ? 'Edit Certificate Type' : 'Add Certificate Type';

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
                title="Certificate Types"
                fields={[
                  {
                    name: 'name',
                    label: 'Certificate Type Name',
                    type: 'text',
                    defaultValue: '',
                  },
                ]}
                values={dynamicItems}
                onChange={setDynamicItems}
                disabled={isSubmitting}
                minItems={1}
                maxItems={20}
              />
            ) : (
              <Field.Text
                name="name"
                label="Certificate Type Name"
                placeholder="Enter certificate type name (e.g., GIA, IGI, SSEF)"
                required
              />
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
