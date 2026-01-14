import { useEffect, useCallback, useMemo, useRef } from 'react';
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
import { MultiFileUpload } from './components/multi-file-upload';
import { isValidPhoneNumber } from 'react-phone-number-input';
import { gstRegex } from 'src/auth/utils/regex';
import { parsePhoneField } from 'src/components/hook-form/parsePhoneNumber';
import { useRouter } from 'src/routes/hooks';
import { useBoolean } from 'minimal-shared';
import { useProducts } from 'src/hooks/useProducts';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

// Schemas for each step
const generalDetailsSchema = zod.object({
  karigarGstNumber: zod
    .string()
    .optional()
    .refine((val) => !val || gstRegex.test(val), { message: 'Invalid GST Number format' })
    .transform((val) => (val ? val : '')),

  ownerName: zod.string().min(1, 'Owner name is required'),
  firmName: zod.string().optional(),
  address: zod.string().optional(),
  permanentAddress: zod.string().optional(),
  city: zod.string().optional(), //min(1, 'City is required'),
  pincode: zod
    .string()
    .refine((val) => !val || val.length === 6, { message: 'Pincode must be 6 digits' })
    .optional(),
  karigarCode: zod.string().optional(),
  whatsappNumber: schemaHelper.phoneNumber(
    { isValid: isValidPhoneNumber },
    false,
    'WhatsApp Number'
  ),
  panNumber: zod.string().optional(),
  contactNumber: schemaHelper.phoneNumber({ isValid: isValidPhoneNumber }, false, 'Contact Number'),
  passportPhoto: zod.any().optional(),
  kycDocuments: zod.array(zod.any()).optional(),
});

const bankDetailsSchema = zod.object({
  bankName: zod.string().min(1, 'Bank name is required'),
  accountType: zod.string().min(1, 'Account type is required'),
  ifscCode: zod.string().min(1, 'IFSC code is required').max(11, 'IFSC code must be 11 characters'),
  accountNumber: zod.coerce
    .string()
    .min(1, 'Account number is required')
    .max(50, 'Account number must be 50 characters'),
});

const wastageDetailsSchema = zod.object({
  wastageEntries: zod
    .array(
      zod.object({
        id: zod.coerce.number().optional(), // For update
        product_id: zod.number().min(1, 'Product is required'),
        wastagePercentage: zod.coerce.number().min(0, 'Wastage percentage must be positive'),
      })
    )
    .optional(),
});

const balanceDetailsSchema = zod.object({
  balanceEntries: zod
    .array(
      zod.object({
        id: zod.coerce.number().optional(), // For update
        // companySelection: zod.string().min(1, 'Company selection is required'),
        openingAmount: zod.coerce.number().min(0, 'Opening amount must be positive'),
        payableReceivable: zod.enum(['payable', 'receivable']),
        // subCategory: zod.string().optional(),
        // openingWeight: zod.number().min(0, 'Opening weight must be positive').optional(),
        // fineType: zod.enum(['payable', 'receivable']).optional(),
      })
    )
    .optional(),
});
// Mock data
const ACCOUNT_TYPES = [
  { value: 'savings', label: 'Savings' },
  { value: 'current', label: 'Current' },
  { value: 'fixed', label: 'Fixed Deposit' },
];

const PRODUCT_TYPES = [
  { value: 'gold_jewelry', label: 'Gold Jewelry' },
  { value: 'silver_jewelry', label: 'Silver Jewelry' },
  { value: 'diamond_jewelry', label: 'Diamond Jewelry' },
  { value: 'gemstone_jewelry', label: 'Gemstone Jewelry' },
];

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

// ----------------------------------------------------------------------

