import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';

import { useApi } from 'src/hooks/useApi';
import { getApiErrorMessage } from 'src/utils/error-handler';

import { API_ROUTES } from 'src/utils/apiRoute';

export function useBonusMasters() {
  const { callApi } = useApi();
  const selectedCompany = useSelector((state) => state.user.selectedCompany);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const getCompanyId = useCallback(() => {
    const companyId = selectedCompany?.company?.id;
    return companyId;
  }, [selectedCompany]);

  // Fetch list of bonus masters with pagination and search
  const fetchItems = useCallback(
    async (page = 1, pageSize = 10, search = '', pointsGivenType = '') => {
      setLoading(true);
      setError(null);
      try {
        const companyId = getCompanyId();
        const queryParams = new URLSearchParams({
          company_id: companyId,
          page: page.toString(),
          page_size: pageSize.toString(),
          ...(search && { search }),
          ...(pointsGivenType && { points_given_type: pointsGivenType }),
        });

        const response = await callApi({
          url: `${API_ROUTES.BONUS_MASTERS.LIST}?${queryParams}`,
          method: 'GET',
        });

        if (response.success) {
          let items = [];
          let total = 0;

          if (response.results) {
            items = response.results;
            total = response.count || 0;
          } else if (response.data?.results) {
            items = response.data.results;
            total = response.data.count || 0;
          } else if (Array.isArray(response.data)) {
            items = response.data;
            total = response.data.length;
          }

          setData(items);
          setTotalCount(total);
          setCurrentPage(page);
          return {
            items,
            total,
            hasNext: !!response.next || !!response.data?.next,
            hasPrevious: !!response.previous || !!response.data?.previous,
          };
        }
        return { items: [], total: 0, hasNext: false, hasPrevious: false };
      } catch (err) {
        setError(err);
        return { items: [], total: 0, hasNext: false, hasPrevious: false };
      } finally {
        setLoading(false);
      }
    },
    [callApi, getCompanyId]
  );

  // Create new bonus master (supports both single and bulk creation)
  const createItem = useCallback(
    async (itemData) => {
      setLoading(true);
      setError(null);
      try {
        const companyId = getCompanyId();

        // Check if this is bulk entry
        if (itemData.isBulkEntry && itemData.bonusMasters && Array.isArray(itemData.bonusMasters)) {
          // Handle bulk creation using bulk endpoint
          const bulkRequestBody = {
            company_id: companyId,
            bonus_masters: itemData.bonusMasters.map((bonusMaster) => ({
              name: bonusMaster.name,
              points_given_type: bonusMaster.points_given_type,
              per_unit_value: parseFloat(bonusMaster.per_unit_value),
              bonus_points: parseFloat(bonusMaster.bonus_points),
            })),
          };

          const response = await callApi({
            url: API_ROUTES.BONUS_MASTERS.BULK_CREATE,
            method: 'POST',
            body: bulkRequestBody,
          });

          if (response.success) {
            setRefreshTrigger((prev) => prev + 1);
            return {
              success: true,
              data: response.data,
              bulkDetails: {
                totalCreated: response.data?.total_created || 0,
                totalExisting: response.data?.total_existing || 0,
                createdBonusMasters: response.data?.created_bonus_masters || [],
                existingBonusMasters: response.data?.existing_bonus_masters || [],
              },
            };
          }
          return {
            success: false,
            message: response.message || 'Failed to create bonus masters',
          };
        } else {
          // Handle single creation
          const requestBody = {
            ...itemData,
            company_id: companyId,
            per_unit_value: parseFloat(itemData.per_unit_value),
            bonus_points: parseFloat(itemData.bonus_points),
          };

          const response = await callApi({
            url: API_ROUTES.BONUS_MASTERS.CREATE,
            method: 'POST',
            body: requestBody,
          });

          if (response.success) {
            setRefreshTrigger((prev) => prev + 1);
            return {
              success: true,
              data: response.data,
            };
          }
          return {
            success: false,
            message: response.message || 'Failed to create bonus master',
          };
        }
      } catch (err) {
        return {
          success: false,
          message: getApiErrorMessage(err) || 'Something went wrong!',
        };
      } finally {
        setLoading(false);
      }
    },
    [callApi, getCompanyId]
  );

  // Update existing bonus master
  const updateItem = useCallback(
    async (id, itemData) => {
      setLoading(true);
      setError(null);
      try {
        const companyId = getCompanyId();
        const requestBody = {
          ...itemData,
          company_id: companyId,
          per_unit_value: parseFloat(itemData.per_unit_value),
          bonus_points: parseFloat(itemData.bonus_points),
        };

        const response = await callApi({
          url: `${API_ROUTES.BONUS_MASTERS.UPDATE}${id}/`,
          method: 'PATCH',
          body: requestBody,
        });

        if (response.success) {
          setRefreshTrigger((prev) => prev + 1);
          return {
            success: true,
            data: response.data,
          };
        }
        return {
          success: false,
          message: response.message || 'Failed to update bonus master',
        };
      } catch (err) {
        return {
          success: false,
          message: getApiErrorMessage(err) || 'Something went wrong!',
        };
      } finally {
        setLoading(false);
      }
    },
    [callApi, getCompanyId]
  );

  // Delete bonus master (soft delete by setting is_active to false)
  const deleteItem = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);
      try {
        const companyId = getCompanyId();
        const response = await callApi({
          url: `${API_ROUTES.BONUS_MASTERS.DELETE}${id}/`,
          method: 'DELETE',
          body: { company_id: companyId },
        });

        if (response.success) {
          setRefreshTrigger((prev) => prev + 1);
          return {
            success: true,
            message: response.message || 'Bonus master deleted successfully!',
          };
        }
        return {
          success: false,
          message: response.message || 'Failed to delete bonus master',
        };
      } catch (err) {
        return {
          success: false,
          message: getApiErrorMessage(err) || 'Something went wrong!',
        };
      } finally {
        setLoading(false);
      }
    },
    [callApi, getCompanyId]
  );

  // Delete multiple bonus masters
  const deleteItems = useCallback(
    async (ids) => {
      setLoading(true);
      setError(null);
      try {
        const companyId = getCompanyId();
        const deletePromises = ids.map((id) =>
          callApi({
            url: `${API_ROUTES.BONUS_MASTERS.DELETE}${id}/`,
            method: 'DELETE',
            body: { company_id: companyId },
          })
        );

        const responses = await Promise.all(deletePromises);
        const successCount = responses.filter((response) => response.success).length;

        if (successCount === ids.length) {
          setRefreshTrigger((prev) => prev + 1);
          return {
            success: true,
            deletedCount: successCount,
            totalCount: ids.length,
          };
        }
        return {
          success: false,
          message: 'Failed to delete bonus masters',
        };
      } catch (err) {
        return {
          success: false,
          message: getApiErrorMessage(err) || 'Something went wrong!',
        };
      } finally {
        setLoading(false);
      }
    },
    [callApi, getCompanyId]
  );

  // Get single bonus master by ID
  const getItem = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);
      try {
        const response = await callApi({
          url: `${API_ROUTES.BONUS_MASTERS.LIST}${id}/`,
          method: 'GET',
        });

        if (response.success) {
          return {
            success: true,
            data: response.data,
          };
        }
        return {
          success: false,
          message: response.message || 'Failed to fetch bonus master',
        };
      } catch (err) {
        return {
          success: false,
          message: getApiErrorMessage(err) || 'Something went wrong!',
        };
      } finally {
        setLoading(false);
      }
    },
    [callApi]
  );

  // Refresh data
  const refresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return {
    data,
    loading,
    error,
    totalCount,
    currentPage,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    deleteItems,
    getItem,
    refresh,
    refreshTrigger,
  };
}
