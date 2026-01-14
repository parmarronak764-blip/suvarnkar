import { z as zod } from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useBoolean } from 'minimal-shared/hooks';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Input from '@mui/material/Input';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';
import { Form, Field, schemaHelper } from 'src/components/hook-form';
import { FormHead } from '../../components/form-head';
import { SignUpTerms } from '../../components/sign-up-terms';
import { useApi } from 'src/hooks/useApi';
import { API_ROUTES } from 'src/utils/apiRoute';
import { useSelector } from 'react-redux';
import { toast } from 'src/components/snackbar';
import { getApiErrorMessage } from 'src/utils/error-handler';
import { gstRegex } from 'src/auth/utils/regex';
import { isValidPhoneNumber } from 'react-phone-number-input';
import { parsePhoneField } from 'src/components/hook-form/parsePhoneNumber';

export const CompanySignUpSchema = zod.object({
  // Company fields
  company_name: zod.string().min(1, { message: 'Company name is required!' }),
  gst_number: zod
    .string()
    .min(1, { message: 'GST number is required!' })
    .trim()
    .toUpperCase()
    .length(15, { message: 'GST number must be exactly 15 characters!' })
    .regex(gstRegex, 'Invalid GST Number format'),
  city: zod.string().min(1, { message: 'City is required!' }),
  logo: zod.any().optional(),
  terms_agreed: zod.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms and conditions!',
  }),

  // Owner fields
  owner_name: zod.string().min(1, { message: 'Owner name is required!' }),
  owner_email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
  owner_contact: schemaHelper.phoneNumber({ isValid: isValidPhoneNumber }, true, 'Contact Number'),
  whatsapp_number: schemaHelper.phoneNumber(
    { isValid: isValidPhoneNumber },
    true,
    'WhatsApp Number'
  ),
  password: zod
    .string()
    .min(1, { message: 'Password is required!' })
    .min(6, { message: 'Password must be at least 6 characters!' }),
});

// ----------------------------------------------------------------------

export function JwtSignUpView() {
  const accessToken = useSelector((state) => state.user.accessToken);

  const { callApi } = useApi();
  const router = useRouter();

  if (accessToken) {
    router.push(paths.dashboard.root);
  }

  const showPassword = useBoolean();

  const [selectedFile, setSelectedFile] = useState(null);

  const methods = useForm({
    resolver: zodResolver(CompanySignUpSchema),
  });

  const {
    handleSubmit,
    formState: { isSubmitting, errors },
    watch,
    setValue,
  } = methods;

  const termsAgreed = watch('terms_agreed');

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setValue('logo', file);
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (!selectedFile) {
        delete data.logo;
      }
      const whatsapp = parsePhoneField(data.whatsapp_number, 'WhatsApp number', true);
      if (whatsapp.error) return;

      data.whatsapp_country_code = whatsapp.countryCode;
      data.whatsapp_number = whatsapp.number;

      const owner = parsePhoneField(data.owner_contact, 'contact number', true);
      if (owner.error) return;

      data.owner_contact_country_code = owner.countryCode;
      data.owner_contact = owner.number;

      const result = await callApi({
        url: API_ROUTES.AUTH.SIGNUP,
        method: 'POST',
        body: data,
        isFormData: true,
      });

      if (result?.success) {
        toast.success(result?.message || 'Account created successfully!');
        router.push(paths.auth.jwt.signIn);
      } else {
        // Handle API response errors
        const errorMessage = getApiErrorMessage(
          result,
          null,
          'Failed to create account. Please try again.'
        );
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Sign up error:', error);

      // Handle network errors and other exceptions
      const errorMessage = getApiErrorMessage(
        null,
        error,
        'Network error. Please check your connection and try again.'
      );
      toast.error(errorMessage);
    }
  });

  const renderForm = () => (
    <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
      {/* Company Information Section */}
      <Box>
        <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
          Company Information
        </Typography>

        <Box sx={{ gap: 2, display: 'flex', flexDirection: 'column' }}>
          <Field.Text
            name="company_name"
            label="Company Name"
            slotProps={{ inputLabel: { shrink: true, required: true } }}
          />

          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <Field.Text
              name="gst_number"
              label="GST Number"
              placeholder="15-digit GST number"
              slotProps={{ inputLabel: { shrink: true, required: true } }}
            />
            <Field.Text
              name="city"
              label="City"
              slotProps={{ inputLabel: { shrink: true, required: true } }}
            />
          </Box>

          {/* Custom File Input */}
          <FormControl error={!!errors.logo}>
            <FormLabel sx={{ mb: 1 }}>Company Logo (Optional)</FormLabel>
            <Input
              type="file"
              inputProps={{
                accept: 'image/*',
              }}
              onChange={handleFileChange}
              sx={{ mb: 1 }}
            />
            {selectedFile && (
              <Typography variant="body2" color="text.secondary">
                Selected: {selectedFile.name}
              </Typography>
            )}
            {errors.logo && <FormHelperText>{errors.logo.message}</FormHelperText>}
          </FormControl>
        </Box>
      </Box>

      <Divider />

      {/* Owner Information Section */}
      <Box>
        <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
          Owner Information
        </Typography>

        <Box sx={{ gap: 2, display: 'flex', flexDirection: 'column' }}>
          <Field.Text
            name="owner_name"
            label="Owner Full Name"
            slotProps={{ inputLabel: { shrink: true, required: true } }}
          />

          <Field.Text
            name="owner_email"
            label="Owner Email Address"
            type="email"
            slotProps={{ inputLabel: { shrink: true, required: true } }}
          />

          {/* <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}> */}
          <Field.Phone
            name="owner_contact"
            required
            label="Contact Number"
            defaultCountry="IN"
            placeholder="Enter Contact Number"
            slotProps={{ inputLabel: { shrink: true }, required: true }}
          />

          <Field.Phone
            name="whatsapp_number"
            label="WhatsApp Number"
            defaultCountry="IN"
            placeholder="Enter WhatsApp Number"
            slotProps={{ inputLabel: { shrink: true, required: true } }}
          />
          {/* </Box> */}

          <Field.Text
            name="password"
            label="Password"
            placeholder="6+ characters"
            type={showPassword.value ? 'text' : 'password'}
            slotProps={{
              inputLabel: { shrink: true, required: true },
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={showPassword.onToggle} edge="end">
                      <Iconify
                        icon={showPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                      />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>
      </Box>

      <Divider />

      {/* Terms and Conditions */}
      <Box>
        <Field.Checkbox
          name="terms_agreed"
          label="I agree to the Terms and Conditions and Privacy Policy"
        />
      </Box>

      <Button
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        disabled={!termsAgreed}
        loading={isSubmitting}
        loadingIndicator="Creating account..."
      >
        Create Company Account
      </Button>
    </Box>
  );

  return (
    <>
      <FormHead
        title="Get started absolutely free"
        description={
          <>
            {`Already have an account? `}
            <Link component={RouterLink} href={paths.auth.jwt.signIn} variant="subtitle2">
              Get started
            </Link>
          </>
        }
        sx={{ textAlign: { xs: 'center', md: 'left' } }}
      />

      <Form methods={methods} onSubmit={onSubmit}>
        {renderForm()}
      </Form>

      <SignUpTerms />
    </>
  );
}
