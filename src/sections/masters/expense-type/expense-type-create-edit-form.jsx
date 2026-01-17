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
import { createExpenseType } from 'src/redux/slices/expenseType.slice';

// ----------------------------------------------------------------------

export function ExpenseTypeCreateEditForm({ currentExpenseType }) {
  const selectedCompany = useSelector((state) => state.user?.selectedCompany?.company?.id);
  console.log('SELECTED COMPANY ID IN EXPENSE TYPE FORM →', selectedCompany);
  const { loading } = useSelector((state) => state?.expenseType);
  const dispatch = useDispatch();
  const defaultValues = {
    name: '',
  };

  const methods = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(ExpenseTypeSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  // edit mode
  useEffect(() => {
    if (currentExpenseType) {
      reset(currentExpenseType);
    }
  }, [currentExpenseType, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      console.log('EXPENSE TYPE DATA →', data);
      dispatch(createExpenseType({ name: data?.name, company: selectedCompany }));

      toast.success(
        currentExpenseType
          ? 'Expense type updated successfully!'
          : 'Expense type created successfully!'
      );
    } catch (error) {
      toast.error('Something went wrong');
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          {currentExpenseType ? 'Edit Expense Type' : 'Add Expense Type'}
        </Typography>

        {/* ✅ OLD GRID LAYOUT */}
        <Grid container spacing={2}>
          {/* Expense Type Name */}
          <Grid size={6}>
            <Field.Text
              name="name"
              label="Expense Type *"
              placeholder="Enter expense type name"
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>

          {/* Empty column for layout balance */}
          <Grid size={6} />

          {/* Save Button */}
          <Grid size={12} display="flex" justifyContent="flex-end">
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {currentExpenseType ? 'Save Changes' : 'Save'}
            </Button>
          </Grid>
        </Grid>
      </Card>
    </Form>
  );
}
