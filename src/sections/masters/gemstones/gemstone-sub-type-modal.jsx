import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z as zod } from 'zod';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import MenuItem from '@mui/material/MenuItem';
import LoadingButton from '@mui/lab/LoadingButton';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

import { Form, Field } from 'src/components/hook-form';
import { DynamicFormFields } from 'src/components/dynamic-form-fields';
import { useGemstone } from 'src/hooks/useGemstone';
import { toast } from 'src/components/snackbar';

// ----------------------------------------------------------------------

const GemstoneSubTypeSchema = zod.object({
  carat: zod.number().min(1, 'Carat is required!'),
  sub_type_name: zod.string().min(1, 'Sub type name is required!'),
});

const BulkGemstoneSubTypeSchema = zod.object({
  sub_types: zod
    .array(
      zod.object({
        carat: zod.number().min(1, 'Carat is required!'),
        sub_type_name: zod.string().min(1, 'Sub type name is required!'),
      })
    )
    .min(1, { message: 'Please add at least one sub type!' }),
});

// ----------------------------------------------------------------------

export function GemstoneSubTypeModal({ open, onClose, currentItem, onSave, loading, onSaved }) {
  const { fetchGemstonesCarats, createBulkSubTypes } = useGemstone();
  const [carats, setCarats] = useState([]);
  const [isBulkEntry, setIsBulkEntry] = useState(false);

  const defaultValues = {
    carat: 0,
    sub_type_name: '',
  };

  const methods = useForm({
    resolver: zodResolver(GemstoneSubTypeSchema),
    defaultValues: currentItem || defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const bulkMethods = useForm({
    resolver: zodResolver(BulkGemstoneSubTypeSchema),
    defaultValues: {
      sub_types: [{ carat: 0, sub_type_name: '' }],
    },
  });

  const {
    reset: resetBulk,
    handleSubmit: handleBulkSubmit,
    formState: { isSubmitting: isBulkSubmitting },
  } = bulkMethods;

  // Fetch carats on component mount
  useEffect(() => {
    const loadCarats = async () => {
      const result = await fetchGemstonesCarats();

      if (result.success) {
        setCarats(result.data || []);
      } else {
        console.error('Failed to load carats:', result.message);
        toast.error('Failed to load carats');
      }
    };

    if (open) {
      loadCarats();
    }
  }, [fetchGemstonesCarats, open]);

  // Ensure clean state on open for create mode
  useEffect(() => {
    if (open && !currentItem) {
      setIsBulkEntry(false);
      reset({ carat: 0, sub_type_name: '' });
      resetBulk({ sub_types: [{ carat: 0, sub_type_name: '' }] });
    }
  }, [open, currentItem, reset, resetBulk]);

  // Pre-populate form when editing an existing sub type
  useEffect(() => {
    if (open && currentItem) {
      setIsBulkEntry(false);
      reset({
        carat: Number(currentItem.carat || currentItem.carat_id || 0),
        sub_type_name: currentItem.sub_type_name || currentItem.name || '',
      });
    }
  }, [open, currentItem, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const result = await onSave(data);
      if (result && result.success) {
        // Success: clear and close
        reset();
        if (onSaved) onSaved();
        if (onClose) onClose();
      } else {
        // Error: keep values in place; rely on global API toast
        // Optional: surface concise message in UI if needed (no toast)
      }
    } catch (error) {
      // Network/unknown error: keep values; rely on global API toast
      console.error(error);
    }
  });

  const onBulkSubmit = handleBulkSubmit(async (data) => {
    try {
      const items = (data.sub_types || [])
        .map((s) => ({
          carat: Number(s.carat) || 0,
          sub_type_name: (s.sub_type_name || '').trim(),
        }))
        .filter((s) => s.carat > 0 && s.sub_type_name);
      if (items.length === 0) return;

      const result = await createBulkSubTypes(items);
      if (result && result.success) {
        resetBulk({ sub_types: [{ carat: 0, sub_type_name: '' }] });
        if (onSaved) onSaved();
        if (onClose) onClose();
      } else {
        // keep values; rely on global API toasts
      }
    } catch (error) {
      console.error(error);
      // keep values; rely on global API toasts
    }
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { overflow: 'visible' },
      }}
    >
      {currentItem ? (
        <Form methods={methods} onSubmit={onSubmit}>
          <DialogTitle>Edit Gemstone Sub Type</DialogTitle>

          <DialogContent dividers sx={{ overflow: 'visible' }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <Field.Select name="carat" label="Carat" InputLabelProps={{ shrink: true }}>
                <MenuItem value={0}>Select Carat</MenuItem>
                {carats.map((carat) => (
                  <MenuItem key={carat.id} value={carat.id}>
                    {carat.name || carat.carat_name}
                  </MenuItem>
                ))}
              </Field.Select>
              <Field.Text
                name="sub_type_name"
                label="Sub Type Name"
                placeholder="Enter the sub type name"
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <LoadingButton type="submit" variant="contained" loading={isSubmitting || loading}>
              Update
            </LoadingButton>
          </DialogActions>
        </Form>
      ) : (
        <>
          <DialogTitle>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              Add Gemstone Sub Type
              <FormControlLabel
                control={
                  <Switch
                    checked={isBulkEntry}
                    onChange={(e) => setIsBulkEntry(e.target.checked)}
                  />
                }
                label="Bulk Entry"
                labelPlacement="start"
                sx={{ mr: 0 }}
              />
            </Stack>
          </DialogTitle>

          {!isBulkEntry ? (
            <Form methods={methods} onSubmit={onSubmit}>
              <DialogContent dividers sx={{ overflow: 'visible' }}>
                <Box
                  rowGap={3}
                  columnGap={2}
                  display="grid"
                  gridTemplateColumns={{
                    xs: 'repeat(1, 1fr)',
                    sm: 'repeat(2, 1fr)',
                  }}
                >
                  <Field.Select name="carat" label="Carat" InputLabelProps={{ shrink: true }}>
                    <MenuItem value={0}>Select Carat</MenuItem>
                    {carats.map((carat) => (
                      <MenuItem key={carat.id} value={carat.id}>
                        {carat.name || carat.carat_name}
                      </MenuItem>
                    ))}
                  </Field.Select>
                  <Field.Text
                    name="sub_type_name"
                    label="Sub Type Name"
                    placeholder="Enter the sub type name"
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
              </DialogContent>

              <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <LoadingButton type="submit" variant="contained" loading={isSubmitting || loading}>
                  Create
                </LoadingButton>
              </DialogActions>
            </Form>
          ) : (
            <Form methods={bulkMethods} onSubmit={onBulkSubmit}>
              <DialogContent dividers sx={{ overflow: 'visible' }}>
                <Stack spacing={3}>
                  <Controller
                    name="sub_types"
                    control={bulkMethods.control}
                    render={({ field }) => (
                      <DynamicFormFields
                        title="Sub Types"
                        fields={[
                          {
                            name: 'carat',
                            label: 'Carat',
                            type: 'select',
                            flex: 1,
                            options: carats.map((c) => ({
                              value: c.id,
                              label: c.name || c.carat_name,
                            })),
                          },
                          { name: 'sub_type_name', label: 'Sub Type Name', type: 'text', flex: 1 },
                        ]}
                        values={field.value}
                        onChange={field.onChange}
                        minItems={1}
                        maxItems={50}
                      />
                    )}
                  />
                </Stack>
              </DialogContent>

              <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <LoadingButton
                  type="submit"
                  variant="contained"
                  loading={isBulkSubmitting || loading}
                >
                  Create
                </LoadingButton>
              </DialogActions>
            </Form>
          )}
        </>
      )}
    </Dialog>
  );
}
