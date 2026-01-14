import { useState, useCallback } from 'react';
import { useApi } from './useApi';
import { API_ROUTES } from 'src/utils/apiRoute';
import { useSelector } from 'react-redux';

// Map tab values to API endpoints
const ENDPOINT_MAP = {
  clarity: API_ROUTES.DIAMONDS, // Use diamonds API for clarity tab
  shape: API_ROUTES.DIAMOND_DETAILS.SHAPE,
  sizeRange: API_ROUTES.DIAMOND_DETAILS.SIZE_RANGE,
  color: API_ROUTES.DIAMOND_DETAILS.COLOR,
  certificateType: API_ROUTES.DIAMOND_DETAILS.CERTIFICATE_TYPE,
  carat: API_ROUTES.DIAMOND_DETAILS.CARAT,
  metal: API_ROUTES.DIAMOND_DETAILS.METAL_TYPES,
};

// ----------------------------------------------------------------------

export const useDiamondDetails = (category = 'clarity') => {
  const { callApi, loading, error } = useApi();
  const [data, setData] = useState([]);
  const selectedCompany = useSelector((state) => state.user.selectedCompany);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    currentPage: 1,
    pageSize: 10,
  });

  // Get current endpoints for the category
  const endpoints = ENDPOINT_MAP[category];

  // Get company_id from localStorage or user context
  const getCompanyId = useCallback(() => {
    const companyId = selectedCompany?.company?.id;
    return companyId;
  }, [selectedCompany]);

  // Fetch list of items
  const fetchItems = useCallback(
    async (page = 1, pageSize = 10, searchTerm = '', status = 'all', filters = {}) => {
      if (!endpoints) return;

      try {
        const companyId = getCompanyId();
        const query = {
          company_id: companyId,
        };

        if (filters.pagination !== false) {
          query.page = page;
          query.page_size = pageSize;
        }

        // Add search parameters if provided
        if (searchTerm) {
          query.search = searchTerm;
        }
        if (status !== 'all') {
          query.is_active = status === 'active';
        }

        // eslint-disable-next-line no-unused-vars
        const { pagination: paginationFlag, ...otherFilters } = filters;
        Object.assign(query, otherFilters);

        const response = await callApi({
          url: endpoints.LIST,
          method: 'GET',
          query,
        });

        if (response.success) {
          const items = response.results || response.data || [];

          if (category === 'carat' || category === 'metal') {
            const carats = Object.values(response).filter(
              (v) => typeof v === 'object' && v !== null && 'id' in v
            );
            setData(carats);
          } else {
            setData(items);
          }

          setPagination({
            count: response.count || 0,
            next: response.next,
            previous: response.previous,
            currentPage: page,
            pageSize,
          });
        }
      } catch (err) {
        console.error(`Failed to fetch ${category} items:`, err);
      }
    },
    [callApi, endpoints, category, getCompanyId]
  );

  // Create new item (supports both single and bulk creation)
  const createItem = useCallback(
    async (itemData) => {
      if (!endpoints) return { success: false };

      try {
        const companyId = getCompanyId();

        if (
          itemData.isBulkEntry &&
          (itemData.names || itemData.range_values) &&
          (Array.isArray(itemData.names) || Array.isArray(itemData.range_values))
        ) {
          let bulkRequestBody;

          if (category === 'sizeRange') {
            bulkRequestBody = {
              company_id: companyId,
              size_ranges: itemData.range_values.map((rangeValue) => ({
                range_value: rangeValue.trim(),
                shape_id: itemData.shape_id,
                company_id: companyId,
              })),
            };
          } else if (category === 'certificateType') {
            bulkRequestBody = {
              company_id: companyId,
              certificate_types: itemData.names.map((name) => name.trim()),
            };
          } else if (category === 'color') {
            bulkRequestBody = {
              company_id: companyId,
              colors: itemData.names.map((name) => name.trim()),
            };
          } else if (category === 'shape') {
            bulkRequestBody = {
              company_id: companyId,
              shapes: itemData.names.map((name) => name.trim()),
            };
          } else {
            bulkRequestBody = {
              company_id: companyId,
              [category]: itemData.names.map((name) => name.trim()),
            };
          }

          const bulkEndpoint = endpoints.CREATE.replace(/\/$/, '') + '/bulk/';

          const response = await callApi({
            url: bulkEndpoint,
            method: 'POST',
            body: bulkRequestBody,
          });

          if (response.success) {
            setRefreshTrigger((prev) => prev + 1);
            return response;
          }
          return response;
        } else {
          let requestBody;

          if (category === 'sizeRange') {
            requestBody = {
              range_value: itemData.range_value,
              shape_id: itemData.shape_id,
              company_id: companyId,
            };
          } else if (category === 'clarity') {
            requestBody = {
              shape_id: itemData.shape_id,
              size_range_id: itemData.size_range_id,
              carat_id: itemData.carat_id,
              todays_rate: itemData.todays_rate,
              company_id: companyId,
              is_active: itemData.is_active,
            };
          } else if (category === 'certificateType') {
            requestBody = {
              name: itemData.name,
              company_id: companyId,
            };
          } else {
            requestBody = {
              ...itemData,
              company_id: companyId,
            };
          }

          const response = await callApi({
            url: endpoints.CREATE,
            method: 'POST',
            body: requestBody,
          });

          if (response.success) {
            setRefreshTrigger((prev) => prev + 1);
            return response;
          }
          return response;
        }
      } catch (err) {
        console.error(`Failed to create ${category} item:`, err);
        return { success: false, message: err.message };
      }
    },
    [callApi, endpoints, category, getCompanyId]
  );

  // Update existing item
  const updateItem = useCallback(
    async (id, itemData) => {
      if (!endpoints) return { success: false };

      try {
        const companyId = getCompanyId();
        let requestBody;

        if (category === 'sizeRange') {
          requestBody = {
            range_value: itemData.range_value,
            shape_id: itemData.shape_id,
            company_id: companyId,
            is_active: itemData.is_active,
          };
        } else if (category === 'clarity') {
          requestBody = {
            clarity_id: itemData.clarity_id || 1,
            shape_id: itemData.shape_id,
            size_range_id: itemData.size_range_id,
            carat_id: itemData.carat_id,
            todays_rate: itemData.todays_rate,
            company_id: companyId,
            is_active: itemData.is_active,
          };
        } else {
          requestBody = {
            ...itemData,
            company_id: companyId,
          };
        }

        const response = await callApi({
          url: `${endpoints.UPDATE}${id}/`,
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
        console.error(`Failed to update ${category} item:`, err);
        return { success: false, message: err.message };
      }
    },
    [callApi, endpoints, category, getCompanyId]
  );

  // Delete item (soft delete by setting is_active to false)
  const deleteItem = useCallback(
    async (id) => {
      if (!endpoints) return { success: false };

      try {
        const companyId = getCompanyId();
        const response = await callApi({
          url: `${endpoints.DELETE}${id}/`,
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
        console.error(`Failed to delete ${category} item:`, err);
        return { success: false, message: err.message };
      }
    },
    [callApi, endpoints, category, getCompanyId]
  );

  // Delete multiple items
  const deleteItems = useCallback(
    async (ids) => {
      if (!endpoints || !Array.isArray(ids)) return { success: false };

      try {
        const companyId = getCompanyId();
        const deletePromises = ids.map((id) =>
          callApi({
            url: `${endpoints.DELETE}${id}/`,
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

        return { success: false, message: 'Failed to delete items' };
      } catch (err) {
        console.error(`Failed to delete ${category} items:`, err);
        return { success: false, message: err.message };
      }
    },
    [callApi, endpoints, category, getCompanyId]
  );

  // Get single item by ID
  const getItem = useCallback(
    async (id) => {
      if (!endpoints) return { success: false };

      try {
        const companyId = getCompanyId();
        const response = await callApi({
          url: `${endpoints.LIST}${id}/`,
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
        console.error(`Failed to get ${category} item:`, err);
        return { success: false, message: err.message };
      }
    },
    [callApi, endpoints, category, getCompanyId]
  );

  // Search items
  const searchItems = useCallback(
    async (searchTerm, page = 1, pageSize = 10) => {
      if (!endpoints) return;

      try {
        const companyId = getCompanyId();
        const response = await callApi({
          url: endpoints.LIST,
          method: 'GET',
          query: {
            company_id: companyId,
            search: searchTerm,
            page,
            page_size: pageSize,
          },
        });

        if (response.success) {
          const items = response.results || response.data || [];
          setData(items);

          setPagination({
            count: response.count || 0,
            next: response.next,
            previous: response.previous,
            currentPage: page,
            pageSize,
          });
        }
      } catch (err) {
        console.error(`Failed to search ${category} items:`, err);
      }
    },
    [callApi, endpoints, category, getCompanyId]
  );

  // Refresh data
  const refresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return {
    data,
    loading,
    error,
    pagination,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    deleteItems,
    getItem,
    searchItems,
    refresh,
    refreshTrigger,
  };
};
