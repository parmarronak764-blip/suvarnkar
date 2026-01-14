import { paths } from 'src/routes/paths';

import axios, { endpoints } from 'src/lib/axios';

import { JWT_STORAGE_KEY, JWT_REFRESH_STORAGE_KEY } from './constant';

// ----------------------------------------------------------------------

export function jwtDecode(token: string) {
  try {
    if (!token) return null;

    const parts = token.split('.');
    if (parts.length < 2) {
      throw new Error('Invalid token!');
    }

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(base64));

    return decoded;
  } catch (error) {
    console.error('Error decoding token:', error);
    throw error;
  }
}

// ----------------------------------------------------------------------

export function isValidToken(accessToken: string) {
  if (!accessToken) {
    return false;
  }

  try {
    const decoded = jwtDecode(accessToken);

    if (!decoded || !('exp' in decoded)) {
      return false;
    }

    const currentTime = Date.now() / 1000;

    return decoded.exp > currentTime;
  } catch (error) {
    console.error('Error during token validation:', error);
    return false;
  }
}

// ----------------------------------------------------------------------

export function tokenExpired(exp: number, testing = false) {
  const currentTime = Date.now();
  const timeLeft = exp * 1000 - currentTime;
  const delay = testing ? 3000 : Math.max(timeLeft - 200000, 0); // 3s if testing, else 200s before expiry

  console.log('Will attempt refresh in', delay, 'ms');

  setTimeout(async () => {
    try {
      const refreshAuthToken = sessionStorage.getItem(JWT_REFRESH_STORAGE_KEY) || '';

      if (isValidToken(refreshAuthToken)) {
        const { newAccessToken, newRefreshToken } = await refreshAuthTokens(refreshAuthToken);
        
        if (newAccessToken && newRefreshToken) {
          setSession(newAccessToken, newRefreshToken);
          console.log('✅ Token refreshed successfully');
          return; // Exit early, no logout
        }
      }

      throw new Error('Invalid or expired refresh token');

    } catch (error) {
      console.error('❌ Error during token refresh:', error);
      sessionStorage.removeItem(JWT_STORAGE_KEY);
      sessionStorage.removeItem(JWT_REFRESH_STORAGE_KEY);
      window.location.href = paths.auth.jwt.signIn;
    }
  }, delay);
}
// ----------------------------------------------------------------------

export async function setSession(accessToken: string | null, refreshToken: string | null) {
  try {
    if (accessToken) {
      sessionStorage.setItem(JWT_STORAGE_KEY, accessToken);
      sessionStorage.setItem(JWT_REFRESH_STORAGE_KEY, refreshToken);

      axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

      const decodedToken = jwtDecode(accessToken); // ~3 days by minimals server

      if (decodedToken && 'exp' in decodedToken) {
        tokenExpired(decodedToken.exp);
      } else {
        throw new Error('Invalid access token!');
      }
    } else {
      sessionStorage.removeItem(JWT_STORAGE_KEY);
      delete axios.defaults.headers.common.Authorization;
    }
  } catch (error) {
    console.error('Error during set session:', error);
    throw error;
  }
}


export async function refreshAuthTokens(refreshToken: string) {
  try {
    const data = { refresh: refreshToken.toString() };
    const response = await axios.post(endpoints.auth.refreshToken, data);
    const newAccessToken = response.data.access;
    const newRefreshToken = response.data.refresh;
    
    return { newAccessToken, newRefreshToken };
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error; // Propagate error to AuthProvider
  }
}