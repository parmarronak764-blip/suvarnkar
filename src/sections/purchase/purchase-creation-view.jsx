import { useState, useEffect, useCallback, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Zod from 'zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Collapse from '@mui/material/Collapse';

import { paths } from 'src/routes/paths';
import { useRouter, useParams } from 'src/routes/hooks';

import { useSettingsContext } from 'src/components/settings';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Field, Form } from 'src/components/hook-form';

import { usePurchases } from 'src/hooks/usePurchases';
import { useMakingCharges } from 'src/hooks/useMakingCharges';
import { useLessTypes } from 'src/hooks/useLessTypes';

import { PurchaseProductTableDynamic } from './components/purchase-product-table-dynamic';
import { PurchasePaymentSection } from './components/purchase-payment-section';
import { useBoolean } from 'minimal-shared';

// ----------------------------------------------------------------------

// Zod Schemas matching API structure

const otherChargesSchema = Zod.object({
  charge_type: Zod.string().min(1, 'Charge type is required'),
  purchase_charges: Zod.string().optional().default('0'),
  sale_charges: Zod.string().optional().default('0'),
});

const lessWeightDetailsSchema = Zod.object({
  less_type: Zod.number().min(1, 'Less type is required'),
  charges_type: Zod.enum(['PCS', 'GRM']),
  pieces: Zod.number().min(0).optional().default(0),
  grams: Zod.string().optional().default('0'),
  tag_variation_type: Zod.enum(['LESS', 'ADD']),
  tag_variation: Zod.string().min(1, 'Tag variation is required'),
  tag_variation_grams: Zod.string().optional().default('0'),
  purchase_rate: Zod.string().min(1, 'Purchase rate is required'),
  sale_rate: Zod.string().min(1, 'Sale rate is required'),
  purchase_charges: Zod.string().optional().default('0'),
  sale_charges: Zod.string().optional().default('0'),
});

const makingChargesDetailsSchema = Zod.object({
  making_charges: Zod.number().min(1, 'Making charges is required'),
  making_charges_on: Zod.enum(['GROSS_WEIGHT', 'NET_WEIGHT']),
  weight: Zod.string().min(1, 'Weight is required'),
  charge_type: Zod.enum(['PER_GRAM', 'PERCENTAGE', 'TOTAL_AMOUNT']),
  purchase_labour_charge: Zod.string().min(1, 'Purchase labour charge is required'),
  percentage_value: Zod.string().optional().nullable(),
  total_amount_value: Zod.string().optional().nullable(),
  purchase_charges_amount: Zod.string().optional().default('0'),
  sale_value: Zod.string().optional().default('0'),
});

const itemDetailsSchema = Zod.object({
  metal_type: Zod.number().min(1, 'Metal type is required'),
  quantity: Zod.number().min(0).optional().default(0),
  gross_weight: Zod.string().min(1, 'Gross weight is required'),
  less_weight: Zod.string().optional().default('0'),
  net_weight: Zod.string().min(1, 'Net weight is required'),
  purity_touch: Zod.string().min(1, 'Purity touch is required'),
  purchase_wastage: Zod.string().min(1, 'Purchase wastage is required'),
  purchase_rate: Zod.string().optional().nullable(),
  purchase_mrp: Zod.string().optional().nullable(),
  sale_mrp: Zod.string().optional().nullable(),
  pure_weight: Zod.string().optional().default('0'),
  other_charges: Zod.string().optional().default('0'),
  purchase_making_charges: Zod.string().optional().default('0'),
  purchase_total_amount: Zod.string().optional().default('0'),
  other_charges_details: Zod.array(otherChargesSchema).optional().default([]),
  making_charges_details: Zod.array(makingChargesDetailsSchema).optional().default([]),
  less_weight_details: Zod.array(lessWeightDetailsSchema).optional().default([]),
});

const diamondDetailsSchema = Zod.object({
  diamond_colour_clarity: Zod.number().min(1, 'Diamond colour clarity is required'),
  diamond_size_range: Zod.number().min(1, 'Diamond size range is required'),
  diamond_colour: Zod.number().min(1, 'Diamond colour is required'),
  diamond_certificate: Zod.number().min(1, 'Diamond certificate is required'),
  diamond_piece: Zod.number().min(0).optional().default(0),
  diamond_weight: Zod.string().min(1, 'Diamond weight is required'),
  certificate_number: Zod.string().optional().nullable(),
  diamond_purchase_rate: Zod.string().min(1, 'Diamond purchase rate is required'),
  diamond_sale_rate: Zod.string().min(1, 'Diamond sale rate is required'),
  purchase_amount: Zod.string().optional().default('0'),
  sale_amount: Zod.string().optional().default('0'),
});

const otherTagDetailsSchema = Zod.object({
  remarks: Zod.string().optional().nullable(),
  design_code: Zod.string().max(100).optional().nullable(),
  certificate_number: Zod.string().max(100).optional().nullable(),
  huid_1: Zod.string().max(100).optional().nullable(),
  huid_2: Zod.string().max(100).optional().nullable(),
  huid_3: Zod.string().max(100).optional().nullable(),
  gram_option_1: Zod.string().optional().nullable(),
  gram_option_2: Zod.string().optional().nullable(),
});

const purchaseItemSchema = Zod.object({
  description: Zod.string().min(1, 'Description is required'),
  product_type: Zod.number().min(1, 'Product type is required'),
  total_other_charges: Zod.string().optional().default('0'),
  total_making_charges: Zod.string().optional().default('0'),
  total_purchase_amount: Zod.string().optional().default('0'),
  item_details: Zod.array(itemDetailsSchema).min(1, 'At least one item detail is required'),
  diamond_details: Zod.array(diamondDetailsSchema).optional().default([]),
  other_tag_details: Zod.array(otherTagDetailsSchema).optional().default([]),
});

const purchaseSchema = Zod.object({
  company: Zod.number().min(1, 'Company is required'),
  dealer: Zod.number().min(1, 'Dealer is required'),
  bill_metal_type: Zod.number().min(1, 'Bill metal type is required'),
  bill_date: Zod.string().min(1, 'Bill date is required'),
  bill_number: Zod.string().min(1).max(100, 'Bill number is required'),
  tag_selected: Zod.enum(['TAG', 'NON_TAG']).default('TAG'),
  payment_mode: Zod.number().min(1, 'Payment mode is required'),
  purchase_items: Zod.array(purchaseItemSchema).min(1, 'At least one purchase item is required'),
});

// ----------------------------------------------------------------------

