import { useForm, Controller } from 'react-hook-form';
import { useEffect, useState, useMemo } from 'react';
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
import MenuItem from '@mui/material/MenuItem';

import { Form, Field } from 'src/components/hook-form';
import { DynamicFormFields } from 'src/components/dynamic-form-fields';
import { useGemstone } from 'src/hooks/useGemstone';
import { toast } from 'src/components/snackbar';

// ----------------------------------------------------------------------

const GemstoneRateSchema = zod.object({
  gemstone_sub_type: zod.number().min(1, 'Gemstone sub type is required!'),
  gemstone_shape: zod.number().min(1, 'Gemstone shape is required!'),
  carat_size: zod.string().min(1, 'Carat size is required!'),
  rate_per_carat: zod.string().min(1, 'Rate per carat is required!'),
});

const BulkGemstoneRateSchema = zod.object({
  rates: zod
    .array(
      zod.object({
        gemstone_sub_type: zod.number().min(1, 'Gemstone sub type is required!'),
        gemstone_shape: zod.number().min(1, 'Gemstone shape is required!'),
        carat_size: zod.string().min(1, 'Carat size is required!'),
        rate_per_carat: zod.string().min(1, 'Rate per carat is required!'),
      })
    )
    .min(1, { message: 'Please add at least one rate!' }),
});

// ----------------------------------------------------------------------

