import { useState, useCallback } from 'react';
import { useApi } from './useApi';
import { API_ROUTES } from 'src/utils/apiRoute';
import { useSelector } from 'react-redux';
import { usePurchaseDiamondDetails } from './usePurchaseDiamondDetails';
import { usePurchaseLessWeightDetails } from './usePurchaseLessWeightDetails';

export const usePurchases = () => {
  const { callApi, loading, error } = useApi();
  const [purchases, setPurchases] = useState([]);
  const selectedCompany = useSelector((state) => state.user.selectedCompany);

  // Initialize API hooks
  const diamondDetailsHook = usePurchaseDiamondDetails();
  const lessWeightDetailsHook = usePurchaseLessWeightDetails();

  // Get company_id from selectedCompany
  const getCompanyId = useCallback(() => {
    const companyId = selectedCompany?.company?.id || selectedCompany?.id;
    return companyId;
  }, [selectedCompany]);

  // Main purchase CRUD operations
  const getPurchases = useCallback(
    async (filters = {}) => {
      try {
        const companyId = getCompanyId();
        if (!companyId) {
          console.warn('No company ID available for fetching purchases');
          return { success: false, data: [], message: 'No company ID available' };
        }

        const response = await callApi({
          url: API_ROUTES.PURCHASE.PURCHASES.LIST,
          method: 'GET',
          query: {
            company_id: companyId,
            page: filters.page || 1,
            page_size: filters.page_size || 100,
            ...filters, // Include additional filters like search, status, category, dealer
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

          setPurchases(items);
          return {
            success: true,
            data: items,
            total: response.count || items.length,
          };
        }

        return { success: false, data: [], message: 'Failed to fetch purchases' };
      } catch (err) {
        console.error('Error:', err);
        console.error('Error fetching purchases:', err);
        return {
          success: false,
          data: [],
          message: 'Failed to fetch purchases',
          error: err.message,
        };
      }
    },
    [callApi, getCompanyId]
  );

  const getPurchaseById = useCallback(
    async (id) => {
      try {
        const companyId = getCompanyId();
        if (!companyId) {
          return {
            success: false,
            message: 'No company ID available',
            error: 'Company ID is required',
          };
        }

        const response = await callApi({
          url: API_ROUTES.PURCHASE.PURCHASES.GET_BY_ID(id),
          method: 'GET',
          query: {
            company_id: companyId,
          },
        });

        if (response.success) {
          return {
            success: true,
            data: response.data || response,
          };
        }

        return {
          success: false,
          message: 'Failed to fetch purchase details',
          error: 'Purchase not found',
        };
      } catch (err) {
        console.error('Error fetching purchase details:', err);
        return {
          success: false,
          message: 'Failed to fetch purchase details',
          error: err.message,
        };
      }
    },
    [callApi, getCompanyId]
  );

  const calculateTotal = (item) => {
    // Base amount calculation
    let total = 0;
    const weight = Number(item.pureWeight) || 0;
    const mrp = Number(item.purchaseMrp) || 0;
    const rate = Number(item.purchaseRate) || 0;
    const otherCharges = Number(item.otherCharges) || 0;
    const saleMrp = Number(item.saleMrp) || 0;

    if (rate && weight) {
      total = weight * rate;
    } else if (mrp && saleMrp) {
      total = (mrp + saleMrp) * weight; // Use MRP values if purchase rate not available
    }

    const purchase_making_charges = Number(item.labourRate) || Number(item.makingCharges) || 0;
    return String(total + otherCharges + purchase_making_charges);
  };

  const createPurchase = useCallback(
    async (purchaseData) => {
      try {
        const companyId = getCompanyId();
        if (!companyId) {
          throw new Error('No company ID available');
        }

        // Filter out platinum rows - they will be combined with their parent products
        const filledProducts = (purchaseData.products || []).filter(
          (product) => product.description && product.description.trim() && !product.isPlatinumRow
        );
        const roundOffAmount =
          purchaseData.payment?.roundOffAmount === '' || !purchaseData.payment?.roundOffAmount
            ? '0.000'
            : purchaseData.payment?.roundOffAmount || '0.000';

        // Helper function to find metal type from base metal types
        const findMetalTypeId = (baseMetalTypes, metalTypeCode) => {
          if (!baseMetalTypes || !Array.isArray(baseMetalTypes)) return null;
          const metalType = baseMetalTypes.find(
            (mt) =>
              mt.code === metalTypeCode ||
              mt.name?.toUpperCase() === metalTypeCode ||
              mt.code?.toUpperCase() === metalTypeCode
          );
          return metalType?.id || null;
        };

        // Transform the form data to match API schema
        const apiPayload = {
          company: companyId,
          dealer: purchaseData.generalDetails.dealerId,
          bill_metal_type: purchaseData.generalDetails.billMetalType,
          bill_date: purchaseData.generalDetails.billDate,
          bill_number: purchaseData.generalDetails.billNo,
          tag_selected: purchaseData.generalDetails.tagSelected,
          round_off_amount: String(roundOffAmount || '0.000'), // Top-level round off amount
          payment_mode: purchaseData.payment?.paymentMode ?? null,
          total_paid_amount: String(purchaseData.payment?.totalPaidAmount || '0'),
          note: purchaseData.payment?.note ?? null,
          pending_amount: String(Number(purchaseData.payment?.pendingAmount).toFixed(3) || '0'),
          total_purchase_amount: String(purchaseData.payment?.totalPurchaseAmount || '0'),
          purchase_items: filledProducts.map((product) => {
            console.log('Processing product for payload:', {
              productId: product.id,
              productDescription: product.description,
              allProducts: purchaseData.products?.map((p) => ({
                id: p.id,
                isPlatinumRow: p.isPlatinumRow,
                parentProductId: p.parentProductId,
              })),
            });

            // Find platinum row for this product
            // Try both number and string comparison for parentProductId
            const platinumRow = (purchaseData.products || []).find(
              (p) =>
                p.isPlatinumRow &&
                (p.parentProductId === product.id ||
                  String(p.parentProductId) === String(product.id) ||
                  Number(p.parentProductId) === Number(product.id))
            );

            console.log('Platinum row search result:', {
              productId: product.id,
              productIdType: typeof product.id,
              platinumRowFound: !!platinumRow,
              platinumRow: platinumRow
                ? {
                    id: platinumRow.id,
                    parentProductId: platinumRow.parentProductId,
                    parentProductIdType: typeof platinumRow.parentProductId,
                    netWeight: platinumRow.netWeight,
                  }
                : null,
            });

            // Get base metal types for this product
            const baseMetalTypes = product.baseMetalTypes || [];

            console.log('Product baseMetalTypes:', {
              productId: product.id,
              baseMetalTypes,
              baseMetalTypesLength: baseMetalTypes.length,
            });

            // Find metal types for gold and platinum from base metal types
            // Try to find GOLD first, then fallback to first base metal type or billMetalType
            let goldMetalTypeId = findMetalTypeId(baseMetalTypes, 'GOLD');
            if (!goldMetalTypeId && baseMetalTypes.length > 0) {
              // Use first base metal type if GOLD not found
              goldMetalTypeId =
                baseMetalTypes[0]?.id || purchaseData.generalDetails.billMetalType || 1;
            } else if (!goldMetalTypeId) {
              goldMetalTypeId = purchaseData.generalDetails.billMetalType || 1;
            }

            // Find PLATINUM metal type
            // Try multiple ways to find platinum metal type
            let platinumMetalTypeId =
              findMetalTypeId(baseMetalTypes, 'PLATINUM') ||
              findMetalTypeId(baseMetalTypes, 'PLAT') ||
              findMetalTypeId(baseMetalTypes, 'PLATINUM_AND_DIAMOND') ||
              null;

            // If not found, try direct search in baseMetalTypes array
            if (!platinumMetalTypeId && baseMetalTypes.length > 0) {
              const platinumMetal = baseMetalTypes.find(
                (mt) =>
                  mt.code?.toUpperCase() === 'PLATINUM' ||
                  mt.name?.toUpperCase() === 'PLATINUM' ||
                  mt.code?.toUpperCase().includes('PLATINUM') ||
                  mt.name?.toUpperCase().includes('PLATINUM')
              );
              platinumMetalTypeId = platinumMetal?.id || null;
            }

            console.log('Platinum metal type search:', {
              baseMetalTypes,
              platinumMetalTypeId,
              searchResults: {
                byCode: findMetalTypeId(baseMetalTypes, 'PLATINUM'),
                directFind: baseMetalTypes.find((mt) => mt.code?.toUpperCase() === 'PLATINUM')?.id,
              },
            });

            // Calculate totals including platinum if exists
            const platinumOtherCharges = platinumRow
              ? parseFloat(platinumRow.otherCharges || 0)
              : 0;
            const platinumMakingCharges = platinumRow
              ? parseFloat(platinumRow.labourRate || platinumRow.makingCharges || 0)
              : 0;
            const platinumAmount = platinumRow ? parseFloat(platinumRow.amount || 0) : 0;
            const totalOtherCharges = parseFloat(product.otherCharges || 0) + platinumOtherCharges;
            const totalMakingCharges =
              parseFloat(product.labourRate || product.makingCharges || 0) + platinumMakingCharges;
            // Initial total purchase amount (will be recalculated after diamond details are added)
            const basePurchaseAmount = parseFloat(product.amount || 0) + platinumAmount; // TODO:

            const item = {
              description: product.description,
              product_type: product.subTypeId || null,
              quantity: product.pcs ?? 0, // Moved from item_details to purchase_items level (no fallback to 1)
              total_other_charges: String(totalOtherCharges),
              total_making_charges: String(totalMakingCharges),
              total_diamond_pcs: 0, // Will be recalculated after diamond_details are added
              total_diamond_weight: '0', // Will be recalculated after diamond_details are added
              total_diamond_purchase_amount: '0', // Will be recalculated after diamond_details are added
              total_diamond_sale_amount: '0', // Will be recalculated after diamond_details are added
              total_purchase_amount: String(basePurchaseAmount), // Will be recalculated after diamond_details are added
              item_details: [
                // Regular product item detail (Gold)
                {
                  metal_type: goldMetalTypeId,
                  gross_weight: String(product.grossWeight || 0),
                  less_weight: String(product.lessWeight || 0),
                  net_weight: String(product.netWeight || 0),
                  purity_touch: String(product.touch || product.purity || 0),
                  purchase_wastage: String(product.wastagePercent || product.wastage || 0),
                  purchase_rate: product.purchaseRate ? String(product.purchaseRate) : null,
                  purchase_mrp: product.purchaseMrp ? String(product.purchaseMrp) : null,
                  sale_mrp: product.saleMrp ? String(product.saleMrp) : null,
                  pure_weight: String(product.totalPureWeight || product.pureWeight || 0),
                  other_charges: String(product.otherCharges || 0),
                  purchase_making_charges: String(product.labourRate || product.makingCharges || 0),
                  // purchase_total_amount: calculateTotal(product),
                  purchase_total_amount: String(product.amount || 0),
                  // other_charges_details: product.otherChargesDetails || [],
                  // making_charges_details: product.makingChargesDetails || [],
                  // less_weight_details: product.lessWeightDetails || [],
                },
              ],
              other_charges: String(product.otherCharges || 0),
              purchase_making_charges: String(product.labourRate || product.makingCharges || 0),
              diamond_details: [],
              other_tag_details: [],
              other_charges_details: product.otherChargesDetails || [],
              making_charges_details: product.makingChargesDetails || [],
              less_weight_details: product.lessWeightDetails || [],
            };

            // Add platinum item detail if platinum row exists
            if (platinumRow) {
              console.log('Found platinum row for product:', {
                productId: product.id,
                platinumRow,
                parentProductId: platinumRow.parentProductId,
              });

              // Use platinum metal type from base metal types, or try to find it from metalTypes list
              // If not found, we'll need to get it from the API metal types list
              // For now, use the found platinumMetalTypeId or fallback to a default
              const finalPlatinumMetalTypeId =
                platinumMetalTypeId ||
                (baseMetalTypes.length > 1
                  ? baseMetalTypes.find(
                      (mt) =>
                        mt.code?.toUpperCase().includes('PLATINUM') ||
                        mt.name?.toUpperCase().includes('PLATINUM')
                    )?.id
                  : null) ||
                (baseMetalTypes.length > 1 ? baseMetalTypes[1]?.id : null) || // Try second metal type if available
                purchaseData.generalDetails.billMetalType; // Fallback to bill metal type if not found

              console.log('Platinum metal type resolution:', {
                platinumMetalTypeId,
                baseMetalTypes,
                finalPlatinumMetalTypeId,
                billMetalType: purchaseData.generalDetails.billMetalType,
              });

              // Check if platinum has any meaningful data (net weight, amount, etc.)
              // Be lenient - check if netWeight is not empty string (even if 0, it might be valid)
              const netWeightValue =
                platinumRow.netWeight !== undefined &&
                platinumRow.netWeight !== null &&
                platinumRow.netWeight !== ''
                  ? parseFloat(platinumRow.netWeight)
                  : 0;
              const hasPlatinumData =
                netWeightValue > 0 ||
                (platinumRow.amount && parseFloat(platinumRow.amount) > 0) ||
                (platinumRow.touch && platinumRow.touch !== '') ||
                (platinumRow.purity && parseFloat(platinumRow.purity) > 0) ||
                (platinumRow.purchaseRate && parseFloat(platinumRow.purchaseRate) > 0) ||
                (platinumRow.otherCharges && parseFloat(platinumRow.otherCharges) > 0) ||
                (platinumRow.labourRate && parseFloat(platinumRow.labourRate) > 0) ||
                (platinumRow.makingCharges && parseFloat(platinumRow.makingCharges) > 0) ||
                (platinumRow.lessWeightDetails && platinumRow.lessWeightDetails.length > 0) ||
                (platinumRow.otherChargesDetails && platinumRow.otherChargesDetails.length > 0) ||
                (platinumRow.makingChargesDetails && platinumRow.makingChargesDetails.length > 0);

              console.log('Platinum data check:', {
                netWeightValue,
                hasPlatinumData,
                platinumRowData: {
                  netWeight: platinumRow.netWeight,
                  amount: platinumRow.amount,
                  touch: platinumRow.touch,
                  purity: platinumRow.purity,
                  purchaseRate: platinumRow.purchaseRate,
                  otherCharges: platinumRow.otherCharges,
                  lessWeightDetails: platinumRow.lessWeightDetails,
                },
              });

              // Add platinum if metal type is found (data check is optional - if row exists, include it)
              // Check for both null/undefined and ensure it's a valid number (not 0 unless 0 is valid)
              if (finalPlatinumMetalTypeId !== null && finalPlatinumMetalTypeId !== undefined) {
                item.item_details.push({
                  metal_type: finalPlatinumMetalTypeId,
                  gross_weight: '0', // Platinum doesn't have gross weight
                  less_weight: '0', // Platinum doesn't have less weight
                  net_weight: String(platinumRow.netWeight || 0),
                  purity_touch: String(platinumRow.touch || platinumRow.purity || 0),
                  purchase_wastage: String(platinumRow.wastagePercent || platinumRow.wastage || 0),
                  purchase_rate: platinumRow.purchaseRate ? String(platinumRow.purchaseRate) : null,
                  purchase_mrp: platinumRow.purchaseMrp ? String(platinumRow.purchaseMrp) : null,
                  sale_mrp: null, // Platinum doesn't have sale MRP
                  pure_weight: String(platinumRow.totalPureWeight || platinumRow.pureWeight || 0),
                  // other_charges: String(platinumRow.otherCharges),
                  // purchase_making_charges: String(
                  //   platinumRow.makingCharges || platinumRow.labourRate || 0
                  // ),

                  // purchase_total_amount: calculateTotal(platinumRow),
                  purchase_total_amount: String(platinumRow.amount || 0),
                  // other_charges_details: platinumRow.otherChargesDetails || [],
                  // making_charges_details: platinumRow.makingChargesDetails || [],
                  // less_weight_details: platinumRow.lessWeightDetails || [],
                });
                console.log('Platinum item_detail added successfully');
              } else {
                // Log why platinum wasn't added for debugging
                console.warn(
                  'Platinum row found but not added to item_details - metal type not found:',
                  {
                    platinumRow,
                    finalPlatinumMetalTypeId,
                    hasPlatinumData,
                    baseMetalTypes,
                    platinumMetalTypeId,
                    productId: product.id,
                  }
                );
              }
            } else {
              console.log('No platinum row found for product:', {
                productId: product.id,
                allProducts: purchaseData.products?.map((p) => ({
                  id: p.id,
                  isPlatinumRow: p.isPlatinumRow,
                  parentProductId: p.parentProductId,
                })),
              });
            }

            // Add diamond details if available
            // For GOLD+DIAMOND categories - diamondDetails is an array
            if (
              product.diamondDetails &&
              Array.isArray(product.diamondDetails) &&
              product.diamondDetails.length > 0
            ) {
              item.diamond_details = product.diamondDetails
                .filter(
                  (diamond) =>
                    diamond.diamond_colour_clarity ||
                    diamond.diamond_size_range ||
                    diamond.diamond_piece ||
                    diamond.diamond_weight ||
                    diamond.diamond_purchase_rate ||
                    diamond.diamond_sale_rate
                )
                .map((diamond) => {
                  // Handle empty strings - convert to 0 for numeric fields, null for optional fields
                  const piece =
                    diamond.diamond_piece === '' ||
                    diamond.diamond_piece === null ||
                    diamond.diamond_piece === undefined
                      ? 0
                      : parseInt(diamond.diamond_piece) || 0;
                  const weight =
                    diamond.diamond_weight === '' ||
                    diamond.diamond_weight === null ||
                    diamond.diamond_weight === undefined
                      ? 0
                      : parseFloat(diamond.diamond_weight) || 0;
                  const purchaseRate =
                    diamond.diamond_purchase_rate === '' ||
                    diamond.diamond_purchase_rate === null ||
                    diamond.diamond_purchase_rate === undefined
                      ? 0
                      : parseFloat(diamond.diamond_purchase_rate) || 0;
                  const saleRate =
                    diamond.diamond_sale_rate === '' ||
                    diamond.diamond_sale_rate === null ||
                    diamond.diamond_sale_rate === undefined
                      ? 0
                      : parseFloat(diamond.diamond_sale_rate) || 0;

                  // Calculate amounts if not already calculated
                  const purchaseAmount = diamond.purchase_amount
                    ? parseFloat(diamond.purchase_amount)
                    : weight * purchaseRate;
                  const saleAmount = diamond.sale_amount
                    ? parseFloat(diamond.sale_amount)
                    : weight * saleRate;

                  return {
                    diamond_colour_clarity: diamond.diamond_colour_clarity || null,
                    diamond_size_range: diamond.diamond_size_range || null,
                    diamond_colour: diamond.diamond_colour || null,
                    diamond_certificate: diamond.diamond_certificate || null,
                    diamond_piece: piece,
                    diamond_weight: String(weight),
                    certificate_number: diamond.certificate_number || null,
                    diamond_purchase_rate: String(purchaseRate),
                    diamond_sale_rate: String(saleRate),
                    purchase_amount: String(purchaseAmount.toFixed(2)),
                    sale_amount: String(saleAmount.toFixed(2)),
                  };
                });
            } else if (
              // For ONLY DIAMOND category - diamond fields are stored directly on product
              product.diamondColourClarity ||
              product.diamondSizeRange ||
              product.diamondColour ||
              product.diamondCertificate
            ) {
              item.diamond_details = [
                {
                  diamond_colour_clarity: product.diamondColourClarity,
                  diamond_size_range: product.diamondSizeRange,
                  diamond_colour: product.diamondColour,
                  diamond_certificate: product.diamondCertificate,
                  diamond_piece: product.diamondPiece || 0,
                  diamond_weight: String(product.diamondWeight || 0),
                  certificate_number: product.certificateNumber || null,
                  diamond_purchase_rate: String(product.diamondPurchaseRate || 0),
                  diamond_sale_rate: String(product.diamondSaleRate || 0),
                  purchase_amount: String(product.diamondPurchaseAmount || 0),
                  sale_amount: String(product.diamondSaleAmount || 0),
                },
              ];
            }

            // Recalculate diamond totals from the actual diamond_details array
            if (item.diamond_details && item.diamond_details.length > 0) {
              let totalDiamondPcs = 0;
              let totalDiamondWeight = 0;
              let totalDiamondPurchaseAmount = 0;
              let totalDiamondSaleAmount = 0;

              item.diamond_details.forEach((diamond) => {
                totalDiamondPcs += parseInt(diamond.diamond_piece || 0);
                totalDiamondWeight += parseFloat(diamond.diamond_weight || 0);
                totalDiamondPurchaseAmount += parseFloat(diamond.purchase_amount || 0);
                totalDiamondSaleAmount += parseFloat(diamond.sale_amount || 0);
              });

              item.total_diamond_pcs = totalDiamondPcs;
              item.total_diamond_weight = String(totalDiamondWeight.toFixed(3));
              item.total_diamond_purchase_amount = String(totalDiamondPurchaseAmount.toFixed(2));
              item.total_diamond_sale_amount = String(totalDiamondSaleAmount.toFixed(2));

              // Recalculate total_purchase_amount to include diamond purchase amount
              const currentTotalPurchaseAmount = parseFloat(item.total_purchase_amount || 0);
              const finalTotalPurchaseAmount =
                currentTotalPurchaseAmount + totalDiamondPurchaseAmount;
              item.total_purchase_amount = String(finalTotalPurchaseAmount.toFixed(2));
            }

            // Add other tag details if available
            if (product.otherTagDetails) {
              item.other_tag_details = [
                {
                  remarks: product.otherTagDetails.remarks || null,
                  design_code: product.otherTagDetails.designCode || null,
                  certificate_number: product.otherTagDetails.certificateNumber || null,
                  huid_1: product.otherTagDetails.huid1 || null,
                  huid_2: product.otherTagDetails.huid2 || null,
                  huid_3: product.otherTagDetails.huid3 || null,
                  gram_option_1: product.otherTagDetails.gramOption1
                    ? String(product.otherTagDetails.gramOption1)
                    : null,
                  gram_option_2: product.otherTagDetails.gramOption2
                    ? String(product.otherTagDetails.gramOption2)
                    : null,
                },
              ];
            }

            return item;
          }),
        };

        console.log(':::::::::::::::::', apiPayload);

        const response = await callApi({
          url: API_ROUTES.PURCHASE.PURCHASES.CREATE,
          method: 'POST',
          body: apiPayload,
        });

        if (response.success) {
          // Add the new purchase to the local state
          setPurchases((prev) => [response.data || response, ...prev]);
          return {
            success: true,
            data: response.data || response,
            message: 'Purchase created successfully',
          };
        }

        return {
          success: false,
          message: response.message || 'Failed to create purchase',
          error: response.error || 'Unknown error',
        };
      } catch (err) {
        console.error('Error creating purchase:', err);
        // Extract detailed error message from API response
        const errorData = err.response?.data || {};
        let errorMessage = 'Failed to create purchase';

        // Try to extract field-specific errors (e.g., "round_off_amount: ...")
        if (typeof errorData === 'object' && errorData !== null) {
          const fieldErrors = [];
          for (const [fieldName, fieldValue] of Object.entries(errorData)) {
            if (
              ['success', 'data', 'message', 'error', 'detail', 'status', 'code'].includes(
                fieldName
              )
            ) {
              continue;
            }
            if (Array.isArray(fieldValue)) {
              const fieldErrorText = fieldValue.join(', ');
              fieldErrors.push(`${fieldName}: ${fieldErrorText}`);
            } else if (typeof fieldValue === 'string' && fieldValue.trim()) {
              fieldErrors.push(`${fieldName}: ${fieldValue}`);
            }
          }
          if (fieldErrors.length > 0) {
            errorMessage = fieldErrors.join('; ');
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.detail) {
            errorMessage = errorData.detail;
          }
        } else if (err.message && !err.message.includes('Request failed')) {
          errorMessage = err.message;
        }

        return {
          success: false,
          message: errorMessage,
          error: errorMessage,
        };
      }
    },
    [callApi, getCompanyId]
  );

  const updatePurchase = useCallback(
    async (id, purchaseData) => {
      try {
        const companyId = getCompanyId();
        if (!companyId) {
          throw new Error('No company ID available');
        }

        // Filter out platinum rows - they will be combined with their parent products
        const filledProducts = (purchaseData.products || []).filter(
          (product) => product.description && product.description.trim() && !product.isPlatinumRow
        );
        const roundOffAmount =
          purchaseData.payment?.roundOffAmount === '' || !purchaseData.payment?.roundOffAmount
            ? '0.000'
            : purchaseData.payment?.roundOffAmount || '0.000';

        // Helper function to find metal type from base metal types
        const findMetalTypeId = (baseMetalTypes, metalTypeCode) => {
          if (!baseMetalTypes || !Array.isArray(baseMetalTypes)) return null;
          const metalType = baseMetalTypes.find(
            (mt) =>
              mt.code === metalTypeCode ||
              mt.name?.toUpperCase() === metalTypeCode ||
              mt.code?.toUpperCase() === metalTypeCode
          );
          return metalType?.id || null;
        };

        // Transform the form data to match API schema (same as createPurchase)
        const apiPayload = {
          company: companyId,
          dealer: purchaseData.generalDetails.dealerId,
          bill_metal_type: purchaseData.generalDetails.billMetalType,
          bill_date: purchaseData.generalDetails.billDate,
          bill_number: purchaseData.generalDetails.billNo,
          tag_selected: purchaseData.generalDetails.tagSelected,
          round_off_amount: String(roundOffAmount || '0.000'), // Top-level round off amount
          payment_mode: purchaseData.payment?.paymentMode ?? null,
          total_paid_amount: String(purchaseData.payment?.totalPaidAmount || '0'),
          note: purchaseData.payment?.note ?? null,
          pending_amount: String(Number(purchaseData.payment?.pendingAmount).toFixed(3) || '0'),
          total_purchase_amount: String(purchaseData.payment?.totalPurchaseAmount || '0'),
          purchase_items: filledProducts.map((product) => {
            console.log('Processing product for payload:', {
              productId: product.id,
              productDescription: product.description,
              allProducts: purchaseData.products?.map((p) => ({
                id: p.id,
                isPlatinumRow: p.isPlatinumRow,
                parentProductId: p.parentProductId,
              })),
            });

            // Find platinum row for this product
            // Try both number and string comparison for parentProductId
            const platinumRow = (purchaseData.products || []).find(
              (p) =>
                p.isPlatinumRow &&
                (p.parentProductId === product.id ||
                  String(p.parentProductId) === String(product.id) ||
                  Number(p.parentProductId) === Number(product.id))
            );

            console.log('Platinum row search result:', {
              productId: product.id,
              productIdType: typeof product.id,
              platinumRowFound: !!platinumRow,
              platinumRow: platinumRow
                ? {
                    id: platinumRow.id,
                    parentProductId: platinumRow.parentProductId,
                    parentProductIdType: typeof platinumRow.parentProductId,
                    netWeight: platinumRow.netWeight,
                  }
                : null,
            });

            // Get base metal types for this product
            const baseMetalTypes = product.baseMetalTypes || [];

            console.log('Product baseMetalTypes:', {
              productId: product.id,
              baseMetalTypes,
              baseMetalTypesLength: baseMetalTypes.length,
            });

            // Find metal types for gold and platinum from base metal types
            // Try to find GOLD first, then fallback to first base metal type or billMetalType
            let goldMetalTypeId = findMetalTypeId(baseMetalTypes, 'GOLD');
            if (!goldMetalTypeId && baseMetalTypes.length > 0) {
              // Use first base metal type if GOLD not found
              goldMetalTypeId =
                baseMetalTypes[0]?.id || purchaseData.generalDetails.billMetalType || 1;
            } else if (!goldMetalTypeId) {
              goldMetalTypeId = purchaseData.generalDetails.billMetalType || 1;
            }

            // Find PLATINUM metal type
            // Try multiple ways to find platinum metal type
            let platinumMetalTypeId =
              findMetalTypeId(baseMetalTypes, 'PLATINUM') ||
              findMetalTypeId(baseMetalTypes, 'PLAT') ||
              findMetalTypeId(baseMetalTypes, 'PLATINUM_AND_DIAMOND') ||
              null;

            // If not found, try direct search in baseMetalTypes array
            if (!platinumMetalTypeId && baseMetalTypes.length > 0) {
              const platinumMetal = baseMetalTypes.find(
                (mt) =>
                  mt.code?.toUpperCase() === 'PLATINUM' ||
                  mt.name?.toUpperCase() === 'PLATINUM' ||
                  mt.code?.toUpperCase().includes('PLATINUM') ||
                  mt.name?.toUpperCase().includes('PLATINUM')
              );
              platinumMetalTypeId = platinumMetal?.id || null;
            }

            console.log('Platinum metal type search:', {
              baseMetalTypes,
              platinumMetalTypeId,
              searchResults: {
                byCode: findMetalTypeId(baseMetalTypes, 'PLATINUM'),
                directFind: baseMetalTypes.find((mt) => mt.code?.toUpperCase() === 'PLATINUM')?.id,
              },
            });

            // Calculate totals including platinum if exists
            const platinumOtherCharges = platinumRow
              ? parseFloat(platinumRow.otherCharges || 0)
              : 0;
            const platinumMakingCharges = platinumRow
              ? parseFloat(platinumRow.labourRate || platinumRow.makingCharges || 0)
              : 0;
            const platinumAmount = platinumRow ? parseFloat(platinumRow.amount || 0) : 0;
            const totalOtherCharges = parseFloat(product.otherCharges || 0) + platinumOtherCharges;
            const totalMakingCharges =
              parseFloat(product.labourRate || product.makingCharges || 0) + platinumMakingCharges;
            // Initial total purchase amount (will be recalculated after diamond details are added)
            const basePurchaseAmount = parseFloat(product.amount || 0) + platinumAmount; // TODO:

            const item = {
              description: product.description,
              product_type: product.subTypeId || null,
              quantity: product.pcs ?? 0, // Moved from item_details to purchase_items level (no fallback to 1)
              total_other_charges: String(totalOtherCharges),
              total_making_charges: String(totalMakingCharges),
              total_diamond_pcs: 0, // Will be recalculated after diamond_details are added
              total_diamond_weight: '0', // Will be recalculated after diamond_details are added
              total_diamond_purchase_amount: '0', // Will be recalculated after diamond_details are added
              total_diamond_sale_amount: '0', // Will be recalculated after diamond_details are added
              total_purchase_amount: String(basePurchaseAmount), // Will be recalculated after diamond_details are added
              item_details: [
                // Regular product item detail (Gold)
                {
                  metal_type: goldMetalTypeId,
                  gross_weight: String(product.grossWeight || 0),
                  less_weight: String(product.lessWeight || 0),
                  net_weight: String(product.netWeight || 0),
                  purity_touch: String(product.touch || product.purity || 0),
                  purchase_wastage: String(product.wastagePercent || product.wastage || 0),
                  purchase_rate: product.purchaseRate ? String(product.purchaseRate) : null,
                  purchase_mrp: product.purchaseMrp ? String(product.purchaseMrp) : null,
                  sale_mrp: product.saleMrp ? String(product.saleMrp) : null,
                  pure_weight: String(product.totalPureWeight || product.pureWeight || 0),
                  other_charges: String(product.otherCharges || 0),
                  purchase_making_charges: String(product.labourRate || product.makingCharges || 0),
                  // purchase_total_amount: calculateTotal(product),
                  purchase_total_amount: String(product.amount || 0),
                  // other_charges_details: product.otherChargesDetails || [],
                  // making_charges_details: product.makingChargesDetails || [],
                  // less_weight_details: product.lessWeightDetails || [],
                },
              ],
              other_charges: String(product.otherCharges || 0),
              purchase_making_charges: String(product.labourRate || product.makingCharges || 0),
              diamond_details: [],
              other_tag_details: [],
              other_charges_details: product.otherChargesDetails || [],
              making_charges_details: product.makingChargesDetails || [],
              less_weight_details: product.lessWeightDetails || [],
            };

            // Add platinum item detail if platinum row exists
            if (platinumRow) {
              console.log('Found platinum row for product:', {
                productId: product.id,
                platinumRow,
                parentProductId: platinumRow.parentProductId,
              });

              // Use platinum metal type from base metal types, or try to find it from metalTypes list
              // If not found, we'll need to get it from the API metal types list
              // For now, use the found platinumMetalTypeId or fallback to a default
              const finalPlatinumMetalTypeId =
                platinumMetalTypeId ||
                (baseMetalTypes.length > 1
                  ? baseMetalTypes.find(
                      (mt) =>
                        mt.code?.toUpperCase().includes('PLATINUM') ||
                        mt.name?.toUpperCase().includes('PLATINUM')
                    )?.id
                  : null) ||
                (baseMetalTypes.length > 1 ? baseMetalTypes[1]?.id : null) || // Try second metal type if available
                purchaseData.generalDetails.billMetalType; // Fallback to bill metal type if not found

              console.log('Platinum metal type resolution:', {
                platinumMetalTypeId,
                baseMetalTypes,
                finalPlatinumMetalTypeId,
                billMetalType: purchaseData.generalDetails.billMetalType,
              });

              // Check if platinum has any meaningful data (net weight, amount, etc.)
              // Be lenient - check if netWeight is not empty string (even if 0, it might be valid)
              const netWeightValue =
                platinumRow.netWeight !== undefined &&
                platinumRow.netWeight !== null &&
                platinumRow.netWeight !== ''
                  ? parseFloat(platinumRow.netWeight)
                  : 0;
              const hasPlatinumData =
                netWeightValue > 0 ||
                (platinumRow.amount && parseFloat(platinumRow.amount) > 0) ||
                (platinumRow.touch && platinumRow.touch !== '') ||
                (platinumRow.purity && parseFloat(platinumRow.purity) > 0) ||
                (platinumRow.purchaseRate && parseFloat(platinumRow.purchaseRate) > 0) ||
                (platinumRow.otherCharges && parseFloat(platinumRow.otherCharges) > 0) ||
                (platinumRow.labourRate && parseFloat(platinumRow.labourRate) > 0) ||
                (platinumRow.makingCharges && parseFloat(platinumRow.makingCharges) > 0) ||
                (platinumRow.lessWeightDetails && platinumRow.lessWeightDetails.length > 0) ||
                (platinumRow.otherChargesDetails && platinumRow.otherChargesDetails.length > 0) ||
                (platinumRow.makingChargesDetails && platinumRow.makingChargesDetails.length > 0);

              console.log('Platinum data check:', {
                netWeightValue,
                hasPlatinumData,
                platinumRowData: {
                  netWeight: platinumRow.netWeight,
                  amount: platinumRow.amount,
                  touch: platinumRow.touch,
                  purity: platinumRow.purity,
                  purchaseRate: platinumRow.purchaseRate,
                  otherCharges: platinumRow.otherCharges,
                  lessWeightDetails: platinumRow.lessWeightDetails,
                },
              });

              // Add platinum if metal type is found (data check is optional - if row exists, include it)
              // Check for both null/undefined and ensure it's a valid number (not 0 unless 0 is valid)
              if (finalPlatinumMetalTypeId !== null && finalPlatinumMetalTypeId !== undefined) {
                item.item_details.push({
                  metal_type: finalPlatinumMetalTypeId,
                  gross_weight: '0', // Platinum doesn't have gross weight
                  less_weight: '0', // Platinum doesn't have less weight
                  net_weight: String(platinumRow.netWeight || 0),
                  purity_touch: String(platinumRow.touch || platinumRow.purity || 0),
                  purchase_wastage: String(platinumRow.wastagePercent || platinumRow.wastage || 0),
                  purchase_rate: platinumRow.purchaseRate ? String(platinumRow.purchaseRate) : null,
                  purchase_mrp: platinumRow.purchaseMrp ? String(platinumRow.purchaseMrp) : null,
                  sale_mrp: null, // Platinum doesn't have sale MRP
                  pure_weight: String(platinumRow.totalPureWeight || platinumRow.pureWeight || 0),
                  // other_charges: String(platinumRow.otherCharges),
                  // purchase_making_charges: String(
                  //   platinumRow.makingCharges || platinumRow.labourRate || 0
                  // ),

                  // purchase_total_amount: calculateTotal(platinumRow),
                  purchase_total_amount: String(platinumRow.amount || 0),
                  // other_charges_details: platinumRow.otherChargesDetails || [],
                  // making_charges_details: platinumRow.makingChargesDetails || [],
                  // less_weight_details: platinumRow.lessWeightDetails || [],
                });
                console.log('Platinum item_detail added successfully');
              } else {
                // Log why platinum wasn't added for debugging
                console.warn(
                  'Platinum row found but not added to item_details - metal type not found:',
                  {
                    platinumRow,
                    finalPlatinumMetalTypeId,
                    hasPlatinumData,
                    baseMetalTypes,
                    platinumMetalTypeId,
                    productId: product.id,
                  }
                );
              }
            } else {
              console.log('No platinum row found for product:', {
                productId: product.id,
                allProducts: purchaseData.products?.map((p) => ({
                  id: p.id,
                  isPlatinumRow: p.isPlatinumRow,
                  parentProductId: p.parentProductId,
                })),
              });
            }

            // Add diamond details if available
            // For GOLD+DIAMOND categories - diamondDetails is an array
            if (
              product.diamondDetails &&
              Array.isArray(product.diamondDetails) &&
              product.diamondDetails.length > 0
            ) {
              item.diamond_details = product.diamondDetails
                .filter(
                  (diamond) =>
                    diamond.diamond_colour_clarity ||
                    diamond.diamond_size_range ||
                    diamond.diamond_piece ||
                    diamond.diamond_weight ||
                    diamond.diamond_purchase_rate ||
                    diamond.diamond_sale_rate
                )
                .map((diamond) => {
                  // Handle empty strings - convert to 0 for numeric fields, null for optional fields
                  const piece =
                    diamond.diamond_piece === '' ||
                    diamond.diamond_piece === null ||
                    diamond.diamond_piece === undefined
                      ? 0
                      : parseInt(diamond.diamond_piece) || 0;
                  const weight =
                    diamond.diamond_weight === '' ||
                    diamond.diamond_weight === null ||
                    diamond.diamond_weight === undefined
                      ? 0
                      : parseFloat(diamond.diamond_weight) || 0;
                  const purchaseRate =
                    diamond.diamond_purchase_rate === '' ||
                    diamond.diamond_purchase_rate === null ||
                    diamond.diamond_purchase_rate === undefined
                      ? 0
                      : parseFloat(diamond.diamond_purchase_rate) || 0;
                  const saleRate =
                    diamond.diamond_sale_rate === '' ||
                    diamond.diamond_sale_rate === null ||
                    diamond.diamond_sale_rate === undefined
                      ? 0
                      : parseFloat(diamond.diamond_sale_rate) || 0;

                  // Calculate amounts if not already calculated
                  const purchaseAmount = diamond.purchase_amount
                    ? parseFloat(diamond.purchase_amount)
                    : weight * purchaseRate;
                  const saleAmount = diamond.sale_amount
                    ? parseFloat(diamond.sale_amount)
                    : weight * saleRate;

                  return {
                    diamond_colour_clarity: diamond.diamond_colour_clarity || null,
                    diamond_size_range: diamond.diamond_size_range || null,
                    diamond_colour: diamond.diamond_colour || null,
                    diamond_certificate: diamond.diamond_certificate || null,
                    diamond_piece: piece,
                    diamond_weight: String(weight),
                    certificate_number: diamond.certificate_number || null,
                    diamond_purchase_rate: String(purchaseRate),
                    diamond_sale_rate: String(saleRate),
                    purchase_amount: String(purchaseAmount.toFixed(2)),
                    sale_amount: String(saleAmount.toFixed(2)),
                  };
                });
            } else if (
              // For ONLY DIAMOND category - diamond fields are stored directly on product
              product.diamondColourClarity ||
              product.diamondSizeRange ||
              product.diamondColour ||
              product.diamondCertificate
            ) {
              item.diamond_details = [
                {
                  diamond_colour_clarity: product.diamondColourClarity,
                  diamond_size_range: product.diamondSizeRange,
                  diamond_colour: product.diamondColour,
                  diamond_certificate: product.diamondCertificate,
                  diamond_piece: product.diamondPiece || 0,
                  diamond_weight: String(product.diamondWeight || 0),
                  certificate_number: product.certificateNumber || null,
                  diamond_purchase_rate: String(product.diamondPurchaseRate || 0),
                  diamond_sale_rate: String(product.diamondSaleRate || 0),
                  purchase_amount: String(product.diamondPurchaseAmount || 0),
                  sale_amount: String(product.diamondSaleAmount || 0),
                },
              ];
            }

            // Recalculate diamond totals from the actual diamond_details array
            if (item.diamond_details && item.diamond_details.length > 0) {
              let totalDiamondPcs = 0;
              let totalDiamondWeight = 0;
              let totalDiamondPurchaseAmount = 0;
              let totalDiamondSaleAmount = 0;

              item.diamond_details.forEach((diamond) => {
                totalDiamondPcs += parseInt(diamond.diamond_piece || 0);
                totalDiamondWeight += parseFloat(diamond.diamond_weight || 0);
                totalDiamondPurchaseAmount += parseFloat(diamond.purchase_amount || 0);
                totalDiamondSaleAmount += parseFloat(diamond.sale_amount || 0);
              });

              item.total_diamond_pcs = totalDiamondPcs;
              item.total_diamond_weight = String(totalDiamondWeight.toFixed(3));
              item.total_diamond_purchase_amount = String(totalDiamondPurchaseAmount.toFixed(2));
              item.total_diamond_sale_amount = String(totalDiamondSaleAmount.toFixed(2));

              // Recalculate total_purchase_amount to include diamond purchase amount
              const currentTotalPurchaseAmount = parseFloat(item.total_purchase_amount || 0);
              const finalTotalPurchaseAmount =
                currentTotalPurchaseAmount + totalDiamondPurchaseAmount;
              item.total_purchase_amount = String(finalTotalPurchaseAmount.toFixed(2));
            }

            // Add other tag details if available
            if (product.otherTagDetails) {
              item.other_tag_details = [
                {
                  remarks: product.otherTagDetails.remarks || null,
                  design_code: product.otherTagDetails.designCode || null,
                  certificate_number: product.otherTagDetails.certificateNumber || null,
                  huid_1: product.otherTagDetails.huid1 || null,
                  huid_2: product.otherTagDetails.huid2 || null,
                  huid_3: product.otherTagDetails.huid3 || null,
                  gram_option_1: product.otherTagDetails.gramOption1
                    ? String(product.otherTagDetails.gramOption1)
                    : null,
                  gram_option_2: product.otherTagDetails.gramOption2
                    ? String(product.otherTagDetails.gramOption2)
                    : null,
                },
              ];
            }

            return item;
          }),
        };
        console.log('::::::::::::::Update ---apiPayload: ', apiPayload);

        const response = await callApi({
          url: API_ROUTES.PURCHASE.PURCHASES.UPDATE(id),
          method: 'PUT',
          query: {
            company_id: companyId,
          },
          body: apiPayload,
        });

        if (response.success) {
          // Update the purchase in local state
          setPurchases((prev) =>
            prev.map((p) => (p.id === parseInt(id, 10) ? response.data || response : p))
          );
          return {
            success: true,
            data: response.data || response,
            message: 'Purchase updated successfully',
          };
        }

        return {
          success: false,
          message: response.message || 'Failed to update purchase',
          error: response.error || 'Unknown error',
        };
      } catch (err) {
        console.error('Error updating purchase:', err);
        // Extract detailed error message from API response
        const errorData = err.response?.data || {};
        let errorMessage = 'Failed to update purchase';

        // Try to extract field-specific errors (e.g., "round_off_amount: ...")
        if (typeof errorData === 'object' && errorData !== null) {
          const fieldErrors = [];
          for (const [fieldName, fieldValue] of Object.entries(errorData)) {
            if (
              ['success', 'data', 'message', 'error', 'detail', 'status', 'code'].includes(
                fieldName
              )
            ) {
              continue;
            }
            if (Array.isArray(fieldValue)) {
              const fieldErrorText = fieldValue.join(', ');
              fieldErrors.push(`${fieldName}: ${fieldErrorText}`);
            } else if (typeof fieldValue === 'string' && fieldValue.trim()) {
              fieldErrors.push(`${fieldName}: ${fieldValue}`);
            }
          }
          if (fieldErrors.length > 0) {
            errorMessage = fieldErrors.join('; ');
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.detail) {
            errorMessage = errorData.detail;
          }
        } else if (err.message && !err.message.includes('Request failed')) {
          errorMessage = err.message;
        }

        return {
          success: false,
          message: errorMessage,
          error: errorMessage,
        };
      }
    },
    [callApi, getCompanyId]
  );

  const deletePurchase = useCallback(
    async (id) => {
      try {
        const companyId = getCompanyId();
        if (!companyId) {
          throw new Error('No company ID available');
        }

        const response = await callApi({
          url: API_ROUTES.PURCHASE.PURCHASES.DELETE(id),
          method: 'DELETE',
          query: {
            company_id: companyId,
          },
        });

        if (response.success) {
          // Remove the deleted purchase from local state
          setPurchases((prev) => prev.filter((p) => p.id !== parseInt(id, 10)));
          return {
            success: true,
            message: 'Purchase deleted successfully',
          };
        }

        return {
          success: false,
          message: response.message || 'Failed to delete purchase',
          error: response.error || 'Unknown error',
        };
      } catch (err) {
        console.error('Error:', err);
        console.error('Error deleting purchase:', err);
        return {
          success: false,
          message: 'Failed to delete purchase',
          error: err.message,
        };
      }
    },
    [callApi, getCompanyId]
  );

  const getDealers = useCallback(async () => {
    try {
      const companyId = getCompanyId();
      if (!companyId) {
        return { success: false, data: [], items: [], message: 'No company ID available' };
      }

      const response = await callApi({
        url: API_ROUTES.ACCOUNTS.DEALERS.GET,
        method: 'GET',
        query: {
          company_id: companyId,
          pagination: false, // Get all dealers without pagination
        },
      });

      if (response.success) {
        let items = [];

        // Handle different response structures
        if (Array.isArray(response.results)) {
          items = response.results;
        } else if (Array.isArray(response.data)) {
          items = response.data;
        } else if (response.results && typeof response.results === 'object') {
          items = Object.values(response.results);
        } else if (response.data && typeof response.data === 'object') {
          items = Object.values(response.data);
        }

        return {
          success: true,
          data: items,
          items, // Provide both for compatibility
        };
      }

      return { success: false, data: [], items: [], message: 'Failed to fetch dealers' };
    } catch (err) {
      console.error('Error fetching dealers:', err);
      return {
        success: false,
        data: [],
        items: [],
        message: 'Failed to fetch dealers',
        error: err.message,
      };
    }
  }, [callApi, getCompanyId]);

  const getDealerById = useCallback(
    async (id) => {
      try {
        const companyId = getCompanyId();
        if (!companyId) {
          return { success: false, data: null, message: 'No company ID available' };
        }

        const response = await callApi({
          url: `accounts/dealers/${id}/`,
          method: 'GET',
          query: {
            company_id: companyId,
          },
        });

        if (response.success) {
          return {
            success: true,
            data: response,
          };
        }

        return { success: false, data: null, message: 'Dealer not found' };
      } catch (err) {
        console.error('Error:', err);
        return {
          success: false,
          data: null,
          message: 'Failed to fetch dealer details',
          error: err.message,
        };
      }
    },
    [callApi, getCompanyId]
  );

  const getCategories = useCallback(async () => {
    try {
      const companyId = getCompanyId();
      if (!companyId) {
        return { success: false, data: [], message: 'No company ID available' };
      }

      const response = await callApi({
        url: API_ROUTES.PRODUCT_CATEGORIES.LIST,
        method: 'GET',
        query: {
          company_id: companyId,
          pagination: false, // Get all categories without pagination
        },
      });

      if (response.success) {
        let items = [];

        // Handle different response structures
        if (Array.isArray(response)) {
          items = response;
        } else if (Array.isArray(response.results)) {
          items = response.results;
        } else if (Array.isArray(response.data)) {
          items = response.data;
        } else if (response.results && typeof response.results === 'object') {
          items = Object.values(response.results);
        } else if (response.data && typeof response.data === 'object') {
          items = Object.values(response.data);
        } else {
          // Handle numeric keys spread by useApi
          const numericKeys = Object.keys(response).filter((key) => !isNaN(parseInt(key, 10)));
          if (numericKeys.length > 0) {
            items = numericKeys.map((key) => response[key]);
          }
        }

        return {
          success: true,
          data: items,
        };
      }

      return { success: false, data: [], message: 'Failed to fetch categories' };
    } catch (err) {
      console.error('Error fetching categories:', err);
      return {
        success: false,
        data: [],
        message: 'Failed to fetch categories',
        error: err.message,
      };
    }
  }, [callApi, getCompanyId]);

  const getPaymentModes = useCallback(
    async () => ({
      success: true,
      data: [], // No mock data - API only
    }),
    []
  );

  const getProductsByCategory = useCallback(
    async (categoryId, metalTypeId) => {
      try {
        const companyId = getCompanyId();
        if (!companyId) {
          return { success: false, data: [], message: 'No company ID available' };
        }

        const response = await callApi({
          url: API_ROUTES.PRODUCTS.LIST,
          method: 'GET',
          query: {
            company_id: companyId,
            category: categoryId,
            metal_type: metalTypeId,
            pagination: false, // Get all products without pagination
          },
        });

        if (response.success) {
          let items = [];

          // Handle different response structures
          if (Array.isArray(response)) {
            items = response;
          } else if (Array.isArray(response.results)) {
            items = response.results;
          } else if (Array.isArray(response.data)) {
            items = response.data;
          } else if (response.results && typeof response.results === 'object') {
            items = Object.values(response.results);
          } else if (response.data && typeof response.data === 'object') {
            items = Object.values(response.data);
          } else {
            // Handle numeric keys spread by useApi
            const numericKeys = Object.keys(response).filter((key) => !isNaN(parseInt(key, 10)));
            if (numericKeys.length > 0) {
              items = numericKeys.map((key) => response[key]);
            }
          }

          return {
            success: true,
            data: items,
          };
        }

        return { success: false, data: [], message: 'Failed to fetch products' };
      } catch (err) {
        console.error('Error fetching products:', err);
        return {
          success: false,
          data: [],
          message: 'Failed to fetch products',
          error: err.message,
        };
      }
    },
    [callApi, getCompanyId]
  );

  const getBillTypes = useCallback(
    async () => ({
      success: true,
      data: [], // No mock data - API only
    }),
    []
  );

  const getPlatinumCarats = useCallback(
    async () => ({
      success: true,
      data: [], // No mock data - API only
    }),
    []
  );

  const getTaxOptions = useCallback(
    async () => ({
      success: true,
      data: [], // No mock data - API only
    }),
    []
  );

  const getMetalTypes = useCallback(async () => {
    try {
      const companyId = getCompanyId();
      if (!companyId) {
        return { success: false, data: [], message: 'No company ID available' };
      }

      const response = await callApi({
        url: API_ROUTES.DIAMOND_DETAILS.METAL_TYPES.LIST,
        method: 'GET',
        query: {
          company_id: companyId,
          pagination: false, // Get all metal types
        },
      });

      if (response.success) {
        let items = [];

        // Handle different response structures
        if (Array.isArray(response)) {
          items = response;
        } else if (Array.isArray(response.results)) {
          items = response.results;
        } else if (Array.isArray(response.data)) {
          items = response.data;
        } else if (response.results && typeof response.results === 'object') {
          items = Object.values(response.results);
        } else if (response.data && typeof response.data === 'object') {
          items = Object.values(response.data);
        } else {
          // Handle numeric keys spread by useApi
          const numericKeys = Object.keys(response).filter((key) => !isNaN(parseInt(key, 10)));
          if (numericKeys.length > 0) {
            items = numericKeys.map((key) => response[key]);
          }
        }

        return {
          success: true,
          data: items,
        };
      }

      return { success: false, data: [], message: 'Failed to fetch metal types' };
    } catch (err) {
      console.error('Error fetching metal types:', err);
      return {
        success: false,
        data: [],
        message: 'Failed to fetch metal types',
        error: err.message,
      };
    }
  }, [callApi, getCompanyId]);

  // Get next purchase number
  const getNextPurchaseNumber = useCallback(async () => {
    try {
      const companyId = getCompanyId();
      if (!companyId) {
        throw new Error('No company ID available');
      }

      const response = await callApi({
        url: API_ROUTES.PURCHASE.PURCHASES.NEXT_NUMBER,
        method: 'GET',
        query: {
          company_id: companyId,
        },
      });

      if (response.success) {
        return {
          success: true,
          data: response,
          nextNumber: response.next_purchase_number,
        };
      }

      return {
        success: false,
        message: 'Failed to get next purchase number',
        error: response.message || 'Unknown error',
      };
    } catch (err) {
      console.error('Error:', err);
      console.error('Error getting next purchase number:', err);
      return {
        success: false,
        message: 'Failed to get next purchase number',
        error: err.message,
      };
    }
  }, [callApi, getCompanyId]);

  // New API functions for diamond details
  const getDiamondDetails = useCallback(
    async (filters = {}) => {
      try {
        const result = await diamondDetailsHook.fetchDiamondDetails(filters);
        return {
          success: true,
          data: result.items || [],
        };
      } catch (err) {
        console.error('Error:', err);
        return {
          success: false,
          message: 'Failed to fetch diamond details',
          error: err.message,
        };
      }
    },
    [diamondDetailsHook]
  );

  const createDiamondDetail = useCallback(
    async (diamondData) => {
      try {
        const result = await diamondDetailsHook.createDiamondDetail(diamondData);
        return {
          success: result.success,
          data: result.data,
          message: result.success
            ? 'Diamond detail created successfully'
            : 'Failed to create diamond detail',
        };
      } catch (err) {
        console.error('Error:', err);
        return {
          success: false,
          message: 'Failed to create diamond detail',
          error: err.message,
        };
      }
    },
    [diamondDetailsHook]
  );

  const updateDiamondDetail = useCallback(
    async (id, diamondData) => {
      try {
        const result = await diamondDetailsHook.updateDiamondDetail(id, diamondData);
        return {
          success: result.success,
          data: result.data,
          message: result.success
            ? 'Diamond detail updated successfully'
            : 'Failed to update diamond detail',
        };
      } catch (err) {
        console.error('Error:', err);
        return {
          success: false,
          message: 'Failed to update diamond detail',
          error: err.message,
        };
      }
    },
    [diamondDetailsHook]
  );

  const deleteDiamondDetail = useCallback(
    async (id) => {
      try {
        const result = await diamondDetailsHook.deleteDiamondDetail(id);
        return {
          success: result.success,
          message: result.success
            ? 'Diamond detail deleted successfully'
            : 'Failed to delete diamond detail',
        };
      } catch (err) {
        console.error('Error:', err);
        return {
          success: false,
          message: 'Failed to delete diamond detail',
          error: err.message,
        };
      }
    },
    [diamondDetailsHook]
  );

  // New API functions for less weight details
  const getLessWeightDetails = useCallback(
    async (filters = {}) => {
      try {
        const result = await lessWeightDetailsHook.fetchLessWeightDetails(filters);
        return {
          success: true,
          data: result.items || [],
        };
      } catch (err) {
        console.error('Error:', err);
        return {
          success: false,
          message: 'Failed to fetch less weight details',
          error: err.message,
        };
      }
    },
    [lessWeightDetailsHook]
  );

  const createLessWeightDetail = useCallback(
    async (lessWeightData) => {
      try {
        const result = await lessWeightDetailsHook.createLessWeightDetail(lessWeightData);
        return {
          success: result.success,
          data: result.data,
          message: result.success
            ? 'Less weight detail created successfully'
            : 'Failed to create less weight detail',
        };
      } catch (err) {
        console.error('Error:', err);
        return {
          success: false,
          message: 'Failed to create less weight detail',
          error: err.message,
        };
      }
    },
    [lessWeightDetailsHook]
  );

  const updateLessWeightDetail = useCallback(
    async (id, lessWeightData) => {
      try {
        const result = await lessWeightDetailsHook.updateLessWeightDetail(id, lessWeightData);
        return {
          success: result.success,
          data: result.data,
          message: result.success
            ? 'Less weight detail updated successfully'
            : 'Failed to update less weight detail',
        };
      } catch (err) {
        console.error('Error:', err);
        return {
          success: false,
          message: 'Failed to update less weight detail',
          error: err.message,
        };
      }
    },
    [lessWeightDetailsHook]
  );

  const deleteLessWeightDetail = useCallback(
    async (id) => {
      try {
        const result = await lessWeightDetailsHook.deleteLessWeightDetail(id);
        return {
          success: result.success,
          message: result.success
            ? 'Less weight detail deleted successfully'
            : 'Failed to delete less weight detail',
        };
      } catch (err) {
        console.error('Error:', err);
        return {
          success: false,
          message: 'Failed to delete less weight detail',
          error: err.message,
        };
      }
    },
    [lessWeightDetailsHook]
  );

  // Fetch Diamond Master Data (for dropdowns)
  const getDiamondMasterData = useCallback(async () => {
    try {
      const companyId = getCompanyId();
      if (!companyId) {
        return {
          success: false,
          message: 'Company ID not found',
        };
      }

      const [diamonds, shapes, sizeRanges, colours, certificates] = await Promise.allSettled([
        callApi({
          url: API_ROUTES.DIAMONDS.LIST,
          method: 'GET',
          query: { company_id: companyId, pagination: false },
        }),
        callApi({
          url: API_ROUTES.DIAMOND_DETAILS.SHAPE.LIST,
          method: 'GET',
          query: { company_id: companyId, pagination: false },
        }),
        callApi({
          url: API_ROUTES.DIAMOND_DETAILS.SIZE_RANGE.LIST,
          method: 'GET',
          query: { company_id: companyId, pagination: false },
        }),
        callApi({
          url: API_ROUTES.DIAMOND_DETAILS.COLOR.LIST,
          method: 'GET',
          query: { company_id: companyId, pagination: false },
        }),
        callApi({
          url: API_ROUTES.DIAMOND_DETAILS.CERTIFICATE_TYPE.LIST,
          method: 'GET',
          query: { company_id: companyId, pagination: false },
        }),
      ]);

      const extractData = (result) => {
        if (result.status !== 'fulfilled' || !result.value.success) return [];
        const data = result.value.data || result.value.results || result.value.items || [];
        return Array.isArray(data) ? data : [];
      };

      return {
        success: true,
        diamondColourClarity: extractData(diamonds),
        diamondShapes: extractData(shapes),
        diamondSizeRanges: extractData(sizeRanges),
        diamondColours: extractData(colours),
        diamondCertificateTypes: extractData(certificates),
      };
    } catch (err) {
      console.error('Error fetching diamond master data:', err);
      return {
        success: false,
        message: 'Failed to fetch diamond master data',
        error: err.message,
      };
    }
  }, [callApi, getCompanyId]);

  const getProductBaseMetalTypes = useCallback(
    async (productId) => {
      try {
        if (!productId) {
          return {
            success: false,
            data: [],
            message: 'Product ID is required',
          };
        }

        const companyId = getCompanyId();
        if (!companyId) {
          return {
            success: false,
            data: [],
            message: 'No company ID available',
          };
        }

        const response = await callApi({
          url: API_ROUTES.PRODUCTS.GET_BASE_METAL_TYPES(productId),
          method: 'GET',
          query: {
            company_id: companyId,
          },
        });

        if (response.success) {
          const responseData = response.data || response;

          return {
            success: true,
            data: responseData,
            base_metal_types: responseData.base_metal_types || [],
            metal_type: responseData.metal_type || null,
          };
        }

        return {
          success: false,
          data: [],
          base_metal_types: [],
          metal_type: null,
          message: 'Failed to fetch base metal types',
        };
      } catch (err) {
        console.error('Error fetching product base metal types:', err);
        return {
          success: false,
          data: [],
          message: 'Failed to fetch base metal types',
          error: err.message,
        };
      }
    },
    [callApi, getCompanyId]
  );

  return {
    loading: loading || diamondDetailsHook.loading || lessWeightDetailsHook.loading,
    error: error || diamondDetailsHook.error || lessWeightDetailsHook.error,
    purchases,
    // Purchase CRUD operations
    getPurchases,
    getPurchaseById,
    createPurchase,
    updatePurchase,
    deletePurchase,
    getNextPurchaseNumber,
    // Helper data fetchers
    getDealers,
    getDealerById,
    getCategories,
    getPaymentModes,
    getProductsByCategory,
    getBillTypes,
    getPlatinumCarats,
    getTaxOptions,
    getMetalTypes,
    getDiamondMasterData,
    getProductBaseMetalTypes,
    // Diamond Details API functions
    getDiamondDetails,
    createDiamondDetail,
    updateDiamondDetail,
    deleteDiamondDetail,
    // Less Weight Details API functions
    getLessWeightDetails,
    createLessWeightDetail,
    updateLessWeightDetail,
    deleteLessWeightDetail,
    // Direct access to hooks for advanced usage
    diamondDetailsHook,
    lessWeightDetailsHook,
  };
};