export function PurchaseCreationView() {
  const router = useRouter();
  const params = useParams();
  const purchaseId = params?.id ? parseInt(params.id, 10) : null;
  const isEditMode = !!purchaseId;

  const {
    createPurchase,
    updatePurchase,
    getPurchaseById,
    loading,
    getDealers,
    getCategories,
    getNextPurchaseNumber,
    getMetalTypes,
    getProductsByCategory,
    getDiamondMasterData,
    getProductBaseMetalTypes,
  } = usePurchases();

  const { fetchItems: fetchMakingCharges } = useMakingCharges();
  const { fetchItems: fetchLessTypes } = useLessTypes();

  const [selectedDealer, setSelectedDealer] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const productsRef = useRef(products);
  const showDealerDetails = useBoolean(false);
  const [totals, setTotals] = useState({
    totalGoldPcs: 0,
    totalGrossWeight: 0,
    totalLessWeight: 0,
    totalNetWeight: 0,
    totalPureWeight: 0,
    totalOtherCharges: 0,
    totalMakingCharges: 0,
    totalGoldAmount: 0,
    totalPlatNetWeight: 0,
    totalPlatAmount: 0,
    totalDiamondPcs: 0,
    totalDiamondWeight: 0,
    totalDiamondAmount: 0,
    totalDiamondSaleAmount: 0,
    tcs: '0.10%',
  });

  // API data state
  const [apiData, setApiData] = useState({
    dealers: [],
    categories: [],
    paymentModes: [],
    billTypes: [],
    platinumCarats: [],
    taxOptions: [],
    diamondDetails: [],
    lessWeightDetails: [],
    metalTypes: [],
    products: [], // Sub type products for selected category
    diamondColourClarity: [], // Diamond Colour/Clarity (from diamonds API)
    diamondShapes: [], // Diamond Shapes
    diamondSizeRanges: [], // Diamond Size Ranges
    diamondColours: [], // Diamond Colours
    diamondCertificateTypes: [], // Diamond Certificate Types
    makingCharges: [], // Making Charges Master
    lessTypes: [], // Less Types Master
  });

  // Display data
  const [nextPurchaseNumber, setNextPurchaseNumber] = useState('');
  const [apiLoading, setApiLoading] = useState(false);
  const [isLoadingPurchase, setIsLoadingPurchase] = useState(false);

  // Show loading indicator when API data is being fetched
  const isLoading = loading || apiLoading || isLoadingPurchase;

  // Internal form schema for UI (user-friendly field names)
  const internalFormSchema = Zod.object({
    generalDetails: Zod.object({
      dealerId: Zod.number().min(1, 'Dealer is required'),
      category: Zod.number().min(1, 'Category is required'),
      billDate: Zod.string().min(1, 'Bill date is required'),
      billNo: Zod.string().min(1).max(100, 'Bill number is required'),
      billMetalType: Zod.number().min(1, 'Metal type is required'),
      tagSelected: Zod.enum(['TAG', 'NON_TAG']).default('TAG'),
      productsToEnter: Zod.number().min(1).max(50).default(10),
    }),
    products: Zod.array(Zod.any()).min(1, 'At least one product is required'),
  });

  const methods = useForm({
    resolver: zodResolver(internalFormSchema),
    defaultValues: {
      generalDetails: {
        dealerId: '',
        category: '',
        billDate: new Date().toISOString().split('T')[0],
        billNo: '',
        billMetalType: '',
        tagSelected: 'TAG',
        productsToEnter: 10,
      },
      products: [],
      payment: {
        paymentMode: null,
        totalPaidAmount: '',
        roundOffAmount: '',
        totalPurchaseAmount: '0',
        totalAmount: '0',
        pendingAmount: '0',
        note: '',
      },
    },
  });

  const {
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = methods;

  const watchedCategory = watch('generalDetails.category');
  const watchedDealer = watch('generalDetails.dealerId');
  const watchedProductsToEnter = watch('generalDetails.productsToEnter');

  // Fetch API data on component mount
  useEffect(() => {
    const fetchApiData = async () => {
      setApiLoading(true);
      try {
        const [
          dealersResult,
          categoriesResult,
          metalTypesResult,
          nextNumberResult,
          diamondMasterResult,
          makingChargesResult,
          lessTypesResult,
        ] = await Promise.allSettled([
          getDealers(),
          getCategories(),
          getMetalTypes(),
          getNextPurchaseNumber(),
          getDiamondMasterData(),
          fetchMakingCharges(1, 1000), // Fetch all making charges
          fetchLessTypes(1, 1000), // Fetch all less types
        ]);

        const dealers =
          dealersResult.status === 'fulfilled' && dealersResult.value.success
            ? dealersResult.value.data || dealersResult.value.items || []
            : [];

        const categories =
          categoriesResult.status === 'fulfilled' && categoriesResult.value.success
            ? categoriesResult.value.data || []
            : [];

        const metalTypes =
          metalTypesResult.status === 'fulfilled' && metalTypesResult.value.success
            ? metalTypesResult.value.data || []
            : [];

        const diamondMaster =
          diamondMasterResult.status === 'fulfilled' && diamondMasterResult.value.success
            ? diamondMasterResult.value
            : {
                diamondColourClarity: [],
                diamondShapes: [],
                diamondSizeRanges: [],
                diamondColours: [],
                diamondCertificateTypes: [],
              };

        const makingCharges =
          makingChargesResult.status === 'fulfilled' && Array.isArray(makingChargesResult.value)
            ? makingChargesResult.value
            : [];

        const lessTypes =
          lessTypesResult.status === 'fulfilled' && lessTypesResult.value.items
            ? lessTypesResult.value.items
            : [];

        setApiData({
          dealers,
          categories,
          metalTypes,
          products: [],
          paymentModes: [],
          billTypes: [],
          platinumCarats: [],
          taxOptions: [],
          diamondDetails: [],
          lessWeightDetails: [],
          diamondColourClarity: diamondMaster.diamondColourClarity || [],
          diamondShapes: diamondMaster.diamondShapes || [],
          diamondSizeRanges: diamondMaster.diamondSizeRanges || [],
          diamondColours: diamondMaster.diamondColours || [],
          diamondCertificateTypes: diamondMaster.diamondCertificateTypes || [],
          makingCharges,
          lessTypes,
        });

        // Set the purchase number - handle nested data structure
        if (nextNumberResult.status === 'fulfilled' && nextNumberResult.value.success) {
          // Extract purchase number from nested structure
          const purchaseNumber =
            nextNumberResult.value.data?.data?.next_purchase_number ||
            nextNumberResult.value.data?.next_purchase_number ||
            nextNumberResult.value.next_purchase_number ||
            '';
          setNextPurchaseNumber(purchaseNumber);
        }
      } catch (error) {
        console.error('Error fetching API data:', error);
        toast.error('Failed to load some data. Using default values.');
      } finally {
        setApiLoading(false);
      }
    };

    fetchApiData();
  }, [
    getDealers,
    getCategories,
    getMetalTypes,
    getNextPurchaseNumber,
    getDiamondMasterData,
    fetchMakingCharges,
    fetchLessTypes,
    setValue,
  ]);

  // Track previous category and productsToEnter to detect changes
  const prevCategoryRef = useRef(null);
  const prevProductsToEnterRef = useRef(null);

  // Transform API response to form format
  const transformPurchaseDataToForm = useCallback((purchaseData) => {
    if (!purchaseData) return null;

    // Transform purchase_items to products format
    const transformedProducts = [];
    let productIndex = 1;

    purchaseData.purchase_items?.forEach((item) => {
      // Find gold item detail (first item_detail with metal_type_name === "Gold")
      const goldItemDetail = item.item_details?.find((detail) => detail.metal_type_name === 'Gold');
      // Find platinum item detail (first item_detail with metal_type_name === "Platinum")
      const platinumItemDetail = item.item_details?.find(
        (detail) => detail.metal_type_name === 'Platinum'
      );
      if (goldItemDetail) {
        // Create gold product row
        const goldProduct = {
          id: productIndex,
          srNo: productIndex,
          description: item.description || '',
          subType: item.product_type_name || '',
          subTypeId: item.product_type ? Number(item.product_type) : null,
          productType: purchaseData.bill_metal_type || null,
          pcs: goldItemDetail.quantity || 1,
          grossWeight: parseFloat(goldItemDetail.gross_weight) || 0,
          lessWeight: parseFloat(goldItemDetail.less_weight) || 0,
          netWeight: parseFloat(goldItemDetail.net_weight) || 0,
          touch: parseFloat(goldItemDetail.purity_touch) || '',
          purity: parseFloat(goldItemDetail.purity_touch) || 0,
          wastagePercent: parseFloat(goldItemDetail.purchase_wastage) || 0,
          wastage: parseFloat(goldItemDetail.purchase_wastage) || 0,
          totalPureWeight: parseFloat(goldItemDetail.pure_weight) || 0,
          pureWeight: parseFloat(goldItemDetail.pure_weight) || 0,
          purchaseRate: parseFloat(goldItemDetail.purchase_rate) || 0,
          purchaseMrp: goldItemDetail.purchase_mrp ? parseFloat(goldItemDetail.purchase_mrp) : null,
          saleMrp: goldItemDetail.sale_mrp ? parseFloat(goldItemDetail.sale_mrp) : null,
          labourRate: parseFloat(goldItemDetail.purchase_making_charges) || 0,
          makingCharges: parseFloat(goldItemDetail.purchase_making_charges) || 0,
          otherCharges: parseFloat(goldItemDetail.other_charges) || 0,
          amount: parseFloat(goldItemDetail.purchase_total_amount) || 0,
          isPlatinumRow: false,
          platinumNetWeight: platinumItemDetail
            ? parseFloat(platinumItemDetail.net_weight) || 0
            : 0,
          lessWeightDetails:
            item.less_weight_details?.map((lw) => ({
              less_type: lw.less_type,
              less_type_name: lw.less_type_name || '',
              charges_type: lw.charges_type,
              pieces: lw.pieces || 0,
              grams: String(lw.grams || 0),
              tag_variation_type: lw.tag_variation_type,
              tag_variation: String(lw.tag_variation || 0),
              tag_variation_grams: String(lw.tag_variation_grams || 0),
              purchase_rate: String(lw.purchase_rate || 0),
              sale_rate: String(lw.sale_rate || 0),
              purchase_charges: String(lw.purchase_charges || 0),
              sale_charges: String(lw.sale_charges || 0),
            })) || [],
          makingChargesDetails:
            item.making_charges_details?.map((mc) => ({
              making_charges: mc.making_charges,
              making_charges_name: mc.making_charges_name || '',
              making_charges_code: mc.making_charges_code || '',
              making_charges_on: mc.making_charges_on,
              weight: String(mc.weight || 0),
              charge_type: mc.charge_type,
              purchase_labour_charge: String(mc.purchase_labour_charge || 0),
              percentage_value: mc.percentage_value ? String(mc.percentage_value) : null,
              total_amount_value: mc.total_amount_value ? String(mc.total_amount_value) : null,
              purchase_charges_amount: String(mc.purchase_charges_amount || 0),
              sale_value: String(mc.sale_value || 0),
            })) || [],
          otherChargesDetails:
            item.other_charges_details?.map((oc) => ({
              charge_type: oc.charge_type || '',
              purchase_charges: String(oc.purchase_charges || 0),
              sale_charges: String(oc.sale_charges || 0),
            })) || [],
          diamondDetails:
            item.diamond_details?.map((dd) => ({
              id: Date.now() + Math.random(),
              diamond_colour_clarity: dd.diamond_colour_clarity || '',
              diamond_size_range: dd.diamond_size_range || '',
              diamond_colour: dd.diamond_colour || '',
              diamond_certificate: dd.diamond_certificate || '',
              diamond_piece:
                dd.diamond_piece === 0 || dd.diamond_piece === '0'
                  ? ''
                  : String(dd.diamond_piece || ''),
              diamond_weight:
                dd.diamond_weight === '0' || dd.diamond_weight === 0
                  ? ''
                  : String(dd.diamond_weight || ''),
              certificate_number: dd.certificate_number || '',
              diamond_purchase_rate:
                dd.diamond_purchase_rate === '0' || dd.diamond_purchase_rate === 0
                  ? ''
                  : String(dd.diamond_purchase_rate || ''),
              diamond_sale_rate:
                dd.diamond_sale_rate === '0' || dd.diamond_sale_rate === 0
                  ? ''
                  : String(dd.diamond_sale_rate || ''),
              purchase_amount: String(dd.purchase_amount || 0),
              sale_amount: String(dd.sale_amount || 0),
            })) || [],
          otherTagDetails: item.other_tag_details?.[0] || null,
        };
        transformedProducts.push(goldProduct);

        // Add platinum row if exists
        if (platinumItemDetail) {
          transformedProducts.push({
            id: `platinum-${productIndex}`,
            srNo: productIndex,
            description: 'PLATINUM',
            subType: '',
            subTypeId: null,
            productType: purchaseData.bill_metal_type || null,
            pcs: platinumItemDetail.quantity || 1,
            grossWeight: 0,
            lessWeight: 0,
            netWeight: parseFloat(platinumItemDetail.net_weight) || '',
            touch: parseFloat(platinumItemDetail.purity_touch) || '',
            purity: parseFloat(platinumItemDetail.purity_touch) || 0,
            wastagePercent: parseFloat(platinumItemDetail.purchase_wastage) || 0,
            wastage: parseFloat(platinumItemDetail.purchase_wastage) || 0,
            totalPureWeight: parseFloat(platinumItemDetail.pure_weight) || 0,
            pureWeight: parseFloat(platinumItemDetail.pure_weight) || 0,
            purchaseRate: parseFloat(platinumItemDetail.purchase_rate) || 0,
            purchaseMrp: platinumItemDetail.purchase_mrp
              ? parseFloat(platinumItemDetail.purchase_mrp)
              : null,
            saleMrp: platinumItemDetail.sale_mrp ? parseFloat(platinumItemDetail.sale_mrp) : null,
            labourRate: parseFloat(platinumItemDetail.purchase_making_charges) || 0,
            makingCharges: parseFloat(platinumItemDetail.purchase_making_charges) || 0,
            otherCharges: parseFloat(platinumItemDetail.other_charges) || 0,
            amount: parseFloat(platinumItemDetail.purchase_total_amount) || 0,
            isPlatinumRow: true,
            parentProductId: productIndex,
            lessWeightDetails:
              platinumItemDetail.less_weight_details?.map((lw) => ({
                less_type: lw.less_type,
                less_type_name: lw.less_type_name || '',
                charges_type: lw.charges_type,
                pieces: lw.pieces || 0,
                grams: String(lw.grams || 0),
                tag_variation_type: lw.tag_variation_type,
                tag_variation: String(lw.tag_variation || 0),
                tag_variation_grams: String(lw.tag_variation_grams || 0),
                purchase_rate: String(lw.purchase_rate || 0),
                sale_rate: String(lw.sale_rate || 0),
                purchase_charges: String(lw.purchase_charges || 0),
                sale_charges: String(lw.sale_charges || 0),
              })) || [],
            makingChargesDetails:
              platinumItemDetail.making_charges_details?.map((mc) => ({
                making_charges: mc.making_charges,
                making_charges_name: mc.making_charges_name || '',
                making_charges_code: mc.making_charges_code || '',
                making_charges_on: mc.making_charges_on,
                weight: String(mc.weight || 0),
                charge_type: mc.charge_type,
                purchase_labour_charge: String(mc.purchase_labour_charge || 0),
                percentage_value: mc.percentage_value ? String(mc.percentage_value) : null,
                total_amount_value: mc.total_amount_value ? String(mc.total_amount_value) : null,
                purchase_charges_amount: String(mc.purchase_charges_amount || 0),
                sale_value: String(mc.sale_value || 0),
              })) || [],
            otherChargesDetails:
              platinumItemDetail.other_charges_details?.map((oc) => ({
                charge_type: oc.charge_type || '',
                purchase_charges: String(oc.purchase_charges || 0),
                sale_charges: String(oc.sale_charges || 0),
              })) || [],
            diamondDetails: [],
            otherTagDetails: null,
          });
        }

        productIndex++;
      }
    });

    return {
      generalDetails: {
        dealerId: purchaseData.dealer || '',
        // category: purchaseData.bill_metal_type || '', // Removed as it's not getting from API
        billDate: purchaseData.bill_date || new Date().toISOString().split('T')[0],
        billNo: purchaseData.bill_number || '',
        billMetalType: purchaseData.bill_metal_type || '',
        tagSelected: purchaseData.tag_selected || 'TAG',
        productsToEnter: transformedProducts.filter((p) => !p.isPlatinumRow).length || 10,
      },
      products: transformedProducts,
      payment: {
        paymentMode: purchaseData.payment_mode || null,
        totalPaidAmount:
          purchaseData.total_paid_amount === '0' || purchaseData.total_paid_amount === 0
            ? ''
            : String(purchaseData.total_paid_amount || ''),
        roundOffAmount:
          purchaseData.round_off_amount === '0' || purchaseData.round_off_amount === 0
            ? ''
            : String(purchaseData.round_off_amount || ''),
        totalPurchaseAmount: String(purchaseData.total_purchase_amount || '0'),
        totalAmount: String(purchaseData.final_purchase_amount || '0'),
        pendingAmount: String(purchaseData.pending_amount || '0'),
        note: purchaseData.note || '',
      },
    };
  }, []);

  // Load purchase data when in edit mode
  useEffect(() => {
    const loadPurchaseData = async () => {
      if (!isEditMode || !purchaseId) return;
      setIsLoadingPurchase(true);
      try {
        const result = await getPurchaseById(purchaseId);
        if (result.success && result.data) {
          const formData = transformPurchaseDataToForm(result.data);
          if (formData) {
            // Set form values
            setValue('generalDetails', formData.generalDetails);
            setValue('payment', formData.payment);

            // Set products
            setProducts(formData.products);
            productsRef.current = formData.products;

            // Set selected dealer and category
            const dealer = apiData.dealers.find((d) => d.id === formData.generalDetails.dealerId);
            if (dealer) setSelectedDealer(dealer);
            // debugger;
            const category = apiData.categories.find(
              (c) => c.metal_type === formData.generalDetails.billMetalType
            );
            if (category) {
              setValue('generalDetails.category', category.id);
              // Set selected category
              setSelectedCategory(category);
              //  Set products Totals
              handleProductsChange(formData.products);

              // Fetch products for this category so they're available in dropdowns
              if (category?.id && category?.metal_type) {
                const productsResult = await getProductsByCategory(
                  category.id,
                  category.metal_type
                );
                if (productsResult.success) {
                  setApiData((prev) => ({ ...prev, products: productsResult.data || [] }));
                }
              }
            }

            // Set purchase number
            if (result.data.purchase_number) {
              setNextPurchaseNumber(result.data.purchase_number);
            }
          }
        } else {
          toast.error(result.message || 'Failed to load purchase data');
          router.push(paths.purchase.list);
        }
      } catch (error) {
        console.error('Error loading purchase:', error);
        toast.error('Failed to load purchase data');
        router.push(paths.purchase.list);
      } finally {
        setIsLoadingPurchase(false);
      }
    };

    // Wait for API data to be loaded before loading purchase data
    if (apiData.dealers.length > 0 && apiData.categories.length > 0) {
      loadPurchaseData();
    }
  }, [
    isEditMode,
    purchaseId,
    getPurchaseById,
    transformPurchaseDataToForm,
    apiData.dealers,
    apiData.categories,
    getProductsByCategory,
    setValue,
    router,
  ]);

  // Helper function to create initial products
  const createInitialProducts = useCallback((category, rowCount) => {
    if (!category) return [];

    const metalTypeName = (category?.metal_type_name || '').toUpperCase();
    const hasPlatinum = metalTypeName.includes('PLATINUM') && metalTypeName.includes('GOLD');
    const initialProducts = [];

    // Create regular product rows
    for (let i = 0; i < rowCount; i++) {
      const productIndex = i + 1;
      initialProducts.push({
        id: productIndex,
        srNo: productIndex,
        description: '',
        subType: '',
        subTypeId: null,
        productType: category?.id,
        pcs: 1,
        grossWeight: 0,
        lessWeight: 0,
        netWeight: 0,
        touch: '',
        purity: 0,
        wastagePercent: 0,
        wastage: 0,
        totalPureWeight: 0,
        pureWeight: 0,
        purchaseRate: 0,
        purchaseMrp: null,
        saleMrp: null,
        labourRate: 0,
        makingCharges: 0,
        otherCharges: 0,
        amount: 0,
        isPlatinumRow: false,
        platinumNetWeight: 0, // Store platinum net weight for less weight calculation
        // Arrays for details
        lessWeightDetails: [],
        makingChargesDetails: [],
        otherChargesDetails: [],
        diamondDetails: [],
        otherTagDetails: null,
      });

      // Add platinum row after each product if category has platinum
      if (hasPlatinum) {
        initialProducts.push({
          id: `platinum-${productIndex}`,
          srNo: productIndex, // Same sr no as parent product
          description: 'PLATINUM',
          subType: '',
          subTypeId: null,
          productType: category?.id,
          pcs: 1,
          grossWeight: 0,
          lessWeight: 0, // This will be platinum net weight
          netWeight: 0,
          touch: '',
          purity: 0,
          wastagePercent: 0,
          wastage: 0,
          totalPureWeight: 0,
          pureWeight: 0,
          purchaseRate: 0,
          purchaseMrp: null,
          saleMrp: null,
          labourRate: 0,
          makingCharges: 0,
          otherCharges: 0,
          amount: 0,
          isPlatinumRow: true,
          parentProductId: productIndex, // Reference to parent product
          // Arrays for details
          lessWeightDetails: [],
          makingChargesDetails: [],
          otherChargesDetails: [],
          diamondDetails: [],
          otherTagDetails: null,
        });
      }
    }

    return initialProducts;
  }, []);

  // Initialize products when category changes
  useEffect(() => {
    if (watchedCategory) {
      const category = apiData.categories.find(
        (cat) => cat.id === watchedCategory || cat.value === watchedCategory
      );

      // Check if category changed
      const categoryChanged = prevCategoryRef.current !== watchedCategory;
      prevCategoryRef.current = watchedCategory;

      if (!category) return; // Category not found yet

      setSelectedCategory(category);
      // Set bill_metal_type from category's metal_type
      if (category?.metal_type) {
        setValue('generalDetails.billMetalType', category.metal_type);
      }

      // Fetch products for this category and metal type
      const fetchProducts = async () => {
        if (category?.id && category?.metal_type) {
          const result = await getProductsByCategory(category.id, category.metal_type);
          if (result.success) {
            setApiData((prev) => ({ ...prev, products: result.data || [] }));
          }
        }
      };

      fetchProducts();

      // Initialize products if category changed
      if (categoryChanged) {
        const rowCount = watchedProductsToEnter || 10;
        const initialProducts = createInitialProducts(category, rowCount);

        // Ensure correct order and no duplicates: product1, platinum1, product2, platinum2, etc.
        const orderedProducts = [];
        const processedPlatinumIds = new Set(); // Track which platinum rows we've already added

        // Get all regular products sorted by ID
        const regularProducts = initialProducts
          .filter((p) => !p.isPlatinumRow)
          .sort((a, b) => {
            const idA = typeof a.id === 'number' ? a.id : parseInt(a.id) || 0;
            const idB = typeof b.id === 'number' ? b.id : parseInt(b.id) || 0;
            return idA - idB;
          });

        // Add products in correct order: product, then its platinum row
        regularProducts.forEach((product) => {
          orderedProducts.push(product);
          // Find and add its platinum row immediately after (only once)
          const platinumRow = initialProducts.find(
            (p) =>
              p.isPlatinumRow && p.parentProductId === product.id && !processedPlatinumIds.has(p.id)
          );
          if (platinumRow) {
            orderedProducts.push(platinumRow);
            processedPlatinumIds.add(platinumRow.id);
          }
        });

        setProducts(orderedProducts);
        productsRef.current = orderedProducts; // Keep ref in sync
        setValue('products', orderedProducts);
        prevProductsToEnterRef.current = rowCount;
      }
    }
  }, [
    watchedCategory,
    watchedProductsToEnter,
    apiData.categories,
    setValue,
    getProductsByCategory,
    createInitialProducts,
  ]);

  // Update product count when productsToEnter changes (but category hasn't changed)
  useEffect(() => {
    if (watchedCategory && selectedCategory) {
      const rowCount = Number(watchedProductsToEnter) || 10;
      const prevCount = prevProductsToEnterRef.current;
      const productsToEnterChanged = prevCount !== rowCount && prevCount !== null;

      // Only update if count changed AND category hasn't changed
      if (productsToEnterChanged && prevCategoryRef.current === watchedCategory) {
        const currentProducts = products || [];
        const currentRegularProducts = currentProducts.filter((p) => !p.isPlatinumRow);
        const currentCount = currentRegularProducts.length;

        if (rowCount > currentCount) {
          // Add more rows - preserve existing data and maintain order
          const metalTypeName = (selectedCategory?.metal_type_name || '').toUpperCase();
          const hasPlatinum = metalTypeName.includes('PLATINUM') && metalTypeName.includes('GOLD');

          // Rebuild products array in correct order: product1, platinum1, product2, platinum2, etc.
          const orderedProducts = [];
          const processedPlatinumIds = new Set();

          // Get all existing regular products sorted by ID
          const existingRegularProducts = currentProducts
            .filter((p) => !p.isPlatinumRow)
            .sort((a, b) => {
              const idA = typeof a.id === 'number' ? a.id : parseInt(a.id) || 0;
              const idB = typeof b.id === 'number' ? b.id : parseInt(b.id) || 0;
              return idA - idB;
            });

          // Add existing products in correct order
          existingRegularProducts.forEach((product) => {
            orderedProducts.push(product);
            // Find and add its platinum row immediately after
            const platinumRow = currentProducts.find(
              (p) =>
                p.isPlatinumRow &&
                p.parentProductId === product.id &&
                !processedPlatinumIds.has(p.id)
            );
            if (platinumRow) {
              orderedProducts.push(platinumRow);
              processedPlatinumIds.add(platinumRow.id);
            }
          });

          // Add new regular product rows with their platinum rows
          for (let i = currentCount; i < rowCount; i++) {
            const productIndex = i + 1;
            orderedProducts.push({
              id: productIndex,
              srNo: productIndex,
              description: '',
              subType: '',
              subTypeId: null,
              productType: selectedCategory?.id,
              pcs: 1,
              grossWeight: 0,
              lessWeight: 0,
              netWeight: 0,
              touch: '',
              purity: 0,
              wastagePercent: 0,
              wastage: 0,
              totalPureWeight: 0,
              pureWeight: 0,
              purchaseRate: 0,
              purchaseMrp: null,
              saleMrp: null,
              labourRate: 0,
              makingCharges: 0,
              otherCharges: 0,
              amount: 0,
              isPlatinumRow: false,
              platinumNetWeight: 0,
              lessWeightDetails: [],
              makingChargesDetails: [],
              otherChargesDetails: [],
              diamondDetails: [],
              otherTagDetails: null,
            });

            // Add platinum row immediately after if needed
            if (hasPlatinum) {
              orderedProducts.push({
                id: `platinum-${productIndex}`,
                srNo: productIndex,
                description: 'PLATINUM',
                subType: '',
                subTypeId: null,
                productType: selectedCategory?.id,
                pcs: 1,
                grossWeight: 0,
                lessWeight: 0,
                netWeight: '',
                touch: '',
                purity: 0,
                wastagePercent: 0,
                wastage: 0,
                totalPureWeight: 0,
                pureWeight: 0,
                purchaseRate: 0,
                purchaseMrp: null,
                saleMrp: null,
                labourRate: 0,
                makingCharges: 0,
                otherCharges: 0,
                amount: 0,
                isPlatinumRow: true,
                parentProductId: productIndex,
                lessWeightDetails: [],
                makingChargesDetails: [],
                otherChargesDetails: [],
                diamondDetails: [],
                otherTagDetails: null,
              });
            }
          }

          setProducts(orderedProducts);
          productsRef.current = orderedProducts;
          setValue('products', orderedProducts);
        } else if (rowCount < currentCount) {
          // Remove excess rows - maintain order: product, platinum, product, platinum
          const regularProducts = currentProducts
            .filter((p) => !p.isPlatinumRow)
            .sort((a, b) => {
              const idA = typeof a.id === 'number' ? a.id : parseInt(a.id) || 0;
              const idB = typeof b.id === 'number' ? b.id : parseInt(b.id) || 0;
              return idA - idB;
            });
          const platinumProducts = currentProducts.filter((p) => p.isPlatinumRow);

          const productsToKeep = regularProducts.slice(0, rowCount);
          const platinumToKeep = platinumProducts.filter((p) =>
            productsToKeep.some((rp) => rp.id === p.parentProductId)
          );

          // Rebuild in correct order: product1, platinum1, product2, platinum2, etc.
          const orderedProducts = [];
          productsToKeep.forEach((product) => {
            orderedProducts.push(product);
            const platinumRow = platinumToKeep.find((p) => p.parentProductId === product.id);
            if (platinumRow) {
              orderedProducts.push(platinumRow);
            }
          });

          setProducts(orderedProducts);
          productsRef.current = orderedProducts;
          setValue('products', orderedProducts);
        }
        prevProductsToEnterRef.current = rowCount;
      }
    }
  }, [watchedProductsToEnter, watchedCategory, selectedCategory, products, setValue]);

  // Keep productsRef in sync with products state
  useEffect(() => {
    productsRef.current = products;
  }, [products]);

  // Update dealer info when dealer changes
  useEffect(() => {
    if (watchedDealer) {
      const dealer = apiData.dealers.find((d) => d.id === parseInt(watchedDealer, 10));
      setSelectedDealer(dealer);
    } else {
      // Clear dealer details when deselected
      setSelectedDealer(null);
    }
  }, [watchedDealer, apiData.dealers]);

  const handleProductsChange = useCallback(
    (updatedProductsOrUpdater) => {
      // debugger;
      // Support both direct array and functional update (like React setState)
      const updatedProducts =
        typeof updatedProductsOrUpdater === 'function'
          ? updatedProductsOrUpdater(products)
          : updatedProductsOrUpdater;

      // Ensure it's an array
      if (!Array.isArray(updatedProducts)) {
        return;
      }

      setProducts(updatedProducts);
      productsRef.current = updatedProducts; // Keep ref in sync
      setValue('products', updatedProducts);

      // Calculate totals
      const newTotals = calculateTotals(updatedProducts);
      setTotals(newTotals);

      // Update grand total in form
      const grandTotal =
        newTotals.totalGoldAmount + newTotals.totalPlatAmount + newTotals.totalDiamondAmount;
      setValue('payment.totalAmount', grandTotal);
      setValue('grandTotal', grandTotal);
    },
    [setValue, products]
  );

  const handleAddProductRow = useCallback(() => {
    if (!selectedCategory) {
      toast.error('Please select a category first');
      return;
    }

    const metalTypeName = (selectedCategory?.metal_type_name || '').toUpperCase();
    const hasPlatinum = metalTypeName.includes('PLATINUM') && metalTypeName.includes('GOLD');

    // Find the maximum numeric ID from regular products (not platinum rows)
    const regularProducts = products.filter((p) => !p.isPlatinumRow);
    const maxId =
      regularProducts.length > 0
        ? Math.max(...regularProducts.map((p) => (typeof p.id === 'number' ? p.id : 0)))
        : 0;

    const newProductId = maxId + 1;
    const newSrNo = regularProducts.length + 1;

    const newProduct = {
      id: newProductId,
      srNo: newSrNo,
      description: '',
      subType: '',
      subTypeId: null,
      productType: selectedCategory?.id,
      pcs: 1,
      grossWeight: 0,
      lessWeight: 0,
      netWeight: 0,
      touch: '',
      purity: 0,
      wastagePercent: 0,
      wastage: 0,
      totalPureWeight: 0,
      pureWeight: 0,
      purchaseRate: 0,
      purchaseMrp: null,
      saleMrp: null,
      labourRate: 0,
      makingCharges: 0,
      otherCharges: 0,
      amount: 0,
      isPlatinumRow: false,
      platinumNetWeight: 0,
      // Arrays for details
      lessWeightDetails: [],
      makingChargesDetails: [],
      otherChargesDetails: [],
      diamondDetails: [],
      otherTagDetails: null,
    };

    // Build updated products array maintaining order: product1, platinum1, product2, platinum2, etc.
    const updatedProducts = [];
    const processedPlatinumIds = new Set(); // Track which platinum rows we've already added

    // Get all regular products sorted by ID
    const allRegularProducts = products
      .filter((p) => !p.isPlatinumRow)
      .sort((a, b) => {
        const idA = typeof a.id === 'number' ? a.id : parseInt(a.id) || 0;
        const idB = typeof b.id === 'number' ? b.id : parseInt(b.id) || 0;
        return idA - idB;
      });

    // Add all existing products in correct order: product, then its platinum
    allRegularProducts.forEach((product) => {
      updatedProducts.push(product);
      // Find its platinum row
      const platinumRow = products.find(
        (p) =>
          p.isPlatinumRow && p.parentProductId === product.id && !processedPlatinumIds.has(p.id)
      );
      if (platinumRow) {
        updatedProducts.push(platinumRow);
        processedPlatinumIds.add(platinumRow.id);
      }
    });

    // Add the new product
    updatedProducts.push(newProduct);

    // Add platinum row immediately after the new product if category has platinum
    if (hasPlatinum) {
      updatedProducts.push({
        id: `platinum-${newProductId}`,
        srNo: newSrNo, // Same sr no as parent product
        description: 'PLATINUM',
        subType: '',
        subTypeId: null,
        productType: selectedCategory?.id,
        pcs: 1,
        grossWeight: 0,
        lessWeight: 0,
        netWeight: '',
        touch: '',
        purity: 0,
        wastagePercent: 0,
        wastage: 0,
        totalPureWeight: 0,
        pureWeight: 0,
        purchaseRate: 0,
        purchaseMrp: null,
        saleMrp: null,
        labourRate: 0,
        makingCharges: 0,
        otherCharges: 0,
        amount: 0,
        isPlatinumRow: true,
        parentProductId: newProductId,
        // Arrays for details
        lessWeightDetails: [],
        makingChargesDetails: [],
        otherChargesDetails: [],
        diamondDetails: [],
        otherTagDetails: null,
      });
    }

    handleProductsChange(updatedProducts);
  }, [products, selectedCategory, handleProductsChange]);

  const calculateTotals = (productList) => {
    const filled = productList.filter((p) => p.description);

    return filled.reduce(
      (acc, product) => {
        acc.totalGoldPcs += parseInt(product.pcs) || 0;
        acc.totalGrossWeight += parseFloat(product.grossWeight) || 0;
        acc.totalLessWeight += parseFloat(product.lessWeight) || 0;
        acc.totalNetWeight += parseFloat(product.netWeight) || 0;
        acc.totalPureWeight += parseFloat(product.totalPureWeight || product.pureWeight) || 0;
        acc.totalOtherCharges += parseFloat(product.otherCharges) || 0;
        acc.totalMakingCharges += parseFloat(product.labourRate || product.makingCharges) || 0;
        acc.totalGoldAmount += parseFloat(product.amount) || 0;

        // Diamond totals
        if (product.diamondDetails && Array.isArray(product.diamondDetails)) {
          product.diamondDetails.forEach((diamond) => {
            // Handle both camelCase and snake_case field names
            const diamondPiece = diamond.diamondPiece || diamond.diamond_piece || 0;
            const diamondWeight = diamond.diamondWeight || diamond.diamond_weight || 0;
            const purchaseAmount = diamond.purchaseAmount || diamond.purchase_amount || 0;
            const saleAmount = diamond.saleAmount || diamond.sale_amount || 0;

            acc.totalDiamondPcs += parseInt(diamondPiece) || 0;
            acc.totalDiamondWeight += parseFloat(diamondWeight) || 0;
            acc.totalDiamondAmount += parseFloat(purchaseAmount) || 0;
            acc.totalDiamondSaleAmount += parseFloat(saleAmount) || 0;
          });
        }

        // For ONLY DIAMOND category - diamond fields are stored directly on product
        if (product.diamondPiece || product.diamondWeight) {
          acc.totalDiamondPcs += parseInt(product.diamondPiece) || 0;
          acc.totalDiamondWeight += parseFloat(product.diamondWeight) || 0;
          acc.totalDiamondAmount += parseFloat(product.diamondPurchaseAmount) || 0;
          acc.totalDiamondSaleAmount += parseFloat(product.diamondSaleAmount) || 0;
        }

        // Platinum totals (if applicable)
        if (product.platinumNetWeight) {
          acc.totalPlatNetWeight += parseFloat(product.platinumNetWeight) || 0;
          acc.totalPlatAmount += parseFloat(product.platinumTotal) || 0;
        }

        return acc;
      },
      {
        totalGoldPcs: 0,
        totalGrossWeight: 0,
        totalLessWeight: 0,
        totalNetWeight: 0,
        totalPureWeight: 0,
        totalOtherCharges: 0,
        totalMakingCharges: 0,
        totalGoldAmount: 0,
        totalPlatNetWeight: 0,
        totalPlatAmount: 0,
        totalDiamondPcs: 0,
        totalDiamondWeight: 0,
        totalDiamondAmount: 0,
        totalDiamondSaleAmount: 0,
        tcs: '0.10%',
      }
    );
  };

  const onSubmit = handleSubmit(async (data) => {
    // debugger;
    try {
      // Always use the products state directly - this is the source of truth from the table
      // The form's products field might be stale if validation failed previously
      // Use ref to ensure we have the latest products value even if state hasn't updated yet
      const currentProducts = productsRef.current || products || [];

      // Validate that we have products with descriptions (excluding platinum rows)
      const filledProducts = currentProducts.filter(
        (p) => p && p.description && p.description.trim() && !p.isPlatinumRow
      );

      if (filledProducts.length === 0) {
        toast.error('Please add at least one product with description');
        return;
      }

      // Get payment values directly from form state (since payment is not in validation schema)
      const paymentValues = getValues('payment') || watch('payment') || {};

      // Validate payment mode
      if (!paymentValues.paymentMode) {
        toast.error('Payment mode is required');
        return;
      }

      // Calculate totals
      const totalBeforeRoundOff =
        totals.totalGoldAmount + totals.totalPlatAmount + totals.totalDiamondAmount;
      const roundOffAmount = parseFloat(
        paymentValues.roundOffAmount === '' || !paymentValues.roundOffAmount
          ? 0
          : paymentValues.roundOffAmount || 0
      );
      const totalAfterRoundOff = totalBeforeRoundOff - roundOffAmount;

      const purchaseData = {
        generalDetails: data.generalDetails,
        products: currentProducts, // Pass full products array including platinum rows
        payment: {
          paymentMode: paymentValues.paymentMode ?? null,
          totalPaidAmount: String(
            paymentValues.totalPaidAmount === '' || !paymentValues.totalPaidAmount
              ? '0'
              : paymentValues.totalPaidAmount || '0'
          ),
          roundOffAmount: String(
            paymentValues.roundOffAmount === '' || !paymentValues.roundOffAmount
              ? '0.000'
              : paymentValues.roundOffAmount || '0.000'
          ),
          totalPurchaseAmount: String(totalBeforeRoundOff), // Before round off
          totalAmount: String(totalAfterRoundOff), // After round off
          pendingAmount: String(
            Math.max(
              0,
              totalAfterRoundOff -
                parseFloat(
                  paymentValues.totalPaidAmount === '' || !paymentValues.totalPaidAmount
                    ? 0
                    : paymentValues.totalPaidAmount || 0
                )
            )
          ),
          note: paymentValues.note?.trim() || null,
        },
      };

      const result = isEditMode
        ? await updatePurchase(purchaseId, purchaseData)
        : await createPurchase(purchaseData);

      if (result.success) {
        toast.success(
          isEditMode ? 'Purchase updated successfully!' : 'Purchase created successfully!'
        );
        router.push(paths.purchase.list);
      } else {
        console.error('Purchase operation failed:', result.message);
      }
    } catch (error) {
      console.error('Error creating purchase:', error);
    }
  });

  const handleCancel = () => {
    router.push(paths.purchase.list);
  };

  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <CustomBreadcrumbs
        slotProps={{
          heading: {
            sx: { typography: 'h6' },
          },
        }}
        heading={
          isEditMode
            ? `Edit Purchase -  ${nextPurchaseNumber}`
            : `Add Purchase -  ${nextPurchaseNumber}`
        }
        // links={[
        //   { name: 'Dashboard', href: paths.dashboard.root },
        //   { name: 'Purchase', href: paths.purchase.list },
        //   { name: isEditMode ? 'Edit Purchase' : 'Add Purchase' },
        //   { name: !nextPurchaseNumber ? 'Purchase No:' : `${nextPurchaseNumber}` },
        // ]}
        sx={{ mb: 2 }}
      />

      {/* Purchase Number Display */}
      {/* {nextPurchaseNumber && (
        <Box sx={{ mb: 2, p: 1.5, bgcolor: 'background.neutral', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
            Purchase Number:
          </Typography>
          <Typography variant="body2" component="span" fontWeight={600}>
            {nextPurchaseNumber}
          </Typography>
        </Box>
      )} */}

      <Form methods={methods} onSubmit={onSubmit}>
        <Card sx={{ p: 3 }}>
          {/* Row 1 - Dealer and Category */}
          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            }}
            sx={{ mb: 2 }}
          >
            {/* Dealer Selection */}
            <Controller
              name="generalDetails.dealerId"
              control={methods.control}
              render={({ field, fieldState: { error } }) => (
                <Autocomplete
                  {...field}
                  size="small"
                  options={apiData.dealers}
                  getOptionLabel={(option) =>
                    option.dealer_name || option.dealerName || option.name || ''
                  }
                  isOptionEqualToValue={(option, value) => option.id === value}
                  value={apiData.dealers.find((dealer) => dealer.id === field.value) || null}
                  onChange={(event, newValue) => {
                    field.onChange(newValue?.id || '');
                  }}
                  renderInput={(textFieldParams) => (
                    <TextField
                      {...textFieldParams}
                      label="Search Dealer *"
                      error={!!error}
                      helperText={error?.message}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                  renderOption={(props, option) => {
                    const { key, ...otherProps } = props;
                    return (
                      <Box component="li" key={option.id || key} {...otherProps}>
                        <Stack>
                          <Typography variant="body2" fontWeight={600}>
                            {option.dealer_name || option.dealerName || option.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {option.dealer_code || option.dealerCode} •{' '}
                            {option.owner_name || option.ownerName}
                          </Typography>
                        </Stack>
                      </Box>
                    );
                  }}
                />
              )}
            />

            <Field.Select size="small" name="generalDetails.tagSelected" label="Tag Selection *">
              <MenuItem value="TAG">Tag</MenuItem>
              <MenuItem value="NON_TAG">Non-Tag</MenuItem>
            </Field.Select>

            <Field.Text
              size="small"
              name="generalDetails.productsToEnter"
              label="Products to Enter Count"
              type="number"
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: 1, max: 50 }}
            />
          </Box>

          {/* Row 2 - Dealer Info Display (if dealer selected) */}

          {selectedDealer && (
            <Stack direction="row">
              <Button
                variant="text"
                color="primary"
                startIcon={
                  <Iconify
                    icon={showDealerDetails.value ? 'eva:arrow-up-fill' : 'eva:arrow-down-fill'}
                  />
                }
                onClick={showDealerDetails.onToggle}
              >
                {showDealerDetails.value
                  ? 'Hide Selected Dealer Details'
                  : 'Show Selected Dealer Details'}
              </Button>
            </Stack>
          )}

          <Collapse in={showDealerDetails.value}>
            {selectedDealer && (
              <Box
                rowGap={2}
                columnGap={2}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                }}
                sx={{ my: 1, p: 1.5, bgcolor: 'grey.100', borderRadius: 1.5 }}
              >
                <TextField
                  size="small"
                  label="Dealer Name"
                  value={selectedDealer.dealer_name || selectedDealer.name || ''}
                  InputProps={{ readOnly: true }}
                  InputLabelProps={{ shrink: true }}
                  sx={{ bgcolor: 'white' }}
                />
                <TextField
                  size="small"
                  label="Dealer Code"
                  value={selectedDealer.dealer_code || selectedDealer.code || ''}
                  InputProps={{ readOnly: true }}
                  InputLabelProps={{ shrink: true }}
                  sx={{ bgcolor: 'white' }}
                />
                <TextField
                  size="small"
                  label="Contact Number"
                  value={
                    selectedDealer.phone_number ||
                    selectedDealer.contact ||
                    selectedDealer.phone ||
                    ''
                  }
                  InputProps={{ readOnly: true }}
                  InputLabelProps={{ shrink: true }}
                  sx={{ bgcolor: 'white' }}
                />
                <TextField
                  size="small"
                  label="City"
                  value={selectedDealer.city || ''}
                  InputProps={{ readOnly: true }}
                  InputLabelProps={{ shrink: true }}
                  sx={{ bgcolor: 'white' }}
                />
                <TextField
                  size="small"
                  label="Address"
                  value={selectedDealer.address || ''}
                  InputProps={{ readOnly: true }}
                  InputLabelProps={{ shrink: true }}
                  sx={{ bgcolor: 'white' }}
                />
                <TextField
                  size="small"
                  label="GST Number"
                  value={selectedDealer.gst_number || selectedDealer.gst || ''}
                  InputProps={{ readOnly: true }}
                  InputLabelProps={{ shrink: true }}
                  sx={{ bgcolor: 'white' }}
                />
              </Box>
            )}
          </Collapse>

          {/* Row 3 - Bill Details */}
          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            }}
            sx={{ mt: 2 }}
          >
            {/* Category Selection */}
            <Controller
              name="generalDetails.category"
              control={methods.control}
              render={({ field, fieldState: { error } }) => (
                <Autocomplete
                  {...field}
                  size="small"
                  options={apiData.categories}
                  getOptionLabel={(option) =>
                    option.category_name || option.name || option.label || ''
                  }
                  isOptionEqualToValue={(option, value) => option.id === value}
                  value={apiData.categories.find((category) => category.id === field.value) || null}
                  onChange={(event, newValue) => {
                    field.onChange(newValue?.id || '');
                  }}
                  renderInput={(textFieldParams) => (
                    <TextField
                      {...textFieldParams}
                      label="Bill Type *"
                      error={!!error}
                      helperText={error?.message}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                  renderOption={(props, option) => {
                    const { key, ...otherProps } = props;
                    return (
                      <Box component="li" key={option.id || key} {...otherProps}>
                        <Stack>
                          <Typography variant="body2" fontWeight={600}>
                            {option.category_name || option.name || option.label}
                          </Typography>
                          {option.metal_type_name && (
                            <Typography variant="caption" color="text.secondary">
                              Metal: {option.metal_type_name}
                            </Typography>
                          )}
                        </Stack>
                      </Box>
                    );
                  }}
                />
              )}
            />

            <Field.Text
              size="small"
              name="generalDetails.billDate"
              label="Bill Date *"
              type="date"
              InputLabelProps={{ shrink: true }}
            />

            <Field.Text
              size="small"
              name="generalDetails.billNo"
              label="Bill No. *"
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          {/* Hidden field for bill_metal_type - auto-set from category */}
          <Field.Text name="generalDetails.billMetalType" type="hidden" sx={{ display: 'none' }} />
        </Card>

        {/* Product Details Section - Renders based on selected category */}
        {selectedCategory && (
          <Card sx={{ mt: 3 }}>
            <Box sx={{ p: 3, pb: 2 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                <Iconify icon="solar:box-bold" sx={{ mr: 1 }} />
                Product Details - {selectedCategory.category_name || selectedCategory.name}
              </Typography>
            </Box>

            <Box sx={{ overflowX: 'auto', width: '100%' }}>
              <PurchaseProductTableDynamic
                products={products}
                category={selectedCategory}
                onProductsChange={handleProductsChange}
                apiData={apiData}
                tagSelected={watch('generalDetails.tagSelected')}
                totals={totals}
                getProductBaseMetalTypes={getProductBaseMetalTypes}
              />
            </Box>

            <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<Iconify icon="eva:plus-fill" />}
                onClick={handleAddProductRow}
                sx={{ minWidth: '140px' }}
              >
                Add Row
              </Button>
            </Box>
          </Card>
        )}

        {/* Payment Details Section */}
        {selectedCategory && (
          <Card sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
              <Iconify icon="solar:wallet-bold" sx={{ mr: 1 }} />
              Payment Details
            </Typography>
            <PurchasePaymentSection
              methods={methods}
              totalAmount={
                totals.totalGoldAmount + totals.totalPlatAmount + totals.totalDiamondAmount
              }
              apiData={apiData}
            />
          </Card>
        )}

        {/* Action Buttons */}

        {selectedCategory && (
          <Stack direction="row" spacing={2} sx={{ my: 3 }}>
            <Button
              type="button"
              variant="outlined"
              color="inherit"
              onClick={handleCancel}
              startIcon={<Iconify icon="solar:close-circle-bold" />}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              loading={isLoading}
              startIcon={<Iconify icon="solar:check-circle-bold" />}
            >
              Save Purchase
            </Button>
          </Stack>
        )}
      </Form>
    </Container>
  );
}
