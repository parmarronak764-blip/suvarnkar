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

const CustomerGroupSchema = z.object({
  group_name: z.string().max(255, 'Group name must be less than 255 characters').optional(),
  isBulkEntry: z.boolean().default(false),
});

// ----------------------------------------------------------------------

export function CustomerGroupFormModal({ open, onClose, currentItem, onSave, loading = false }) {
  const isEdit = Boolean(currentItem);
  const [dynamicItems, setDynamicItems] = useState([
    {
      group_name: '',
    },
  ]);

  const methods = useForm({
    resolver: zodResolver(CustomerGroupSchema),
    defaultValues: {
      group_name: '',
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
          group_name: '',
        },
      ]);
    }
  }, [isBulkEntry, dynamicItems.length]);

  // Reset form when modal opens/closes or item changes
  useEffect(() => {
    if (open) {
      if (currentItem) {
        reset({
          group_name: currentItem.group_name || '',
          isBulkEntry: false,
        });
      } else {
        reset({
          group_name: '',
          isBulkEntry: false,
        });
        setDynamicItems([
          {
            group_name: '',
          },
        ]);
      }
    }
  }, [open, currentItem, reset]);

  const onSubmit = async (data) => {
    try {
      if (data.isBulkEntry) {
        // Process bulk entry from dynamic items
        const validItems = dynamicItems.filter((item) => item.group_name?.trim());

        if (validItems.length === 0) {
          toast.error('Please fill in at least one group name');
          return;
        }

        // Check for duplicate names within the form
        const names = validItems.map((item) => item.group_name.trim());
        const uniqueNames = [...new Set(names)];

        if (names.length !== uniqueNames.length) {
          toast.error('Duplicate group names found. Please remove duplicates before submitting.');
          return;
        }

        // Create bulk data object
        const bulkData = {
          ...data,
          names: names,
        };

        const response = await onSave(bulkData);

        if (response && !response.success) {
          // Show error message and don't close modal
          toast.error(response.message || 'Failed to create customer groups');
          return;
        }

        // Handle bulk response details
        if (response && response.bulkDetails) {
          const { totalCreated, totalExisting, createdGroups, existingGroups } =
            response.bulkDetails;

          if (totalCreated > 0 && totalExisting > 0) {
            toast.success(
              `${totalCreated} customer groups created successfully. ${totalExisting} already existed.`
            );
          } else if (totalCreated > 0) {
            toast.success(`${totalCreated} customer groups created successfully!`);
          } else if (totalExisting > 0) {
            toast.warning(
              `${totalExisting} customer groups already exist. No new groups were created.`
            );
          }
        }
      } else {
        // Single entry
        if (!data.group_name || !data.group_name.trim()) {
          toast.error('Please enter a group name');
          return;
        }

        const response = await onSave(data);

        if (response && !response.success) {
          // Show error message and don't close modal
          toast.error(response.message || 'Failed to save customer group');
          return;
        }
      }

      // Only reset and close if successful
      reset();
      setDynamicItems([
        {
          group_name: '',
        },
      ]);
      onClose();
    } catch (error) {
      toast.error('Failed to save customer group');
    }
  };

  const handleClose = () => {
    reset();
    setDynamicItems([
      {
        group_name: '',
      },
    ]);
    onClose();
  };

  const title = isEdit ? 'Edit Customer Group' : 'Add Customer Group';

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      PaperProps={{
        sx: { borderRadius: 2, width: '100%', maxWidth: 500 },
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
                title="Customer Groups"
                fields={[
                  {
                    name: 'group_name',
                    label: 'Group Name',
                    type: 'text',
                    defaultValue: '',
                    flex: 1,
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
                name="group_name"
                label="Group Name"
                placeholder="Enter customer group name"
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
            {isEdit ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
