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

const CustomerSchema = z.object({
  clarity_id: z.number().optional(),
  shape_id: z.number().optional(),
  size_range_id: z.number().optional(),
  carat_id: z.number().optional(),
  todays_rate: z.string().optional(),
  isBulkEntry: z.boolean().default(false),
});

// ----------------------------------------------------------------------

export function CustomerModal({ open, onClose, onSave, loading = false }) {
  const [dynamicItems, setDynamicItems] = useState([
    {
      shape_id: 0,
      size_range_id: 0,
      carat_id: 0,
      todays_rate: '',
    },
  ]);
  const methods = useForm({
    resolver: zodResolver(CustomerSchema),
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
  const onSubmit = (data) => {
    onSave(data);
  };
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div">
            Add Customer
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </Box>
      </DialogTitle>
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogContent sx={{ pt: 1 }}>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={3}>
              <Field.Text name="customer_name" required label="Customer Name" placeholder="Customer Name*" />
            </Grid>

            <Grid size={3}>
              <Field.Text name="whatsapp_no" required label="Whatsapp Number" placeholder="Whatsapp Number*" />
            </Grid>

            <Grid size={3}>
              <Field.Text name="city" required label="City" placeholder="City*" />
            </Grid>

            <Grid size={3}>
              <Field.Phone name="other_phone_no" label="Other Phone Number" placeholder="Other Phone Number" />
            </Grid>
          </Grid>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={3}>
              <Field.Text name="address" required label="Address" placeholder="Address*" />
            </Grid>

            <Grid size={3}>
              <Field.Text name="state" required label="State" placeholder="State*" />
            </Grid>

            <Grid size={3}>
              <Field.Text name="gst_no" label="GST Number" placeholder="GST Number" />
            </Grid>

            <Grid size={3}>
              <Typography variant="subtitle2">Premium User</Typography> 
              <Field.Switch name="premium_user" label={watch('premium_user') ? 'Yes' : 'No'} labelPlacement="end" />
            </Grid>
          </Grid>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={3}>
              <Field.Text name="adhar_card_no" label="Adhar Card Number" placeholder="Adhar Card Number" />
            </Grid>

            <Grid size={3}>
              <Field.Text name="driving_licences_no" label="Driving Licences Number" placeholder="Driving Licences Number" />
            </Grid>

            <Grid size={3}>
              <Field.Text name="pan_no" label="PAN Number" placeholder="PAN Number" />
            </Grid>

            <Grid size={3}>
              <Field.Text name="debit_opening_amount" label="Debit Opening Amount" placeholder="Debit Opening Amount" />
            </Grid>
          </Grid>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={3}>
              <Field.Text name="credit_opening_amount" label="Credit Opening Amount" placeholder="Credit Opening Amount" />
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