export function KarigarForm({
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

  const { fetchItems: fetchProducts, data: products, loading: productsLoading } = useProducts();

  // Memoize the localStorage key to prevent unnecessary re-renders
  const selectedCompany = useSelector((state) => state.user.selectedCompany);
  const company_id = selectedCompany?.company?.id;

  const karigarInfo = useSelector(
    (state) => state.account.currentKarigar || state.account.karigarDetails
  );
  // In edit mode, use accountId prop; otherwise use karigar_id from Redux state
  const karigar_id = isEditMode ? accountId : karigarInfo?.account?.id;

  const localStorageKey = useMemo(() => `karigar-form-${company_id}`, [company_id]);
  const {
    createUpdateKarigar,
    createKarigarDetailsLoading,
    createUpdateAccountBankDetails,
    createAccountBankDetailsLoading,
    getAccountBankDetails,
    getAccountBankDetailsLoading,
    createUpdateWastageDetails,
    deleteWastageDetails,
    createUpdateMoneyBalanceDetails,
    deleteMoneyBalanceDetails,
    createMoneyBalanceDetailsLoading,
    createMetalBalanceDetailsLoading,
    createBankDetails,
    createBankDetailsLoading,
    createWastageDetails,
    createWastageDetailsLoading,
    createBalanceDetails,
    createBalanceDetailsLoading,
  } = useAccounts();

  // Load form data from localStorage on mount
  const getInitialFormData = useCallback(() => {
    // const storedData = getStoredValue(localStorageKey, {});
    const finalData = { ...formData }; // ...storedData,
    return finalData;
  }, [formData, localStorageKey]);

  // Save form data to localStorage whenever it changes
  const saveFormData = useCallback(
    (data) => {
      setStoredValue(localStorageKey, data);
    },
    [localStorageKey]
  );

  // Fetch products when component mounts or when on wastage details step
  useEffect(() => {
    if (company_id && activeStep === 2 && (!products || products.length === 0)) {
      fetchProducts({ pagination: false });
    }
  }, [company_id, activeStep, fetchProducts, products]);

  const getSchemaForStep = (step) => {
    switch (step) {
      case 0:
        return generalDetailsSchema;
      case 1:
        return bankDetailsSchema;
      case 2:
        return wastageDetailsSchema;
      case 3:
        return balanceDetailsSchema;
      default:
        return zod.object({});
    }
  };

  const methods = useForm({
    resolver: zodResolver(getSchemaForStep(activeStep)),
    defaultValues: getInitialFormData(),
  });

  const {
    reset,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting, isValid, errors },
  } = methods;

  // Save form data to localStorage whenever form values change
  useEffect(() => {
    const subscription = watch((value) => {
      saveFormData(value);
    });
    return () => subscription.unsubscribe();
  }, [watch, saveFormData]);

  // Reset form when step changes or formData changes
  useEffect(() => {
    // Don't reset form if we're on Bank Details step in edit mode (handled separately)
    if (isEditMode && activeStep === 1) {
      return;
    }
    const currentData = getInitialFormData();
    reset(currentData);
  }, [activeStep, reset, getInitialFormData]);

  const onStepSubmit = handleSubmit(async (data) => {
    try {
      onDataChange(data);
      saveFormData(data);
      switch (activeStep) {
        case 0: {
          const { number: whatsapp_number, countryCode: whatsapp_country_code } = parsePhoneField(
            data.whatsappNumber || ''
          );
          const { number: contact_number, countryCode: contact_country_code } = parsePhoneField(
            data.contactNumber || ''
          );
          data = {
            ...data,
            whatsappNumber: whatsapp_number,
            whatsappCountryCode: whatsapp_country_code,
            contactNumber: contact_number,
            contactCountryCode: contact_country_code,
          };
          const id = isEditMode ? karigar_id : null;
          const result = await createUpdateKarigar(data, company_id, id);
          if (result.success) {
            // Clear localStorage after successful creation
            setStoredValue(localStorageKey, {});
            onNext();
          }
          break;
        }
        case 1: {
          // const result = await createBankDetails({ data });
          // if (result.success) {
          //   // Clear localStorage after successful creation
          //   setStoredValue(localStorageKey, {});
          //   onNext();
          // }
          // break;
          if (!karigar_id) {
            toast.error('Karigar account ID is required');
            return;
          }
          const bankId = isEditMode ? formData?.bankId : null;
          const result = await createUpdateAccountBankDetails(data, karigar_id, company_id, bankId);
          if (result.success) {
            // Clear localStorage after successful creation
            toast.success(result.message || 'Bank details saved successfully');
            setStoredValue(localStorageKey, {});
            onNext();
          }
          break;
        }
        case 2: {
          // const result = await createWastageDetails({ data });
          // if (result.success) {
          //   // Clear localStorage after successful creation
          //   setStoredValue(localStorageKey, {});
          //   onNext();
          // }
          // break;
          if (!karigar_id || !company_id) {
            toast.error('Karigar account ID and Company ID are required');
            return;
          }
          const wastageError = data?.wastageEntries?.find(
            (item) => item.wastagePercentage == '0' || item.wastagePercentage > '100'
          );
          if (wastageError) {
            toast.error('Wastage percentage should be less than 100%');
            return;
          }
          const result = await createUpdateWastageDetails(data, company_id, karigar_id, isEditMode);
          if (result) {
            toast.success(result?.message || 'Wastage details saved successfully');
            setStoredValue(localStorageKey, {});
            onNext();
          }
          break;
        }
        case 3: {
          // const result = await createBalanceDetails({ data });
          // if (result.success) {
          //   // Clear localStorage after successful creation
          //   setStoredValue(localStorageKey, {});
          //   onNext();
          // }
          // break;

          if (!karigar_id || !company_id) {
            toast.error('Karigar account ID and Company ID are required');
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
            karigar_id,
            isEditMode
          );
          if (result.success) {
            // Clear localStorage after successful creation
            setStoredValue(localStorageKey, {});
            // back to list
            router.replace(`${paths.account.list}?tab=Karigars`);
          }
          break;
        }
        default:
          console.error('Unknown step:', activeStep);
          break;
      }
    } catch (error) {
      console.error('Error submitting step:', error);
      // toast.error('Something went wrong!');
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
          onClick={
            activeStep === 2
              ? deleteWastageEntry
              : activeStep === 3
                ? deleteMoneyBalanceEntry
                : null
          }
        >
          Delete
        </Button>
      }
    />
  );

  // Wastage entries management
  const wastageEntries = watch('wastageEntries') || [];
  console.log('wastageEntries', wastageEntries);

  const addWastageEntry = () => {
    const newEntries = [...wastageEntries, { id: null, product_id: 0, wastagePercentage: 0 }];
    setValue('wastageEntries', newEntries);
  };

  const removeWastageEntry = (index) => {
    if (isEditMode && toBeRemovedItem?.current?.id) {
      // match with id to be removed
      const newEntries = wastageEntries.filter((item) => item.id !== toBeRemovedItem?.current?.id);
      setValue('wastageEntries', newEntries);
    } else {
      const newEntries = wastageEntries.filter((_, i) => i !== index);
      setValue('wastageEntries', newEntries);
    }
    toBeRemovedItem.current = null;
  };

  const deleteWastageEntry = async () => {
    try {
      const wastage_detail_id = toBeRemovedItem?.current?.id;
      const response = await deleteWastageDetails(wastage_detail_id, company_id);
      if (response.success) {
        removeWastageEntry(0);
        toast.success(response.message || 'Wastage details deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting wastage details:', error);
      toast.error(error?.message || 'Failed to delete wastage details');
    }
    confirmDialog.onFalse();
  };

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
                <Field.Text name="karigarGstNumber" label="Karigar GST Number" />
              </Grid>
              <Grid item xs={12} md={6}>
                <Field.Text name="karigarCode" label="Karigar Code" />
              </Grid>
              <Grid item xs={12} md={6}>
                <Field.Text name="ownerName" label="Owner Name" required />
              </Grid>
              <Grid item xs={12} md={6}>
                <Field.Text name="firmName" label="Firm Name" />
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
              <Grid item xs={12} md={6}>
                <Field.Text
                  name="address"
                  label="Current Address"
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
                <Field.Text
                  name="permanentAddress"
                  label="Permanent Address"
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
                <Field.Text name="city" label="City" />
              </Grid>
              <Grid item xs={12} md={6}>
                <Field.Text name="pincode" label="Pincode" />
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
                  // required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Field.Phone
                  name="contactNumber"
                  defaultCountry="IN"
                  label="Contact Number"
                  // required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Field.Text name="panNumber" label="PAN Number" />
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Document Upload Section */}
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
              Document Upload
            </Typography>
            <Stack spacing={3} sx={{ width: '100%' }}>
              <Box sx={{ width: '100%' }}>
                <MultiFileUpload
                  name="passportPhoto"
                  label="Passport Size Photograph"
                  accept="image/*"
                  maxFiles={1}
                  helperText="Upload passport size photo (JPG, PNG only)"
                />
              </Box>
              <Box sx={{ width: '100%' }}>
                <MultiFileUpload
                  name="kycDocuments"
                  label="KYC Documents (Up to 4 documents)"
                  accept="image/*,.pdf"
                  maxFiles={4}
                  helperText="Upload KYC documents like Aadhar, PAN, Driving License, etc. (Images or PDF)"
                />
              </Box>
              <Box sx={{ width: '100%' }}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: 'info.lighter',
                    borderRadius: 1,
                    border: '1px dashed',
                    borderColor: 'info.main',
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    <strong>📋 Document Guidelines:</strong>
                    <br />
                    • Passport Photo: Ensure the photo is passport size (2x2 inches) and clearly
                    shows the face
                    <br />
                    • KYC Documents: Upload clear copies of Aadhar Card, PAN Card, or other identity
                    documents
                    <br />• Accepted formats: JPG, PNG for photos; PDF, JPG, PNG for KYC documents
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Card>
  );

  const renderBankDetails = () => (
    <Card sx={{ p: 3, width: '100% !important', minWidth: '100% !important' }}>
      <Typography variant="h6" gutterBottom>
        Bank Details
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Field.Text name="bankName" label="Bank Name *" />
        </Grid>

        <Grid item xs={12} md={6}>
          <Field.Select
            name="accountType"
            label="Account Type *"
            sx={{ minWidth: 200 }}
            InputLabelProps={{ shrink: true }}
          >
            <MenuItem value="">--Select--</MenuItem>
            {ACCOUNT_TYPES.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Field.Select>
        </Grid>

        <Grid item xs={12} md={6}>
          <Field.Text name="ifscCode" label="IFSC Code *" />
        </Grid>

        <Grid item xs={12} md={6}>
          <Field.Text type="number" name="accountNumber" label="Account Number *" />
        </Grid>
      </Grid>
    </Card>
  );

  const renderWastageDetails = () => (
    <Card sx={{ p: 3, width: '100% !important', minWidth: '100% !important' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h6">Wastage Details</Typography>
        <Button
          variant="outlined"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={addWastageEntry}
        >
          Add Wastage Entry
        </Button>
      </Stack>

      {wastageEntries.length > 0 && (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>Wastage Percentage</TableCell>
                <TableCell width={80}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {wastageEntries.map((entry, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Field.Select
                      name={`wastageEntries.${index}.product_id`}
                      label=""
                      size="small"
                      sx={{ minWidth: 200 }}
                      InputLabelProps={{ shrink: true }}
                      disabled={productsLoading}
                    >
                      <MenuItem value="" disabled>
                        <em>Select Product</em>
                      </MenuItem>
                      {productsLoading ? (
                        <MenuItem value={0} disabled>
                          Loading products...
                        </MenuItem>
                      ) : products && products.length > 0 ? (
                        products.map((product) => (
                          <MenuItem key={product.id} value={product.id}>
                            {product.name || product.product_name || `Product ${product.id}`}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem value={0} disabled>
                          No products available
                        </MenuItem>
                      )}
                    </Field.Select>
                  </TableCell>
                  <TableCell>
                    <Field.Text
                      name={`wastageEntries.${index}.wastagePercentage`}
                      label=""
                      type="number"
                      size="small"
                      InputProps={{ endAdornment: '%' }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="error"
                      onClick={() => {
                        if (isEditMode && entry.id) {
                          toBeRemovedItem.current = entry;
                          confirmDialog.onTrue();
                        } else {
                          removeWastageEntry(index);
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

      {wastageEntries.length === 0 && (
        <Box
          sx={{
            p: 3,
            textAlign: 'center',
            border: '1px dashed',
            borderColor: 'divider',
            borderRadius: 1,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            No wastage entries added yet. Click &quot;Add Wastage Entry&quot; to get started.
          </Typography>
        </Box>
      )}
    </Card>
  );

  const renderBalanceDetails = () => (
    <Card sx={{ p: 3, width: '100% !important', minWidth: '100% !important' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h6">Money Balance Details</Typography>
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
          }}
        >
          <Typography variant="body2" color="text.secondary">
            No balance entries added yet. Click &quot;Add Balance Entry&quot; to get started.
          </Typography>
        </Box>
      )}
    </Card>
  );

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return renderGeneralDetails();
      case 1:
        return renderBankDetails();
      case 2:
        return renderWastageDetails();
      case 3:
        return renderBalanceDetails();
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
            {/* Loading overlay */}
            {(isSubmitting ||
              createKarigarDetailsLoading ||
              createBankDetailsLoading ||
              createWastageDetailsLoading ||
              createBalanceDetailsLoading ||
              createAccountBankDetailsLoading ||
              createWastageDetailsLoading ||
              createMoneyBalanceDetailsLoading ||
              createMetalBalanceDetailsLoading) && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1000,
                  borderRadius: 1,
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      border: '2px solid',
                      borderColor: 'primary.main',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      '@keyframes spin': {
                        '0%': { transform: 'rotate(0deg)' },
                        '100%': { transform: 'rotate(360deg)' },
                      },
                    }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {isLastStep
                      ? isEditMode
                        ? 'Updating Karigar...'
                        : 'Creating Karigar...'
                      : 'Saving step...'}
                  </Typography>
                </Stack>
              </Box>
            )}
            <Button
              variant="outlined"
              onClick={onBack}
              disabled={
                activeStep === 0 ||
                createKarigarDetailsLoading ||
                createBankDetailsLoading ||
                createWastageDetailsLoading ||
                createBalanceDetailsLoading
              }
              startIcon={<Iconify icon="solar:arrow-left-bold" />}
            >
              Back
            </Button>

            <LoadingButton
              type="submit"
              variant="contained"
              loading={
                createKarigarDetailsLoading ||
                createBankDetailsLoading ||
                createWastageDetailsLoading ||
                createBalanceDetailsLoading
              }
              endIcon={
                isLastStep ? (
                  <Iconify icon="solar:check-circle-bold" />
                ) : (
                  <Iconify icon="solar:arrow-right-bold" />
                )
              }
            >
              {isLastStep ? 'Create Karigar' : 'Next'}
            </LoadingButton>
          </Stack>
        </Card>
      </Stack>
      {renderConfirmDialog()}
    </Form>
  );
}
