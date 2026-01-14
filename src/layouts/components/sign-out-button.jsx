import { useCallback } from 'react';
import Button from '@mui/material/Button';
import { useRouter } from 'src/routes/hooks';
import { useApi } from 'src/hooks/useApi';
import { clearLocalStorage, getItem } from 'src/utils/services';
import { API_ROUTES } from 'src/utils/apiRoute';
import { paths } from 'src/routes/paths';
import { setAccessToken, setRefreshToken } from 'src/redux/slices/user.slice';
import { useDispatch } from 'react-redux';

export function SignOutButton({ sx, ...other }) {
  const { callApi } = useApi();
  const router = useRouter();
  const dispatch = useDispatch();
  const handleLogout = useCallback(async () => {
    const result = await callApi({
      url: API_ROUTES.AUTH.SIGN_OUT,
      method: 'POST',
      body: {
        refresh: getItem('refreshToken'),
      },
    });

    if (result?.success) {
      clearLocalStorage();
      dispatch(setAccessToken(null));
      dispatch(setRefreshToken(null));
    }

    router.push(paths.auth.jwt.signIn);
  }, [router]);

  return (
    <Button
      fullWidth
      variant="soft"
      size="large"
      color="error"
      onClick={handleLogout}
      sx={sx}
      {...other}
    >
      Logout
    </Button>
  );
}
