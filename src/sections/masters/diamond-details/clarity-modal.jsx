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
import Grid from '@mui/material/Grid';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Field, Form } from 'src/components/hook-form';
import { useDiamondDetails } from 'src/hooks/useDiamondDetails';
import { DynamicFormFields } from 'src/components/dynamic-form-fields';

// ----------------------------------------------------------------------

const ClaritySchema = z.object({
  clarity_id: z.number().optional(),
  shape_id: z.number().optional(),
  size_range_id: z.number().optional(),
  carat_id: z.number().optional(),
  todays_rate: z.string().optional(),
  isBulkEntry: z.boolean().default(false),
});

// ----------------------------------------------------------------------

export function ClarityModal({ open, onClose, currentItem, onSave, loading = false }) {
  const isEdit = Boolean(currentItem);
  const [dynamicItems, setDynamicItems] = useState([
    {
      shape_id: 0,
      size_range_id: 0,
      carat_id: 0,
      todays_rate: '',
    },
  ]);

  // Fetch dropdown options
  const { data: clarities, fetchItems: fetchClarities } = useDiamondDetails('clarity');
  const { data: shapes, fetchItems: fetchShapes } = useDiamondDetails('shape');
  const { data: sizeRanges, fetchItems: fetchSizeRanges } = useDiamondDetails('sizeRange');
  const { data: carats, fetchItems: fetchCarats } = useDiamondDetails('carat');
  const { data: metalTypes, fetchItems: fetchMetalTypes } = useDiamondDetails('metal');
  const [diamondCarats, setDiamondCarats] = useState([]);
  const [metalType, setMetalType] = useState([]);

  const methods = useForm({
    resolver: zodResolver(ClaritySchema),
    defaultValues: {
      clarity_id: 0,
      shape_id: 0,
      size_range_id: 0,
      carat_id: 0,
      todays_rate: '',
      isBulkEntry: false,
    },
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
    watch,
  } = methods;

  const isBulkEntry = watch('isBulkEntry');

  // Fetch dropdown data when modal opens
  useEffect(() => {
    if (open) {
      // Fetch all dropdown data without pagination
      fetchClarities(1, 100, '', 'all', { pagination: false });
      fetchShapes(1, 100, '', 'all', { pagination: false });
      fetchSizeRanges(1, 100, '', 'all', { pagination: false });
      fetchMetalTypes(1, 100, '', 'all', { pagination: false });
      fetchCarats(1, 100, '', 'all', { pagination: false });
    }
  }, [open, fetchClarities, fetchShapes, fetchSizeRanges, fetchCarats, fetchMetalTypes]);

  useEffect(() => {
    if (metalTypes) {
      const diamondMetalType = metalTypes.find((item) => item.code === 'DIAMOND');
      setMetalType(metalTypes.find((item) => item.code === 'DIAMOND'));
      setDiamondCarats(carats.filter((carat) => carat.metal_type === diamondMetalType?.id));
    }
  }, [metalTypes, carats]);

  useEffect(() => {
    setDiamondCarats(carats.filter((carat) => carat.metal_type === metalType?.id));
  }, [metalType, carats]);

  // Initialize dynamic items when bulk entry is enabled
  useEffect(() => {
    if (isBulkEntry && dynamicItems.length === 0) {
      setDynamicItems([
        {
          shape_id: 0,
          size_range_id: 0,
          carat_id: 0,
          todays_rate: '',
        },
      ]);
    }
  }, [isBulkEntry, dynamicItems]);

  // Reset form when modal opens/closes or item changes
  useEffect(() => {
    if (open && clarities && shapes && sizeRanges && carats) {
      // Small delay to ensure all data is properly loaded
      const timer = setTimeout(() => {
        if (currentItem) {
          reset({
            shape_id: currentItem.shape || currentItem.shape_id || 0,
            size_range_id: currentItem.size_range || currentItem.size_range_id || 0,
            carat_id: currentItem.carat || currentItem.carat_id || 0,
            todays_rate: currentItem.todays_rate || '',
            isBulkEntry: false, // Always single entry for editing
          });
          setDynamicItems([
            {
              shape_id: 0,
              size_range_id: 0,
              carat_id: 0,
              todays_rate: '',
            },
          ]);
        } else {
          reset({
            shape_id: 0,
            size_range_id: 0,
            carat_id: 0,
            todays_rate: '',
            isBulkEntry: false,
          });
          setDynamicItems([
            {
              shape_id: 0,
              size_range_id: 0,
              carat_id: 0,
              todays_rate: '',
            },
          ]);
        }
      }, 100);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [open, currentItem, reset, clarities, shapes, sizeRanges, carats]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (data.isBulkEntry) {
        // Process bulk entry from dynamic items
        const validItems = dynamicItems.filter(
          (item) => item.shape_id && item.size_range_id && item.carat_id && item.todays_rate?.trim()
        );

        if (validItems.length === 0) {
          toast.error('Please fill in at least one complete diamond entry');
          return;
        }

        // Create bulk data object
        const bulkData = {
          ...data,
          diamonds: validItems.map((item) => ({
            shape_id: item.shape_id,
            size_range_id: item.size_range_id,
            carat_id: item.carat_id,
            todays_rate: item.todays_rate,
          })),
        };

        const result = await onSave(bulkData);

        if (result?.success) {
          reset();
          setDynamicItems([
            {
              shape_id: 0,
              size_range_id: 0,
              carat_id: 0,
              todays_rate: '',
            },
          ]);
          onClose();
        }
      } else {
        if (!data.shape_id) {
          toast.error('Please select a shape');
          return;
        }
        if (!data.size_range_id) {
          toast.error('Please select a size range');
          return;
        }
        if (!data.carat_id) {
          toast.error('Please select a carat');
          return;
        }
        if (!data.todays_rate || !data.todays_rate.trim()) {
          toast.error("Please enter today's rate");
          return;
        }

        const result = await onSave(data);

        if (result?.success) {
          reset();
          setDynamicItems([
            {
              shape_id: 0,
              size_range_id: 0,
              carat_id: 0,
              todays_rate: '',
            },
          ]);
          onClose();
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  });

  const handleClose = () => {
    reset();
    setDynamicItems([
      {
        shape_id: 0,
        size_range_id: 0,
        carat_id: 0,
        todays_rate: '',
      },
    ]);
    onClose();
  };

  const title = isEdit ? 'Edit Diamond' : 'Add Diamond';

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
                title="Diamonds"
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
                    name: 'size_range_id',
                    label: 'Size Range',
                    type: 'select',
                    defaultValue: 0,
                    options:
                      sizeRanges?.map((range) => ({
                        value: range.id,
                        label: range.range_value,
                      })) || [],
                    flex: 1,
                  },
                  {
                    name: 'carat_id',
                    label: 'Carat',
                    type: 'select',
                    defaultValue: 0,
                    options:
                      diamondCarats?.map((carat) => ({
                        value: carat.id,
                        label: carat.name,
                      })) || [],
                    flex: 1,
                  },
                  {
                    name: 'todays_rate',
                    label: "Today's Rate",
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
              <Stack
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'repeat(1, 1fr)',
                    sm: 'repeat(2, 1fr)',
                  },
                }}
                spacing={1.5}
              >
                {/* First Row */}
                <Grid item xs={12} md={4}>
                  <Field.Select name="shape_id" label="Shape" required>
                    <MenuItem value={0} disabled>
                      Select shape
                    </MenuItem>
                    {shapes?.map((shape) => (
                      <MenuItem key={shape.id} value={shape.id}>
                        {shape.name || shape.shape_name}
                      </MenuItem>
                    ))}
                  </Field.Select>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Field.Select name="size_range_id" label="Size Range" required>
                    <MenuItem value={0} disabled>
                      Select size range
                    </MenuItem>
                    {sizeRanges?.map((range) => (
                      <MenuItem key={range.id} value={range.id}>
                        {range.range_value} ({range.shape_name})
                      </MenuItem>
                    ))}
                  </Field.Select>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Field.Select name="carat_id" label="Carat" required>
                    <MenuItem value={0} disabled>
                      Select carat
                    </MenuItem>
                    {diamondCarats?.map((carat) => (
                      <MenuItem key={carat?.id} value={carat?.id}>
                        {carat?.hsn_code}
                      </MenuItem>
                    ))}
                  </Field.Select>
                </Grid>

                {/* Second Row */}
                <Grid item xs={12} md={6}>
                  <Field.Text
                    name="todays_rate"
                    label="Today's Rate"
                    placeholder="Enter today's rate"
                    required
                    type="text"
                  />
                </Grid>
              </Stack>
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
