import { useState, useCallback } from 'react';
import { API_ROUTES } from 'src/utils/apiRoute';
import { useSelector } from 'react-redux';
import { getApiErrorMessage } from 'src/utils/error-handler';
import { useApi } from './useApi';

export const usePurchaseBarcodeTag = () => {
  const { callApi, loading, error } = useApi();
  const [stockTypes, setStockTypes] = useState([]);
  const [data, setData] = useState([]);
  const [datum, setDatum] = useState(null);
  const [mediaFiles, setMediaFiles] = useState(null);
  const [summary, setSummary] = useState(null);
  const [itemCodes, setItemCodes] = useState([]);
  const [savedFiles, setSavedFiles] = useState({
    image: [],
    video: [],
  });
  const [uploadingFile, setUploadingFile] = useState({
    image: false,
    video: false,
  });
  const selectedCompany = useSelector((state) => state.user.selectedCompany);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Get company_id from selectedCompany
  const getCompanyId = useCallback(
    () => selectedCompany?.company?.id || selectedCompany?.id,
    [selectedCompany]
  );

  // Fetch list of barcode locations
  const fetchItems = useCallback(
    async (
      filters = {
        page: 1,
        page_size: 10,
        search: null,
        product_type: 0,
        stock_type: 0,
        metal_category: 0,
        dealer: 0,
      }
    ) => {
      try {
        const filteredQueryParams = Object.keys(filters)
          .filter((key) => {
            const value = filters[key];
            return value !== null && value !== undefined && value !== '' && value !== 0;
          })
          .reduce((acc, key) => {
            acc[key] = filters[key];
            return acc;
          }, {});
        const companyId = getCompanyId();
        if (!companyId) {
          console.warn('No company ID available for fetching barcode locations');
          return [];
        }

        const queryParams = {
          company_id: companyId,
          ...filteredQueryParams,
        };

        const response = await callApi({
          url: API_ROUTES.PURCHASE_BARCODE_ITEMS.LIST,
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
          setSummary(response.summary || null);
          return {
            items,
            total: response.count || items.length,
            hasNext: !!response.next,
            hasPrevious: !!response.previous,
            summary,
          };
        }
        return { items: [], total: 0, hasNext: false, hasPrevious: false, summary: null };
      } catch (err) {
        console.error('Failed to fetch barcode locations:', err);
        const errorMessage = getApiErrorMessage(null, err, 'Failed to fetch barcode locations');
        throw new Error(errorMessage);
      }
    },
    [callApi, getCompanyId]
  );

  const fetchItem = useCallback(
    async (id) => {
      try {
        const companyId = getCompanyId();
        if (!companyId) {
          console.warn('No company ID available for fetching barcode locations');
          return [];
        }

        const response = await callApi({
          url: API_ROUTES.PURCHASE_BARCODE_ITEMS.GET_ITEM(id),
          method: 'GET',
          query: { company_id: companyId },
        });

        if (response.success) {
          setDatum(response);
        }
        return response;
      } catch (err) {
        const errorMessage = getApiErrorMessage(null, err, 'Failed to fetch barcode locations');
        throw new Error(errorMessage);
      }
    },
    [callApi, getCompanyId]
  );

  const fetchMedia = useCallback(
    async (id) => {
      try {
        const companyId = getCompanyId();
        if (!companyId) {
          console.warn('No company ID available for fetching barcode locations');
          return [];
        }

        const response = await callApi({
          url: API_ROUTES.PURCHASE_BARCODE_ITEMS.GET_MEDIA(id),
          method: 'GET',
          query: { company_id: companyId },
        });

        if (response.success) {
          setMediaFiles(response.results);
        }
        return response;
      } catch (err) {
        const errorMessage = getApiErrorMessage(null, err, 'Failed to fetch barcode locations');
        throw new Error(errorMessage);
      }
    },
    [callApi, getCompanyId]
  );

  // Delete Barcode Item
  const deleteItem = useCallback(
    async (barcode_id) => {
      try {
        const companyId = getCompanyId();
        if (!companyId) {
          throw new Error('Company ID is required to get next codes');
        }
        const response = await callApi({
          url: API_ROUTES.PURCHASE_BARCODE_ITEMS.DELETE_ITEM(barcode_id),
          method: 'DELETE',
          body: { company_id: companyId },
        });
        if (response.success) {
          setData((prevData) => prevData.filter((item) => item.id !== barcode_id));
        }
        return response;
      } catch (err) {
        console.error('Error deleting user:', err);
        throw err;
      }
    },
    [callApi, getCompanyId]
  );

  // Delete multiple items
  const deleteItems = useCallback(
    async (ids) => {
      try {
        if (!Array.isArray(ids)) return { success: false };
        const companyId = getCompanyId();
        if (!companyId) {
          throw new Error('Company ID is required to get next codes');
        }
        const deletePromises = ids.map((barcode_id) =>
          callApi({
            url: API_ROUTES.PURCHASE_BARCODE_ITEMS.DELETE_ITEM(barcode_id),
            method: 'DELETE',
            body: { company_id: getCompanyId() },
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
        console.error(`Failed to delete items:`, err);
        return { success: false, message: err.message };
      }
    },
    [callApi, getCompanyId]
  );

  // Get next available box codes
  const getNextCode = useCallback(async () => {
    try {
      const companyId = getCompanyId();
      if (!companyId) {
        throw new Error('Company ID is required to get next codes');
      }

      const response = await callApi({
        url: API_ROUTES.PURCHASE_BARCODE_ITEMS.NEXT_CODE,
        method: 'POST',
        body: {
          company_id: companyId,
        },
      });

      if (response.success) {
        return {
          success: true,
          codes: response.next_code,
        };
      }
      return response;
    } catch (err) {
      const errorMessage = getApiErrorMessage(null, err, 'Failed to generate codes');
      return { success: false, message: errorMessage };
    }
  }, [callApi, getCompanyId]);

  // Fetch list of stock types
  const fetchStockTypes = useCallback(
    async (query = '') => {
      try {
        const response = await callApi({
          url: API_ROUTES.STOCK_TYPES.LIST,
          method: 'GET',
          query: { search: query }, // Use search parameter as shown in API
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
          setStockTypes(items);
        }
      } catch (err) {
        console.error('Failed to fetch stock types:', err);
      }
    },
    [callApi]
  );

  // Upload file
  const uploadFile = useCallback(
    async (file, media_type) => {
      // media_type = 'image' | 'video'
      // file will be single always
      try {
        setUploadingFile((pre) => ({ ...pre, [media_type]: true }));
        const response = await callApi({
          url: API_ROUTES.PURCHASE_BARCODE_ITEMS.UPLOADS,
          method: 'POST',
          body: {
            file,
            media_type,
          },
          query: {},
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          isFormData: true,
        });
        if (response.success) {
          setSavedFiles((pre) => {
            if (response.media_type === 'image') {
              return { ...pre, image: [...pre.image, response] };
            }
            if (response.media_type === 'video') {
              return { ...pre, video: [...pre.video, response] };
            }
            return pre;
          });
          return response;
        }
        return response;
      } catch (err) {
        console.error('Failed to upload file:', err);
        const errorMessage = getApiErrorMessage(null, err, 'Failed to upload file');
        return { success: false, message: errorMessage };
      } finally {
        setUploadingFile((pre) => ({ ...pre, [media_type]: false }));
      }
    },
    [callApi]
  );

  const createRecord = useCallback(
    async (payloadData) => {
      try {
        const companyId = getCompanyId();
        if (!companyId) {
          throw new Error('Company ID is required to get next codes');
        }
        const body = { ...payloadData, company: getCompanyId() };
        const response = await callApi({
          url: API_ROUTES.PURCHASE_BARCODE_ITEMS.CREATE,
          method: 'POST',
          body: body,
        });

        if (response.success) {
          return response;
        }
        return response;
      } catch (err) {
        console.error('Failed to create record:', err);
        const errorMessage = getApiErrorMessage(err, err, 'Failed to create record');
        return { success: false, message: errorMessage };
      }
    },
    [callApi, getCompanyId]
  );

  const createRecordWithVariants = useCallback(
    async (payloadData) => {
      try {
        const companyId = getCompanyId();
        if (!companyId) {
          throw new Error('Company ID is required to get next codes');
        }
        const body = { ...payloadData, company: getCompanyId() };
        const response = await callApi({
          url: API_ROUTES.PURCHASE_BARCODE_ITEMS.CREATE_WITH_VARIANTS,
          method: 'POST',
          body: body,
        });

        if (response.success) {
          return response;
        }
        return response;
      } catch (err) {
        console.error('Failed to create record:', err);
        const errorMessage = getApiErrorMessage(err, err, 'Failed to create record');
        return { success: false, message: errorMessage };
      }
    },
    [callApi, getCompanyId]
  );

  const updateRecord = useCallback(
    async (id, payloadData) => {
      try {
        const companyId = getCompanyId();
        if (!companyId) {
          throw new Error('Company ID is required to get next codes');
        }
        const body = { ...payloadData, company_id: companyId };
        const response = await callApi({
          url: API_ROUTES.PURCHASE_BARCODE_ITEMS.UPDATE_ITEM(id),
          method: 'PUT',
          body: { ...body, id: Number(id) },
          isFormData: false,
        });

        if (response.success) {
          return response;
        }
        return response;
      } catch (err) {
        console.error('Failed to update record:', err);
        const errorMessage = getApiErrorMessage(err, err, 'Failed to create record');
        return { success: false, message: errorMessage };
      }
    },
    [callApi, getCompanyId]
  );

  //  Fetch ALL iteM codes // Get next available box codes
  const fetchAllItemCodes = useCallback(
    async (search = '') => {
      try {
        const companyId = getCompanyId();
        if (!companyId) {
          throw new Error('Company ID is required to get next codes');
        }

        const response = await callApi({
          url: API_ROUTES.PURCHASE_BARCODE_ITEMS.GET_ALL_ITEM_CODES,
          method: 'GET',
          query: {
            company_id: companyId,
            search,
          },
        });

        if (response.success) {
          setItemCodes(response.results || []);
        }
        return response;
      } catch (err) {
        const errorMessage = getApiErrorMessage(null, err, 'Failed to generate codes');
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
    summary,
    datum,
    mediaFiles,
    stockTypes,
    loading,
    error,
    refreshTrigger,
    savedFiles,
    uploadingFile,
    itemCodes,

    // Actions
    fetchItems,
    fetchItem,
    fetchMedia,
    deleteItem,
    deleteItems,
    getNextCode,
    refresh,
    fetchStockTypes,
    uploadFile,
    createRecord,
    createRecordWithVariants,
    updateRecord,
    fetchAllItemCodes,
  };
};
