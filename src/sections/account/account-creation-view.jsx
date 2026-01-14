import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams, useParams, usePathname } from 'src/routes/hooks';
import { useAccounts } from 'src/hooks/useAccounts';
import { useSelector } from 'react-redux';
import { toast } from 'src/components/snackbar';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Paper from '@mui/material/Paper';

import { paths } from 'src/routes/paths';
import { useSettingsContext } from 'src/components/settings';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { DealerForm } from './forms/dealer-form';
import { CustomerForm } from './forms/customer-form';
import { KarigarForm } from './forms/karigar-form';
import { OthersForm } from './forms/others-form';
import { setStoredValue, getStoredValue } from 'src/utils/services';
import { getCompleteNumber } from 'src/components/hook-form/parsePhoneNumber';
import { id } from 'zod/v4/locales';

// ----------------------------------------------------------------------

const ACCOUNT_TYPES = [
  {
    value: 'dealer',
    label: 'Dealer',
    description: 'Business dealers and suppliers',
    icon: 'solar:shop-bold',
    color: 'primary',
  },
  {
    value: 'customer',
    label: 'Customer',
    description: 'End customers and buyers',
    icon: 'solar:user-bold',
    color: 'success',
  },
  {
    value: 'karigar',
    label: 'Karigar',
    description: 'Craftsmen and artisans',
    icon: 'eva:settings-2-fill',
    color: 'warning',
  },
  {
    value: 'others',
    label: 'Others',
    description: 'Other account types',
    icon: 'solar:folder-bold',
    color: 'info',
  },
];

const getStepsForAccountType = (accountType) => {
  switch (accountType) {
    case 'dealer':
      return ['General Details', 'Bank Details', 'Wastage Details', 'Balance Details'];
    case 'customer':
      return ['General Details', 'Balance Details', 'Membership Details'];
    case 'karigar':
      return ['General Details', 'Bank Details', 'Wastage Details', 'Balance Details'];
    case 'others':
      return ['Account Details'];
    default:
      return [];
  }
};

// ----------------------------------------------------------------------

