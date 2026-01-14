import { useState, useCallback } from 'react';
import { useApi } from './useApi';
import { API_ROUTES } from 'src/utils/apiRoute';
import { useSelector } from 'react-redux';
import { getApiErrorMessage } from 'src/utils/error-handler';

// ----------------------------------------------------------------------

export const usePurchaseDiamondDetails = () => {
  const { callApi, loading, error } = useApi();
  const [data, setData] = useState([]);
  const selectedCompany = useSelector((state) => state.user.selectedCompany);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Get company_id from selectedCompany
  const getCompanyId = useCallback(() => {
    const companyId = selectedCompany?.company?.id || selectedCompany?.id;
    return companyId;
  }, [selectedCompany]);

  // Fetch diamond details for purchase
  const fetchDiamondDetails = useCallback(async (filters = {}) => {
    try {
      const companyId = getCompanyId();
      if (!companyId) {
        console.warn('No company ID available for fetching diamond details');
        return [];
      }

      const response = await callApi({
        url: API_ROUTES.PURCHASE.DIAMOND_DETAILS.LIST,
        method: 'GET',
        query: {
          company_id: companyId,
          page: filters.page || 1,
          page_size: filters.page_size || 100,
          ...filters, // Include additional filters
        },
      });

      if (response.success) {
        let items = [];

        // Handle different response structures
        if (response.results) {
          items = response.results;
        } else if (response.data && Array.isArray(response.data)) {
          items = response.data;
        } else if (Array.isArray(response)) {
          items = response;
        } else {
          // Handle useApi spreading behavior
          const numericKeys = Object.keys(response).filter((key) => !isNaN(parseInt(key, 10)));
          if (numericKeys.length > 0) {
            items = numericKeys.map((key) => response[key]);
          }
        }

        setData(items);
        return {
          items,
          success: true,
        };
      }

      return { items: [], success: false };
    } catch (err) {
      console.error('Error fetching diamond details:', err);
      const errorMessage = getApiErrorMessage(null, err, 'Failed to fetch diamond details');
      throw new Error(errorMessage);
    }
  }, [callApi, getCompanyId]);

  // Create diamond detail
  const createDiamondDetail = useCallback(async (diamondData) => {
    try {
      const companyId = getCompanyId();
      if (!companyId) {
        throw new Error('No company ID available');
      }

      const response = await callApi({
        url: API_ROUTES.PURCHASE.DIAMOND_DETAILS.CREATE,
        method: 'POST',
        body: {
          ...diamondData,
          company_id: companyId,
        },
      });

      if (response.success) {
        setRefreshTrigger(prev => prev + 1);
        return { success: true, data: response };
      }

      return { success: false };
    } catch (err) {
      console.error('Error creating diamond detail:', err);
      const errorMessage = getApiErrorMessage(null, err, 'Failed to create diamond detail');
      throw new Error(errorMessage);
    }
  }, [callApi, getCompanyId]);

  // Update diamond detail
  const updateDiamondDetail = useCallback(async (id, diamondData) => {
    try {
      const response = await callApi({
        url: `${API_ROUTES.PURCHASE.DIAMOND_DETAILS.UPDATE}${id}/`,
        method: 'PATCH',
        body: diamondData,
      });

      if (response.success) {
        setRefreshTrigger(prev => prev + 1);
        return { success: true, data: response };
      }

      return { success: false };
    } catch (err) {
      console.error('Error updating diamond detail:', err);
      const errorMessage = getApiErrorMessage(null, err, 'Failed to update diamond detail');
      throw new Error(errorMessage);
    }
  }, [callApi]);

  // Delete diamond detail
  const deleteDiamondDetail = useCallback(async (id) => {
    try {
      const response = await callApi({
        url: `${API_ROUTES.PURCHASE.DIAMOND_DETAILS.DELETE}${id}/`,
        method: 'DELETE',
      });

      if (response.success) {
        setRefreshTrigger(prev => prev + 1);
        return { success: true };
      }

      return { success: false };
    } catch (err) {
      console.error('Error deleting diamond detail:', err);
      const errorMessage = getApiErrorMessage(null, err, 'Failed to delete diamond detail');
      throw new Error(errorMessage);
    }
  }, [callApi]);

  return {
    data,
    loading,
    error,
    refreshTrigger,
    fetchDiamondDetails,
    createDiamondDetail,
    updateDiamondDetail,
    deleteDiamondDetail,
  };
};
