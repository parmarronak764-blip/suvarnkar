import { useState, useCallback } from 'react';
import { API_ROUTES } from 'src/utils/apiRoute';
import { useSelector } from 'react-redux';
import { useApi } from './useApi';

export const useProductsMasters = () => {
  const { callApi, loading, error } = useApi();
  const [data, setData] = useState({ carats: [], stockTypes: [] });
  const selectedCompany = useSelector((state) => state?.user?.selectedCompany);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Get company_id from selectedCompany
  const getCompanyId = useCallback(
    () => selectedCompany?.company?.id || selectedCompany?.id,
    [selectedCompany]
  );

  // Trigger refresh
  const refresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const fetchStockTypes = useCallback(
    async (query = '') => {
      try {
        const response = await callApi({
          url: API_ROUTES.STOCK_TYPES.LIST,
          method: 'GET',
          query: { search: query }, // Use search parameter as shown in API
        });

        if (response.success) {
          // Handle the useApi hook's array spreading behavior
          let items = [];

          if (Array.isArray(response)) {
            items = response;
          } else if (response.results) {
            items = response.results;
          } else if (response.data) {
            items = response.data;
          } else {
            // Handle spread array case: {0: item1, 1: item2, success: true}
            const numericKeys = Object.keys(response).filter((key) => !isNaN(parseInt(key, 10)));
            if (numericKeys.length > 0) {
              items = numericKeys.map((key) => response[key]);
            }
          }
          setData((prev) => ({
            ...prev,
            stockTypes: items,
          }));
        }
      } catch (err) {
        console.error('Failed to fetch stock types:', err);
      }
    },
    [callApi]
  );

  const fetchCaratsByMetalType = useCallback(
    async (metalType = '') => {
      try {
        if (!metalType) {
          throw new Error('Metal type is required.');
        }
        const companyId = getCompanyId();
        const response = await callApi({
          url: API_ROUTES.PRODUCTS_MASTERS.GET_CARAT_BY_METAL_TYPE(metalType),
          method: 'GET',
          query: { metal_type_id: metalType, company_id: companyId }, // Use search parameter as shown in API
        });
        if (response.success) {
          const result = {
            data: Object.values(response).filter(
              (item) => typeof item === 'object' && item !== null && !Array.isArray(item)
            ),
            success: response.success === true,
          };
          setData((prev) => ({
            ...prev,
            carats: result.data,
          }));
        }
      } catch (err) {
        console.error('Failed to fetch carat types:', err);
      }
    },
    [callApi]
  );

  return {
    // Data
    data,
    loading,
    error,
    refreshTrigger,

    // Actions
    refresh,
    fetchStockTypes,
    fetchCaratsByMetalType,
  };
};
