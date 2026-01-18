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

import { useDispatch, useSelector } from 'react-redux';
import { createPaymentType, updatePaymentType } from 'src/redux/slices/paymentType.slice';

import { useNavigate } from 'react-router';
import { paths } from 'src/routes/paths';
import { handleDecimalInput } from 'src/utils/decimal';

// ----------------------------------------------------------------------

const typeOptions = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank', label: 'Bank' },
];

// ----------------------------------------------------------------------

export function PaymentTypeCreateEditForm({ currentPaymentType }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading } = useSelector((state) => state.paymentType);
  const selectedCompany = useSelector((state) => state.user?.selectedCompany?.company?.id);

  const methods = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(PaymentTypeSchema),
    defaultValues: {
      name: '',
      type: 'cash',
      balance: 0,
      description: '',
    },
  });

  const {
    reset,
    handleSubmit,
    getValues,
    formState: { isSubmitting, dirtyFields },
  } = methods;

  // ----------------------------------------------------------------------
  // EDIT MODE LOAD
  // ----------------------------------------------------------------------

  useEffect(() => {
    if (currentPaymentType) {
      reset({
        name: currentPaymentType.name ?? '',
        type: currentPaymentType.type ?? 'cash',
        balance: Number(currentPaymentType.balance ?? 0),
        description: currentPaymentType.description ?? '',
      });
    }
  }, [currentPaymentType, reset]);

  // ----------------------------------------------------------------------
  // BUILD DIRTY PAYLOAD
  // ----------------------------------------------------------------------

  const getDirtyPayload = (values) => {
    const payload = {};

    Object.keys(dirtyFields).forEach((key) => {
      payload[key] = values[key];
    });

    return payload;
  };

  // ----------------------------------------------------------------------
  // SUBMIT
  // ----------------------------------------------------------------------

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (currentPaymentType) {
        // ✅ only changed fields
        const dirtyPayload = getDirtyPayload(data);

        if (Object.keys(dirtyPayload).length === 0) {
          toast.info('No changes detected');
          return;
        }

        await dispatch(
          updatePaymentType({
            typeId: currentPaymentType.id,
            payload: {
              ...dirtyPayload,
              company: selectedCompany,
            },
          })
        ).unwrap();

        toast.success('Payment type updated successfully!');
      } else {
        // ✅ CREATE MODE
        await dispatch(
          createPaymentType({
            ...data,
            company: selectedCompany,
          })
        ).unwrap();

        toast.success('Payment type created successfully!');
      }

      navigate(paths.masters.paymentType);
    } catch (error) {
      toast.error(error?.message || 'Something went wrong');
    }
  });

  // ----------------------------------------------------------------------

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          {currentPaymentType ? 'Edit Payment Type' : 'Add Payment Type'}
        </Typography>

        <Grid container spacing={2}>
          {/* Name */}
          <Grid size={12}>
            <Field.Text name="name" label="Payment Name *" fullWidth />
          </Grid>

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
              onInput={handleDecimalInput}
            />
          </Grid>

          {/* Description */}
          <Grid size={12}>
            <Field.Text name="description" label="Description" multiline rows={3} fullWidth />
          </Grid>

          {/* Save */}
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
