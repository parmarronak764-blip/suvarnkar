import { useState, useCallback } from 'react';
import { useApi } from './useApi';
import { API_ROUTES } from 'src/utils/apiRoute';
import { useSelector } from 'react-redux';

export const useCustomerGroups = () => {
  const { callApi, loading, error } = useApi();
  const [data, setData] = useState([]);
  const selectedCompany = useSelector((state) => state.user.selectedCompany);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    page: 1,
    page_size: 10,
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Get endpoints
  const ENDPOINTS = API_ROUTES.CUSTOMER_GROUPS;

  // Get company_id from localStorage or user context
  const getCompanyId = useCallback(() => {
    const companyId = selectedCompany?.company?.id;
    return companyId;
  }, [selectedCompany]);

  // Fetch list of customer groups with pagination and search
  const fetchItems = useCallback(
    async (page = 1, pageSize = 10, search = '', isActive = null) => {
      try {
        const companyId = getCompanyId();
        const query = {
          company_id: companyId,
          page,
          page_size: pageSize,
        };

        if (search) {
          query.search = search;
        }

        if (isActive !== null) {
          query.is_active = isActive;
        }

        const response = await callApi({
          url: ENDPOINTS.LIST,
          method: 'GET',
          query,
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

          setData(items);

          // Update pagination state
          if (response.count !== undefined) {
            setPagination({
              count: response.count,
              next: response.next,
              previous: response.previous,
              page,
              page_size: pageSize,
            });
          }

          return items;
        }
        return [];
      } catch {
        return [];
      }
    },
    [callApi, ENDPOINTS, getCompanyId]
  );

  // Create new customer group (supports both single and bulk creation)
  const createItem = useCallback(
    async (itemData) => {
      try {
        const companyId = getCompanyId();

        // Check if this is bulk entry
        if (itemData.isBulkEntry && itemData.names && Array.isArray(itemData.names)) {
          // Handle bulk creation using bulk endpoint
          const bulkRequestBody = {
            company_id: companyId,
            customer_groups: itemData.names.map((name) => ({
              group_name: name.trim(),
            })),
          };

          // Use bulk endpoint
          const bulkEndpoint = ENDPOINTS.CREATE.replace(/\/$/, '') + '/bulk/';

          const response = await callApi({
            url: bulkEndpoint,
            method: 'POST',
            body: bulkRequestBody,
          });

          if (response.success) {
            // Refresh data after creation
            setRefreshTrigger((prev) => prev + 1);

            // Return enhanced response with bulk details
            return {
              ...response,
              success: true,
              bulkDetails: {
                totalCreated: response.total_created || 0,
                totalExisting: response.total_existing || 0,
                createdGroups: response.created_customer_groups || [],
                existingGroups: response.existing_customer_groups || [],
              },
            };
          }
          return { success: false, message: 'Failed to create customer groups' };
        } else {
          // Handle single creation
          const requestBody = {
            group_name: itemData.group_name,
            company_id: companyId,
            is_active: itemData.is_active !== undefined ? itemData.is_active : true,
          };

          const response = await callApi({
            url: ENDPOINTS.CREATE,
            method: 'POST',
            body: requestBody,
          });

          if (response.success) {
            // Refresh data after creation
            setRefreshTrigger((prev) => prev + 1);
            return response;
          }
          return response;
        }
      } catch (err) {
        // Handle specific error cases
        if (err.message && err.message.includes('duplicate key value violates unique constraint')) {
          return {
            success: false,
            message:
              'A customer group with this name already exists for your company. Please use a different name.',
          };
        }

        return { success: false, message: err.message || 'Failed to create customer group' };
      }
    },
    [callApi, ENDPOINTS, getCompanyId]
  );

  // Update existing customer group
  const updateItem = useCallback(
    async (id, itemData) => {
      try {
        const companyId = getCompanyId();
        const requestBody = {
          group_name: itemData.group_name,
          company_id: companyId,
          is_active: itemData.is_active !== undefined ? itemData.is_active : true,
        };

        const response = await callApi({
          url: `${ENDPOINTS.UPDATE}${id}/`,
          method: 'PATCH',
          body: requestBody,
        });

        if (response.success) {
          // Refresh data after update
          setRefreshTrigger((prev) => prev + 1);
          return response;
        }
        return response;
      } catch (err) {
        return { success: false, message: err.message };
      }
    },
    [callApi, ENDPOINTS, getCompanyId]
  );

  // Delete customer group (soft delete by setting is_active to false)
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
          // Remove item from local state immediately for better UX
          setData((prevData) => prevData.filter((item) => item.id !== id));
          return response;
        }
        return response;
      } catch (err) {
        return { success: false, message: err.message };
      }
    },
    [callApi, ENDPOINTS, getCompanyId]
  );

  // Delete multiple customer groups
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
          // Remove successfully deleted items from local state
          const deletedIds = ids.slice(0, successfulDeletes.length);
          setData((prevData) => prevData.filter((item) => !deletedIds.includes(item.id)));

          return {
            success: true,
            deletedCount: successfulDeletes.length,
            totalCount: ids.length,
          };
        }

        return { success: false, message: 'Failed to delete customer groups' };
      } catch (err) {
        return { success: false, message: err.message };
      }
    },
    [callApi, ENDPOINTS, getCompanyId]
  );

  // Get single customer group by ID
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
        return { success: false, message: err.message };
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
    pagination,
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
