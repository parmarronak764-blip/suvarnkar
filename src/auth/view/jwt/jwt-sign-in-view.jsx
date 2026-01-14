import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { useBoolean } from 'minimal-shared/hooks';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

import { FormHead } from '../../components/form-head';
import { API_ROUTES } from 'src/utils/apiRoute';
import { useApi } from 'src/hooks/useApi';
import { setItem } from 'src/utils/services';
import { useDispatch, useSelector } from 'react-redux';
import {
  setAccessToken,
  setAccountInfo,
  setSelectedCompany,
  setUserInfo,
  setRefreshToken,
} from 'src/redux/slices/user.slice';
import { toast } from 'src/components/snackbar';
import { getApiErrorMessage } from 'src/utils/error-handler';

// ----------------------------------------------------------------------

export const SignInSchema = zod.object({
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
  password: zod.string().min(1, { message: 'Password is required!' }),
  // .min(6, { message: 'Password must be at least 6 characters!' }),
});

// ----------------------------------------------------------------------

export function JwtSignInView() {
  const { callApi } = useApi();
  const dispatch = useDispatch();
  const accessToken = useSelector((state) => state.user.accessToken);
  const router = useRouter();

  if (accessToken) {
    router.push(paths.dashboard.root);
  }

  const showPassword = useBoolean();

  const methods = useForm({
    resolver: zodResolver(SignInSchema),
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const fetchAccountInfo = async () => {
    const result = await callApi({ url: API_ROUTES.ACCOUNTS.ME, method: 'GET' });
    if (result.success) {
      dispatch(setAccountInfo(result.data));
      dispatch(setSelectedCompany(result.data.company_users?.[0] || null));
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      const result = await callApi({
        url: API_ROUTES.AUTH.SIGNIN,
        method: 'POST',
        body: {
          email: data.email,
          password: data.password,
        },
      });

      if (result?.success && result?.data?.access) {
        toast.success(result?.message || 'Login successful!');
        dispatch(setAccessToken(result?.data?.access));
        dispatch(setRefreshToken(result?.data?.refresh));
        dispatch(setUserInfo(result?.data?.user));
        setItem('accessToken', result?.data?.access);
        setItem('refreshToken', result?.data?.refresh);
        fetchAccountInfo();
        router.push(paths.dashboard.root);
      } else {
        // Handle login failure with detailed error messages
        const errorMessage = getApiErrorMessage(result, null, 'Login failed. Please try again.');
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Login error:', error);

      // Handle network or API errors
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
      <Field.Text name="email" label="Email address" slotProps={{ inputLabel: { shrink: true } }} />

      <Box sx={{ gap: 1.5, display: 'flex', flexDirection: 'column' }}>
        <Link
          component={RouterLink}
          href="#"
          variant="body2"
          color="inherit"
          sx={{ alignSelf: 'flex-end' }}
        >
          Forgot password?
        </Link>

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

      <Button
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        loadingIndicator="Sign in..."
        onClick={onSubmit}
      >
        Sign in
      </Button>
    </Box>
  );

  return (
    <>
      <FormHead
        title="Sign in to your account"
        description={
          <>
            {`Don’t have an account? `}
            <Link component={RouterLink} href={paths.auth.jwt.signUp} variant="subtitle2">
              Get started
            </Link>
          </>
        }
        sx={{ textAlign: { xs: 'center', md: 'left' } }}
      />

      <Form methods={methods} onSubmit={onSubmit}>
        {renderForm()}
      </Form>
    </>
  );
}
