import { useDispatch, useSelector } from 'react-redux';
import { setUsersList, setCurrentUser, setModules } from 'src/redux/slices/user.slice';
import { API_ROUTES } from 'src/utils/apiRoute';
import { useApi } from './useApi';
import { useCallback, useEffect } from 'react';
import { getCompleteNumber, parsePhoneField } from 'src/components/hook-form/parsePhoneNumber';

export const useUser = () => {
  const { callApi, loading, error, data } = useApi();
  const dispatch = useDispatch();
  const selectedCompany = useSelector((state) => state.user.selectedCompany);

  // Helper function to convert any date format to DD-MM-YYYY format for backend
  const convertDateToDDMMYYYY = (dateString) => {
    if (!dateString) {
      const now = new Date();
      return `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
    }
    try {
      if (dateString.includes('-') && dateString.split('-').length === 3) {
        const [day, month, year] = dateString.split('-');
        if (day.length === 2 && month.length === 2 && year.length === 4) {
          return dateString;
        }
      }
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        const now = new Date();
        return `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
      }
      return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
    } catch {
      const now = new Date();
      return `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
    }
  };

  // Also check if data from useApi hook has user info
  useEffect(() => {
    if (data && data.user_id) {
      const userData = data;
      const mappedUser = {
        id: userData.user_id,
        name: userData.name,
        email: userData.email,
        phoneNumber: userData.phone,
        role: userData.role,
        company: userData.company,
        status: userData.is_active ? 'active' : 'inactive',
        isVerified: userData.is_active,
        address: userData.address || '',
        avatarUrl: userData.profile_image,
        idCard: userData.id_card,
        modules: userData.modules || [],
        // Set default values for missing fields
        country: '',
        state: '',
        city: '',
        zipCode: '',
      };
      dispatch(setCurrentUser(mappedUser));
    }
  }, [data, dispatch]);

  const fetchUsers = useCallback(
    async (filters = {}) => {
      const companyId = selectedCompany?.company?.id || selectedCompany?.id;

      if (!companyId) {
        console.warn('No company ID available for fetching users');
        return { items: [], total: 0 };
      }

      const queryParams = {
        company_id: companyId,
      };

      if (filters.pagination !== false) {
        queryParams.page = filters.page || 1;
        queryParams.page_size = filters.page_size || 10;
      }

      // eslint-disable-next-line no-unused-vars
      const { pagination, page, page_size, ...otherFilters } = filters;
      Object.assign(queryParams, otherFilters);

      const response = await callApi({
        url: API_ROUTES.USER_MANAGEMENT.LIST_USERS,
        method: 'GET',
        query: queryParams,
      });

      let items = [];
      let total = 0;

      if (response?.data) {
        if (Array.isArray(response.data)) {
          items = response.data;
          total = response.count || response.data.length;
        } else if (response.results && Array.isArray(response.results)) {
          items = response.results;
          total = response.count || response.results.length;
        } else {
          items = response.data;
          total = response.count || 0;
        }

        dispatch(setUsersList(items));
      }

      return {
        items,
        total,
        hasNext: !!response.next,
        hasPrevious: !!response.previous,
      };
    },
    [callApi, selectedCompany?.company?.id, selectedCompany?.id, dispatch]
  );

  const fetchUserById = useCallback(
    async (userId) => {
      dispatch(setCurrentUser(null));

      const apiUrl = `${API_ROUTES.USER_MANAGEMENT.GET_USER_BY_ID}${userId}/`;

      try {
        const response = await callApi({
          url: apiUrl,
          method: 'GET',
        });

        let userData = null;

        if (response?.success && response?.data) {
          userData = response.data;
        } else if (response?.data) {
          userData = response.data;
        } else if (response && typeof response === 'object' && response.user_id) {
          userData = response;
        }

        if (userData) {
          const phoneNumber = getCompleteNumber(userData?.phone_country_code, userData.phone);
          const mappedUser = {
            id: userData.user_id,
            name: userData.name,
            email: userData.email,
            phoneNumber: phoneNumber,
            role: userData.role,
            company: userData.company,
            status: userData.is_active ? 'active' : 'inactive',
            isVerified: userData.is_active,
            address: userData.address || '',
            avatarUrl: userData.profile_image,
            idCard: userData.id_card,
            modules: userData.modules || [],
            country: '',
            state: '',
            city: '',
            zipCode: '',
          };

          dispatch(setCurrentUser(mappedUser));
        }
      } catch (err) {
        console.error('Error in fetchUserById:', err);
      }
    },
    [callApi, dispatch]
  );

  const createUser = useCallback(
    async (userData) => {
      try {
        const {
          countryCode,
          number,
          error: phoneError,
        } = parsePhoneField(userData.phoneNumber, 'phone Number', true);
        if (phoneError) return { error: phoneError };

        const body = {
          email: userData.email,
          password: userData.password || 'defaultPassword123', // Required for new user
          salesmanName: userData.name,
          phone_country_code: countryCode,
          phone: number,
          role: userData.role,
          company_id: userData.company_id || selectedCompany?.company?.id || selectedCompany?.id,
          joinDate: userData.joinDate
            ? convertDateToDDMMYYYY(userData.joinDate)
            : new Date().toLocaleDateString('en-GB'),
          address: userData.address || '',
          modules: Array.isArray(userData.modules) ? userData.modules : [],
        };

        if (userData.avatarUrl instanceof File) {
          body.profile_image = userData.avatarUrl;
        }

        const response = await callApi({
          url: API_ROUTES.USER_MANAGEMENT.CREATE_USER,
          method: 'POST',
          body,
          isFormData: true,
        });

        return response;
      } catch (err) {
        console.error('Error creating user:', err);
        const errorMessage =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.response?.data?.errors ||
          err?.response?.data?.detail ||
          err?.response?.data?.data?.detail ||
          err?.response?.data?.data?.message ||
          err?.response?.data?.data?.error ||
          err?.message ||
          'Failed to create user';
        throw new Error(errorMessage);
      }
    },
    [callApi, selectedCompany?.company?.id, selectedCompany?.id]
  );

  const updateUser = useCallback(
    async (userId, userData) => {
      try {
        const {
          countryCode,
          number,
          error: phoneError,
        } = parsePhoneField(userData.phoneNumber, 'phone Number', true);
        if (phoneError) return { error: phoneError };

        const body = {
          id: userId,
          email: userData.email,
          password: userData.password || '',
          salesmanName: userData.name,
          phone: number || '',
          phone_country_code: countryCode || '+91',
          role: userData.role,
          company_id: userData.company_id || selectedCompany?.company?.id || selectedCompany?.id,
          joinDate: userData.joinDate
            ? convertDateToDDMMYYYY(userData.joinDate)
            : new Date().toLocaleDateString('en-GB'),
          address: userData.address || '',
          modules: Array.isArray(userData.modules) ? userData.modules : [],
        };

        if (userData.avatarUrl instanceof File) {
          body.profile_image = userData.avatarUrl;
        }

        const response = await callApi({
          url: API_ROUTES.USER_MANAGEMENT.UPDATE_USER,
          method: 'POST',
          body,
          isFormData: true,
        });

        return response;
      } catch (err) {
        console.error('Error updating user:', err);
        const errorMessage =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.response?.data?.errors ||
          err?.response?.data?.detail ||
          err?.response?.data?.data?.detail ||
          err?.response?.data?.data?.message ||
          err?.response?.data?.data?.error ||
          err?.message ||
          'Failed to update user';
        throw new Error(errorMessage);
      }
    },
    [callApi, selectedCompany?.company?.id, selectedCompany?.id]
  );

  const fetchRoles = useCallback(async () => {
    try {
      const response = await callApi({
        url: API_ROUTES.USER_MANAGEMENT.GET_ROLES,
        method: 'GET',
      });

      return response.data || [];
    } catch (err) {
      console.error('Error fetching roles:', err);
      return [];
    }
  }, [callApi]);

  const deleteUser = useCallback(
    async (userId) => {
      try {
        const response = await callApi({
          url: API_ROUTES.USER_MANAGEMENT.DELETE_USER,
          method: 'POST',
          body: {
            user_id: userId,
            company_id: selectedCompany?.company?.id || selectedCompany?.id,
          },
          isFormData: true,
        });

        return response;
      } catch (err) {
        console.error('Error deleting user:', err);
        throw err;
      }
    },
    [callApi, selectedCompany?.company?.id]
  );

  const fetchModules = useCallback(async () => {
    try {
      const response = await callApi({
        url: API_ROUTES.USER_MANAGEMENT.GET_MODULES,
        method: 'GET',
      });

      if (response?.data) {
        dispatch(setModules(response.data));
      }

      return response.data || [];
    } catch (err) {
      console.error('Error fetching modules:', err);
      return [];
    }
  }, [callApi, dispatch]);

  const clearCurrentUser = useCallback(() => {
    dispatch(setCurrentUser(null));
  }, [dispatch]);

  return {
    fetchUsers,
    fetchUserById,
    createUser,
    updateUser,
    deleteUser,
    fetchRoles,
    fetchModules,
    clearCurrentUser,
    loading,
    error,
    data,
  };
};