export function AccountCreationView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const pathname = usePathname();
  const settings = useSettingsContext();
  const {
    createDealer,
    createCustomer,
    createKarigar,
    getDealerById,
    getCustomerById,
    getKarigarById,
    getLedgerById,
    loading,
  } = useAccounts();

  // Get account type from URL query parameter
  const accountTypeFromUrl = searchParams.get('type');
  // Get account ID from route params (for edit) or query params (for creation with type)
  const accountIdFromUrl = params.id || searchParams.get('id');
  const isEditMode = !!params.id; // If we have an ID in route params, we're in edit mode

  const [formData, setFormData] = useState({});
  const [selectedAccountType, setSelectedAccountType] = useState(
    accountTypeFromUrl || getStoredValue('accountType', '')
  );
  // Reset activeStep to 0 when entering edit mode, otherwise use stored value
  const [activeStep, setActiveStep] = useState(isEditMode ? 0 : getStoredValue('activeStep', 0));

  // Clear form data when entering create mode (not edit mode)
  const selectedCompany = useSelector((state) => state.user.selectedCompany);

  useEffect(() => {
    if (!isEditMode && !accountIdFromUrl) {
      // We're in create mode, clear any existing form data
      setFormData({});
      const companyId = selectedCompany?.company?.id || 'default';
      setStoredValue(`dealer-form-${companyId}`, {});
      setStoredValue(`customer-form-${companyId}`, {});
      setStoredValue(`karigar-form-${companyId}`, {});
      setStoredValue(`others-form-${companyId}`, {});
      setStoredValue('activeStep', 0);
    }
  }, [isEditMode, accountIdFromUrl, selectedCompany]);

  // Reset activeStep when entering edit mode
  useEffect(() => {
    if (isEditMode && accountIdFromUrl) {
      setActiveStep(0);
      setStoredValue('activeStep', 0);
    }
  }, [isEditMode, accountIdFromUrl]);

  // Ensure account type is set from URL in edit mode
  useEffect(() => {
    if (isEditMode && accountTypeFromUrl && !selectedAccountType) {
      setSelectedAccountType(accountTypeFromUrl);
      setStoredValue('accountType', accountTypeFromUrl);
    }
  }, [isEditMode, accountTypeFromUrl, selectedAccountType]);

  const steps = getStepsForAccountType(selectedAccountType);

  // Set account type from URL parameter on mount
  useEffect(() => {
    if (accountTypeFromUrl) {
      setSelectedAccountType(accountTypeFromUrl);
      setStoredValue('accountType', accountTypeFromUrl);
      if (!isEditMode) {
        setActiveStep(0);
        setStoredValue('activeStep', 0);
        // Clear form data when entering create mode
        setFormData({});
        const companyId = selectedCompany?.company?.id || 'default';
        setStoredValue(`dealer-form-${companyId}`, {});
        setStoredValue(`customer-form-${companyId}`, {});
        setStoredValue(`karigar-form-${companyId}`, {});
        setStoredValue(`others-form-${companyId}`, {});
      }
    }
  }, [accountTypeFromUrl, isEditMode, selectedCompany]);

  // Single useEffect to handle account type changes and step resets
  useEffect(() => {
    if (selectedAccountType) {
      const lastAccountType = getStoredValue('accountType', '');

      // Only reset step if the user selected a different type
      if (selectedAccountType !== lastAccountType) {
        setActiveStep(0);
        setStoredValue('activeStep', 0);
      }

      // Persist the current account type
      setStoredValue('accountType', selectedAccountType);
    }
  }, [selectedAccountType]);

  // Separate useEffect to persist active step changes
  useEffect(() => {
    setStoredValue('activeStep', activeStep);
  }, [activeStep]);

  // Fetch account data when in edit mode
  const company_id = selectedCompany?.company?.id;

  const [dataFetched, setDataFetched] = useState(false);

  useEffect(() => {
    // Prevent multiple calls - only fetch once when all conditions are met
    if (!isEditMode || !accountIdFromUrl || !selectedAccountType || !company_id || dataFetched) {
      return undefined;
    }

    let isCancelled = false;

    const fetchAccountData = async () => {
      try {
        switch (selectedAccountType) {
          case 'dealer': {
            const dealerData = await getDealerById(accountIdFromUrl, company_id);
            if (!isCancelled && !dealerData) toast.error('Failed to fetch dealer data');
            // Check if the request was cancelled
            if (!isCancelled && dealerData) {
              // Map API response to form data structure
              const mappedData = {
                // General Details Start
                dealerName: dealerData.name,
                ownerName: dealerData.owner_name,
                address: dealerData.address,
                city: dealerData.city,
                pincode: dealerData.pincode,
                dealerCode: dealerData.dealer_code,
                dealerSupplyType: dealerData.dealer_supply_type,
                whatsappNumber: getCompleteNumber(
                  dealerData.whatsapp_country_code,
                  dealerData.whatsapp_number
                ),
                panCardNumber: dealerData.pan_no || '',
                contactNumber: getCompleteNumber(
                  dealerData.contact_country_code,
                  dealerData.contact_number
                ),
                dealerGstNumber: dealerData.gst_number,
                // General Details End

                // Bank Details Start
                bankId: dealerData?.bank_detail?.id,
                bankName: dealerData?.bank_detail?.bank_name,
                accountType: dealerData?.bank_detail?.account_type,
                ifscCode: dealerData?.bank_detail?.ifsc_code,
                accountNumber: dealerData?.bank_detail?.account_number,
                // Bank Details End

                // Wastage Details Start
                wastageEntries: dealerData?.wastage_details?.map((entry) => ({
                  id: entry.id,
                  product_id: entry.product,
                  wastagePercentage: entry.wastage_percent,
                })),
                // Wastage Details End

                // Balance Details Start
                balanceEntries: dealerData?.money_balance_details?.map((entry) => ({
                  id: entry.id,
                  openingAmount: entry.opening_amount,
                  payableReceivable: entry.amount_type,
                })),
                // Balance Details End
              };
              setFormData(mappedData);
              setDataFetched(true);
            }
            break;
          }
          case 'customer': {
            const apiData = await getCustomerById(accountIdFromUrl, company_id);
            if (!isCancelled && !apiData) toast.error('Failed to fetch customer data');
            // Check if the request was cancelled
            else if (!isCancelled && apiData) {
              // Map API response to form data structure
              const mappedData = {
                // Basic
                customerName: apiData.name ?? '',
                city: apiData.city ?? '',

                // WhatsApp
                whatsappNumber: getCompleteNumber(
                  apiData.whatsapp_country_code,
                  apiData.whatsapp_number
                ),
                // Other Phone
                otherPhoneNumber: getCompleteNumber(
                  apiData.other_phone_country_code,
                  apiData.other_phone_number
                ),

                // Address
                address: apiData.address ?? '',
                state: apiData.state ?? '',
                pincode: apiData.pincode ?? '',

                // Documents
                gstNumber: apiData.gst_number ?? '',
                aadharCardNumber: apiData.adhar_card_number ?? '',
                drivingLicenceNumber: apiData.driving_license_number ?? '',
                panNumber: apiData.pan_number ?? apiData.pan_no ?? '',

                // Group
                customerGroup: apiData.customer_group ? Number(apiData.customer_group) : null,

                // Contact
                email: apiData.email ?? '',

                // Dates (API → Form)
                birthDate: apiData.birthday_date ?? '',
                anniversaryDate: apiData.anniversary_date ?? '',

                // Extra
                spouseName: apiData.spouse_name ?? '',
                customerNote: apiData.customer_note ?? '',

                // Balance Details Start
                balanceEntries: apiData?.money_balance_details?.map((entry) => ({
                  id: entry.id,
                  openingAmount: entry.opening_amount,
                  payableReceivable: entry.amount_type,
                })),
                // Balance Details End

                // Membership  Start
                membershipNumber: apiData.membership_number ?? '',
                membershipName: apiData.membership_name ?? '',
                // MemberShip End
              };
              setFormData(mappedData);
              setDataFetched(true);
            }
            break;
          }
          case 'karigar': {
            const karigaraData = await getKarigarById(accountIdFromUrl, company_id);
            if (!isCancelled && !karigaraData) toast.error('Failed to fetch karigar data');
            // Check if the request was cancelled
            if (!isCancelled && karigaraData) {
              // Map API response to form data structure
              const mappedData = {
                ownerName: karigaraData.name ?? '',
                firmName: karigaraData.firm_name ?? '',

                address: karigaraData.address ?? '',
                permanentAddress: karigaraData.permanent_address ?? '',

                city: karigaraData.city ?? '',
                pincode: karigaraData.pincode ?? '',

                karigarCode: karigaraData.karigar_code ?? '',

                whatsappNumber: getCompleteNumber(
                  karigaraData.whatsapp_country_code,
                  karigaraData.whatsapp_number
                ),

                contactNumber: getCompleteNumber(
                  karigaraData.contact_country_code,
                  karigaraData.contact_number
                ),

                panNumber: karigaraData.pan_no ?? '',
                gstNumber: karigaraData.gst_number ?? '',

                passportPhoto: karigaraData.passport_photo ?? '',
                kycDocuments: karigaraData.kyc_documents ?? '',

                // Bank Details Start
                bankId: karigaraData?.bank_detail?.id,
                bankName: karigaraData?.bank_detail?.bank_name,
                accountType: karigaraData?.bank_detail?.account_type,
                ifscCode: karigaraData?.bank_detail?.ifsc_code,
                accountNumber: karigaraData?.bank_detail?.account_number,
                // Bank Details End

                // Wastage Details Start
                wastageEntries: karigaraData?.wastage_details?.map((entry) => ({
                  id: entry.id,
                  product_id: entry.product,
                  wastagePercentage: entry.wastage_percent,
                })),
                // Wastage Details End

                // Balance Details Start
                balanceEntries: karigaraData?.money_balance_details?.map((entry) => ({
                  id: entry.id,
                  openingAmount: entry.opening_amount,
                  payableReceivable: entry.amount_type,
                })),
                // Balance Details End
              };

              setFormData(mappedData);
              setDataFetched(true);
            }
            break;
          }
          case 'others': {
            const ledgerResponse = await getLedgerById(accountIdFromUrl, company_id);
            if (!isCancelled && !ledgerResponse) toast.error('Failed to fetch ledger data');
            // Check if the request was cancelled
            if (!isCancelled && ledgerResponse) {
              // Handle different response structures
              const ledgerData = ledgerResponse?.data || ledgerResponse;
              if (ledgerData) {
                // Map API response to form data structure
                const mappedData = {
                  ledgerType:
                    ledgerData.ledger_type ||
                    ledgerData.ledger_type_id ||
                    ledgerData.ledger_type_name?.id,
                  accountName: ledgerData.ledger_name || ledgerData.name,
                  currentBalance: ledgerData.current_balance
                    ? parseFloat(ledgerData.current_balance)
                    : 0,
                };
                setFormData(mappedData);
                setDataFetched(true);
              }
            }
            break;
          }
          default:
            console.error('Invalid account type:', selectedAccountType);
            break;
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Error fetching account data:', error);
          toast.error('Failed to load account data');
        }
      }
    };

    fetchAccountData();

    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, accountIdFromUrl, selectedAccountType, company_id, dataFetched]); // dataFetched prevents multiple calls

  // Reset dataFetched when accountId or accountType changes
  useEffect(() => {
    setDataFetched(false);
  }, [accountIdFromUrl, selectedAccountType]);

  // Clear form data when switching from edit mode to create mode
  useEffect(() => {
    if (!isEditMode && !accountIdFromUrl) {
      // We're in create mode, clear any existing form data
      setFormData({});
      setActiveStep(0);
      // Clear localStorage for all form types
      const companyId = selectedCompany?.company?.id || 'default';
      setStoredValue(`dealer-form-${companyId}`, {});
      setStoredValue(`customer-form-${companyId}`, {});
      setStoredValue(`karigar-form-${companyId}`, {});
      setStoredValue(`others-form-${companyId}`, {});
      setStoredValue('activeStep', 0);
    }
  }, [isEditMode, accountIdFromUrl, selectedCompany]);

  const handleAccountTypeChange = useCallback(
    (event) => {
      const newAccountType = event.target.value;
      setSelectedAccountType(newAccountType);
      setActiveStep(0);
      setFormData({});

      // Clear localStorage for all form types when switching account types
      const companyId = selectedCompany?.company?.id || 'default';
      setStoredValue(`dealer-form-${companyId}`, {});
      setStoredValue(`customer-form-${companyId}`, {});
      setStoredValue(`karigar-form-${companyId}`, {});
      setStoredValue(`others-form-${companyId}`, {});

      // Update URL query parameter
      const queryString = new URLSearchParams({ type: newAccountType }).toString();
      router.replace(`${pathname}?${queryString}`, { replace: true });
    },
    [router, pathname, selectedCompany]
  );

  const handleNext = useCallback(() => {
    setActiveStep((prevStep) => {
      const newStep = prevStep + 1;
      setStoredValue('activeStep', newStep);
      return newStep;
    });
  }, []);

  const handleBack = useCallback(() => {
    setActiveStep((prevStep) => {
      const newStep = prevStep - 1;
      setStoredValue('activeStep', newStep);
      return newStep;
    });
  }, []);

  const handleStepClick = useCallback((step) => {
    const stepNumber = Number(step);
    setActiveStep(stepNumber);
    setStoredValue('activeStep', stepNumber);
  }, []);

  const handleFormDataChange = useCallback((stepData) => {
    setFormData((prev) => ({ ...prev, ...stepData }));
  }, []);

  const handleSubmit = useCallback(
    async (result) => {
      try {
        // Map account types to tab names
        const accountTypeToTabMap = {
          dealer: 'dealers',
          customer: 'customers',
          karigar: 'karigars',
          others: 'others',
        };

        // Get the tab name for the current account type
        const tabName = accountTypeToTabMap[selectedAccountType] || 'dealers';

        // If result is already passed (for 'others' type or edit mode), use it directly
        // Otherwise, call the appropriate create function
        if (result && result.success) {
          // Clear all form localStorage
          setStoredValue('dealer-form-default', {});
          setStoredValue('customer-form-default', {});
          setStoredValue('karigar-form-default', {});
          setStoredValue('others-form-default', {});
          setStoredValue('accountType', '');
          setStoredValue('activeStep', 0);

          // Navigate to account list with the appropriate tab
          router.push(`${paths.account.list}?tab=${tabName}`);
          return;
        }

        // For multi-step forms (dealer, customer, karigar)
        let apiResult;
        switch (selectedAccountType) {
          case 'dealer':
            apiResult = await createDealer(formData);
            break;
          case 'customer':
            apiResult = await createCustomer(formData);
            break;
          case 'karigar':
            apiResult = await createKarigar(formData);
            break;
          default:
            throw new Error('Invalid account type');
        }

        if (apiResult.success) {
          // Clear all form localStorage
          setStoredValue('dealer-form-default', {});
          setStoredValue('customer-form-default', {});
          setStoredValue('karigar-form-default', {});
          setStoredValue('others-form-default', {});
          setStoredValue('accountType', '');
          setStoredValue('activeStep', 0);

          // Navigate to account list with the appropriate tab
          router.push(`${paths.account.list}?tab=${tabName}`);
        }
      } catch (error) {
        console.error('Error creating account:', error);
      }
    },
    [selectedAccountType, formData, router, createDealer, createCustomer, createKarigar]
  );

  const renderAccountTypeSelection = () => (
    <Card sx={{ p: 4 }}>
      <Typography variant="h6" gutterBottom>
        Select Account Type
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Choose the type of account you want to create
      </Typography>

      <FormControl component="fieldset">
        <RadioGroup
          value={selectedAccountType}
          onChange={handleAccountTypeChange}
          row
          sx={{ gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}
        >
          {ACCOUNT_TYPES.map((type) => (
            <Paper
              key={type.value}
              variant="outlined"
              sx={{
                p: 2,
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: selectedAccountType === type.value ? 2 : 1,
                borderColor: selectedAccountType === type.value ? `${type.color}.main` : 'divider',
                bgcolor:
                  selectedAccountType === type.value ? `${type.color}.lighter` : 'transparent',
                minWidth: 200,
                maxWidth: 250,
                '&:hover': {
                  borderColor: `${type.color}.main`,
                  bgcolor: `${type.color}.lighter`,
                },
              }}
              onClick={() => {
                const event = { target: { value: type.value } };
                handleAccountTypeChange(event);
              }}
            >
              <FormControlLabel
                value={type.value}
                control={<Radio sx={{ display: 'none' }} />}
                label={
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ width: 1 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 1.5,
                        bgcolor: `${type.color}.main`,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Iconify icon={type.icon} width={24} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {type.label}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {type.description}
                      </Typography>
                    </Box>
                    {selectedAccountType === type.value && (
                      <Iconify
                        icon="solar:check-circle-bold"
                        sx={{ color: `${type.color}.main` }}
                        width={24}
                      />
                    )}
                  </Stack>
                }
                sx={{ m: 0, width: 1 }}
              />
            </Paper>
          ))}
        </RadioGroup>
      </FormControl>
    </Card>
  );

  const RenderProgressStepper = () => (
    <Card sx={{ p: 3, mb: 3 }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label, index) => (
          <Step key={label} completed={index < activeStep}>
            <StepLabel
              sx={{
                cursor: 'pointer',
                '& .MuiStepLabel-label': {
                  fontSize: '0.875rem',
                  fontWeight: index === activeStep ? 600 : 400,
                },
              }}
              onClick={() => isEditMode && handleStepClick(index)}
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Card>
  );

  const RenderForm = () => {
    if (!selectedAccountType) return null;

    const commonProps = {
      activeStep,
      onNext: handleNext,
      onBack: handleBack,
      onSubmit: handleSubmit,
      onDataChange: handleFormDataChange,
      formData,
      isLastStep: activeStep === steps.length - 1,
      loading,
    };

    switch (selectedAccountType) {
      case 'dealer':
        return <DealerForm {...commonProps} isEditMode={isEditMode} accountId={accountIdFromUrl} />;
      case 'customer':
        return (
          <CustomerForm {...commonProps} isEditMode={isEditMode} accountId={accountIdFromUrl} />
        );
      case 'karigar':
        return (
          <KarigarForm {...commonProps} isEditMode={isEditMode} accountId={accountIdFromUrl} />
        );
      case 'others':
        return <OthersForm {...commonProps} isEditMode={isEditMode} accountId={accountIdFromUrl} />;
      default:
        return null;
    }
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <CustomBreadcrumbs
        heading={isEditMode ? 'Edit Account' : 'Create Account'}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Account', href: paths.account.list },
          { name: isEditMode ? 'Edit' : 'Create' },
          { name: ACCOUNT_TYPES.find((type) => type.value === selectedAccountType)?.label },
        ]}
        action={
          <Button
            variant="outlined"
            startIcon={<Iconify icon="solar:arrow-left-bold" />}
            onClick={() => {
              // Map account types to tab names
              const accountTypeToTabMap = {
                dealer: 'dealers',
                customer: 'customers',
                karigar: 'karigars',
                others: 'others',
              };
              const tabName = accountTypeToTabMap[selectedAccountType] || 'dealers';
              router.push(`${paths.account.list}?tab=${tabName}`);
            }}
          >
            Back to List
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Stack spacing={3}>
        {!isEditMode && renderAccountTypeSelection()}

        {/* {isEditMode && selectedAccountType && (
          <Card sx={{ p: 2, bgcolor: 'background.neutral' }}>
            <Typography variant="body2" color="text.secondary">
              Editing:{' '}
              <strong>
                {ACCOUNT_TYPES.find((type) => type.value === selectedAccountType)?.label ||
                  selectedAccountType}
              </strong>
            </Typography>
          </Card>
        )} */}

        {selectedAccountType && (
          <>
            <RenderProgressStepper />
            <RenderForm />
          </>
        )}
      </Stack>
    </Container>
  );
}
