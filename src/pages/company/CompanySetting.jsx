import React, { useEffect, useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';

import { LoadingButton } from '@mui/lab';
import { Box, Stack, Card, Typography, CardContent, CardHeader } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { Field, Form, schemaHelper } from 'src/components/hook-form';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { DashboardContent } from 'src/layouts/dashboard';
import { paths } from 'src/routes/paths';
import { useApi } from 'src/hooks/useApi';
import { API_ROUTES } from 'src/utils/apiRoute';
import { fData } from 'src/utils/formate-number';
import { setAccountInfo, setSelectedCompany } from 'src/redux/slices/user.slice';
import { getCompanyLogoUrl } from 'src/utils/image-url';
import { getApiErrorMessage } from 'src/utils/error-handler';
import { gstRegex } from 'src/auth/utils/regex';
import { isValidPhoneNumber } from 'react-phone-number-input';
import { getCompleteNumber, parsePhoneField } from 'src/components/hook-form/parsePhoneNumber';

const CompanySettingsSchema = zod.object({
  name: zod.string().min(1, 'Company name is required').max(255, 'Name too long'),
  gst_number: zod
    .string()
    .min(15, 'GST number must be 15 characters')
    .max(15, 'GST number must be 15 characters')
    .trim()
    .toUpperCase()
    .regex(gstRegex, 'Invalid GST Number format'),
  address: zod.string().min(1, 'Address is required'),
  city: zod.string().min(1, 'City is required').max(100, 'City name too long'),
  pin_code: zod.string().min(6, 'Pin code must be 6 digits').max(6, 'Pin code must be 6 digits'),
  whatsapp_number: schemaHelper
    .phoneNumber({ isValid: isValidPhoneNumber }, false, 'WhatsApp Number')
    .optional(),
  crm_number: schemaHelper
    .phoneNumber({ isValid: isValidPhoneNumber }, false, 'CRM Number')
    .optional(),
  logo: zod
    .any()
    .optional()
    .refine(
      (file) => {
        if (!file) return true; // Optional field
        if (typeof file === 'string') return true; // Existing URL
        if (file instanceof File) {
          const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
          return validTypes.includes(file.type);
        }
        return false;
      },
      { message: 'Only JPEG, JPG, PNG, and GIF files are allowed' }
    )
    .refine(
      (file) => {
        if (!file || typeof file === 'string') return true;
        if (file instanceof File) {
          return file.size <= 3145728; // 3MB
        }
        return false;
      },
      { message: 'File size must be less than 3MB' }
    ),
  tag_prefix: zod.string().max(50, 'Tag prefix too long').optional(),
});

const CompanySetting = () => {
  const selectedCompany = useSelector((state) => state.user.selectedCompany);
  const dispatch = useDispatch();
  const { callApi, loading } = useApi();

  const methods = useForm({
    resolver: zodResolver(CompanySettingsSchema),
    defaultValues: {
      name: '',
      gst_number: '',
      address: '',
      city: '',
      pin_code: '',
      whatsapp_number: '',
      crm_number: '',
      logo: null,
      tag_prefix: '',
    },
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data) => {
    try {
      if (!selectedCompany?.company?.id) {
        toast.error('No company selected. Please select a company first.');
        return;
      }
      //  Phone Number
      const whatsapp = parsePhoneField(data.whatsapp_number, 'WhatsApp number');
      if (whatsapp.error) return;

      data.whatsapp_country_code = whatsapp.countryCode;
      data.whatsapp_number = whatsapp.number;

      const crm = parsePhoneField(data.crm_number, 'CRM number');
      if (crm.error) return;

      data.crm_number_country_code = crm.countryCode;
      data.crm_number = crm.number;

      // Prepare the data according to API structure
      const { logo, ...restData } = data;
      let body = { ...restData };

      //

      // Only include logo if it's a File (new upload)
      if (logo instanceof File) {
        body.logo = logo;
      }

      const result = await callApi({
        url: API_ROUTES.ACCOUNTS.UPDATE_COMPANY_SETTINGS,
        method: 'PUT',
        body,
        query: { company_id: selectedCompany.company.id || selectedCompany.id },
        isFormData: true,
      });

      if (result?.success) {
        toast.success(result?.message || 'Company settings updated successfully!');

        // Refresh account information to get updated company data
        const accountResult = await callApi({
          url: API_ROUTES.ACCOUNTS.ME,
          method: 'GET',
        });

        if (accountResult.success) {
          dispatch(setAccountInfo(accountResult.data));

          // Find and maintain the currently selected company by ID
          const currentCompanyId = selectedCompany?.company?.id || selectedCompany?.id;
          const updatedSelectedCompany = accountResult.data.company_users?.find(
            (companyUser) => companyUser.company.id === currentCompanyId
          );

          dispatch(
            setSelectedCompany(
              updatedSelectedCompany || accountResult.data.company_users?.[0] || null
            )
          );
        }
      } else {
        toast.error(result?.message || 'Failed to update company settings');
      }
    } catch (error) {
      console.error('Error updating company settings:', error);
      const errorMessage = getApiErrorMessage(
        null,
        error,
        'An error occurred while updating settings'
      );
      toast.error(errorMessage);
    }
  };

  const fetchCompanyDetails = useCallback(async () => {
    try {
      if (!selectedCompany?.company?.id) {
        console.warn('No company selected for fetching settings');
        return;
      }

      const result = await callApi({
        url: API_ROUTES.ACCOUNTS.GET_COMPANY_SETTINGS,
        method: 'GET',
        query: {
          company_id: selectedCompany.company.id || selectedCompany.id,
        },
      });

      if (result?.success) {
        reset({
          name: result?.data?.name || '',
          gst_number: result?.data?.gst_number || '',
          address: result?.data?.address || '',
          city: result?.data?.city || '',
          pin_code: result?.data?.pin_code || '',
          whatsapp_number: `${
            result?.data?.whatsapp_number
              ? getCompleteNumber(
                  result?.data?.whatsapp_country_code,
                  result?.data?.whatsapp_number
                )
              : ''
          }`,

          crm_number: `${
            result?.data?.crm_number
              ? getCompleteNumber(result?.data?.crm_country_code, result?.data?.crm_number)
              : ''
          }`,
          logo: result?.data?.logo ? getCompanyLogoUrl(result.data.logo) : null,
          tag_prefix: result?.data?.tag_prefix || '',
        });
      } else {
        toast.error(result?.message || 'Failed to fetch company settings');
      }
    } catch (error) {
      console.error('Error fetching company settings:', error);
      const errorMessage = getApiErrorMessage(null, error, 'Failed to load company settings');
      toast.error(errorMessage);
    }
  }, [selectedCompany?.company?.id, selectedCompany?.id, callApi, reset]);

  useEffect(() => {
    fetchCompanyDetails();
  }, [fetchCompanyDetails]);

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Company Settings"
        links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'Company Settings' }]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <CardHeader
          title="Company Information"
          subheader="Update your company details and contact information"
        />

        <CardContent>
          <Form methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
              {/* Left Side - Company Logo Upload */}
              <Card sx={{ p: 3, minWidth: 400, flex: 1 }}>
                <Box sx={{ mb: 5 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2, textAlign: 'center' }}>
                    Company Logo
                  </Typography>
                  <Field.UploadAvatar
                    name="logo"
                    maxSize={3145728}
                    helperText={
                      <Typography
                        variant="caption"
                        sx={{
                          mt: 3,
                          mx: 'auto',
                          display: 'block',
                          textAlign: 'center',
                          color: 'text.disabled',
                        }}
                      >
                        Allowed *.jpeg, *.jpg, *.png, *.gif
                        <br /> max size of {fData(3145728)}
                      </Typography>
                    }
                  />
                </Box>
              </Card>

              {/* Right Side - Company Details */}
              <Card sx={{ p: 3, minWidth: 400, flex: 2 }}>
                <Stack spacing={3}>
                  <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                    <Field.Text name="name" label="Company Name" required sx={{ flex: 1 }} />
                    <Field.Text
                      name="gst_number"
                      label="GST Number"
                      required
                      inputProps={{ maxLength: 15 }}
                      sx={{ flex: 1 }}
                    />
                  </Box>

                  <Field.Text name="address" label="Address" required multiline rows={3} />

                  <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                    <Field.Text name="city" label="City" required sx={{ flex: 1 }} />
                    <Field.Text
                      name="pin_code"
                      label="Pin Code"
                      required
                      inputProps={{ maxLength: 6 }}
                      sx={{ flex: 1 }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                    <Field.Phone
                      defaultCountry="IN"
                      name="whatsapp_number"
                      label="WhatsApp Number"
                      placeholder="+91 9876543210"
                      sx={{ flex: 1 }}
                    />
                    <Field.Phone
                      defaultCountry="IN"
                      name="crm_number"
                      label="CRM Number"
                      placeholder="+91 9876543210"
                      sx={{ flex: 1 }}
                    />
                  </Box>

                  <Field.Text
                    name="tag_prefix"
                    label="Tag Prefix"
                    placeholder="Optional prefix for product tags"
                    helperText="Optional prefix for product tags (e.g., 'ABC' for ABC001, ABC002, etc.)"
                  />

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 2 }}>
                    <LoadingButton
                      type="submit"
                      variant="contained"
                      loading={isSubmitting || loading}
                      startIcon={<Iconify icon="solar:pen-bold" />}
                    >
                      Save Changes
                    </LoadingButton>
                  </Box>
                </Stack>
              </Card>
            </Box>
          </Form>
        </CardContent>
      </Card>
    </DashboardContent>
  );
};

export default CompanySetting;
