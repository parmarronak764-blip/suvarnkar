import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';

import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { Form, Field } from 'src/components/hook-form';
import { toast } from 'src/components/snackbar';

import { ExpenseTypeSchema } from 'src/schema/expense-type.schema';

import { useDispatch, useSelector } from 'react-redux';
import { createExpenseType, updateExpenseType } from 'src/redux/slices/expenseType.slice';

import { paths } from 'src/routes/paths';
import { useNavigate } from 'react-router';

// ----------------------------------------------------------------------

export function ExpenseTypeCreateEditForm({ currentExpenseType }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const selectedCompany = useSelector((state) => state.user?.selectedCompany?.company?.id);

  const { loading } = useSelector((state) => state.expenseType);
  console.log(loading);
  const methods = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(ExpenseTypeSchema),
    defaultValues: { name: '' },
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (currentExpenseType) {
      reset(currentExpenseType);
    }
  }, [currentExpenseType, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (currentExpenseType?.id) {
        // ✅ EDIT MODE
        await dispatch(
          updateExpenseType({
            typeId: currentExpenseType.id,
            payload: {
              name: data.name,
              company_id: selectedCompany,
            },
          })
        ).unwrap();

        toast.success('Expense type updated successfully!');
      } else {
        // ✅ CREATE MODE

        console.log(selectedCompany, 'cccc');
        await dispatch(
          createExpenseType({
            name: data.name,
            company: selectedCompany,
          })
        ).unwrap();

        toast.success('Expense type created successfully!');
      }

      navigate(paths.masters.expenseType);
    } catch (error) {
      toast.error(error?.message || 'Something went wrong');
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          {currentExpenseType ? 'Edit Expense Type' : 'Add Expense Type'}
        </Typography>

        <Grid container spacing={2}>
          <Grid size={6}>
            <Field.Text name="name" label="Expense Type *" fullWidth />
          </Grid>

          <Grid size={6} />

          <Grid size={12} display="flex" justifyContent="flex-end">
            <Button type="submit" variant="contained" disabled={loading || isSubmitting}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </Grid>
        </Grid>
      </Card>
    </Form>
  );
}
