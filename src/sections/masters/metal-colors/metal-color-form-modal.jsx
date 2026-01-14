import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z as zod } from 'zod';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import LoadingButton from '@mui/lab/LoadingButton';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Field, Form } from 'src/components/hook-form';
import { DynamicFormFields } from 'src/components/dynamic-form-fields';

// ----------------------------------------------------------------------

const MetalColorSchema = zod.object({
  metal_color: zod.string().min(1, { message: 'Metal color is required!' }),
});

const BulkMetalColorSchema = zod.object({
  metalColors: zod
    .array(
      zod.object({
        metal_color: zod.string().min(1, { message: 'Metal color is required!' }),
      })
    )
    .min(1, { message: 'Please add at least one metal color!' }),
});

// ----------------------------------------------------------------------

export function MetalColorFormModal({ open, onClose, currentItem, onSave, loading }) {
  const isEdit = Boolean(currentItem);
  const [isBulkEntry, setIsBulkEntry] = useState(false);

  const methods = useForm({
    resolver: zodResolver(MetalColorSchema),
    defaultValues: {
      metal_color: '',
    },
  });

  const bulkMethods = useForm({
    resolver: zodResolver(BulkMetalColorSchema),
    defaultValues: {
      metalColors: [
        {
          metal_color: '',
        },
      ],
    },
  });

  const { reset, handleSubmit } = methods;
  const { reset: bulkReset, handleSubmit: handleBulkSubmit, control: bulkControl } = bulkMethods;

  useEffect(() => {
    if (currentItem) {
      reset({
        metal_color: currentItem.metal_color || '',
      });
    } else {
      reset({
        metal_color: '',
      });
      bulkReset({
        metalColors: [
          {
            metal_color: '',
          },
        ],
      });
    }
  }, [currentItem, reset, bulkReset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const result = await onSave(currentItem?.id, data);
      if (result.success) {
        toast.success(
          currentItem ? 'Metal color updated successfully!' : 'Metal color created successfully!'
        );
        reset({
          metal_color: '',
        });
        onClose();
      } else {
        toast.error(result.message || 'Something went wrong!');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Something went wrong!');
    }
  });

  const onBulkSubmit = handleBulkSubmit(async (data) => {
    try {
      const result = await onSave(null, { ...data, isBulkEntry: true });
      if (result.success) {
        const { bulkDetails } = result;
        if (bulkDetails) {
          const successMessage = `Successfully created ${bulkDetails.totalCreated} metal color(s).`;
          const warningMessage =
            bulkDetails.totalExisting > 0
              ? ` ${bulkDetails.totalExisting} metal color(s) already existed.`
              : '';
          toast.success(successMessage + warningMessage);
        } else {
          toast.success('Metal colors created successfully!');
        }
        onClose();
        bulkReset({
          metalColors: [
            {
              metal_color: '',
            },
          ],
        });
      } else {
        toast.error(result.message || 'Something went wrong!');
      }
    } catch (error) {
      console.error('Bulk form submission error:', error);
      toast.error('Something went wrong!');
    }
  });

  const handleClose = () => {
    onClose();
    reset({
      metal_color: '',
    });
    bulkReset({
      metalColors: [
        {
          metal_color: '',
        },
      ],
    });
    setIsBulkEntry(false);
  };

  return (
    <Dialog
      fullWidth
      maxWidth={isBulkEntry ? 'md' : 'sm'}
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            {isEdit
              ? 'Edit Metal Color'
              : isBulkEntry
                ? 'Bulk Add Metal Colors'
                : 'Add Metal Color'}
          </Typography>
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

      <DialogContent dividers sx={{ p: 3 }}>
        {isBulkEntry ? (
          <Form methods={bulkMethods} onSubmit={onBulkSubmit}>
            <Controller
              name="metalColors"
              control={bulkControl}
              render={({ field }) => (
                <DynamicFormFields
                  title="Metal Colors"
                  fields={[
                    {
                      name: 'metal_color',
                      label: 'Metal Color',
                      type: 'text',
                      flex: 1,
                      placeholder: 'e.g., Rose Gold, White Gold, Yellow Gold',
                    },
                  ]}
                  values={field.value}
                  onChange={field.onChange}
                  minItems={1}
                  maxItems={20}
                />
              )}
            />
          </Form>
        ) : (
          <Form methods={methods} onSubmit={onSubmit}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
              }}
            >
              <Field.Text
                name="metal_color"
                label="Metal Color"
                placeholder="e.g., Rose Gold, White Gold, Yellow Gold"
              />
            </Box>
          </Form>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button variant="outlined" onClick={handleClose}>
          Cancel
        </Button>

        <LoadingButton
          type="submit"
          variant="contained"
          loading={loading}
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={isBulkEntry ? onBulkSubmit : onSubmit}
        >
          {isEdit ? 'Update' : 'Create'}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
