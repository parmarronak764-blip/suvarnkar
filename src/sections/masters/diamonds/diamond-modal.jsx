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

// ----------------------------------------------------------------------

const DiamondSchema = z.object({
  clarity_id: z.number().min(1, 'Clarity is required'),
  shape_id: z.number().min(1, 'Shape is required'),
  size_range_id: z.number().min(1, 'Size range is required'),
  carat_id: z.number().min(1, 'Carat is required'),
  todays_rate: z.string().min(1, "Today's rate is required"),
});

// ----------------------------------------------------------------------

export function DiamondModal({ open, onClose, currentItem, onSave, loading = false }) {
  const isEdit = Boolean(currentItem);

  // Fetch dropdown options
  const { data: clarities, fetchItems: fetchClarities } = useDiamondDetails('clarity');
  const { data: shapes, fetchItems: fetchShapes } = useDiamondDetails('shape');
  const { data: sizeRanges, fetchItems: fetchSizeRanges } = useDiamondDetails('sizeRange');
  const { data: colors, fetchItems: fetchColors } = useDiamondDetails('color');

  const methods = useForm({
    resolver: zodResolver(DiamondSchema),
    defaultValues: {
      clarity_id: 0,
      shape_id: 0,
      size_range_id: 0,
      carat_id: 0,
      todays_rate: '',
    },
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  // Fetch dropdown data when modal opens
  useEffect(() => {
    if (open) {
      fetchClarities();
      fetchShapes();
      fetchSizeRanges();
      fetchColors();
    }
  }, [open, fetchClarities, fetchShapes, fetchSizeRanges, fetchColors]);

  // Reset form when modal opens/closes or item changes
  useEffect(() => {
    if (open) {
      if (currentItem) {
        reset({
          clarity_id: currentItem.clarity_id || currentItem.clarity?.id || 0,
          shape_id: currentItem.shape_id || currentItem.shape?.id || 0,
          size_range_id: currentItem.size_range_id || currentItem.size_range?.id || 0,
          carat_id: currentItem.carat_id || currentItem.carat?.id || 0,
          todays_rate: currentItem.todays_rate || '',
        });
      } else {
        reset({
          clarity_id: 0,
          shape_id: 0,
          size_range_id: 0,
          carat_id: 0,
          todays_rate: '',
        });
      }
    }
  }, [open, currentItem, reset]);

  const onSubmit = async (data) => {
    try {
      await onSave(data);
      reset();
      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Failed to save diamond');
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const title = isEdit ? 'Edit Diamond' : 'Add Diamond';

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

      <Form methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ pt: 1 }}>
          <Grid container spacing={3} sx={{ pt: 1 }}>
            {/* First Row */}
            <Grid item xs={12} md={4}>
              <Field.Select name="clarity_id" label="Clarity" required>
                <MenuItem value={0} disabled>
                  Select clarity
                </MenuItem>
                {clarities?.map((clarity) => (
                  <MenuItem key={clarity.id} value={clarity.id}>
                    {clarity.name}
                  </MenuItem>
                ))}
              </Field.Select>
            </Grid>

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

            {/* Second Row */}
            <Grid item xs={12} md={6}>
              <Field.Select name="carat_id" label="Carat" required>
                <MenuItem value={0} disabled>
                  Select carat
                </MenuItem>
                {/* TODO: Replace with actual carat data - currently using colors as placeholder */}
                {colors?.map((color) => (
                  <MenuItem key={color.id} value={color.id}>
                    {color.name}
                  </MenuItem>
                ))}
              </Field.Select>
            </Grid>

            <Grid item xs={12} md={6}>
              <Field.Text
                name="todays_rate"
                label="Today's Rate"
                placeholder="Enter today's rate"
                required
                type="text"
              />
            </Grid>
          </Grid>
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
