import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';

import { useApi } from 'src/hooks/useApi';
import { getApiErrorMessage } from 'src/utils/error-handler';

import { API_ROUTES } from 'src/utils/apiRoute';

// ----------------------------------------------------------------------

export function useMetalColors() {
  const { callApi } = useApi();
  const selectedCompany = useSelector((state) => state.user.selectedCompany);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Get company_id from Redux
  const getCompanyId = useCallback(() => {
    const companyId = selectedCompany?.company?.id;
    return companyId;
  }, [selectedCompany]);

  // Fetch list of metal colors with pagination and search
  const fetchItems = useCallback(
    async (page = 1, pageSize = 10, search = '', filters = { pagination: true }) => {
      setLoading(true);
      setError(null);
      try {
        const companyId = getCompanyId();
        const queryParams = new URLSearchParams({
          company_id: companyId,
        });

        if (filters.pagination) {
          queryParams.append('page', page);
          queryParams.append('page_size', pageSize.toString());
        }

        search && queryParams.append('search', search);

        const response = await callApi({
          url: `${API_ROUTES.METAL_COLORS.LIST}?${queryParams}`,
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

  // Create new metal color (supports both single and bulk creation)
  const createItem = useCallback(
    async (itemData) => {
      setError(null);
      try {
        const companyId = getCompanyId();

        if (itemData.isBulkEntry && itemData.metalColors && Array.isArray(itemData.metalColors)) {
          const bulkRequestBody = {
            company_id: companyId,
            metal_colors: itemData.metalColors.map((metalColor) => ({
              metal_color: metalColor.metal_color,
            })),
          };

          const response = await callApi({
            url: API_ROUTES.METAL_COLORS.BULK_CREATE,
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
                createdMetalColors: response.data?.created_metal_colors || [],
                existingMetalColors: response.data?.existing_metal_colors || [],
              },
            };
          }
          return {
            success: false,
            message: response.message || 'Failed to create metal colors',
          };
        } else {
          const requestBody = {
            ...itemData,
            company_id: companyId,
          };

          const response = await callApi({
            url: API_ROUTES.METAL_COLORS.CREATE,
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
            message: response.message || 'Failed to create metal color',
          };
        }
      } catch (err) {
        return {
          success: false,
          message: getApiErrorMessage(err) || 'Something went wrong!',
        };
      }
    },
    [callApi, getCompanyId]
  );

  // Update existing metal color
  const updateItem = useCallback(
    async (id, itemData) => {
      setError(null);
      try {
        const companyId = getCompanyId();
        const requestBody = {
          ...itemData,
          company_id: companyId,
        };

        const response = await callApi({
          url: `${API_ROUTES.METAL_COLORS.UPDATE}${id}/`,
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
          message: response.message || 'Failed to update metal color',
        };
      } catch (err) {
        return {
          success: false,
          message: getApiErrorMessage(err) || 'Something went wrong!',
        };
      }
    },
    [callApi, getCompanyId]
  );

  // Delete metal color (soft delete by setting is_active to false)
  const deleteItem = useCallback(
    async (id) => {
      setError(null);
      try {
        const companyId = getCompanyId();
        const response = await callApi({
          url: `${API_ROUTES.METAL_COLORS.DELETE}${id}/`,
          method: 'DELETE',
          body: { company_id: companyId },
        });

        if (response.success) {
          setRefreshTrigger((prev) => prev + 1);
          return {
            success: true,
            message: response.message || 'Metal color deleted successfully!',
          };
        }
        return {
          success: false,
          message: response.message || 'Failed to delete metal color',
        };
      } catch (err) {
        return {
          success: false,
          message: getApiErrorMessage(err) || 'Something went wrong!',
        };
      }
    },
    [callApi, getCompanyId]
  );

  // Delete multiple metal colors
  const deleteItems = useCallback(
    async (ids) => {
      setError(null);
      try {
        const companyId = getCompanyId();
        const deletePromises = ids.map((id) =>
          callApi({
            url: `${API_ROUTES.METAL_COLORS.DELETE}${id}/`,
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
          message: 'Failed to delete metal colors',
        };
      } catch (err) {
        return {
          success: false,
          message: getApiErrorMessage(err) || 'Something went wrong!',
        };
      }
    },
    [callApi, getCompanyId]
  );

  // Get single metal color by ID
  const getItem = useCallback(
    async (id) => {
      setError(null);
      try {
        const response = await callApi({
          url: `${API_ROUTES.METAL_COLORS.LIST}${id}/`,
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
          message: response.message || 'Failed to fetch metal color',
        };
      } catch (err) {
        return {
          success: false,
          message: getApiErrorMessage(err) || 'Something went wrong!',
        };
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
