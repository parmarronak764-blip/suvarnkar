import { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z as zod } from 'zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import LoadingButton from '@mui/lab/LoadingButton';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Field, Form } from 'src/components/hook-form';
import { setStoredValue, getStoredValue } from 'src/utils/services';
import { useAccounts } from 'src/hooks/useAccounts';
import { useSelector } from 'react-redux';

// ----------------------------------------------------------------------

// Schema for others form
const othersSchema = zod.object({
  ledgerType: zod.number().min(1, 'Ledger type is required'),
  accountName: zod.string().min(1, 'Account name is required'),
  currentBalance: zod.coerce.number().min(0, 'Current balance must be positive'),
});

// ----------------------------------------------------------------------

export function OthersForm({
  activeStep,
  onNext,
  onBack,
  onSubmit,
  onDataChange,
  formData,
  isLastStep,
  isEditMode = false,
  accountId = null,
}) {
  // Memoize the localStorage key to prevent unnecessary re-renders
  const selectedCompany = useSelector((state) => state.user.selectedCompany);
  const company_id = selectedCompany?.company?.id;
  const localStorageKey = useMemo(() => `others-form-${company_id || 'default'}`, [company_id]);

  const { createOthers, updateLedger, loading, updateLedgerDetailsLoading, getLedgerTypes } =
    useAccounts();
  const [ledgerTypes, setLedgerTypes] = useState([]);
  const [ledgerTypesFetched, setLedgerTypesFetched] = useState(false);

  // Load form data from localStorage on mount
  const getInitialFormData = useCallback(() => {
    // In edit mode, prioritize formData prop over localStorage
    if (isEditMode && formData && Object.keys(formData).length > 0) {
      return {
        ledgerType: formData.ledgerType || 0,
        accountName: formData.accountName || '',
        currentBalance: formData.currentBalance || 0,
      };
    }
    const storedData = getStoredValue(localStorageKey, {});
    return {
      ledgerType: 0,
      accountName: '',
      currentBalance: 0,
      ...formData,
      ...storedData,
    };
  }, [formData, localStorageKey, isEditMode]);

  // Save form data to localStorage whenever it changes
  const saveFormData = useCallback(
    (data) => {
      setStoredValue(localStorageKey, data);
    },
    [localStorageKey]
  );

  const methods = useForm({
    resolver: zodResolver(othersSchema),
    defaultValues: getInitialFormData(),
  });

  const { reset, handleSubmit, watch } = methods;

  // Fetch ledger types only once on mount
  useEffect(() => {
    if (ledgerTypesFetched || ledgerTypes.length > 0) {
      return undefined; // Already fetched or has data
    }

    let isCancelled = false;

    const fetchLedgerTypes = async () => {
      try {
        const result = await getLedgerTypes();
        if (!isCancelled) {
          if (result.success) {
            setLedgerTypes(result.data || []);
            setLedgerTypesFetched(true);
          } else {
            toast.error('Failed to load ledger types');
          }
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Error fetching ledger types:', error);
          toast.error('Failed to load ledger types');
        }
      }
    };

    fetchLedgerTypes();

    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  // Save form data to localStorage whenever form values change
  useEffect(() => {
    const subscription = watch((value) => {
      saveFormData(value);
    });
    return () => subscription.unsubscribe();
  }, [watch, saveFormData]);

  // Reset form when step changes (for non-edit mode)
  useEffect(() => {
    if (!isEditMode && activeStep === 0) {
      const currentData = getInitialFormData();
      reset(currentData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStep, isEditMode]); // Only reset on step change for non-edit mode

  // Separate effect to handle formData updates in edit mode
  useEffect(() => {
    if (isEditMode && formData && Object.keys(formData).length > 0) {
      const currentData = getInitialFormData();
      reset(currentData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData?.ledgerType, formData?.accountName, formData?.currentBalance, isEditMode, reset]);

  const onStepSubmit = handleSubmit(async (data) => {
    try {
      if (isEditMode && accountId) {
        // Use update API for edit mode
        const result = await updateLedger(accountId, data, company_id);
        if (result) {
          toast.success('Ledger updated successfully');
          // Clear localStorage after successful update
          setStoredValue(localStorageKey, {});
          // Call onSubmit from parent to handle navigation
          if (onSubmit) {
            await onSubmit({ success: true, data: result });
          }
          return { success: true, data: result };
        }
        return { success: false, message: 'Failed to update ledger' };
      }
      // Use create API for new ledger
      const result = await createOthers(data);
      if (result.success) {
        // Clear localStorage after successful creation
        setStoredValue(localStorageKey, {});
        toast.success('Account created successfully!');

        // Call onSubmit from parent to handle navigation
        if (onSubmit) {
          await onSubmit(result);
        }
        return { success: true, data: result.data };
      }

      // Show error message from API
      toast.error(result.message || 'Failed to create account');
      return { success: false, message: result.message };
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(error.message || `Failed to ${isEditMode ? 'update' : 'create'} account`);
      return { success: false, message: error.message };
    }
  });

  const renderAccountDetails = () => (
    <Card sx={{ p: 3, width: '100% !important', minWidth: '100% !important' }}>
      <Typography variant="h6" gutterBottom>
        Account Details
      </Typography>

      <Grid container spacing={3} sx={{ width: '100% !important' }}>
        {/* Account Information Section */}
        <Grid item xs={12} sx={{ width: '100% !important' }}>
          <Card
            sx={{
              p: 3,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'grey.50',
              width: '100% !important',
              minWidth: '100% !important',
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary', mb: 3 }}>
              Account Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Field.Select
                  name="ledgerType"
                  label="Ledger Type"
                  sx={{ minWidth: 200 }}
                  InputLabelProps={{ shrink: true }}
                >
                  {ledgerTypes.map((option) => (
                    <MenuItem key={option.id || option.value} value={option.id || option.value}>
                      {option.name || option.label}
                    </MenuItem>
                  ))}
                </Field.Select>
              </Grid>
              <Grid item xs={12} md={6}>
                <Field.Text name="accountName" label="Account Name" />
              </Grid>
              <Grid item xs={12} md={6}>
                <Field.Text
                  name="currentBalance"
                  label="Current Balance"
                  type="number"
                  InputProps={{
                    startAdornment: '₹',
                  }}
                />
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Note:</strong> Other account types are used for miscellaneous ledger entries that
          don&apos;t fall under Dealer, Customer, or Karigar categories. This includes general
          ledger accounts like expenses, assets, liabilities, etc.
        </Typography>
      </Box>
    </Card>
  );

  return (
    <Form methods={methods} onSubmit={onStepSubmit}>
      <Stack spacing={3} sx={{ width: '100% !important' }}>
        {renderAccountDetails()}

        <Card sx={{ p: 3, width: '100% !important', minWidth: '100% !important' }}>
          <Stack direction="row" justifyContent="space-between">
            <Button
              variant="outlined"
              onClick={onBack}
              disabled={activeStep === 0}
              startIcon={<Iconify icon="solar:arrow-left-bold" />}
            >
              Back
            </Button>

            <LoadingButton
              type="submit"
              variant="contained"
              loading={loading || updateLedgerDetailsLoading}
              endIcon={<Iconify icon="solar:check-circle-bold" />}
            >
              {isEditMode ? 'Update Account' : 'Create Account'}
            </LoadingButton>
          </Stack>
        </Card>
      </Stack>
    </Form>
  );
}
