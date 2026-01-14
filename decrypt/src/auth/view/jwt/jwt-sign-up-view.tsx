'use client';

import { z as zod } from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useBoolean } from 'minimal-shared/hooks';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
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
import { Form, Field } from 'src/components/hook-form';

import { companySignUp } from '../../context/jwt';
import { useAuthContext } from '../../hooks';
import { getErrorMessage } from '../../utils';
import { FormHead } from '../../components/form-head';
import { SignUpTerms } from '../../components/sign-up-terms';

// ----------------------------------------------------------------------

export type CompanySignUpSchemaType = zod.infer<typeof CompanySignUpSchema>;

export const CompanySignUpSchema = zod.object({
  // Company fields
  company_name: zod.string().min(1, { message: 'Company name is required!' }),
  gst_number: zod
    .string()
    .min(1, { message: 'GST number is required!' })
    .length(15, { message: 'GST number must be exactly 15 characters!' }),
  city: zod.string().min(1, { message: 'City is required!' }),
  logo: zod.any().optional(),
  terms_agreed: zod.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and conditions!'
  }),
  
  // Owner fields
  owner_name: zod.string().min(1, { message: 'Owner name is required!' }),
  owner_email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
  owner_contact: zod.string().min(1, { message: 'Contact number is required!' }),
  whatsapp_number: zod.string().min(1, { message: 'WhatsApp number is required!' }),
  password: zod
    .string()
    .min(1, { message: 'Password is required!' })
    .min(6, { message: 'Password must be at least 6 characters!' }),
});

// ----------------------------------------------------------------------

export function JwtSignUpView() {
  const router = useRouter();

  const showPassword = useBoolean();

  const { checkUserSession } = useAuthContext();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const defaultValues: CompanySignUpSchemaType = {
    company_name: 'ABC Company',
    gst_number: '123456789012345',
    city: 'Los Angeles',
    logo: undefined,
    terms_agreed: false,
    owner_name: 'User Name',
    owner_email: 'uGh8M@example.com',
    owner_contact: '8765432111',
    whatsapp_number: '23456789011',
    password: 'jwt1234@123',
  };

  const methods = useForm<CompanySignUpSchemaType>({
    resolver: zodResolver(CompanySignUpSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting, errors },
    watch,
    setValue,
    register,
  } = methods;

  const termsAgreed = watch('terms_agreed');

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setValue('logo', file);
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      console.log('Form data before submission:', data);
      console.log('Selected file:', selectedFile);
      
      const formData = new FormData();
      
      // Append all form fields
      formData.append('company_name', data.company_name);
      formData.append('gst_number', data.gst_number);
      formData.append('city', data.city);
      formData.append('terms_agreed', data.terms_agreed.toString());
      formData.append('owner_name', data.owner_name);
      formData.append('owner_email', data.owner_email);
      formData.append('owner_contact', data.owner_contact);
      formData.append('whatsapp_number', data.whatsapp_number);
      formData.append('password', data.password);
      
      // Append logo if selected
      if (selectedFile) {
        formData.append('logo', selectedFile);
        console.log('Logo file appended:', selectedFile.name);
      }

      // Debug: Log FormData contents
      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      await companySignUp(formData);
      router.push(paths.auth.jwt.signIn);

    } catch (error) {
      console.error('Submission error:', error);
      const feedbackMessage = getErrorMessage(error);
      setErrorMessage(feedbackMessage);
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
            slotProps={{ inputLabel: { shrink: true } }}
          />
          
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <Field.Text
              name="gst_number"
              label="GST Number"
              placeholder="15-digit GST number"
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <Field.Text
              name="city"
              label="City"
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Box>
          
          {/* Custom File Input */}
          <FormControl error={!!errors.logo}>
            <FormLabel sx={{ mb: 1 }}>Company Logo (Optional)</FormLabel>
            <Input
              type="file"
              inputProps={{ 
                accept: "image/*",
                ...register('logo')
              }}
              onChange={handleFileChange}
              sx={{ mb: 1 }}
            />
            {selectedFile && (
              <Typography variant="body2" color="text.secondary">
                Selected: {selectedFile.name}
              </Typography>
            )}
            {errors.logo && (
              <FormHelperText>{errors.logo.message}</FormHelperText>
            )}
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
            slotProps={{ inputLabel: { shrink: true } }}
          />
          
          <Field.Text
            name="owner_email"
            label="Owner Email Address"
            type="email"
            slotProps={{ inputLabel: { shrink: true } }}
          />
          
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <Field.Text
              name="owner_contact"
              label="Contact Number"
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <Field.Text
              name="whatsapp_number"
              label="WhatsApp Number"
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Box>
          
          <Field.Text
            name="password"
            label="Password"
            placeholder="6+ characters"
            type={showPassword.value ? 'text' : 'password'}
            slotProps={{
              inputLabel: { shrink: true },
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={showPassword.onToggle} edge="end">
                      <Iconify icon={showPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
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
        title="Register Your Company"
        description={
          <>
            {`Already have an account? `}
            <Link component={RouterLink} href={paths.auth.jwt.signIn} variant="subtitle2">
              Sign in here
            </Link>
          </>
        }
        sx={{ textAlign: { xs: 'center', md: 'left' } }}
      />

      {!!errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}

      <Form methods={methods} onSubmit={onSubmit}>
        {renderForm()}
      </Form>

      <SignUpTerms />
    </>
  );
}