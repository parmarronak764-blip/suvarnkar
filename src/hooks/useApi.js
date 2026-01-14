import axios from 'axios';
import { useState, useCallback } from 'react';
import { API_ROUTES } from 'src/utils/apiRoute';
import { paths } from 'src/routes/paths';
import { clearLocalStorage } from 'src/utils/services';
import { setAccessToken } from 'src/redux/slices/user.slice';
import { useDispatch } from 'react-redux';
import { getApiErrorMessage } from 'src/utils/error-handler';
import { toast } from 'src/components/snackbar';

const objectToFormData = (obj) => {
  const formData = new FormData();

  Object.entries(obj).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        formData.append(`${key}[]`, item);
      });
    } else {
      formData.append(key, value);
    }
  });

  return formData;
};

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const dispatch = useDispatch();
  const callApi = useCallback(
    async ({
      url,
      method = 'GET',
      body = null,
      query = {},
      headers = {},
      isFormData = false,
      avoidFormat = false,
    }) => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('accessToken');

        const config = {
          url: `${API_ROUTES.BASE_URL}${url}`,
          method,
          headers: { ...headers },
          params: query,
        };

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        if (body) {
          if (isFormData) {
            const formData = objectToFormData(body);
            config.data = formData;

            delete config.headers['Content-Type'];
          } else {
            config.data = body;
            config.headers['Content-Type'] = 'application/json';
          }
        }

        const response = await axios(config);

        setData(response.data);
        if (avoidFormat) return response.data;
        return {
          success: true,
          ...response.data,
        };
      } catch (err) {
        // You can get the status code from err.response?.status
        const statusCode = err.response?.status;
        if (statusCode === 401) {
          clearLocalStorage();
          dispatch(setAccessToken(null));
          window.location.href = paths.auth.jwt.signIn;
        }

        // Preserve the original error structure for better error handling
        const errorData = err.response?.data || {};
        const message =
          errorData.message ||
          errorData.error ||
          errorData.detail ||
          err.message ||
          'API request failed';
        const errorMessage = getApiErrorMessage(null, err, 'API request failed');
        setError(message);
        toast.error(errorMessage);

        // Create enhanced error object with original response data
        const enhancedError = new Error(message);
        enhancedError.response = err.response;
        enhancedError.originalError = err;

        // Re-throw the enhanced error to preserve stack trace and response data
        throw enhancedError;
      } finally {
        setLoading(false);
      }
    },
    [dispatch]
  );

  return {
    callApi,
    loading,
    error,
    data,
  };
};
