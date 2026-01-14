import { useState, useCallback } from 'react';
import { useApi } from './useApi';
import { API_ROUTES } from 'src/utils/apiRoute';
import { useSelector } from 'react-redux';
import { getApiErrorMessage } from 'src/utils/error-handler';

// ----------------------------------------------------------------------

export const useProductCategories = () => {
  const { callApi, loading, error } = useApi();
  const [data, setData] = useState([]);
  const selectedCompany = useSelector((state) => state.user.selectedCompany);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Get endpoints
  const ENDPOINTS = API_ROUTES.PRODUCT_CATEGORIES;

  // Get company_id from localStorage or user context
  const getCompanyId = useCallback(() => {
    const companyId = selectedCompany?.company?.id;
    return companyId;
  }, [selectedCompany]);

  // Fetch list of product categories
  const fetchItems = useCallback(
    async (filters = {}) => {
      try {
        const companyId = getCompanyId();

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
          url: ENDPOINTS.LIST,
          method: 'GET',
          query: queryParams,
        });

        if (response.success) {
          let items = [];

          if (Array.isArray(response)) {
            items = response;
          } else if (response.results) {
            items = response.results;
          } else if (response.data) {
            items = response.data;
          } else {
            const numericKeys = Object.keys(response).filter((key) => !isNaN(parseInt(key, 10)));
            if (numericKeys.length > 0) {
              items = numericKeys.map((key) => response[key]);
            }
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
        console.error('Failed to fetch product categories:', err);
        const errorMessage = getApiErrorMessage(null, err, 'Failed to fetch product categories');
        throw new Error(errorMessage);
      }
    },
    [callApi, ENDPOINTS, getCompanyId]
  );

  // Create new product category
  const createItem = useCallback(
    async (itemData) => {
      try {
        const companyId = getCompanyId();
        const requestBody = {
          name: itemData.name,
          is_active: itemData.is_active,
          company: companyId,
          stock_type: itemData.stock_type,
          metal_type: itemData.metal_type,
          carats: itemData.carats, // Convert single carat to array for API
        };

        const response = await callApi({
          url: ENDPOINTS.CREATE,
          method: 'POST',
          body: requestBody,
          query: {
            company_id: companyId,
          },
        });

        if (response.success) {
          setRefreshTrigger((prev) => prev + 1);
          return response;
        }
        return response;
      } catch (err) {
        console.error('Failed to create product category:', err);
        const errorMessage = getApiErrorMessage(null, err, 'Failed to create product category');
        return { success: false, message: errorMessage };
      }
    },
    [callApi, ENDPOINTS, getCompanyId]
  );

  // Update existing product category
  const updateItem = useCallback(
    async (id, itemData) => {
      try {
        const companyId = getCompanyId();
        const requestBody = {
          name: itemData.name,
          is_active: itemData.is_active,
          company: companyId,
          stock_type: itemData.stock_type,
          metal_type: itemData.metal_type,
          carats: [itemData.carats],
        };

        const response = await callApi({
          url: `${ENDPOINTS.UPDATE}${id}/`,
          method: 'PATCH',
          body: requestBody,
          query: {
            company_id: companyId,
          },
        });

        if (response.success) {
          setRefreshTrigger((prev) => prev + 1);
          return response;
        }
        return response;
      } catch (err) {
        console.error('Failed to update product category:', err);
        const errorMessage = getApiErrorMessage(null, err, 'Failed to update product category');
        return { success: false, message: errorMessage };
      }
    },
    [callApi, ENDPOINTS, getCompanyId]
  );

  // Delete product category (soft delete by setting is_active to false)
  const deleteItem = useCallback(
    async (id) => {
      try {
        const companyId = getCompanyId();
        const response = await callApi({
          url: `${ENDPOINTS.DELETE}${id}/`,
          method: 'DELETE',
          query: {
            company_id: companyId,
          },
        });

        if (response.success) {
          setData((prevData) => prevData.filter((item) => item.id !== id));
          return response;
        }
        return response;
      } catch (err) {
        console.error('Failed to delete product category:', err);
        const errorMessage = getApiErrorMessage(null, err, 'Failed to delete product category');
        return { success: false, message: errorMessage };
      }
    },
    [callApi, ENDPOINTS, getCompanyId]
  );

  // Delete multiple product categories
  const deleteItems = useCallback(
    async (ids) => {
      if (!Array.isArray(ids)) return { success: false };

      try {
        const companyId = getCompanyId();
        const deletePromises = ids.map((id) =>
          callApi({
            url: `${ENDPOINTS.DELETE}${id}/`,
            method: 'DELETE',
            query: {
              company_id: companyId,
            },
          })
        );

        const responses = await Promise.allSettled(deletePromises);
        const successfulDeletes = responses.filter(
          (response) => response.status === 'fulfilled' && response.value.success
        );

        if (successfulDeletes.length > 0) {
          const deletedIds = ids.slice(0, successfulDeletes.length);
          setData((prevData) => prevData.filter((item) => !deletedIds.includes(item.id)));

          return {
            success: true,
            deletedCount: successfulDeletes.length,
            totalCount: ids.length,
          };
        }

        return { success: false, message: 'Failed to delete product categories' };
      } catch (err) {
        console.error('Failed to delete product categories:', err);
        const errorMessage = getApiErrorMessage(null, err, 'Failed to delete product categories');
        return { success: false, message: errorMessage };
      }
    },
    [callApi, ENDPOINTS, getCompanyId]
  );

  // Get single product category by ID
  const getItem = useCallback(
    async (id) => {
      try {
        const companyId = getCompanyId();
        const response = await callApi({
          url: `${ENDPOINTS.LIST}${id}/`,
          method: 'GET',
          query: {
            company_id: companyId,
          },
        });

        if (response.success) {
          return response;
        }
        return response;
      } catch (err) {
        console.error('Failed to get product category:', err);
        const errorMessage = getApiErrorMessage(null, err, 'Failed to get product category');
        return { success: false, message: errorMessage };
      }
    },
    [callApi, ENDPOINTS, getCompanyId]
  );

  // Refresh data
  const refresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return {
    data,
    loading,
    error,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    deleteItems,
    getItem,
    refresh,
    refreshTrigger,
  };
};
