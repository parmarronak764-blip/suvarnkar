import React from 'react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import { Form, Field } from 'src/components/hook-form';
import { useForm } from 'react-hook-form';

const categoryOptions = [
  { value: 'salary', label: 'Salary' },
  { value: 'rent', label: 'Rent' },
];

const paymentTypeOptions = [
  { value: 'cash', label: 'Cash' },
  { value: 'upi', label: 'UPI' },
  { value: 'bank', label: 'Bank Transfer' },
];

function AddExpenseForm() {
  const methods = useForm({
    mode: 'onSubmit',
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    console.log(data);
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Card sx={{ p: 3, mx: { xs: 1, md: 4 } }}>
        <Grid container spacing={2}>
          {/* Category */}
          <Grid xs={12} md={6} lg={3}>
            <Field.MultiSelect
              name="category"
              label="Category *"
              checkbox
              chip
              fullWidth
              options={categoryOptions}
            />
          </Grid>

          {/* Payment Type */}
          <Grid xs={12} md={6} lg={3}>
            <Field.Select
              name="paymentType"
              label="Payment Type *"
              fullWidth
              options={paymentTypeOptions}
            />
          </Grid>

          {/* Amount */}
          <Grid xs={12} md={6} lg={3}>
            <Field.Text
              name="amount"
              label="Amount *"
              type="number"
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>

          {/* Description */}
          <Grid xs={12} md={6} lg={3}>
            <Field.Text name="description" label="Description" fullWidth multiline rows={1} />
          </Grid>

          {/* Save Button */}
          <Grid xs={12} display="flex" justifyContent="flex-end">
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              Save
            </Button>
          </Grid>
        </Grid>
      </Card>
    </Form>
  );
}

export default AddExpenseForm;
