import React, { useEffect, useCallback, useMemo, useRef } from 'react';
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
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import LoadingButton from '@mui/lab/LoadingButton';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Field, Form, schemaHelper } from 'src/components/hook-form';
import { setStoredValue, getStoredValue } from 'src/utils/services';
import { useSelector } from 'react-redux';
import { useAccounts } from 'src/hooks/useAccounts';
import { isValidPhoneNumber } from 'react-phone-number-input';
import { parsePhoneField } from 'src/components/hook-form/parsePhoneNumber';
import { useRouter } from 'src/routes/hooks';
import { useBoolean } from 'minimal-shared';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

// Schemas for each step
const generalDetailsSchema = zod.object({
  customerName: zod.string().min(1, 'Customer name is required'),
  whatsappNumber: schemaHelper.phoneNumber(
    { isValid: isValidPhoneNumber },
    true,
    'WhatsApp Number'
  ),
  city: zod.string().min(1, 'City is required'),
  otherPhoneNumber: schemaHelper.phoneNumber(
    { isValid: isValidPhoneNumber },
    false,
    'Phone Number'
  ),
  address: zod.string().optional(),
  state: zod.string().optional(),
  pincode: zod.string().optional(),
  gstNumber: zod.string().optional(),
  aadharCardNumber: zod.string().optional(),
  drivingLicenceNumber: zod.string().optional(),
  panNumber: zod.string().optional(),
  customerGroup: zod.number().optional(),
  email: zod.string().email().optional().or(zod.literal('')),
  birthDate: zod.string().optional(),
  anniversaryDate: zod.string().optional(),
  spouseName: zod.string().optional(),
  customerNote: zod.string().optional(),
});

const balanceDetailsSchema = zod.object({
  balanceEntries: zod
    .array(
      zod.object({
        id: zod.coerce.number().optional(), // For update
        // companySelection: zod.string().min(1, 'Company selection is required'),
        openingAmount: zod.coerce.number().min(0, 'Opening amount must be positive'),
        payableReceivable: zod.enum(['payable', 'receivable']),
        // payableReceivable: zod.enum(['payable', 'receivable']),
        // subCategory: zod.string().optional(),
        // openingWeight: zod.number().min(0, 'Opening weight must be positive').optional(),
        // fineType: zod.enum(['payable', 'receivable']).optional(),
      })
    )
    .optional(),
  reminderDate: zod.string().optional(),
  totalCashReceivedPerYear: zod.number().min(0, 'Total cash received must be positive').optional(),
});

const membershipDetailsSchema = zod.object({
  membershipNumber: zod.string().optional(),
  membershipName: zod.string().optional(),
});

// Mock data
// const CUSTOMER_GROUPS = [
//   { value: 'premium', label: 'Premium' },
//   { value: 'gold', label: 'Gold' },
//   { value: 'silver', label: 'Silver' },
//   { value: 'regular', label: 'Regular' },
// ];

const COMPANIES = [
  { value: 'company1', label: 'Suvarnakar Main' },
  { value: 'company2', label: 'Suvarnakar Branch 1' },
  { value: 'company3', label: 'Suvarnakar Branch 2' },
];

const SUB_CATEGORIES = [
  { value: 'gold_22k', label: 'Gold 22K' },
  { value: 'gold_18k', label: 'Gold 18K' },
  { value: 'silver_925', label: 'Silver 925' },
  { value: 'diamond', label: 'Diamond' },
];

const STATES = [
  { value: 'maharashtra', label: 'Maharashtra' },
  { value: 'gujarat', label: 'Gujarat' },
  { value: 'rajasthan', label: 'Rajasthan' },
  { value: 'delhi', label: 'Delhi' },
];

// ----------------------------------------------------------------------

