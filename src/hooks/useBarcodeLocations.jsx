import { useState, useCallback } from 'react';
import { useApi } from './useApi';
import { API_ROUTES } from 'src/utils/apiRoute';
import { useSelector } from 'react-redux';
import { getApiErrorMessage } from 'src/utils/error-handler';

export const useBarcodeLocations = () => {
  const { callApi, loading, error } = useApi();
  const [data, setData] = useState([]);
  const selectedCompany = useSelector((state) => state.user.selectedCompany);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Get company_id from selectedCompany
  const getCompanyId = useCallback(
    () => selectedCompany?.company?.id || selectedCompany?.id,
    [selectedCompany]
  );

  // Fetch list of barcode locations
  const fetchItems = useCallback(
    async (filters = {}) => {
      try {
        const companyId = getCompanyId();
        if (!companyId) {
          console.warn('No company ID available for fetching barcode locations');
          return [];
        }

        const queryParams = {
          company_id: companyId,
        };

        if (filters.pagination !== false) {
          queryParams.page = filters.page || 1;
          queryParams.page_size = filters.page_size || 100;
        }

        if (filters.search) {
          queryParams.search = filters.search;
        }

        // eslint-disable-next-line no-unused-vars
        const { pagination, page, page_size, search, ...otherFilters } = filters;
        Object.assign(queryParams, otherFilters);

        const response = await callApi({
          url: API_ROUTES.BARCODE_LOCATIONS.LIST,
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
        console.error('Failed to fetch barcode locations:', err);
        const errorMessage = getApiErrorMessage(null, err, 'Failed to fetch barcode locations');
        throw new Error(errorMessage);
      }
    },
    [callApi, getCompanyId]
  );

  // Create new barcode location
  const createItem = useCallback(
    async (locationData) => {
      try {
        const companyId = getCompanyId();
        if (!companyId) {
          throw new Error('Company ID is required to create a barcode location');
        }

        // Prepare location data with company info
        const body = {
          ...locationData,
          company_id: companyId,
        };

        const response = await callApi({
          url: API_ROUTES.BARCODE_LOCATIONS.CREATE,
          method: 'POST',
          body,
          query: {
            company_id: companyId,
          },
        });

        if (response.success || response.id) {
          // Refresh data after creation
          setRefreshTrigger((prev) => prev + 1);
          return response;
        }
        return response;
      } catch (err) {
        console.error('Failed to create barcode location:', err);
        const errorMessage = getApiErrorMessage(null, err, 'Failed to create barcode location');
        return { success: false, message: errorMessage };
      }
    },
    [callApi, getCompanyId]
  );

  // Create multiple barcode locations (bulk)
  const createBulkItems = useCallback(
    async (bulkData) => {
      try {
        const companyId = getCompanyId();
        if (!companyId) {
          throw new Error('Company ID is required to create barcode locations');
        }

        // Validate bulk count limit
        const locationCount = bulkData.barcode_locations?.length || 0;
        if (locationCount > 10) {
          throw new Error('Cannot create more than 10 barcode locations at once');
        }

        const body = {
          ...bulkData,
          company_id: companyId,
        };

        const response = await callApi({
          url: API_ROUTES.BARCODE_LOCATIONS.BULK_CREATE,
          method: 'POST',
          body,
          query: {
            company_id: companyId,
          },
        });

        if (response.success) {
          // Refresh data after creation
          setRefreshTrigger((prev) => prev + 1);
          return response;
        }
        return response;
      } catch (err) {
        console.error('Failed to create bulk barcode locations:', err);
        const errorMessage = getApiErrorMessage(null, err, 'Failed to create barcode locations');
        return { success: false, message: errorMessage };
      }
    },
    [callApi, getCompanyId]
  );

  // Get next available box codes
  const getNextCodes = useCallback(
    async (count = 1) => {
      try {
        const companyId = getCompanyId();
        if (!companyId) {
          throw new Error('Company ID is required to get next codes');
        }

        // Validate count limit
        if (count > 10) {
          throw new Error('Cannot generate more than 10 codes at once');
        }

        const response = await callApi({
          url: API_ROUTES.BARCODE_LOCATIONS.NEXT_CODES,
          method: 'POST',
          body: {
            company_id: companyId,
            count: Math.max(1, Math.min(10, count)), // Ensure count is between 1-10
          },
          query: {
            company_id: companyId,
          },
        });

        if (response.success || response.next_codes) {
          return {
            success: true,
            codes: response.next_codes || [],
            total_generated: response.total_generated || count,
          };
        }
        return response;
      } catch (err) {
        console.error('Failed to get next codes:', err);
        const errorMessage = getApiErrorMessage(null, err, 'Failed to generate codes');
        return { success: false, message: errorMessage };
      }
    },
    [callApi, getCompanyId]
  );

  // Update existing barcode location
  const updateItem = useCallback(
    async (id, locationData) => {
      try {
        const companyId = getCompanyId();
        if (!companyId) {
          throw new Error('Company ID is required to update a barcode location');
        }

        const body = {
          ...locationData,
          company_id: companyId,
        };

        const response = await callApi({
          url: `${API_ROUTES.BARCODE_LOCATIONS.UPDATE}${id}/`,
          method: 'PATCH',
          body,
          query: {
            company_id: companyId,
          },
        });

        if (response.success || response.id) {
          // Refresh data after update
          setRefreshTrigger((prev) => prev + 1);
          return response;
        }
        return response;
      } catch (err) {
        console.error('Failed to update barcode location:', err);
        const errorMessage = getApiErrorMessage(null, err, 'Failed to update barcode location');
        return { success: false, message: errorMessage };
      }
    },
    [callApi, getCompanyId]
  );

  // Delete barcode location (soft delete - sets is_active to false)
  const deleteItem = useCallback(
    async (id) => {
      try {
        const companyId = getCompanyId();
        if (!companyId) {
          throw new Error('Company ID is required to delete a barcode location');
        }

        const response = await callApi({
          url: `${API_ROUTES.BARCODE_LOCATIONS.DELETE}${id}/`,
          method: 'DELETE',
          query: { company_id: companyId },
        });

        if (response.success) {
          // Refresh data after deletion
          setRefreshTrigger((prev) => prev + 1);
          return { success: true };
        }
        return response;
      } catch (err) {
        console.error('Failed to delete barcode location:', err);
        const errorMessage = getApiErrorMessage(null, err, 'Failed to delete barcode location');
        return { success: false, message: errorMessage };
      }
    },
    [callApi, getCompanyId]
  );

  // Trigger refresh
  const refresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return {
    // Data
    data,
    loading,
    error,
    refreshTrigger,

    // Actions
    fetchItems,
    createItem,
    createBulkItems,
    getNextCodes,
    updateItem,
    deleteItem,
    refresh,
  };
};
