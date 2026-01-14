import { useSetState } from 'minimal-shared/hooks';
import { useMemo } from 'react';

import { JWT_STORAGE_KEY } from './constant';
import { AuthContext } from '../auth-context';
import { isValidToken } from './utils';

// ----------------------------------------------------------------------

/**
 * NOTE:
 * We only build demo at basic level.
 * Customer will need to do some extra handling yourself if you want to extend the logic and other features...
 */

export function AuthProvider({ children }) {
  const { state, setState } = useSetState({ user: null, loading: false });

  // Simple token check without API calls
  const accessToken = sessionStorage.getItem(JWT_STORAGE_KEY);
  const isTokenValid = accessToken && isValidToken(accessToken);
  
  // If no valid token, user is unauthenticated
  if (!isTokenValid && state.user) {
    setState({ user: null, loading: false });
  }

  const checkAuthenticated = state.user ? 'authenticated' : 'unauthenticated';
  const status = state.loading ? 'loading' : checkAuthenticated;

  const memoizedValue = useMemo(
    () => ({
      user: state.user ? { ...state.user, role: state.user?.role ?? 'admin' } : null,
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
    }),
    [state.user, status]
  );

  return <AuthContext value={memoizedValue}>{children}</AuthContext>;
}
