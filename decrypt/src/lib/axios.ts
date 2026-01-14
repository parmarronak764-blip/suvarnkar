import type { AxiosRequestConfig } from 'axios';

import axios from 'axios';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({
  baseURL: CONFIG.serverUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Optional: Add token (if using auth)
 *
 axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
*
*/

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error?.response?.data?.message || error?.message || 'Something went wrong!';
    console.error('Axios error:', message);
    return Promise.reject(new Error(message));
  }
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async <T = unknown>(
  args: string | [string, AxiosRequestConfig]
): Promise<T> => {
  try {
    const [url, config] = Array.isArray(args) ? args : [args, {}];

    const res = await axiosInstance.get<T>(url, config);

    return res.data;
  } catch (error) {
    console.error('Fetcher failed:', error);
    throw error;
  }
};

// ----------------------------------------------------------------------

export const endpoints = {
  chat: '/api/chat',
  kanban: '/api/kanban',
  calendar: '/api/calendar',
  auth: {
    me: 'http://localhost:8000/api/accounts/me',
    signIn: 'http://localhost:8000/api/accounts/sign-in/',
    signUp: 'http://localhost:8000/api/auth/sign-up',
    companySignUp: 'http://localhost:8000/api/accounts/register-company/',
    refreshToken: 'http://localhost:8000/api/accounts/refresh-token/',
  },
  company: {
    settings: 'http://localhost:8000/api/accounts/company/settings/',
  },
  mail: {
    list: '/api/mail/list',
    details: '/api/mail/details',
    labels: '/api/mail/labels',
  },
  post: {
    list: '/api/post/list',
    details: '/api/post/details',
    latest: '/api/post/latest',
    search: '/api/post/search',
  },
  product: {
    list: '/api/product/list',
    details: '/api/product/details',
    search: '/api/product/search',
  },
  workspaces: '/api/accounts/workspaces',
  masters: {
    roles: 'http://localhost:8000/api/accounts/roles/',
    modules: 'http://localhost:8000/api/modules/',
    addUserWithModules: 'http://localhost:8000/api/add-user-with-modules/',
    editUser: 'http://localhost:8000/api/accounts/edit-user/',
    deleteuser: 'http://localhost:8000/api/accounts/delete-user/',
    users: 'http://localhost:8000/api/accounts/users/',
  },
} as const;