export function GemstoneRateModal({ open, onClose, currentItem, onSave, loading, onSaved }) {
  const { fetchSubTypes, fetchShapes, createBulkRates } = useGemstone();
  const [subTypes, setSubTypes] = useState([]);
  const [shapes, setShapes] = useState([]);
  const [isBulkEntry, setIsBulkEntry] = useState(false);

  const defaultValues = useMemo(
    () => ({
      gemstone_sub_type: 0,
      gemstone_shape: 0,
      carat_size: '',
      rate_per_carat: '',
    }),
    []
  );

  const methods = useForm({
    resolver: zodResolver(GemstoneRateSchema),
    defaultValues: currentItem || defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const bulkMethods = useForm({
    resolver: zodResolver(BulkGemstoneRateSchema),
    defaultValues: {
      rates: [{ gemstone_sub_type: 0, gemstone_shape: 0, carat_size: '', rate_per_carat: '' }],
    },
  });

  const {
    reset: resetBulk,
    handleSubmit: handleBulkSubmit,
    formState: { isSubmitting: isBulkSubmitting },
  } = bulkMethods;

  // Load dropdown data (non-paginated) when modal opens
  useEffect(() => {
    const loadDropdowns = async () => {
      const [subTypeRes, shapeRes] = await Promise.all([
        fetchSubTypes(undefined, undefined, { pagination: false }),
        fetchShapes(undefined, undefined, { pagination: false }),
      ]);

      if (subTypeRes?.success) {
        setSubTypes(subTypeRes.data || []);
      } else if (open) {
        toast.error(subTypeRes?.message || 'Failed to load gemstone sub types');
      }

      if (shapeRes?.success) {
        setShapes(shapeRes.data || []);
      } else if (open) {
        toast.error(shapeRes?.message || 'Failed to load gemstone shapes');
      }
    };

    if (open) {
      loadDropdowns();
    }
  }, [open, fetchSubTypes, fetchShapes]);

  // Ensure fresh state on open in create mode
  useEffect(() => {
    if (open && !currentItem) {
      setIsBulkEntry(false);
      reset(defaultValues);
      resetBulk({
        rates: [{ gemstone_sub_type: 0, gemstone_shape: 0, carat_size: '', rate_per_carat: '' }],
      });
    }
  }, [open, currentItem, reset, resetBulk, defaultValues]);

  // Pre-populate form when editing an existing rate
  useEffect(() => {
    if (open && currentItem) {
      setIsBulkEntry(false);
      reset({
        gemstone_sub_type: Number(
          currentItem.gemstone_sub_type ||
            currentItem.gemstone_sub_type_id ||
            currentItem.sub_type ||
            currentItem.sub_type_id ||
            0
        ),
        gemstone_shape: Number(
          currentItem.gemstone_shape ||
            currentItem.gemstone_shape_id ||
            currentItem.shape ||
            currentItem.shape_id ||
            0
        ),
        carat_size: String(currentItem.carat_size || ''),
        rate_per_carat: String(currentItem.rate_per_carat || ''),
      });
    }
  }, [open, currentItem, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const result = await onSave(data);
      if (result && result.success) {
        reset();
        if (onSaved) onSaved();
        if (onClose) onClose();
      }
    } catch (error) {
      console.error(error);
    }
  });

  const onBulkSubmit = handleBulkSubmit(async (data) => {
    try {
      const items = (data.rates || [])
        .map((r) => ({
          gemstone_sub_type: Number(r.gemstone_sub_type) || 0,
          gemstone_shape: Number(r.gemstone_shape) || 0,
          carat_size: (r.carat_size || '').trim(),
          rate_per_carat: (r.rate_per_carat || '').trim(),
        }))
        .filter(
          (r) => r.gemstone_sub_type > 0 && r.gemstone_shape > 0 && r.carat_size && r.rate_per_carat
        );
      if (items.length === 0) return;

      const result = await createBulkRates(items);
      if (result && result.success) {
        resetBulk({
          rates: [{ gemstone_sub_type: 0, gemstone_shape: 0, carat_size: '', rate_per_carat: '' }],
        });
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
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { overflow: 'hidden', maxHeight: '85vh' },
      }}
    >
      {currentItem ? (
        <Form methods={methods} onSubmit={onSubmit}>
          <DialogTitle>Edit Gemstone Rate</DialogTitle>

          <DialogContent dividers sx={{ overflow: 'visible', pt: 1 }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <Field.Select
                name="gemstone_sub_type"
                label="Gemstone Sub Type"
                InputLabelProps={{ shrink: true }}
              >
                <MenuItem value={0}>Select Sub Type</MenuItem>
                {subTypes.map((st) => (
                  <MenuItem key={st.id} value={st.id}>
                    {st.sub_type_name || st.name}
                  </MenuItem>
                ))}
              </Field.Select>
              <Field.Select
                name="gemstone_shape"
                label="Gemstone Shape"
                InputLabelProps={{ shrink: true }}
              >
                <MenuItem value={0}>Select Shape</MenuItem>
                {shapes.map((sh) => (
                  <MenuItem key={sh.id} value={sh.id}>
                    {sh.name}
                  </MenuItem>
                ))}
              </Field.Select>
              <Field.Text
                name="carat_size"
                label="Carat Size"
                placeholder="Enter carat size (e.g., 1.5)"
                InputLabelProps={{ shrink: true }}
              />
              <Field.Text
                name="rate_per_carat"
                label="Rate per Carat"
                placeholder="Enter rate per carat"
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
              Add Gemstone Rate
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
              <DialogContent dividers sx={{ overflow: 'auto', maxHeight: '70vh', pb: 9, pt: 1 }}>
                <Box
                  rowGap={3}
                  columnGap={2}
                  display="grid"
                  gridTemplateColumns={{
                    xs: 'repeat(1, 1fr)',
                    sm: 'repeat(2, 1fr)',
                  }}
                >
                  <Field.Select
                    name="gemstone_sub_type"
                    label="Gemstone Sub Type"
                    InputLabelProps={{ shrink: true }}
                  >
                    <MenuItem value={0}>Select Sub Type</MenuItem>
                    {subTypes.map((st) => (
                      <MenuItem key={st.id} value={st.id}>
                        {st.sub_type_name || st.name}
                      </MenuItem>
                    ))}
                  </Field.Select>
                  <Field.Select
                    name="gemstone_shape"
                    label="Gemstone Shape"
                    InputLabelProps={{ shrink: true }}
                  >
                    <MenuItem value={0}>Select Shape</MenuItem>
                    {shapes.map((sh) => (
                      <MenuItem key={sh.id} value={sh.id}>
                        {sh.name}
                      </MenuItem>
                    ))}
                  </Field.Select>
                  <Field.Text
                    name="carat_size"
                    label="Carat Size"
                    placeholder="Enter carat size (e.g., 1.5)"
                    InputLabelProps={{ shrink: true }}
                  />
                  <Field.Text
                    name="rate_per_carat"
                    label="Rate per Carat"
                    placeholder="Enter rate per carat"
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
              </DialogContent>

              <DialogActions
                sx={{
                  position: 'sticky',
                  bottom: 0,
                  backgroundColor: 'background.paper',
                  zIndex: 1,
                  borderTop: (theme) =>
                    `1px solid ${theme.vars ? theme.vars.palette.divider : '#e0e0e0'}`,
                }}
              >
                <Button onClick={handleClose}>Cancel</Button>
                <LoadingButton type="submit" variant="contained" loading={isSubmitting || loading}>
                  Create
                </LoadingButton>
              </DialogActions>
            </Form>
          ) : (
            <Form methods={bulkMethods} onSubmit={onBulkSubmit}>
              <DialogContent dividers sx={{ overflow: 'auto', maxHeight: '70vh', pb: 9 }}>
                <Stack spacing={1.5}>
                  <Controller
                    name="rates"
                    control={bulkMethods.control}
                    render={({ field }) => (
                      <DynamicFormFields
                        title="Rates"
                        fields={[
                          {
                            name: 'gemstone_sub_type',
                            label: 'Gemstone Sub Type',
                            type: 'select',
                            flex: 1,
                            options: subTypes.map((st) => ({
                              value: st.id,
                              label: st.sub_type_name || st.name,
                            })),
                          },
                          {
                            name: 'gemstone_shape',
                            label: 'Gemstone Shape',
                            type: 'select',
                            flex: 1,
                            options: shapes.map((sh) => ({ value: sh.id, label: sh.name })),
                          },
                          { name: 'carat_size', label: 'Carat Size', type: 'text', flex: 1 },
                          {
                            name: 'rate_per_carat',
                            label: 'Rate per Carat',
                            type: 'text',
                            flex: 1,
                          },
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

              <DialogActions
                sx={{
                  position: 'sticky',
                  bottom: 0,
                  backgroundColor: 'background.paper',
                  zIndex: 1,
                  borderTop: (theme) =>
                    `1px solid ${theme.vars ? theme.vars.palette.divider : '#e0e0e0'}`,
                }}
              >
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
