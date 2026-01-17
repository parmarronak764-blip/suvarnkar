import React, { useEffect, useMemo } from 'react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';

import { Form, Field } from 'src/components/hook-form';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';

import { createExpense, updateExpenseById } from 'src/redux/slices/expense.slice';
import { getExpenseTypes } from 'src/redux/slices/expenseType.slice';
import { getPaymentTypes } from 'src/redux/slices/paymentType.slice';
import { paths } from 'src/routes/paths';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';

function AddExpenseForm({ currentExpenseData }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { selectedCompany } = useSelector((state) => state.user);
  const { expenseTypes } = useSelector((state) => state.expenseType);
  const { paymentTypes } = useSelector((state) => state.paymentType);

  const isEdit = Boolean(currentExpenseData?.id);

  const defaultValues = useMemo(
    () => ({
      category: currentExpenseData?.category || '',
      paymentType: currentExpenseData?.payment_type || '',
      amount: currentExpenseData?.amount || '',
      description: currentExpenseData?.description || '',
    }),
    [currentExpenseData]
  );

  console.log({ currentExpenseData });

  const methods = useForm({
    mode: 'onSubmit',
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = methods;

  useEffect(() => {
    if (isEdit) {
      reset(defaultValues);
    }
  }, [isEdit, defaultValues, reset]);

  const onSubmit = handleSubmit(async (data) => {
    const payload = {
      company: selectedCompany.company.id,
      category: data.category,
      payment_type: data.paymentType,
      amount: data.amount,
      description: data.description,
      expense_date: isEdit
        ? currentExpenseData.expense_date
        : new Date().toISOString().split('T')[0],
    };

    try {
      if (isEdit) {
        await dispatch(
          updateExpenseById({
            id: currentExpenseData.id,
            company_id: selectedCompany.company.id,
            data: payload,
          })
        ).unwrap();
        toast.success('Expense updated successfully!');
      } else {
        await dispatch(createExpense(payload)).unwrap();
        toast.success('Expense Added successfully!');
        reset();
      }
      navigate(paths.expense.allExpense);
    } catch (error) {
      toast.error(error?.message || 'Something went wrong');
    }
  });

  useEffect(() => {
    dispatch(getExpenseTypes());
    dispatch(getPaymentTypes());
  }, [dispatch]);

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
              options={paymentTypes.map((item) => ({
                value: item.id,
                label: item.name,
              }))}
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
              {isEdit
                ? isSubmitting
                  ? 'Updating...'
                  : 'Update'
                : isSubmitting
                  ? 'Saving...'
                  : 'Save'}
            </Button>
          </Grid>
        </Grid>
      </Card>
    </Form>
  );
}

export default AddExpenseForm;
