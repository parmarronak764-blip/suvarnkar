import { useState, useCallback } from 'react';
import { useApi } from './useApi';
import { API_ROUTES } from 'src/utils/apiRoute';
import { useSelector } from 'react-redux';
import { getApiErrorMessage } from 'src/utils/error-handler';

// ----------------------------------------------------------------------

export const usePurchaseLessWeightDetails = () => {
  const { callApi, loading, error } = useApi();
  const [data, setData] = useState([]);
  const selectedCompany = useSelector((state) => state.user.selectedCompany);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Get company_id from selectedCompany
  const getCompanyId = useCallback(() => {
    const companyId = selectedCompany?.company?.id || selectedCompany?.id;
    return companyId;
  }, [selectedCompany]);

  // Fetch less weight details for purchase
  const fetchLessWeightDetails = useCallback(async (filters = {}) => {
    try {
      const companyId = getCompanyId();
      if (!companyId) {
        console.warn('No company ID available for fetching less weight details');
        return [];
      }

      const response = await callApi({
        url: API_ROUTES.PURCHASE.LESS_WEIGHT_DETAILS.LIST,
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
      console.error('Error fetching less weight details:', err);
      const errorMessage = getApiErrorMessage(null, err, 'Failed to fetch less weight details');
      throw new Error(errorMessage);
    }
  }, [callApi, getCompanyId]);

  // Create less weight detail
  const createLessWeightDetail = useCallback(async (lessWeightData) => {
    try {
      const companyId = getCompanyId();
      if (!companyId) {
        throw new Error('No company ID available');
      }

      const response = await callApi({
        url: API_ROUTES.PURCHASE.LESS_WEIGHT_DETAILS.CREATE,
        method: 'POST',
        body: {
          ...lessWeightData,
          company_id: companyId,
        },
      });

      if (response.success) {
        setRefreshTrigger(prev => prev + 1);
        return { success: true, data: response };
      }

      return { success: false };
    } catch (err) {
      console.error('Error creating less weight detail:', err);
      const errorMessage = getApiErrorMessage(null, err, 'Failed to create less weight detail');
      throw new Error(errorMessage);
    }
  }, [callApi, getCompanyId]);

  // Update less weight detail
  const updateLessWeightDetail = useCallback(async (id, lessWeightData) => {
    try {
      const response = await callApi({
        url: `${API_ROUTES.PURCHASE.LESS_WEIGHT_DETAILS.UPDATE}${id}/`,
        method: 'PATCH',
        body: lessWeightData,
      });

      if (response.success) {
        setRefreshTrigger(prev => prev + 1);
        return { success: true, data: response };
      }

      return { success: false };
    } catch (err) {
      console.error('Error updating less weight detail:', err);
      const errorMessage = getApiErrorMessage(null, err, 'Failed to update less weight detail');
      throw new Error(errorMessage);
    }
  }, [callApi]);

  // Delete less weight detail
  const deleteLessWeightDetail = useCallback(async (id) => {
    try {
      const response = await callApi({
        url: `${API_ROUTES.PURCHASE.LESS_WEIGHT_DETAILS.DELETE}${id}/`,
        method: 'DELETE',
      });

      if (response.success) {
        setRefreshTrigger(prev => prev + 1);
        return { success: true };
      }

      return { success: false };
    } catch (err) {
      console.error('Error deleting less weight detail:', err);
      const errorMessage = getApiErrorMessage(null, err, 'Failed to delete less weight detail');
      throw new Error(errorMessage);
    }
  }, [callApi]);

  return {
    data,
    loading,
    error,
    refreshTrigger,
    fetchLessWeightDetails,
    createLessWeightDetail,
    updateLessWeightDetail,
    deleteLessWeightDetail,
  };
};
