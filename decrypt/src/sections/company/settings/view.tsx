'use client';

import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z as zod } from 'zod';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import axios from 'axios';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import LoadingButton from '@mui/lab/LoadingButton';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Form, Field } from 'src/components/hook-form';

import { useRoleCheck } from 'src/auth/utils/permission-utils';
import { JWT_STORAGE_KEY } from 'src/auth/context/jwt/constant';
import { isValidToken } from 'src/auth/context/jwt/utils';
import axiosInstance, { endpoints } from 'src/lib/axios';
import type { RootState } from 'src/redux/store';
import { updateCompany } from 'src/redux/slices/authSlice';
import { CONFIG } from 'src/global-config';
import { fData } from 'src/utils/format-number';
import { getCompanyLogoUrl } from 'src/utils/image-url';

// ----------------------------------------------------------------------

const CompanySettingsSchema = zod.object({
  name: zod.string().min(1, 'Company name is required'),
  gst_number: zod.string().min(15, 'GST number must be 15 characters').max(15, 'GST number must be 15 characters'),
  address: zod.string().min(1, 'Address is required'),
  city: zod.string().min(1, 'City is required'),
  pin_code: zod.string().min(6, 'Pin code must be 6 digits').max(6, 'Pin code must be 6 digits'),
  whatsapp_number: zod.string().optional(),
  crm_number: zod.string().optional(),
  companyLogo: zod.any().optional(),
});

type CompanySettingsSchemaType = zod.infer<typeof CompanySettingsSchema>;

// ----------------------------------------------------------------------

