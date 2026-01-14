import { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

import { Controller } from 'react-hook-form';
import { Field } from 'src/components/hook-form';

import { useApi } from 'src/hooks/useApi';
import { API_ROUTES } from 'src/utils/apiRoute';
import { useSelector } from 'react-redux';

// ----------------------------------------------------------------------

export function PurchasePaymentSection({ methods, totalAmount, apiData = {} }) {
  const { watch, setValue, control } = methods;
  const { callApi } = useApi();
  const selectedCompany = useSelector((state) => state.user.selectedCompany);
  const [paymentAccounts, setPaymentAccounts] = useState([]);

  const watchedTotalPaidAmount = watch('payment.totalPaidAmount');
  const watchedRoundOffAmount = watch('payment.roundOffAmount');

  // Calculate total purchase amount (after round off)
  const calculatedTotalPurchaseAmount =
    parseFloat(totalAmount || 0) -
    parseFloat(
      watchedRoundOffAmount === '' || !watchedRoundOffAmount ? 0 : watchedRoundOffAmount || 0
    );

  // Fetch payment accounts from ledger accounts API
  useEffect(() => {
    const fetchPaymentAccounts = async () => {
      try {
        const companyId = selectedCompany?.company?.id || selectedCompany?.id;
        if (!companyId) return;

        const response = await callApi({
          url: API_ROUTES.ACCOUNTS.LEDGER_ACCOUNT_DETAILS.GET,
          method: 'GET',
          query: {
            company_id: companyId,
          },
        });

        if (response.success) {
          // Handle both array and paginated responses
          const allAccounts = Array.isArray(response.data)
            ? response.data
            : response.data?.results ||
              response.results ||
              response.data?.items ||
              response.items ||
              [];
          setPaymentAccounts(allAccounts);
        }
      } catch (error) {
        console.error('Error fetching payment accounts:', error);
        setPaymentAccounts([]);
      }
    };

    if (selectedCompany) {
      fetchPaymentAccounts();
    }
  }, [callApi, selectedCompany]);

  // Update total purchase amount (before round off)
  useEffect(() => {
    setValue('payment.totalPurchaseAmount', totalAmount);
  }, [totalAmount, setValue]);

  // Calculate pending amount: total_purchase_amount - total_paid_amount
  useEffect(() => {
    const totalPurchase = calculatedTotalPurchaseAmount || 0;
    const paid = parseFloat(
      watchedTotalPaidAmount === '' || !watchedTotalPaidAmount ? 0 : watchedTotalPaidAmount || 0
    );
    const pending = Math.max(0, totalPurchase - paid);
    setValue('payment.pendingAmount', String(pending.toFixed(2)));
  }, [calculatedTotalPurchaseAmount, watchedTotalPaidAmount, setValue]);

  return (
    <Box>
      <Box
        rowGap={3}
        columnGap={2}
        display="grid"
        gridTemplateColumns={{
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
        }}
        sx={{ mb: 3 }}
      >
        {/* Payment Mode Selection */}
        <Controller
          name="payment.paymentMode"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Autocomplete
              {...field}
              size="small"
              options={paymentAccounts}
              getOptionLabel={(option) =>
                typeof option === 'object'
                  ? option.ledger_name || option.account_name || option.name || ''
                  : ''
              }
              isOptionEqualToValue={(option, value) => option.account?.id === value}
              value={paymentAccounts.find((acc) => acc.account?.id === field.value) || null}
              onChange={(event, newValue) => {
                field.onChange(newValue?.account?.id ?? null);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Payment Mode"
                  error={!!error}
                  helperText={error?.message}
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
          )}
        />

        {/* Total Paid Amount */}
        <Field.Text
          size="small"
          name="payment.totalPaidAmount"
          label="Total Paid Amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          InputLabelProps={{ shrink: true }}
          inputProps={{ min: 0 }}
        />

        {/* Round Off Amount */}
        <Field.Text
          size="small"
          name="payment.roundOffAmount"
          label="Round Off Amount"
          type="number"
          step="0.01"
          placeholder="0.000"
          InputLabelProps={{ shrink: true }}
        />
      </Box>

      <Box
        rowGap={3}
        columnGap={2}
        display="grid"
        gridTemplateColumns={{
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(2, 1fr)',
        }}
        sx={{ mb: 3 }}
      >
        {/* Total Purchase Amount (before round off) */}
        <Field.Text
          size="small"
          name="payment.totalPurchaseAmount"
          label="Total Purchase Amount (Before Round Off)"
          type="number"
          step="0.01"
          InputProps={{ readOnly: true }}
          InputLabelProps={{ shrink: true }}
          sx={{ bgcolor: 'grey.50' }}
        />

        {/* Total Amount (after round off) */}
        <Field.Text
          size="small"
          name="payment.totalAmount"
          label="Total Amount (After Round Off)"
          type="number"
          step="0.01"
          value={calculatedTotalPurchaseAmount.toFixed(2)}
          InputProps={{ readOnly: true }}
          InputLabelProps={{ shrink: true }}
          sx={{ bgcolor: 'success.lighter' }}
        />
      </Box>

      {/* Customer Notes */}
      <Box sx={{ mb: 3 }}>
        <Field.Text
          size="small"
          name="payment.note"
          label="Note"
          multiline
          rows={3}
          placeholder="Enter any additional notes..."
          InputLabelProps={{ shrink: true }}
          inputProps={{ maxLength: 500 }}
        />
      </Box>

      {/* Payment Summary */}
      <Box
        sx={{
          p: 2,
          border: '1px solid',
          borderColor: 'success.main',
          borderRadius: 1,
          bgcolor: 'success.lighter',
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
          Payment Summary
        </Typography>

        <Stack spacing={1.5}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Total Purchase Amount (Before Round Off):
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              ₹{totalAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Round Off Amount:
            </Typography>
            <Typography variant="body2" fontWeight={600} color="info.dark">
              ₹
              {parseFloat(
                watchedRoundOffAmount === '' || !watchedRoundOffAmount
                  ? 0
                  : watchedRoundOffAmount || 0
              ).toLocaleString('en-IN', {
                minimumFractionDigits: 2,
              })}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Total Amount (After Round Off):
            </Typography>
            <Typography variant="h6" fontWeight={700}>
              ₹{calculatedTotalPurchaseAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Paid Amount:
            </Typography>
            <Typography variant="body1" fontWeight={600} color="success.dark">
              ₹
              {parseFloat(
                watchedTotalPaidAmount === '' || !watchedTotalPaidAmount
                  ? 0
                  : watchedTotalPaidAmount || 0
              ).toLocaleString('en-IN', {
                minimumFractionDigits: 2,
              })}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Pending Amount:
            </Typography>
            <Typography variant="body1" fontWeight={600} color="warning.dark">
              ₹
              {watch('payment.pendingAmount')?.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
              }) || '0.00'}
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
