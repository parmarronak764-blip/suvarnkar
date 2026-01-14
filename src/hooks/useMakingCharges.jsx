import { useState, useCallback } from 'react';
import { useApi } from './useApi';
import { API_ROUTES } from 'src/utils/apiRoute';
import { useSelector } from 'react-redux';

// ----------------------------------------------------------------------

export const useMakingCharges = () => {
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
  const ENDPOINTS = API_ROUTES.MAKING_CHARGES;

  // Get company_id from localStorage or user context
  const getCompanyId = useCallback(() => {
    const companyId = selectedCompany?.company?.id;
    return companyId;
  }, [selectedCompany]);

  // Fetch list of making charges with pagination
  const fetchItems = useCallback(
    async (page = 1, pageSize = 10) => {
      try {
        const companyId = getCompanyId();
        const query = {
          company_id: companyId,
          page,
          page_size: pageSize,
        };

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
      } catch (err) {
        return [];
      }
    },
    [callApi, ENDPOINTS, getCompanyId]
  );

  // Create new making charge (supports both single and bulk creation)
  const createItem = useCallback(
    async (itemData) => {
      try {
        const companyId = getCompanyId();

        // Check if this is bulk entry
        if (itemData.isBulkEntry && itemData.makingCharges && Array.isArray(itemData.makingCharges)) {
          // Handle bulk creation using bulk endpoint
          const bulkRequestBody = {
            company_id: companyId,
            making_charges: itemData.makingCharges.map((charge) => ({
              charge_name: charge.charge_name,
              charge_code: charge.charge_code,
              labour_charge: charge.labour_charge,
              charge_value: charge.charge_value,
            })),
          };

          const response = await callApi({
            url: ENDPOINTS.BULK_CREATE,
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
                createdCharges: response.created_making_charges || [],
                existingCharges: response.existing_making_charges || [],
              },
            };
          }
          return { success: false, message: 'Failed to create making charges' };
        } else {
          // Handle single creation
          const requestBody = {
            charge_name: itemData.charge_name,
            charge_code: itemData.charge_code,
            labour_charge: itemData.labour_charge,
            charge_value: parseFloat(itemData.charge_value),
            company_id: companyId,
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
              'A making charge with this code already exists for your company. Please use a different code.',
          };
        }

        return { success: false, message: err.message || 'Failed to create making charge' };
      }
    },
    [callApi, ENDPOINTS, getCompanyId]
  );

  // Update existing making charge
  const updateItem = useCallback(
    async (id, itemData) => {
      try {
        const companyId = getCompanyId();
        const requestBody = {
          charge_name: itemData.charge_name,
          charge_code: itemData.charge_code,
          labour_charge: itemData.labour_charge,
          charge_value: parseFloat(itemData.charge_value),
          company_id: companyId,
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

  // Delete making charge (soft delete by setting is_active to false)
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

  // Delete multiple making charges
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

        return { success: false, message: 'Failed to delete making charges' };
      } catch (err) {
        return { success: false, message: err.message };
      }
    },
    [callApi, ENDPOINTS, getCompanyId]
  );

  // Get single making charge by ID
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
