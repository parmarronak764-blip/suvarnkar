import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useApi } from './useApi';
import { API_ROUTES } from 'src/utils/apiRoute';

export const useGemstone = () => {
  const { callApi, loading, error } = useApi();
  const selectedCompany = useSelector((state) => state.user.selectedCompany);

  const [data, setData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  // Get company ID from selected company
  const getCompanyId = useCallback(
    () => selectedCompany?.company?.id || selectedCompany?.id,
    [selectedCompany]
  );

  // Gemstone Packets API
  const fetchPackets = useCallback(
    async (page = 1, pageSize = 25, filters = {}) => {
      try {
        const response = await callApi({
          url: API_ROUTES.GEMSTONES.PACKETS.LIST,
          method: 'GET',
          query: {
            page,
            page_size: pageSize,
            company_id: getCompanyId(),
            ...filters,
          },
        });

        console.log('useGemstone fetchPackets response:', response); // Debug log

        if (response) {
          let items = [];
          let total = 0;
          let paginationData = {};

          if (response.success === false) {
            return { success: false, message: response.message || 'Failed to fetch packets' };
          }

          if (response.data) {
            if (Array.isArray(response.data)) {
              items = response.data;
            } else if (response.data.results) {
              items = response.data.results;
              total = response.data.count || 0;
            }
          } else if (response.results) {
            items = response.results;
            total = response.count || 0;
          } else if (Array.isArray(response)) {
            items = response;
          }

          if (response.pagination) {
            paginationData = response.pagination;
            total = paginationData.total || paginationData.count || total;
          } else if (response.data?.pagination) {
            paginationData = response.data.pagination;
            total = paginationData.total || paginationData.count || total;
          }

          setData(items);
          setTotalCount(total);

          return {
            success: true,
            data: items,
            pagination: { ...paginationData, total, count: total },
          };
        }

        return { success: false, message: 'Failed to fetch packets' };
      } catch (err) {
        console.error('Error fetching packets:', err);
        return { success: false, message: err.message || 'Failed to fetch packets' };
      }
    },
    [callApi, getCompanyId]
  );

  const createPacket = useCallback(
    async (packetData) => {
      try {
        const response = await callApi({
          url: API_ROUTES.GEMSTONES.PACKETS.CREATE,
          method: 'POST',
          body: {
            ...packetData,
            company_id: getCompanyId(),
          },
        });

        if (response?.success) {
          return { success: true, data: response.data };
        }

        return { success: false, message: response?.message || 'Failed to create packet' };
      } catch (err) {
        console.error('Error creating packet:', err);
        return { success: false, message: err.message || 'Failed to create packet' };
      }
    },
    [callApi, getCompanyId]
  );

  const createBulkPackets = useCallback(
    async (packetsData) => {
      try {
        const response = await callApi({
          url: API_ROUTES.GEMSTONES.PACKETS.BULK_CREATE,
          method: 'POST',
          body: {
            company_id: getCompanyId(),
            packets: packetsData,
          },
        });

        if (response?.success) {
          return { success: true, data: response.data };
        }

        return { success: false, message: response?.message || 'Failed to create packets' };
      } catch (err) {
        console.error('Error creating bulk packets:', err);
        return { success: false, message: err.message || 'Failed to create packets' };
      }
    },
    [callApi, getCompanyId]
  );

  const getPacket = useCallback(
    async (id) => {
      try {
        const response = await callApi({
          url: `${API_ROUTES.GEMSTONES.PACKETS.LIST}${id}/`,
          method: 'GET',
          query: { company_id: getCompanyId() },
        });

        if (response?.success) {
          return { success: true, data: response.data };
        }

        return { success: false, message: response?.message || 'Failed to fetch packet' };
      } catch (err) {
        console.error('Error fetching packet:', err);
        return { success: false, message: err.message || 'Failed to fetch packet' };
      }
    },
    [callApi, getCompanyId]
  );

  const updatePacket = useCallback(
    async (id, packetData) => {
      try {
        const response = await callApi({
          url: `${API_ROUTES.GEMSTONES.PACKETS.UPDATE}${id}/`,
          method: 'PATCH',
          body: {
            ...packetData,
            company_id: getCompanyId(),
          },
        });

        if (response?.success) {
          return { success: true, data: response.data };
        }

        return { success: false, message: response?.message || 'Failed to update packet' };
      } catch (err) {
        console.error('Error updating packet:', err);
        return { success: false, message: err.message || 'Failed to update packet' };
      }
    },
    [callApi, getCompanyId]
  );

  const deletePacket = useCallback(
    async (id) => {
      try {
        const response = await callApi({
          url: `${API_ROUTES.GEMSTONES.PACKETS.DELETE}${id}/`,
          method: 'DELETE',
          query: { company_id: getCompanyId() },
        });

        if (response?.success) {
          return { success: true };
        }

        return { success: false, message: response?.message || 'Failed to delete packet' };
      } catch (err) {
        console.error('Error deleting packet:', err);
        return { success: false, message: err.message || 'Failed to delete packet' };
      }
    },
    [callApi, getCompanyId]
  );

  // Gemstone Rates API
  const fetchRates = useCallback(
    async (page = 1, pageSize = 25, filters = {}) => {
      try {
        const response = await callApi({
          url: API_ROUTES.GEMSTONES.RATES.LIST,
          method: 'GET',
          query: {
            page,
            page_size: pageSize,
            company_id: getCompanyId(),
            ...filters,
          },
        });

        if (response) {
          let items = [];
          let total = 0;
          let paginationData = {};

          if (response.success === false) {
            return { success: false, message: response.message || 'Failed to fetch rates' };
          }

          if (response.data) {
            if (Array.isArray(response.data)) {
              items = response.data;
            } else if (response.data.results) {
              items = response.data.results;
              total = response.data.count || 0;
            }
          } else if (response.results) {
            items = response.results;
            total = response.count || 0;
          } else if (Array.isArray(response)) {
            items = response;
          }

          if (response.pagination) {
            paginationData = response.pagination;
            total = paginationData.total || paginationData.count || total;
          } else if (response.data?.pagination) {
            paginationData = response.data.pagination;
            total = paginationData.total || paginationData.count || total;
          }

          setData(items);
          setTotalCount(total);

          return {
            success: true,
            data: items,
            pagination: { ...paginationData, total, count: total },
          };
        }

        return { success: false, message: 'Failed to fetch rates' };
      } catch (err) {
        console.error('Error fetching rates:', err);
        return { success: false, message: err.message || 'Failed to fetch rates' };
      }
    },
    [callApi, getCompanyId]
  );

  const createRate = useCallback(
    async (rateData) => {
      try {
        const response = await callApi({
          url: API_ROUTES.GEMSTONES.RATES.CREATE,
          method: 'POST',
          body: {
            ...rateData,
            company_id: getCompanyId(),
          },
        });

        if (response?.success) {
          return { success: true, data: response.data };
        }

        return { success: false, message: response?.message || 'Failed to create rate' };
      } catch (err) {
        console.error('Error creating rate:', err);
        return { success: false, message: err.message || 'Failed to create rate' };
      }
    },
    [callApi, getCompanyId]
  );

  const createBulkRates = useCallback(
    async (ratesData) => {
      try {
        const response = await callApi({
          url: API_ROUTES.GEMSTONES.RATES.BULK_CREATE,
          method: 'POST',
          body: {
            company_id: getCompanyId(),
            rates: ratesData,
          },
        });

        if (response?.success) {
          return { success: true, data: response.data };
        }

        return { success: false, message: response?.message || 'Failed to create rates' };
      } catch (err) {
        console.error('Error creating bulk rates:', err);
        return { success: false, message: err.message || 'Failed to create rates' };
      }
    },
    [callApi, getCompanyId]
  );

  const updateRate = useCallback(
    async (id, rateData) => {
      try {
        const response = await callApi({
          url: `${API_ROUTES.GEMSTONES.RATES.UPDATE}${id}/`,
          method: 'PATCH',
          body: {
            ...rateData,
            company_id: getCompanyId(),
          },
        });

        if (response?.success) {
          return { success: true, data: response.data };
        }

        return { success: false, message: response?.message || 'Failed to update rate' };
      } catch (err) {
        console.error('Error updating rate:', err);
        return { success: false, message: err.message || 'Failed to update rate' };
      }
    },
    [callApi, getCompanyId]
  );

  const deleteRate = useCallback(
    async (id) => {
      try {
        const response = await callApi({
          url: `${API_ROUTES.GEMSTONES.RATES.DELETE}${id}/`,
          method: 'DELETE',
          query: { company_id: getCompanyId() },
        });

        if (response?.success) {
          return { success: true };
        }

        return { success: false, message: response?.message || 'Failed to delete rate' };
      } catch (err) {
        console.error('Error deleting rate:', err);
        return { success: false, message: err.message || 'Failed to delete rate' };
      }
    },
    [callApi, getCompanyId]
  );

  // Gemstone Shapes API
  const fetchShapes = useCallback(
    async (page = 1, pageSize = 25, filters = {}) => {
      try {
        const query = {
          company_id: getCompanyId(),
          ...filters,
        };
        if (filters?.pagination !== false) {
          query.page = page;
          query.page_size = pageSize;
        }

        const response = await callApi({
          url: API_ROUTES.GEMSTONES.SHAPES.LIST,
          method: 'GET',
          query,
        });

        if (response) {
          let items = [];
          let total = 0;
          let paginationData = {};

          // Check if response has success field
          if (response.success === false) {
            return { success: false, message: response.message || 'Failed to fetch shapes' };
          }

          // Handle response.data structure
          if (response.data) {
            if (Array.isArray(response.data)) {
              items = response.data;
            } else if (response.data.results) {
              items = response.data.results;
              total = response.data.count || 0;
            }
          }
          // Handle response.results structure (direct results)
          else if (response.results) {
            items = response.results;
            total = response.count || 0;
          }
          // Handle direct array response
          else if (Array.isArray(response)) {
            items = response;
          }

          // Extract pagination info
          if (response.pagination) {
            paginationData = response.pagination;
            total = paginationData.total || paginationData.count || total;
          } else if (response.data?.pagination) {
            paginationData = response.data.pagination;
            total = paginationData.total || paginationData.count || total;
          }

          setData(items);
          setTotalCount(total);

          return {
            success: true,
            data: items,
            pagination: { ...paginationData, total, count: total },
          };
        }

        return { success: false, message: 'Failed to fetch shapes' };
      } catch (err) {
        console.error('Error fetching shapes:', err);
        return { success: false, message: err.message || 'Failed to fetch shapes' };
      }
    },
    [callApi, getCompanyId]
  );

  const createShape = useCallback(
    async (shapeData) => {
      try {
        const response = await callApi({
          url: API_ROUTES.GEMSTONES.SHAPES.CREATE,
          method: 'POST',
          body: {
            ...shapeData,
            company_id: getCompanyId(),
          },
        });

        if (response?.success) {
          return { success: true, data: response.data };
        }

        return { success: false, message: response?.message || 'Failed to create shape' };
      } catch (err) {
        console.error('Error creating shape:', err);
        return { success: false, message: err.message || 'Failed to create shape' };
      }
    },
    [callApi, getCompanyId]
  );

  const createBulkShapes = useCallback(
    async (shapesData) => {
      try {
        const response = await callApi({
          url: API_ROUTES.GEMSTONES.SHAPES.BULK_CREATE,
          method: 'POST',
          body: {
            company_id: getCompanyId(),
            shapes: shapesData,
          },
        });

        if (response?.success) {
          return { success: true, data: response.data };
        }

        return { success: false, message: response?.message || 'Failed to create shapes' };
      } catch (err) {
        console.error('Error creating bulk shapes:', err);
        return { success: false, message: err.message || 'Failed to create shapes' };
      }
    },
    [callApi, getCompanyId]
  );

  const getShape = useCallback(
    async (id) => {
      try {
        const response = await callApi({
          url: `${API_ROUTES.GEMSTONES.SHAPES.LIST}${id}/`,
          method: 'GET',
          query: { company_id: getCompanyId() },
        });

        if (response?.success) {
          return { success: true, data: response.data };
        }

        return { success: false, message: response?.message || 'Failed to fetch shape' };
      } catch (err) {
        console.error('Error fetching shape:', err);
        return { success: false, message: err.message || 'Failed to fetch shape' };
      }
    },
    [callApi, getCompanyId]
  );

  const updateShape = useCallback(
    async (id, shapeData) => {
      try {
        const response = await callApi({
          url: `${API_ROUTES.GEMSTONES.SHAPES.UPDATE}${id}/`,
          method: 'PATCH',
          body: {
            ...shapeData,
            company_id: getCompanyId(),
          },
        });

        if (response?.success) {
          return { success: true, data: response.data };
        }

        return { success: false, message: response?.message || 'Failed to update shape' };
      } catch (err) {
        console.error('Error updating shape:', err);
        return { success: false, message: err.message || 'Failed to update shape' };
      }
    },
    [callApi, getCompanyId]
  );

  const deleteShape = useCallback(
    async (id) => {
      try {
        const response = await callApi({
          url: `${API_ROUTES.GEMSTONES.SHAPES.DELETE}${id}/`,
          method: 'DELETE',
          query: { company_id: getCompanyId() },
        });

        if (response?.success) {
          return { success: true };
        }

        return { success: false, message: response?.message || 'Failed to delete shape' };
      } catch (err) {
        console.error('Error deleting shape:', err);
        return { success: false, message: err.message || 'Failed to delete shape' };
      }
    },
    [callApi, getCompanyId]
  );

  // Gemstone Sub Types API
  const fetchSubTypes = useCallback(
    async (page = 1, pageSize = 25, filters = {}) => {
      try {
        const query = {
          company_id: getCompanyId(),
          ...filters,
        };
        // If carat (main type ID) is provided, add it to query
        if (filters?.carat) {
          query.carat = filters.carat;
        }
        if (filters?.pagination !== false) {
          query.page = page;
          query.page_size = pageSize;
        }

        const response = await callApi({
          url: API_ROUTES.GEMSTONES.SUB_TYPES.LIST,
          method: 'GET',
          query,
        });

        if (response) {
          let items = [];
          let total = 0;
          let paginationData = {};

          if (response.success === false) {
            return { success: false, message: response.message || 'Failed to fetch sub types' };
          }
          if (response.data) {
            if (Array.isArray(response.data)) {
              items = response.data;
            } else if (response.data.results) {
              items = response.data.results;
              total = response.data.count || 0;
            }
          } else if (response.results) {
            items = response.results;
            total = response.count || 0;
          } else if (Array.isArray(response)) {
            items = response;
          }

          if (response.pagination) {
            paginationData = response.pagination;
            total = paginationData.total || paginationData.count || total;
          } else if (response.data?.pagination) {
            paginationData = response.data.pagination;
            total = paginationData.total || paginationData.count || total;
          }

          setData(items);
          setTotalCount(total);

          return {
            success: true,
            data: items,
            pagination: { ...paginationData, total, count: total },
          };
        }

        return { success: false, message: 'Failed to fetch sub types' };
      } catch (err) {
        console.error('Error fetching sub types:', err);
        return { success: false, message: err.message || 'Failed to fetch sub types' };
      }
    },
    [callApi, getCompanyId]
  );

  const createSubType = useCallback(
    async (subTypeData) => {
      try {
        const response = await callApi({
          url: API_ROUTES.GEMSTONES.SUB_TYPES.CREATE,
          method: 'POST',
          body: {
            ...subTypeData,
            company_id: getCompanyId(),
          },
        });

        if (response?.success) {
          return { success: true, data: response.data };
        }

        return { success: false, message: response?.message || 'Failed to create sub type' };
      } catch (err) {
        console.error('Error creating sub type:', err);
        return { success: false, message: err.message || 'Failed to create sub type' };
      }
    },
    [callApi, getCompanyId]
  );

  const createBulkSubTypes = useCallback(
    async (subTypesData) => {
      try {
        const response = await callApi({
          url: API_ROUTES.GEMSTONES.SUB_TYPES.BULK_CREATE,
          method: 'POST',
          body: {
            company_id: getCompanyId(),
            sub_types: subTypesData,
          },
        });

        if (response?.success) {
          return { success: true, data: response.data };
        }

        return { success: false, message: response?.message || 'Failed to create sub types' };
      } catch (err) {
        console.error('Error creating bulk sub types:', err);
        return { success: false, message: err.message || 'Failed to create sub types' };
      }
    },
    [callApi, getCompanyId]
  );

  const getSubType = useCallback(
    async (id) => {
      try {
        const response = await callApi({
          url: `${API_ROUTES.GEMSTONES.SUB_TYPES.LIST}${id}/`,
          method: 'GET',
          query: { company_id: getCompanyId() },
        });

        if (response?.success) {
          return { success: true, data: response.data };
        }

        return { success: false, message: response?.message || 'Failed to fetch sub type' };
      } catch (err) {
        console.error('Error fetching sub type:', err);
        return { success: false, message: err.message || 'Failed to fetch sub type' };
      }
    },
    [callApi, getCompanyId]
  );

  const updateSubType = useCallback(
    async (id, subTypeData) => {
      try {
        const response = await callApi({
          url: `${API_ROUTES.GEMSTONES.SUB_TYPES.UPDATE}${id}/`,
          method: 'PATCH',
          body: {
            ...subTypeData,
            company_id: getCompanyId(),
          },
        });

        if (response?.success) {
          return { success: true, data: response.data };
        }

        return { success: false, message: response?.message || 'Failed to update sub type' };
      } catch (err) {
        console.error('Error updating sub type:', err);
        return { success: false, message: err.message || 'Failed to update sub type' };
      }
    },
    [callApi, getCompanyId]
  );

  const deleteSubType = useCallback(
    async (id) => {
      try {
        const response = await callApi({
          url: `${API_ROUTES.GEMSTONES.SUB_TYPES.DELETE}${id}/`,
          method: 'DELETE',
          query: { company_id: getCompanyId() },
        });

        if (response?.success) {
          return { success: true };
        }

        return { success: false, message: response?.message || 'Failed to delete sub type' };
      } catch (err) {
        console.error('Error deleting sub type:', err);
        return { success: false, message: err.message || 'Failed to delete sub type' };
      }
    },
    [callApi, getCompanyId]
  );

  // Carats API for Gemstone: fetch metal types, find GemStone, then fetch its carats
  const fetchCarats = useCallback(
    async (filters = {}) => {
      try {
        const companyId = getCompanyId();

        // Fetch metal types
        const metalTypesResponse = await callApi({
          url: API_ROUTES.DIAMOND_DETAILS.METAL_TYPES.LIST,
          method: 'GET',
          query: {
            company_id: companyId,
            pagination: false,
          },
        });

        if (!metalTypesResponse || metalTypesResponse.success === false) {
          return {
            success: false,
            message: metalTypesResponse?.message || 'Failed to fetch metal types',
          };
        }

        // Normalize metal types list
        let metalTypes = [];
        if (Array.isArray(metalTypesResponse)) {
          metalTypes = metalTypesResponse;
        } else if (Array.isArray(metalTypesResponse.data)) {
          metalTypes = metalTypesResponse.data;
        } else if (Array.isArray(metalTypesResponse.results)) {
          metalTypes = metalTypesResponse.results;
        } else if (metalTypesResponse.data && typeof metalTypesResponse.data === 'object') {
          metalTypes = Object.values(metalTypesResponse.data);
        } else {
          const numericKeys = Object.keys(metalTypesResponse).filter(
            (k) => !isNaN(parseInt(k, 10))
          );
          if (numericKeys.length > 0) {
            metalTypes = numericKeys.map((k) => metalTypesResponse[k]);
          }
        }

        // Find GemStone metal type (by name or code, case-insensitive)
        const gemMetal = metalTypes.find((m) => {
          const name = (m?.name || '').toString().toLowerCase();
          const code = (m?.code || '').toString().toLowerCase();
          return (
            name === 'gemstone' ||
            name === 'gem stone' ||
            code === 'gemstone' ||
            code === 'gem_stone'
          );
        });

        if (!gemMetal?.id) {
          return { success: true, data: [] };
        }

        // Fetch carats for the GemStone metal type
        const caratsUrl = `${API_ROUTES.DIAMOND_DETAILS.METAL_TYPES.LIST}/${gemMetal.id}/carats/`;
        const caratsResponse = await callApi({
          url: caratsUrl,
          method: 'GET',
          query: {
            company_id: companyId,
            pagination: false,
            ...filters,
          },
        });

        if (!caratsResponse || caratsResponse.success === false) {
          return {
            success: false,
            message: caratsResponse?.message || 'Failed to fetch carats',
          };
        }

        // Normalize carats list (keep it minimal: prefer carats array)
        let items = [];
        if (Array.isArray(caratsResponse[0]?.carats)) {
          items = caratsResponse[0]?.carats;
        }

        return {
          success: true,
          data: items,
        };
      } catch (err) {
        console.error('Error fetching carats:', err);
        return { success: false, message: err.message || 'Failed to fetch carats' };
      }
    },
    [callApi, getCompanyId]
  );

  // Gemstone Main Types (Carats) API
  const fetchGemstoneMainTypes = useCallback(
    async (filters = {}) => {
      try {
        const companyId = getCompanyId();
        const query = {
          company_id: companyId,
          pagination: false,
          ...filters,
        };

        const response = await callApi({
          url: API_ROUTES.GEMSTONES.CARATS.LIST,
          method: 'GET',
          query,
        });

        if (!response || response.success === false) {
          return {
            success: false,
            message: response?.message || 'Failed to fetch gemstone main types',
          };
        }

        // Normalize response data
        // Handle object with numeric keys format: { "0": {...}, "1": {...}, "success": true }
        let items = [];
        if (Array.isArray(response)) {
          items = response;
        } else if (Array.isArray(response.data)) {
          items = response.data;
        } else if (Array.isArray(response.results)) {
          items = response.results;
        } else if (response.data && typeof response.data === 'object') {
          items = Object.values(response.data);
        } else if (typeof response === 'object' && response.success === true) {
          // Handle object with numeric string keys
          items = Object.keys(response)
            .filter((key) => key !== 'success' && !isNaN(parseInt(key, 10)))
            .map((key) => response[key])
            .filter((item) => item && typeof item === 'object' && item.id);
        }

        return {
          success: true,
          data: items,
        };
      } catch (err) {
        console.error('Error fetching gemstone main types:', err);
        return { success: false, message: err.message || 'Failed to fetch gemstone main types' };
      }
    },
    [callApi, getCompanyId]
  );

  // APIs to fetch main types of Gemstones and their carats
  const fetchGemstonesCarats = useCallback(
    async (filters = {}) => {
      try {
        const { search } = filters;
        const response = await callApi({
          url: API_ROUTES.GEMSTONES.CARATS.LIST,
          method: 'GET',
          query: {
            search,
          },
        });

        const gemstoneArray = Object.values(response).filter(
          (item) => typeof item === 'object' && !Array.isArray(item)
        );
        return { success: true, data: gemstoneArray };
      } catch (err) {
        console.error('Error fetching carats:', err);
        return { success: false, message: err.message || 'Failed to fetch gemstone carats' };
      }
    },
    [callApi]
  );

  return {
    // State
    data,
    totalCount,
    loading,
    error,

    // Packets API
    fetchPackets,
    createPacket,
    createBulkPackets,
    getPacket,
    updatePacket,
    deletePacket,

    // Rates API
    fetchRates,
    createRate,
    createBulkRates,
    updateRate,
    deleteRate,

    // Shapes API
    fetchShapes,
    createShape,
    createBulkShapes,
    getShape,
    updateShape,
    deleteShape,

    // Sub Types API
    fetchSubTypes,
    createSubType,
    createBulkSubTypes,
    getSubType,
    updateSubType,
    deleteSubType,

    // Carats API
    fetchCarats,

    // Gemstone Main Types API
    fetchGemstoneMainTypes,
    fetchGemstonesCarats,
  };
};

export default useGemstone;
