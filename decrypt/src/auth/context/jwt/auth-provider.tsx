'use client';

import { useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios, { endpoints } from 'src/lib/axios';

import { setSession, isValidToken } from './utils';
import { JWT_STORAGE_KEY, JWT_REFRESH_STORAGE_KEY } from './constant';

import { AuthContext } from '../auth-context';
import { setAuthState } from 'src/redux/slices/authSlice';
import type { RootState } from 'src/redux/store';
import type { CompanyContext } from '../../../auth/types';


type Props = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: Props) {
  const dispatch = useDispatch();

  // 👇 Get Redux auth state
  const { user, loading } = useSelector((state: RootState) => state.auth);

  // 👇 Check session from sessionStorage & fetch `/me` API
  const checkUserSession = useCallback(async () => {
    try {
      const accessToken = sessionStorage.getItem(JWT_STORAGE_KEY);
      const refreshToken = sessionStorage.getItem(JWT_REFRESH_STORAGE_KEY);

      if (accessToken && isValidToken(accessToken)) {
        setSession(accessToken, refreshToken);

        const res = await axios.get(endpoints.auth.me);
        const data = res.data?.data;

        const { company_users = [], ...userInfo } = data;

        const companies: CompanyContext[] = company_users.map((cu: any) => {
          
          return {
            id: cu.company.id,
            name: cu.company.name,
            logo: cu.company.logo, // Use actual logo from backend
            plan: 'Free', // Default plan, can be updated based on company subscription
            permissions: cu.permissions || [],
            modules: cu.modules || [],
            role: cu.role?.name || cu.role || 'staff' // Handle both object and string formats
          };
        });


        // ✅ Set data to Redux
        dispatch(
          setAuthState({
            user: { ...userInfo, accessToken },
            companies,
            loading: false
          })
        );
      } else {
        dispatch(
          setAuthState({
            user: null,
            companies: [],
            selectedCompanyId: null,
            loading: false
          })
        );
      }
    } catch (error) {
      console.error('Session check failed:', error);
      dispatch(
        setAuthState({
          user: null,
          companies: [],
          selectedCompanyId: null,
          loading: false
        })
      );
    }
  }, [dispatch]);

  // 👇 Call once on load
  useEffect(() => {
    checkUserSession();
  }, [checkUserSession]);

  // 👇 Derived status
  const authenticated = !!user;
  const unauthenticated = !user && !loading;

  // 👇 Expose minimal values in AuthContext
  const memoizedValue = useMemo(
    () => ({
      user,
      checkUserSession,
      loading,
      authenticated,
      unauthenticated
    }),
    [user, loading, authenticated, unauthenticated, checkUserSession]
  );

  return <AuthContext value={memoizedValue}>{children}</AuthContext>;
}
