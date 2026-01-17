import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';

import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';

import { Form, Field } from 'src/components/hook-form';
import { toast } from 'src/components/snackbar';
import { PaymentTypeSchema } from 'src/schema/payment-type.schema';

// ----------------------------------------------------------------------

const typeOptions = [
  { value: 'credit', label: 'Credit' },
  { value: 'debit', label: 'Debit' },
];

export function PaymentTypeCreateEditForm({ currentPaymentType }) {
  const defaultValues = {
    type: '',
    balance: '',
    description: '',
  };

  const methods = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(PaymentTypeSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (currentPaymentType) {
      reset(currentPaymentType);
    }
  }, [currentPaymentType, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      console.log('PAYMENT DATA →', data);

      toast.success(
        currentPaymentType ? 'Payment updated successfully!' : 'Payment created successfully!'
      );
    } catch (error) {
      toast.error('Something went wrong');
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          {currentPaymentType ? 'Edit Payment' : 'Create Payment'}
        </Typography>

        {/* SAME GRID LAYOUT */}
        <Grid container spacing={2}>
          {/* Type */}
          <Grid size={6}>
            <Field.Select name="type" label="Type *" fullWidth>
              {typeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Field.Select>
          </Grid>

          {/* Balance */}
          <Grid size={6}>
            <Field.Text
              name="balance"
              label="Balance *"
              type="number"
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>

          {/* Description */}
          <Grid size={12}>
            <Field.Text name="description" label="Description" fullWidth multiline rows={3} />
          </Grid>

          {/* Save Button */}
          <Grid size={12} display="flex" justifyContent="flex-end">
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {currentPaymentType ? 'Save Changes' : 'Create Payment'}
            </Button>
          </Grid>
        </Grid>
      </Card>
    </Form>
  );
}
