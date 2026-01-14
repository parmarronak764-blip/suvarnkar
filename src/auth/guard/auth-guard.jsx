import { useEffect, useRef } from 'react';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { useSelector, useDispatch } from 'react-redux';
import { useApi } from 'src/hooks/useApi';
import { API_ROUTES } from 'src/utils/apiRoute';
import { setAccountInfo, setSelectedCompany } from 'src/redux/slices/user.slice';
import { SplashScreen } from 'src/components/loading-screen';

export function AuthGuard({ children }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { callApi, loading } = useApi();
  const accountInfo = useSelector((state) => state.user.accountInfo);
  const accessToken = useSelector((state) => state.user.accessToken);

  useEffect(() => {
    if (!accessToken) {
      router.push(paths.auth.jwt.signIn);
      return;
    }

    if (!accountInfo) {
      // Fetch user data
      callApi({
        url: API_ROUTES.ACCOUNTS.ME,
        method: 'GET'
      }).then((response) => {
        dispatch(setAccountInfo(response.data));
      }).catch(() => {
        router.push(paths.auth.jwt.signIn);
      });
    }
  }, [accessToken, accountInfo]);

  if (loading || (!accountInfo && accessToken)) {
    return <SplashScreen />;
  }

  if (!accessToken) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}
