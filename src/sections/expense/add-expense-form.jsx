import React, { useEffect } from 'react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import { Form, Field } from 'src/components/hook-form';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { createExpense } from 'src/redux/slices/expense.slice';
import { getExpenseTypes } from 'src/redux/slices/expenseType.slice';

const paymentTypeOptions = [
  { value: 1, label: 'Cash' },
  { value: 2, label: 'UPI' },
  { value: 3, label: 'Bank Transfer' },
];

function AddExpenseForm({ currentExpenseData }) {
  const dispatch = useDispatch();
  const { selectedCompany } = useSelector((state) => state.user);
  const { expenseTypes } = useSelector((state) => state.expenseType);

  const methods = useForm({
    mode: 'onSubmit',
    defaultValues: {
      category: '',
      paymentType: '',
      amount: '',
      description: '',
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = methods;

  useEffect(() => {
    if (currentExpenseData) {
      reset(currentExpenseData);
    }
  }, [currentExpenseData, reset]);

  const onSubmit = handleSubmit(async (data) => {
    const payload = {
      company: selectedCompany.company.id,
      category: data.category,
      payment_type: data.paymentType,
      amount: data.amount,
      description: data.description,
      expense_date: new Date().toISOString().split('T')[0],
    };

    try {
      await dispatch(createExpense(payload)).unwrap();
      reset();
    } catch (error) {
      console.error(error);
    }
  });

  useEffect(() => {
    dispatch(getExpenseTypes());
  }, []);

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Card sx={{ p: 3, mx: { xs: 1, md: 4 } }}>
        <Grid container spacing={2}>
          <Grid size={3}>
            <Field.Select
              name="category"
              label="Category *"
              isWithMenuItem
              fullWidth
              options={expenseTypes.map((item) => ({
                value: item.id,
                label: item.name,
              }))}
              rules={{ required: 'Category is required' }}
            />
          </Grid>

          <Grid size={3}>
            <Field.Select
              name="paymentType"
              label="Payment Type *"
              isWithMenuItem
              fullWidth
              options={paymentTypeOptions}
              rules={{ required: 'Payment type is required' }}
            />
          </Grid>

          <Grid size={3}>
            <Field.Text
              name="amount"
              label="Amount *"
              type="number"
              fullWidth
              rules={{
                required: 'Amount is required',
                min: { value: 1, message: 'Amount must be greater than 0' },
              }}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>

          <Grid size={3}>
            <Field.Text name="description" label="Description" fullWidth multiline rows={1} />
          </Grid>

          <Grid size={12}>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </Grid>
        </Grid>
      </Card>
    </Form>
  );
}

export default AddExpenseForm;
