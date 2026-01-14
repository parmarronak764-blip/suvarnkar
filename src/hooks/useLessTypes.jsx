import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';

import { useApi } from 'src/hooks/useApi';
import { getApiErrorMessage } from 'src/utils/error-handler';

import { API_ROUTES } from 'src/utils/apiRoute';

// ----------------------------------------------------------------------

export function useLessTypes() {
  const { callApi } = useApi();
  const selectedCompany = useSelector((state) => state.user.selectedCompany);
  const [data, setData] = useState([]);
  const [currentItem, setCurrentItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [searchQuery, setSearchQuery] = useState('');
  const [variationType, setVariationType] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Get company_id from Redux
  const getCompanyId = useCallback(() => {
    const companyId = selectedCompany?.company?.id;
    return companyId;
  }, [selectedCompany]);

  // Fetch less types
  const fetchItems = useCallback(
    async (page = 1, pageSize = 25, search = '', variation = '') => {
      setLoading(true);
      setError(null);
      try {
        const companyId = getCompanyId();
        const queryParams = new URLSearchParams({
          company_id: companyId,
          page: page.toString(),
          page_size: pageSize.toString(),
          ...(search && { search }),
          ...(variation && { variation_type: variation }),
        });

        const response = await callApi({
          url: `${API_ROUTES.LESS_TYPES.LIST}?${queryParams}`,
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
          setItemsPerPage(pageSize);
          setSearchQuery(search);
          setVariationType(variation);
          return {
            items,
            total,
            hasNext: !!response.next || !!response.data?.next,
            hasPrevious: !!response.previous || !!response.data?.previous,
          };
        } else {
          setError(response.message || 'Failed to fetch less types');
          setData([]);
          setTotalCount(0);
          return { items: [], total: 0, hasNext: false, hasPrevious: false };
        }
      } catch {
        setError('Something went wrong while fetching less types');
        setData([]);
        setTotalCount(0);
        return { items: [], total: 0, hasNext: false, hasPrevious: false };
      } finally {
        setLoading(false);
      }
    },
    [callApi, getCompanyId]
  );

  // Create or update less type
  const createItem = useCallback(
    async (itemData) => {
      setLoading(true);
      setError(null);
      try {
        const companyId = getCompanyId();

        if (itemData.isBulkEntry && itemData.lessTypes && Array.isArray(itemData.lessTypes)) {
          const bulkRequestBody = {
            company_id: companyId,
            less_types: itemData.lessTypes.map((lessType) => ({
              less_type_name: lessType.less_type_name,
              variation_type: lessType.variation_type,
              variation_percentage: parseFloat(lessType.variation_percentage),
            })),
          };

          const response = await callApi({
            url: API_ROUTES.LESS_TYPES.BULK_CREATE,
            method: 'POST',
            body: bulkRequestBody,
          });

          if (response.success) {
            setRefreshTrigger((prev) => prev + 1);
            return {
              success: true,
              data: response.data,
              bulkDetails: response.data,
              message: response.message || 'Less types created successfully!',
            };
          }
          return {
            success: false,
            message: response.message || 'Failed to create less types in bulk',
          };
        }

        const requestBody = {
          ...itemData,
          company_id: companyId,
          variation_percentage: parseFloat(itemData.variation_percentage),
        };

        const response = await callApi({
          url: API_ROUTES.LESS_TYPES.CREATE,
          method: 'POST',
          body: requestBody,
        });

        if (response.success) {
          setRefreshTrigger((prev) => prev + 1);
          return {
            success: true,
            data: response.data,
            message: response.message || 'Less type created successfully!',
          };
        }
        return {
          success: false,
          message: response.message || 'Failed to create less type',
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

  // Update less type
  const updateItem = useCallback(
    async (id, itemData) => {
      setLoading(true);
      setError(null);
      try {
        const companyId = getCompanyId();
        const requestBody = {
          ...itemData,
          company_id: companyId,
          variation_percentage: parseFloat(itemData.variation_percentage),
        };

        const response = await callApi({
          url: `${API_ROUTES.LESS_TYPES.UPDATE}${id}/`,
          method: 'PATCH',
          body: requestBody,
        });

        if (response.success) {
          setRefreshTrigger((prev) => prev + 1);
          return {
            success: true,
            data: response.data,
            message: response.message || 'Less type updated successfully!',
          };
        }
        return {
          success: false,
          message: response.message || 'Failed to update less type',
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

  // Delete single less type
  const deleteItem = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);
      try {
        const companyId = getCompanyId();
        const response = await callApi({
          url: `${API_ROUTES.LESS_TYPES.DELETE}${id}/`,
          method: 'DELETE',
          body: { company_id: companyId },
        });

        if (response.success) {
          return {
            success: true,
            message: response.message || 'Less type deleted successfully!',
          };
        }
        return {
          success: false,
          message: response.message || 'Failed to delete less type',
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

  // Delete multiple less types
  const deleteItems = useCallback(
    async (ids) => {
      setLoading(true);
      setError(null);
      try {
        const companyId = getCompanyId();
        const deletePromises = ids.map((id) =>
          callApi({
            url: `${API_ROUTES.LESS_TYPES.DELETE}${id}/`,
            method: 'DELETE',
            body: { company_id: companyId },
          })
        );

        const responses = await Promise.all(deletePromises);
        const successCount = responses.filter((response) => response.success).length;

        if (successCount === ids.length) {
          return {
            success: true,
            message: `${successCount} less type(s) deleted successfully!`,
          };
        } else if (successCount > 0) {
          return {
            success: true,
            message: `${successCount} out of ${ids.length} less type(s) deleted successfully!`,
          };
        }
        return {
          success: false,
          message: 'Failed to delete less types',
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

  // Get single less type
  const getItem = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);
      try {
        const response = await callApi({
          url: `${API_ROUTES.LESS_TYPES.LIST}${id}/`,
          method: 'GET',
        });

        if (response.success) {
          setCurrentItem(response.data);
          return {
            success: true,
            data: response.data,
          };
        }
        return {
          success: false,
          message: response.message || 'Failed to fetch less type',
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
  const refreshData = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
    fetchItems(currentPage, itemsPerPage, searchQuery, variationType);
  }, [fetchItems, currentPage, itemsPerPage, searchQuery, variationType]);

  return {
    // Data
    data,
    currentItem,
    loading,
    error,
    totalCount,
    currentPage,
    itemsPerPage,
    searchQuery,
    variationType,

    // Actions
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    deleteItems,
    getItem,
    refreshData,
    refreshTrigger,
    setCurrentItem,
    setSearchQuery,
    setVariationType,
  };
}