export function CustomerForm({
  activeStep,
  onNext,
  onBack,
  onSubmit,
  onDataChange,
  formData,
  isLastStep,
  isEditMode = false,
  accountId,
}) {
  const router = useRouter();
  const confirmDialog = useBoolean();
  const toBeRemovedItem = useRef(null);
  const selectedCompany = useSelector((state) => state.user.selectedCompany);
  const company_id = selectedCompany?.company?.id;
  const customerInfo = useSelector((state) => state.account.currentCustomer) ?? formData;
  // In edit mode, use accountId prop; otherwise use dealer_id from Redux state
  const customer_id = isEditMode ? accountId : customerInfo?.account?.id;
  // Memoize the localStorage key to prevent unnecessary re-renders
  const localStorageKey = useMemo(() => `customer-form-${company_id || 'default'}`, [company_id]);

  const {
    accountCustomerGroups: customerGroups,
    fetchAccountCustomerGroups,
    createUpdateCustomerDetails,
    createBalanceDetails,
    createMembershipDetails,
    createCustomerDetailsLoading,
    createBalanceDetailsLoading,
    createMembershipDetailsLoading,
    createMoneyBalanceDetails,
    createUpdateMoneyBalanceDetails,
    deleteMoneyBalanceDetails,
  } = useAccounts();

  // Load form data from localStorage on mount
  const getInitialFormData = useCallback(() => {
    const storedData = getStoredValue(localStorageKey, {});
    return { ...formData }; // ...storedData
  }, [formData, localStorageKey]);

  // Save form data to localStorage whenever it changes
  const saveFormData = useCallback(
    (data) => {
      setStoredValue(localStorageKey, data);
    },
    [localStorageKey]
  );

  const getSchemaForStep = (step) => {
    switch (step) {
      case 0:
        return generalDetailsSchema;
      case 1:
        return balanceDetailsSchema;
      case 2:
        return membershipDetailsSchema;
      default:
        return zod.object({});
    }
  };

  const methods = useForm({
    resolver: zodResolver(getSchemaForStep(activeStep)),
    defaultValues: getInitialFormData(),
  });

  const { reset, handleSubmit, watch, setValue } = methods;

  // Save form data to localStorage whenever form values change
  useEffect(() => {
    const subscription = watch((value) => {
      saveFormData(value);
    });
    return () => subscription.unsubscribe();
  }, [watch, saveFormData]);

  // Reset form when step changes or formData changes
  useEffect(() => {
    const currentData = getInitialFormData();
    reset(currentData);
  }, [activeStep, reset, getInitialFormData]);

  useEffect(() => {
    if (activeStep === 0) fetchAccountCustomerGroups('', { pagination: false });
  }, [activeStep, fetchAccountCustomerGroups]);

  const onStepSubmit = handleSubmit(async (data) => {
    try {
      onDataChange(data);
      saveFormData(data);
      const payload = {
        generalDetails: null,
        balanceDetails: null,
        membershipDetails: null,
      };
      switch (activeStep) {
        case 0:
          {
            const { number: whatsapp_number, countryCode: whatsapp_country_code } = parsePhoneField(
              data.whatsappNumber || ''
            );
            const { number: other_phone_number, countryCode: other_phone_country_code } =
              parsePhoneField(data.otherPhoneNumber || '');

            payload['generalDetails'] = {
              ...data,
              whatsapp_number,
              whatsapp_country_code,
              other_phone_number,
              other_phone_country_code,
            };

            const payloadCustomerId = isEditMode ? customer_id : null;
            const result = await createUpdateCustomerDetails(
              payload,
              company_id,
              payloadCustomerId
            );
            if (result.success) {
              // Clear localStorage after successful creation
              setStoredValue(localStorageKey, {});
              onNext();
            }
          }

          break;
        case 1: {
          if (!customer_id || !company_id) {
            toast.error('Customer account ID and Company ID are required');
            return;
          }
          const balanceError = data?.balanceEntries?.find((item) => item.openingAmount == '0');
          if (balanceError) {
            toast.error('Opening amount should be greater than 0');
            return;
          }
          const result = await createUpdateMoneyBalanceDetails(
            data,
            company_id,
            customer_id,
            isEditMode
          );
          if (result.success) {
            // Clear localStorage after successful creation
            setStoredValue(localStorageKey, {});
            onNext();
          }
          break;
        }
        case 2: {
          console.log('data', customerInfo);
          const payloadCustomerId = customer_id;
          payload['membershipDetails'] = {
            ...data,
            customerName: customerInfo.customerName,
          };

          if (!payloadCustomerId) {
            toast.error('Customer account ID is required');
            return;
          }
          // Only Update
          const result = await createUpdateCustomerDetails(payload, company_id, payloadCustomerId);
          if (result.success) {
            // Clear localStorage after successful creation
            setStoredValue(localStorageKey, {});
            router.replace(`${paths.account.list}?tab=customers`);
          }
          break;
        }
        default:
          onNext();
          break;
      }
    } catch (error) {
      console.error('Error submitting step:', error);
      toast.error('Something went wrong!');
    }
  });

  const renderConfirmDialog = () => (
    <ConfirmDialog
      open={confirmDialog.value}
      onClose={confirmDialog.onFalse}
      title="Delete"
      content="Are you sure want to remove this Entry?"
      action={
        <Button
          variant="contained"
          color="error"
          onClick={activeStep === 1 ? deleteMoneyBalanceEntry : null}
        >
          Delete
        </Button>
      }
    />
  );

  const deleteMoneyBalanceEntry = async () => {
    try {
      const balance_detail_id = toBeRemovedItem?.current?.id;
      const response = await deleteMoneyBalanceDetails(balance_detail_id, company_id);
      if (response.success) {
        removeBalanceEntry(0);
        toast.success(response.message || 'Money balance details deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting money balance details:', error);
      toast.error(error?.message || 'Failed to delete money balance details');
    }
    confirmDialog.onFalse();
  };

  // Balance entries management
  const balanceEntries = watch('balanceEntries') || [];

  const addBalanceEntry = () => {
    const newEntries = [
      ...balanceEntries,
      {
        id: null,
        // companySelection: '',
        openingAmount: 0,
        payableReceivable: 'payable',
        // subCategory: '',
        // openingWeight: 0,
        // fineType: 'payable',
      },
    ];
    setValue('balanceEntries', newEntries);
  };

  const removeBalanceEntry = (index) => {
    if (isEditMode && toBeRemovedItem?.current?.id) {
      // match with id to be removed
      const newEntries =
        balanceEntries.filter((item) => item.id !== toBeRemovedItem?.current?.id) || [];
      setValue('balanceEntries', newEntries);
    } else {
      const newEntries = balanceEntries.filter((_, i) => i !== index);
      setValue('balanceEntries', newEntries);
    }
    toBeRemovedItem.current = null;
  };

  const renderGeneralDetails = () => (
    <Card sx={{ p: 3, width: '100% !important', minWidth: '100% !important' }}>
      <Typography variant="h6" gutterBottom>
        General Details
      </Typography>

      <Grid container spacing={3} sx={{ width: '100% !important' }}>
        {/* Basic Information Section */}
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
              Basic Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Field.Text name="customerName" label="Customer Name *" />
              </Grid>
              <Grid item xs={12} md={6}>
                <Field.Select
                  name="customerGroup"
                  label="Customer Group"
                  sx={{ minWidth: 200 }}
                  InputLabelProps={{ shrink: true }}
                >
                  {customerGroups?.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.name}
                    </MenuItem>
                  ))}
                </Field.Select>
              </Grid>
              <Grid item xs={12} md={6}>
                <Field.Text name="email" label="Email" type="email" />
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Contact Information Section */}
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
              Contact Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Field.Phone
                  name="whatsappNumber"
                  defaultCountry="IN"
                  label="WhatsApp Number"
                  placeholder="Enter WhatsApp number"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Field.Phone
                  name="otherPhoneNumber"
                  defaultCountry="IN"
                  label="Other Phone Number"
                  placeholder="Enter other phone number"
                />
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Address Information Section */}
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
              Address Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Field.Text
                  name="address"
                  label="Address"
                  multiline
                  rows={2}
                  sx={{
                    '& .MuiInputBase-root': {
                      '& textarea': {
                        resize: 'vertical',
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Field.Text name="city" label="City *" />
              </Grid>
              <Grid item xs={12} md={6}>
                <Field.Select
                  name="state"
                  label="State"
                  sx={{ minWidth: 200 }}
                  InputLabelProps={{ shrink: true }}
                >
                  {STATES.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Field.Select>
              </Grid>
              <Grid item xs={12} md={6}>
                <Field.Text name="pincode" label="Pincode" />
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Identity Documents Section */}
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
              Identity Documents
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Field.Text name="aadharCardNumber" label="Aadhar Card Number" />
              </Grid>
              <Grid item xs={12} md={6}>
                <Field.Text name="panNumber" label="PAN Number" />
              </Grid>
              <Grid item xs={12} md={6}>
                <Field.Text name="drivingLicenceNumber" label="Driving Licence Number" />
              </Grid>
              <Grid item xs={12} md={6}>
                <Field.Text name="gstNumber" label="GST Number" />
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Personal Information Section */}
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
              Personal Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Field.Text
                  name="birthDate"
                  label="Birth Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Field.Text
                  name="anniversaryDate"
                  label="Anniversary Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Field.Text name="spouseName" label="Spouse Name" />
              </Grid>
              <Grid item xs={12}>
                <Field.Text
                  name="customerNote"
                  label="Customer Note"
                  multiline
                  rows={3}
                  sx={{
                    '& .MuiInputBase-root': {
                      '& textarea': {
                        resize: 'vertical',
                      },
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>
    </Card>
  );

  const renderBalanceDetails = () => (
    <Card sx={{ p: 3, width: '100% !important', minWidth: '100% !important' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h6">Balance Details</Typography>
        <Button
          variant="outlined"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={addBalanceEntry}
        >
          Add Balance Entry
        </Button>
      </Stack>

      {balanceEntries.length > 0 && (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                {/* <TableCell>Company</TableCell> */}
                <TableCell>Opening Amount *</TableCell>
                <TableCell>Type *</TableCell>
                {/* <TableCell>Sub Category</TableCell> */}
                {/* <TableCell>Opening Weight</TableCell> */}
                {/* <TableCell>Fine Type</TableCell> */}
                <TableCell width={80}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {balanceEntries.map((entry, index) => (
                <TableRow key={index}>
                  {/* <TableCell>
                    <Field.Select
                      name={`balanceEntries.${index}.companySelection`}
                      label=""
                      size="small"
                      sx={{ minWidth: 150 }}
                      InputLabelProps={{ shrink: true }}
                    >
                      {COMPANIES.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Field.Select>
                  </TableCell> */}
                  <TableCell>
                    <Field.Text
                      type="number"
                      name={`balanceEntries.${index}.openingAmount`}
                      label=""
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Field.Select
                      name={`balanceEntries.${index}.payableReceivable`}
                      label=""
                      size="small"
                      sx={{ minWidth: 120 }}
                      InputLabelProps={{ shrink: true }}
                    >
                      <MenuItem value="payable">Payable</MenuItem>
                      <MenuItem value="receivable">Receivable</MenuItem>
                    </Field.Select>
                  </TableCell>
                  {/* <TableCell>
                    <Field.Select
                      name={`balanceEntries.${index}.subCategory`}
                      label=""
                      size="small"
                      sx={{ minWidth: 120 }}
                      InputLabelProps={{ shrink: true }}
                    >
                      {SUB_CATEGORIES.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Field.Select>
                  </TableCell>
                  <TableCell>
                    <Field.Text
                      name={`balanceEntries.${index}.openingWeight`}
                      label=""
                      type="number"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Field.Select name={`balanceEntries.${index}.fineType`} label="" size="small">
                      <MenuItem value="payable">Payable</MenuItem>
                      <MenuItem value="receivable">Receivable</MenuItem>
                    </Field.Select>
                  </TableCell> */}
                  <TableCell>
                    <IconButton
                      color="error"
                      onClick={() => {
                        if (isEditMode && entry.id) {
                          toBeRemovedItem.current = entry;
                          confirmDialog.onTrue();
                        } else {
                          removeBalanceEntry(index);
                        }
                      }}
                      size="small"
                    >
                      <Iconify icon="solar:trash-bin-trash-bold" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {balanceEntries.length === 0 && (
        <Box
          sx={{
            p: 3,
            textAlign: 'center',
            border: '1px dashed',
            borderColor: 'divider',
            borderRadius: 1,
            mb: 3,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            No balance entries added yet. Click &quot;Add Balance Entry&quot; to get started.
          </Typography>
        </Box>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Field.Text
            name="reminderDate"
            label="Reminder Date"
            type="date"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Field.Text
            name="totalCashReceivedPerYear"
            label="Total Cash Received Per Financial Year"
            type="number"
            InputProps={{
              startAdornment: '₹',
            }}
          />
        </Grid>
      </Grid>
    </Card>
  );

  const renderMembershipDetails = () => (
    <Card sx={{ p: 3, width: '100% !important', minWidth: '100% !important' }}>
      <Typography variant="h6" gutterBottom>
        Membership Details
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Field.Text name="membershipNumber" label="Membership Number" />
        </Grid>

        <Grid item xs={12} md={6}>
          <Field.Text name="membershipName" label="Membership Name" />
        </Grid>
      </Grid>
    </Card>
  );

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return renderGeneralDetails();
      case 1:
        return renderBalanceDetails();
      case 2:
        return renderMembershipDetails();
      default:
        return null;
    }
  };

  return (
    <Form methods={methods} onSubmit={onStepSubmit}>
      <Stack spacing={3} sx={{ width: '100% !important' }}>
        {renderStepContent()}

        <Card sx={{ p: 3, width: '100% !important', minWidth: '100% !important' }}>
          <Stack direction="row" justifyContent="space-between">
            <Button
              variant="outlined"
              onClick={onBack}
              disabled={
                activeStep === 0 ||
                createCustomerDetailsLoading ||
                createBalanceDetailsLoading ||
                createMembershipDetailsLoading
              }
              startIcon={<Iconify icon="solar:arrow-left-bold" />}
            >
              Back
            </Button>

            <LoadingButton
              type="submit"
              loading={
                createCustomerDetailsLoading ||
                createBalanceDetailsLoading ||
                createMembershipDetailsLoading
              }
              variant="contained"
              endIcon={
                isLastStep ? (
                  <Iconify icon="solar:check-circle-bold" />
                ) : (
                  <Iconify icon="solar:arrow-right-bold" />
                )
              }
            >
              {isLastStep ? 'Create Customer' : 'Next'}
            </LoadingButton>
          </Stack>
        </Card>
      </Stack>
      {renderConfirmDialog()}
    </Form>
  );
}
