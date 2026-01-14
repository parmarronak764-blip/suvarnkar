import { useForm, Controller } from 'react-hook-form';
import { useState, useEffect, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z as zod } from 'zod';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import LoadingButton from '@mui/lab/LoadingButton';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

import { Form, Field } from 'src/components/hook-form';
import { DynamicFormFields } from 'src/components/dynamic-form-fields';
import { useGemstone } from 'src/hooks/useGemstone';

// ----------------------------------------------------------------------

const GemstoneShapeSchema = zod.object({
  name: zod.string().min(1, 'Shape name is required!'),
});

const BulkGemstoneShapeSchema = zod.object({
  shapes: zod
    .array(
      zod.object({
        name: zod.string().min(1, 'Shape name is required!'),
      })
    )
    .min(1, { message: 'Please add at least one shape!' }),
});

// ----------------------------------------------------------------------

export function GemstoneShapeModal({ open, onClose, currentItem, onSave, loading, onSaved }) {
  const { createBulkShapes } = useGemstone();
  const [isBulkEntry, setIsBulkEntry] = useState(false);
  const defaultValues = useMemo(
    () => ({
      name: '',
    }),
    []
  );

  const methods = useForm({
    resolver: zodResolver(GemstoneShapeSchema),
    defaultValues: currentItem || defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const bulkMethods = useForm({
    resolver: zodResolver(BulkGemstoneShapeSchema),
    defaultValues: {
      shapes: [{ name: '' }],
    },
  });

  const {
    reset: resetBulk,
    handleSubmit: handleBulkSubmit,
    formState: { isSubmitting: isBulkSubmitting },
  } = bulkMethods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const result = await onSave(data);
      if (result && result.success) {
        reset();
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

  const onBulkSubmit = handleBulkSubmit(async (data) => {
    try {
      const shapes = (data.shapes || []).map((s) => (s?.name || '').trim()).filter(Boolean);
      if (shapes.length === 0) return; // nothing to submit
      // API expects: { company_id, shapes: string[] }
      const result = await createBulkShapes(shapes);
      if (result && result.success) {
        resetBulk({ shapes: [{ name: '' }] });
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

  // Ensure fresh form state whenever opening in create mode
  useEffect(() => {
    if (open && !currentItem) {
      setIsBulkEntry(false);
      reset(currentItem || defaultValues);
      resetBulk({ shapes: [{ name: '' }] });
    }
  }, [open, currentItem, reset, resetBulk, defaultValues]);

  // Prepopulate when editing existing item
  useEffect(() => {
    if (open && currentItem) {
      setIsBulkEntry(false);
      reset({ name: currentItem.name || '' });
    }
  }, [open, currentItem, reset]);

  const handleClose = () => {
    setIsBulkEntry(false);
    reset();
    resetBulk({ shapes: [{ name: '' }] });
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
      {!currentItem && (
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            Add Gemstone Shape
            <FormControlLabel
              control={
                <Switch checked={isBulkEntry} onChange={(e) => setIsBulkEntry(e.target.checked)} />
              }
              label="Bulk Entry"
              labelPlacement="start"
              sx={{ mr: 0 }}
            />
          </Stack>
        </DialogTitle>
      )}

      {currentItem && <DialogTitle>Edit Gemstone Shape</DialogTitle>}

      {!isBulkEntry ? (
        <Form methods={methods} onSubmit={onSubmit}>
          <DialogContent dividers sx={{ overflow: 'visible' }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
              }}
            >
              <Field.Text
                name="name"
                label="Shape Name"
                placeholder="Enter the gemstone shape name (e.g., Round, Oval, Square)"
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <LoadingButton type="submit" variant="contained" loading={isSubmitting || loading}>
              {currentItem ? 'Update' : 'Create'}
            </LoadingButton>
          </DialogActions>
        </Form>
      ) : (
        <Form methods={bulkMethods} onSubmit={onBulkSubmit}>
          <DialogContent dividers sx={{ overflow: 'visible' }}>
            <Stack spacing={3}>
              <Controller
                name="shapes"
                control={bulkMethods.control}
                render={({ field }) => (
                  <DynamicFormFields
                    title="Shapes"
                    fields={[{ name: 'name', label: 'Shape Name', type: 'text', flex: 1 }]}
                    values={field.value}
                    onChange={field.onChange}
                    minItems={1}
                    maxItems={20}
                  />
                )}
              />
            </Stack>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <LoadingButton type="submit" variant="contained" loading={isBulkSubmitting || loading}>
              Create
            </LoadingButton>
          </DialogActions>
        </Form>
      )}
    </Dialog>
  );
}