export function CompanySettingsView() {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const { hasAnyRole, userRole } = useRoleCheck();
  const dispatch = useDispatch();
  
  // Get selected company ID from Redux
  const { selectedCompanyId } = useSelector((state: RootState) => state.auth);

  // Only owners can access company settings
  const hasAccess = hasAnyRole(['owner']);

  const methods = useForm<CompanySettingsSchemaType>({
    resolver: zodResolver(CompanySettingsSchema),
    defaultValues: {
      name: '',
      gst_number: '',
      address: '',
      city: '',
      pin_code: '',
      whatsapp_number: '',
      crm_number: '',
      companyLogo: null,
    },
  });

  const { handleSubmit, reset, formState: { isSubmitting } } = methods;

  // Helper function to get valid token
  const getValidToken = useCallback(() => {
    const token = sessionStorage.getItem(JWT_STORAGE_KEY);
    if (!token || !isValidToken(token)) {
      throw new Error('Invalid or expired token');
    }
    return token;
  }, []);

  // Fetch company settings on load
  const fetchCompanySettings = useCallback(async () => {
    try {
      setInitialLoading(true);
      
      if (!selectedCompanyId) {
        toast.error('No company selected. Please select a company first.');
        return;
      }
      
      const token = getValidToken();
      
      const response = await axiosInstance.get(endpoints.company.settings, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        params: {
          company_id: selectedCompanyId
        }
      });

      if (response.data.success) {
        const companyData = response.data.data;
        reset({
          name: companyData.name || '',
          gst_number: companyData.gst_number || '',
          address: companyData.address || '',
          city: companyData.city || '',
          pin_code: companyData.pin_code || '',
          whatsapp_number: companyData.whatsapp_number || '',
          crm_number: companyData.crm_number || '',
          companyLogo: getCompanyLogoUrl(companyData.logo),
        });
      }
    } catch (error: any) {
      console.error('Error fetching company settings:', error);
      
      if (error.message === 'Invalid or expired token') {
        toast.error('Session expired. Please login again.');
        // Redirect to login
        window.location.href = paths.auth.jwt.signIn;
      } else if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error('Failed to load company settings');
      }
    } finally {
      setInitialLoading(false);
    }
  }, [reset, getValidToken, selectedCompanyId]);

  useEffect(() => {
    if (hasAccess && selectedCompanyId) {
      fetchCompanySettings();
    } else if (!selectedCompanyId) {
      setInitialLoading(false);
    } else {
      setInitialLoading(false);
    }
  }, [hasAccess, fetchCompanySettings, selectedCompanyId]);

  const onSubmit = useCallback(async (data: CompanySettingsSchemaType) => {
    try {
      setLoading(true);
      
      if (!selectedCompanyId) {
        toast.error('No company selected. Please select a company first.');
        return;
      }
      
      const token = getValidToken();
      
      // Convert data to FormData for multipart/form-data request
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        const value = data[key as keyof CompanySettingsSchemaType];
        if (value !== undefined && value !== '' && value !== null) {
          if (key === 'companyLogo' && value instanceof File) {
            formData.append('logo', value);
          } else if (typeof value === 'string') {
            formData.append(key, value);
          }
        }
      });
      
      // Use custom axios instance to avoid default Content-Type header
      const customAxios = axios.create({
        baseURL: CONFIG.serverUrl,
      });
      
      const response = await customAxios.put(
        endpoints.company.settings,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          params: {
            company_id: selectedCompanyId
          }
        }
      );

      if (response.data.success) {
        toast.success('Company settings updated successfully!');
        
        // Update the company data in Redux store to refresh workspace header
        if (selectedCompanyId) {
          dispatch(updateCompany({ 
            id: selectedCompanyId, 
            updates: { 
              logo: response.data.data.logo,
              name: response.data.data.name 
            } 
          }));
        }
      } else {
        toast.error('Failed to update company settings');
      }
    } catch (error: any) {
      console.error('Error updating company settings:', error);
      
      if (error.message === 'Invalid or expired token') {
        toast.error('Session expired. Please login again.');
        // Redirect to login
        window.location.href = paths.auth.jwt.signIn;
      } else if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        Object.keys(errors).forEach(key => {
          toast.error(`${key}: ${errors[key][0]}`);
        });
      } else {
        toast.error('Failed to update company settings');
      }
    } finally {
      setLoading(false);
    }
  }, [getValidToken, selectedCompanyId, dispatch]);

  // Show loading spinner while fetching initial data
  if (initialLoading) {
    return (
      <>
        <DashboardContent>
          <CustomBreadcrumbs
            heading="Company Settings"
            links={[
              { name: 'Dashboard', href: paths.dashboard.root },
              { name: 'Company Settings', href: paths.company.settings },
              { name: 'Details' },
            ]}
            sx={{ mb: { xs: 3, md: 5 } }}
          />
          
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 5 }}>
              <CircularProgress />
              <Typography sx={{ mt: 2 }}>Loading company settings...</Typography>
            </CardContent>
          </Card>
        </DashboardContent>
      </>
    );
  }

  // Show message if no company is selected
  if (!selectedCompanyId) {
    return (
      <>
        <DashboardContent>
          <CustomBreadcrumbs
            heading="Company Settings"
            links={[
              { name: 'Dashboard', href: paths.dashboard.root },
              { name: 'Company Settings', href: paths.company.settings },
              { name: 'Details' },
            ]}
            sx={{ mb: { xs: 3, md: 5 } }}
          />
          
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 5 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                No Company Selected
              </Typography>
              <Typography color="text.secondary">
                Please select a company from the workspace switcher to view and edit company settings.
              </Typography>
            </CardContent>
          </Card>
        </DashboardContent>
      </>
    );
  }

  // Show access denied message if user doesn't have access
  if (!hasAccess) {
    return (
      <>
        <DashboardContent>
          <CustomBreadcrumbs
            heading="Company Settings"
            links={[
              { name: 'Dashboard', href: paths.dashboard.root },
              { name: 'Company Settings', href: paths.company.settings },
              { name: 'Details' },
            ]}
            sx={{ mb: { xs: 3, md: 5 } }}
          />
          
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 5 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Access Denied
              </Typography>
              <Typography color="text.secondary">
                You don't have permission to access company settings.
              </Typography>
              <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                Current role: {userRole || 'Unknown'}
              </Typography>
            </CardContent>
          </Card>
        </DashboardContent>
      </>
    );
  }

  return (
    <>
      <DashboardContent>
        <CustomBreadcrumbs
          heading="Company Settings"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Company Settings', href: paths.company.settings },
            { name: 'Details' },
          ]}
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
                      name="companyLogo"
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
                      <Field.Text
                        name="name"
                        label="Company Name"
                        required
                        sx={{ flex: 1 }}
                      />
                      <Field.Text
                        name="gst_number"
                        label="GST Number"
                        required
                        inputProps={{ maxLength: 15 }}
                        sx={{ flex: 1 }}
                      />
                    </Box>

                    <Field.Text
                      name="address"
                      label="Address"
                      required
                      multiline
                      rows={3}
                    />

                    <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                      <Field.Text
                        name="city"
                        label="City"
                        required
                        sx={{ flex: 1 }}
                      />
                      <Field.Text
                        name="pin_code"
                        label="Pin Code"
                        required
                        inputProps={{ maxLength: 6 }}
                        sx={{ flex: 1 }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                      <Field.Text
                        name="whatsapp_number"
                        label="WhatsApp Number"
                        placeholder="+91 9876543210"
                        sx={{ flex: 1 }}
                      />
                      <Field.Text
                        name="crm_number"
                        label="CRM Number"
                        placeholder="+91 9876543210"
                        sx={{ flex: 1 }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 2 }}>
                      <LoadingButton
                        type="submit"
                        variant="contained"
                        loading={loading || isSubmitting}
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
    </>
  );
} 