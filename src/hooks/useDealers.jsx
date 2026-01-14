import { useState, useCallback } from 'react';
import { useApi } from './useApi';
import { API_ROUTES } from 'src/utils/apiRoute';
import { useSelector } from 'react-redux';

export const useDealers = () => {
  const { callApi, loading, error } = useApi();
  const [data, setData] = useState([]);
  const selectedCompany = useSelector((state) => state.user.selectedCompany);

  // Get company_id from localStorage or user context
  const getCompanyId = useCallback(() => {
    const companyId = selectedCompany?.company?.id;
    return companyId;
  }, [selectedCompany]);

  // Fetch list of dealers
  const fetchItems = useCallback(
    async (filters = {}) => {
      try {
        const companyId = getCompanyId();
        if (!companyId) {
          console.warn('No company ID available for fetching dealers');
          return [];
        }

        // Build query parameters
        const queryParams = {
          company_id: companyId,
        };

        // Only add pagination parameters if pagination is not disabled
        if (filters.pagination !== false) {
          queryParams.page = filters.page || 1;
          queryParams.page_size = filters.page_size || 100;
        }

        // Add other filters (excluding pagination flag)
        // eslint-disable-next-line no-unused-vars
        const { pagination, page, page_size, ...otherFilters } = filters;
        Object.assign(queryParams, otherFilters);

        const response = await callApi({
          url: API_ROUTES.ACCOUNTS.DEALERS.GET,
          method: 'GET',
          query: queryParams,
        });

        if (response.success) {
          let items = [];

          // Handle different response structures
          if (Array.isArray(response.results)) {
            items = response.results;
          } else if (Array.isArray(response.data)) {
            items = response.data;
          } else if (response.results && typeof response.results === 'object') {
            items = Object.values(response.results);
          } else if (response.data && typeof response.data === 'object') {
            items = Object.values(response.data);
          }

          setData(items);
          return {
            items,
            total: response.count || items.length,
            hasNext: !!response.next,
            hasPrevious: !!response.previous,
          };
        }
        return { items: [], total: 0, hasNext: false, hasPrevious: false };
      } catch (err) {
        console.error('Failed to fetch dealers:', err);
        throw new Error('Failed to fetch dealers');
      }
    },
    [callApi, getCompanyId]
  );

  return {
    data,
    loading,
    error,
    fetchItems,
  };
};
