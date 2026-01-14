import { useState, useCallback } from 'react';
import { useApi } from './useApi';
import { API_ROUTES } from 'src/utils/apiRoute';
import { useSelector } from 'react-redux';
import { getApiErrorMessage } from 'src/utils/error-handler';

// ----------------------------------------------------------------------

// Use offers API endpoint
const ENDPOINTS = API_ROUTES.OFFERS;

// ----------------------------------------------------------------------

export const useOfferMaster = () => {
  const { callApi, loading, error } = useApi();
  const [data, setData] = useState([]);
  const selectedCompany = useSelector((state) => state.user.selectedCompany);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Get company_id from localStorage or user context
  const getCompanyId = useCallback(() => {
    const companyId = selectedCompany?.company?.id;
    return companyId;
  }, [selectedCompany]);

  // Fetch list of items
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

          if (response.results) {
            items = response.results;
          } else if (response.data && Array.isArray(response.data)) {
            items = response.data;
          } else {
            const numericKeys = Object.keys(response)
              .filter((key) => !isNaN(parseInt(key, 10)))
              .map((key) => parseInt(key, 10))
              .sort((a, b) => a - b);

            if (numericKeys.length > 0) {
              items = numericKeys.map((index) => response[index]);
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
        console.error('Failed to fetch offers:', err);
        const errorMessage = getApiErrorMessage(null, err, 'Failed to fetch offers');
        throw new Error(errorMessage);
      }
    },
    [callApi, getCompanyId]
  );

  // Create new item (supports both single and bulk creation)
  const createItem = useCallback(
    async (itemData) => {
      try {
        const companyId = getCompanyId();

        if (itemData.isBulkEntry && itemData.offers && Array.isArray(itemData.offers)) {
          const invalidOffers = itemData.offers.filter(
            (offer) => isNaN(Number(offer.value)) || Number(offer.value) <= 0
          );
          if (invalidOffers.length > 0) {
            return { success: false, message: 'All offer values must be positive numbers' };
          }

          const bulkRequestBody = {
            company_id: companyId,
            offers: itemData.offers.map((offer) => ({
              name: offer.name.trim(),
              applied_on: offer.applied_on,
              offer_type: offer.offer_type,
              value: Number(offer.value),
              company_id: companyId,
            })),
          };

          const bulkEndpoint = ENDPOINTS.CREATE.replace(/\/$/, '') + '/bulk/';

          const response = await callApi({
            url: bulkEndpoint,
            method: 'POST',
            body: bulkRequestBody,
          });

          if (response.success) {
            setRefreshTrigger((prev) => prev + 1);
            return response;
          }
          return { success: false, message: 'Failed to create offers' };
        } else {
          if (isNaN(Number(itemData.value)) || Number(itemData.value) <= 0) {
            return { success: false, message: 'Offer value must be a positive number' };
          }

          const requestBody = {
            ...itemData,
            value: Number(itemData.value),
            company_id: companyId,
          };

          const response = await callApi({
            url: ENDPOINTS.CREATE,
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
        console.error('Failed to create offer:', err);
        const errorMessage = getApiErrorMessage(null, err, 'Failed to create offer');
        return { success: false, message: errorMessage };
      }
    },
    [callApi, getCompanyId]
  );

  // Update existing item
  const updateItem = useCallback(
    async (id, itemData) => {
      try {
        const companyId = getCompanyId();
        const requestBody = {
          ...itemData,
          company_id: companyId,
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
        console.error('Failed to update offer:', err);
        const errorMessage = getApiErrorMessage(null, err, 'Failed to update offer');
        return { success: false, message: errorMessage };
      }
    },
    [callApi, getCompanyId]
  );

  // Delete item
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
        console.error('Failed to delete offer:', err);
        const errorMessage = getApiErrorMessage(null, err, 'Failed to delete offer');
        return { success: false, message: errorMessage };
      }
    },
    [callApi, getCompanyId]
  );

  // Delete multiple items
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

        return { success: false, message: 'Failed to delete items' };
      } catch (err) {
        console.error('Failed to delete offers:', err);
        const errorMessage = getApiErrorMessage(null, err, 'Failed to delete offers');
        return { success: false, message: errorMessage };
      }
    },
    [callApi, getCompanyId]
  );

  // Get single item by ID
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
        console.error('Failed to get offer:', err);
        const errorMessage = getApiErrorMessage(null, err, 'Failed to get offer');
        return { success: false, message: errorMessage };
      }
    },
    [callApi, getCompanyId]
  );

  // Search items
  const searchItems = useCallback(
    async (searchTerm, page = 1, pageSize = 100) => {
      try {
        const companyId = getCompanyId();
        const response = await callApi({
          url: ENDPOINTS.LIST,
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
          return items;
        }
        return [];
      } catch (err) {
        console.error('Failed to search offers:', err);
        const errorMessage = getApiErrorMessage(null, err, 'Failed to search offers');
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
    loading,
    error,
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
