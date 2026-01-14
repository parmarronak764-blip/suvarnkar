import { useState, useCallback } from 'react';
import { useApi } from './useApi';
import { API_ROUTES } from 'src/utils/apiRoute';
import { useSelector } from 'react-redux';
import { getApiErrorMessage } from 'src/utils/error-handler';
import { set } from 'nprogress';

// ----------------------------------------------------------------------

export const useProducts = () => {
  const { callApi, loading, error } = useApi();
  const [data, setData] = useState([]);
  const [baseMetals, setBaseMetals] = useState(null);
  const selectedCompany = useSelector((state) => state.user.selectedCompany);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Get company_id from selectedCompany
  const getCompanyId = useCallback(
    () => selectedCompany?.company?.id || selectedCompany?.id,
    [selectedCompany]
  );

  // Fetch list of products
  const fetchItems = useCallback(
    async (filters = {}) => {
      try {
        const companyId = getCompanyId();
        if (!companyId) {
          console.warn('No company ID available for fetching products');
          return [];
        }

        const queryParams = {
          company_id: companyId,
        };

        if (filters.pagination !== false) {
          queryParams.page = filters.page || 1;
          queryParams.page_size = filters.page_size || 100;
        }

        // eslint-disable-next-line no-unused-vars
        const { pagination, page, page_size, ...otherFilters } = filters;
        Object.assign(queryParams, otherFilters);

        const response = await callApi({
          url: API_ROUTES.PRODUCTS.LIST,
          method: 'GET',
          query: queryParams,
        });

        if (response.success) {
          let items = [];

          if (response.results) {
            items = response.results;
          } else if (response.data && Array.isArray(response.data)) {
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
        console.error('Failed to fetch products:', err);
        const errorMessage = getApiErrorMessage(null, err, 'Failed to fetch products');
        throw new Error(errorMessage);
      }
    },
    [callApi, getCompanyId]
  );

  // Create new product
  const createItem = useCallback(
    async (productData) => {
      try {
        const companyId = getCompanyId();
        if (!companyId) {
          throw new Error('Company ID is required to create a product');
        }

        const body = {
          ...productData,
          company: companyId,
        };

        const response = await callApi({
          url: `${API_ROUTES.PRODUCTS.CREATE}`,
          method: 'POST',
          body,
          query: {
            company_id: companyId,
          },
        });

        if (response.success || response.id) {
          setRefreshTrigger((prev) => prev + 1);
          return response;
        }
        return response;
      } catch (err) {
        console.error('Failed to create product:', err);
        const errorMessage = getApiErrorMessage(null, err, 'Failed to create product');
        return { success: false, message: errorMessage };
      }
    },
    [callApi, getCompanyId]
  );

  // Update existing product
  const updateItem = useCallback(
    async (id, productData) => {
      try {
        const companyId = getCompanyId();
        if (!companyId) {
          throw new Error('Company ID is required to update a product');
        }

        const body = {
          ...productData,
          company: companyId,
        };

        const response = await callApi({
          url: `${API_ROUTES.PRODUCTS.UPDATE}${id}/?company_id=${companyId}`,
          method: 'PATCH',
          body,
        });

        if (response.success || response.id) {
          setRefreshTrigger((prev) => prev + 1);
          return response;
        }
        return response;
      } catch (err) {
        console.error('Failed to update product:', err);
        const errorMessage = getApiErrorMessage(null, err, 'Failed to update product');
        return { success: false, message: errorMessage };
      }
    },
    [callApi, getCompanyId]
  );

  // Delete product (soft delete - sets is_active to false)
  const deleteItem = useCallback(
    async (id) => {
      try {
        const companyId = getCompanyId();
        if (!companyId) {
          throw new Error('Company ID is required to delete a product');
        }

        const response = await callApi({
          url: `${API_ROUTES.PRODUCTS.DELETE}${id}/`,
          method: 'DELETE',
          query: { company_id: companyId },
        });

        if (response.success) {
          setData((prevData) => prevData.filter((item) => item.id !== id));
          return response;
        }
        return response;
      } catch (err) {
        console.error('Failed to delete product:', err);
        const errorMessage = getApiErrorMessage(null, err, 'Failed to delete product');
        return { success: false, message: errorMessage };
      }
    },
    [callApi, getCompanyId]
  );

  // Get single product by ID
  const getItem = useCallback(
    async (id) => {
      try {
        const companyId = getCompanyId();

        const response = await callApi({
          url: `${API_ROUTES.PRODUCTS.LIST}${id}/`,
          method: 'GET',
          query: { company_id: companyId },
        });

        if (response.success || response.id) {
          return response;
        }
        return response;
      } catch (err) {
        console.error('Failed to get product:', err);
        const errorMessage = getApiErrorMessage(null, err, 'Failed to get product');
        return { success: false, message: errorMessage };
      }
    },
    [callApi, getCompanyId]
  );

  // Search products
  const searchItems = useCallback(
    async (searchTerm, filters = {}) => {
      try {
        const companyId = getCompanyId();
        const response = await callApi({
          url: `${API_ROUTES.PRODUCTS.LIST}`,
          method: 'GET',
          query: {
            company_id: companyId,
            search: searchTerm,
            page: filters.page || 1,
            page_size: filters.page_size || 100,
            ...filters,
          },
        });

        if (response.success) {
          const items = response.results || response.data || [];
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
        console.error('Failed to search products:', err);
        const errorMessage = getApiErrorMessage(null, err, 'Failed to search products');
        throw new Error(errorMessage);
      }
    },
    [callApi, getCompanyId]
  );

  // FetchBaseMetal Types by product id
  const fetchBaseMetalTypes = useCallback(
    async (product_id, { exclude_diamond = false, exclude_gemstone = false }) => {
      try {
        const companyId = getCompanyId();
        if (!companyId) {
          console.warn('No company ID available for fetching products');
          return [];
        }

        const queryParams = {
          company_id: companyId,
          exclude_diamond: exclude_diamond,
          exclude_gemstone: exclude_gemstone,
        };

        const response = await callApi({
          url: API_ROUTES.PRODUCTS.GET_BASE_METAL_TYPES_BY_PRODUCT_ID(product_id),
          method: 'GET',
          query: queryParams,
        });

        if (response.success) {
          setBaseMetals(response);
          return response;
        }
        setBaseMetals(null);
        return null;
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setBaseMetals(null);
        const errorMessage = getApiErrorMessage(null, err, 'Failed to fetch products');
        throw new Error(errorMessage);
      }
    },
    [callApi, getCompanyId]
  );

  // Refresh data
  const refresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return {
    data,
    baseMetals,
    loading,
    error,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    getItem,
    searchItems,
    fetchBaseMetalTypes,
    refresh,
    refreshTrigger,
  };
};
