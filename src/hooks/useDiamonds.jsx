import { useState, useCallback } from 'react';
import { useApi } from 'src/hooks/useApi';
import { API_ROUTES } from 'src/utils/apiRoute';
import { useSelector } from 'react-redux';
import { getApiErrorMessage } from 'src/utils/error-handler';

export const useDiamonds = () => {
  const { callApi, loading, error } = useApi();
  const [data, setData] = useState([]);
  const [carats, setCarats] = useState([]);
  const selectedCompany = useSelector((state) => state.user.selectedCompany);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    currentPage: 1,
    pageSize: 10,
  });

  const getCompanyId = useCallback(() => selectedCompany?.company?.id, [selectedCompany]);

  // Fetch diamonds
  const fetchDiamonds = useCallback(
    async (page = 1, pageSize = 10, searchTerm = '', status = 'all') => {
      try {
        const companyId = getCompanyId();
        const query = {
          company_id: companyId,
          page,
          page_size: pageSize,
        };

        // Add search parameters if provided
        if (searchTerm) {
          query.search = searchTerm;
        }
        if (status !== 'all') {
          query.is_active = status === 'active';
        }

        const response = await callApi({
          url: API_ROUTES.DIAMONDS.LIST,
          method: 'GET',
          query,
        });

        if (response.success && response.data) {
          const items = response.data.results || response.data || [];
          setData(items);

          // Update pagination state
          setPagination({
            count: response.data.count || 0,
            next: response.data.next,
            previous: response.data.previous,
            currentPage: page,
            pageSize: pageSize,
          });

          return items;
        }
        return [];
      } catch (err) {
        console.error('Failed to fetch diamonds:', err);
        const errorMessage = getApiErrorMessage(null, err, 'Failed to fetch diamonds');
        throw new Error(errorMessage);
      }
    },
    [callApi, getCompanyId]
  );

  // Create new diamond
  const createDiamond = useCallback(
    async (diamondData) => {
      try {
        const companyId = getCompanyId();
        const requestBody = {
          ...diamondData,
          company_id: companyId,
        };

        const response = await callApi({
          url: API_ROUTES.DIAMONDS.CREATE,
          method: 'POST',
          body: requestBody,
        });

        if (response.success) {
          // Refresh data after creation
          setRefreshTrigger((prev) => prev + 1);
          return response;
        }
        return response;
      } catch (err) {
        console.error('Failed to create diamond:', err);
        const errorMessage = getApiErrorMessage(null, err, 'Failed to create diamond');
        return { success: false, message: errorMessage };
      }
    },
    [callApi, getCompanyId]
  );

  // Update existing diamond
  const updateDiamond = useCallback(
    async (id, diamondData) => {
      try {
        const companyId = getCompanyId();
        const requestBody = {
          ...diamondData,
          company_id: companyId,
        };

        const response = await callApi({
          url: `${API_ROUTES.DIAMONDS.UPDATE}${id}/`,
          method: 'PATCH',
          body: requestBody,
          query: {
            company_id: companyId,
          },
        });

        if (response.success) {
          // Refresh data after update
          setRefreshTrigger((prev) => prev + 1);
          return response;
        }
        return response;
      } catch (err) {
        console.error('Failed to update diamond:', err);
        const errorMessage = getApiErrorMessage(null, err, 'Failed to update diamond');
        return { success: false, message: errorMessage };
      }
    },
    [callApi, getCompanyId]
  );

  // Delete diamond
  const deleteDiamond = useCallback(
    async (id) => {
      try {
        const companyId = getCompanyId();
        const response = await callApi({
          url: `${API_ROUTES.DIAMONDS.DELETE}${id}/`,
          method: 'DELETE',
          query: {
            company_id: companyId,
          },
        });

        if (response.success) {
          // Optimistic update
          setData((prevData) => prevData.filter((item) => item.id !== id));
          return response;
        }
        return response;
      } catch (err) {
        console.error('Failed to delete diamond:', err);
        const errorMessage = getApiErrorMessage(null, err, 'Failed to delete diamond');
        return { success: false, message: errorMessage };
      }
    },
    [callApi, getCompanyId]
  );

  // Delete multiple diamonds
  const deleteDiamonds = useCallback(
    async (ids) => {
      try {
        const companyId = getCompanyId();
        const promises = ids.map((id) =>
          callApi({
            url: `${API_ROUTES.DIAMONDS.DELETE}${id}/`,
            method: 'DELETE',
            query: {
              company_id: companyId,
            },
          })
        );

        const responses = await Promise.all(promises);
        const successCount = responses.filter((r) => r.success).length;

        if (successCount > 0) {
          // Optimistic update
          setData((prevData) => prevData.filter((item) => !ids.includes(item.id)));
          return { success: true, count: successCount };
        }
        return { success: false, message: 'Failed to delete diamonds' };
      } catch (err) {
        console.error('Failed to delete diamonds:', err);
        const errorMessage = getApiErrorMessage(null, err, 'Failed to delete diamonds');
        return { success: false, message: errorMessage };
      }
    },
    [callApi, getCompanyId]
  );

  // Get single diamond
  const getDiamond = useCallback(
    async (id) => {
      try {
        const companyId = getCompanyId();
        const response = await callApi({
          url: `${API_ROUTES.DIAMONDS.LIST}${id}/`,
          method: 'GET',
          query: {
            company_id: companyId,
          },
        });

        if (response.success) {
          return response.data;
        }
        return null;
      } catch (err) {
        console.error('Failed to get diamond:', err);
        const errorMessage = getApiErrorMessage(null, err, 'Failed to get diamond');
        throw new Error(errorMessage);
      }
    },
    [callApi, getCompanyId]
  );

  // Search diamonds
  const searchDiamonds = useCallback(
    async (searchTerm, page = 1, pageSize = 100) => {
      try {
        const companyId = getCompanyId();
        const response = await callApi({
          url: API_ROUTES.DIAMONDS.LIST,
          method: 'GET',
          query: {
            company_id: companyId,
            search: searchTerm,
            page,
            page_size: pageSize,
          },
        });

        if (response.success && response.data) {
          return response.data.results || response.data || [];
        }
        return [];
      } catch (err) {
        console.error('Failed to search diamonds:', err);
        const errorMessage = getApiErrorMessage(null, err, 'Failed to search diamonds');
        throw new Error(errorMessage);
      }
    },
    [callApi, getCompanyId]
  );

  // Fetch diamond carats
  const fetchDiamondCarats = useCallback(
    async (search = '') => {
      try {
        const companyId = getCompanyId();
        const query = {
          company_id: companyId,
        };

        // Add search parameters if provided
        if (search) {
          query.search = search;
        }

        const response = await callApi({
          url: API_ROUTES.DIAMONDS.CARAT_LIST,
          method: 'GET',
          query,
          avoidFormat: true,
        });

        if (response) {
          const items = response || [];
          setCarats(items);

          return items;
        }
        return [];
      } catch (err) {
        console.error('Failed to fetch diamonds:', err);
        const errorMessage = getApiErrorMessage(null, err, 'Failed to fetch diamonds');
        throw new Error(errorMessage);
      }
    },
    [callApi, getCompanyId]
  );

  // Manual refresh
  const refresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return {
    data,
    carats,
    loading,
    error,
    pagination,
    fetchDiamonds,
    createDiamond,
    updateDiamond,
    deleteDiamond,
    deleteDiamonds,
    getDiamond,
    searchDiamonds,
    fetchDiamondCarats,
    refresh,
    refreshTrigger,
  };
};
