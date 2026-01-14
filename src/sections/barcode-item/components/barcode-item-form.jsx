import {
  forwardRef,
  Fragment,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import InputAdornment from '@mui/material/InputAdornment';
import { Tooltip } from '@mui/material';
import { paths } from 'src/routes/paths';
import { useParams, useRouter } from 'src/routes/hooks';

import { useSettingsContext } from 'src/components/settings';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Form, Field } from 'src/components/hook-form';
import { usePurchaseBarcodeTag } from 'src/hooks/usePurchaseBarcodeTag';
import { useDealers } from 'src/hooks/useDealers';
import { useBarcodeLocations } from 'src/hooks/useBarcodeLocations';
import { useDiamondDetails } from 'src/hooks/useDiamondDetails';
import { useProductsMasters } from 'src/hooks/useProductsMaster';
import GemstoneFormComponent from './gemstone-form';
import {
  AllChargesSchema,
  diamondFields,
  HuIdDetailsSchema,
  TagItemSchema,
  TagVariantItemSchema,
  unwantedKeys,
} from '../schema/formSchema';
import {
  ALL_charges_default_values,
  defaultValues,
  defaultVariantValues,
  diamond_details_default_values,
  huId_details_default_values,
} from '../const/formInitial';
import { useProducts } from 'src/hooks/useProducts';
import { Image } from 'src/components/image';
import { ProductFormModal } from '../../masters/products';
import { getApiErrorMessage } from 'src/utils/error-handler';
import PurchaseDetailsForm from './purchase-detail-form';
import { MediaModal } from './barcode-media-modal';
import DynamicFormFields from 'src/shared/components/DynamicFormFields';
import { useDiamonds } from 'src/hooks/useDiamonds';
import { useMetalColors } from 'src/hooks/useMetalColors';

export const BarcodeItemForm = forwardRef(
  (
    {
      itemCode,
      barcodeFormData,
      isVariant,
      variantIndex,
      onRemoveVariant,
      onFormValueChange,
      availableVariants = [],
    },
    ref
  ) => {
    if (!isVariant) console.log('availableVariants', availableVariants);
    const settings = useSettingsContext();
    const {
      getNextCode,
      stockTypes,
      fetchStockTypes,
      uploadingFile,
      uploadFile,
      savedFiles,
      createRecord: createBarcodeTag,
      createRecordWithVariants: createBarcodeTagWithVariants,
      fetchItem: fetchBarcodeItem,
      // datum: barcodeItem,
      updateRecord: updateBarcodeTag,
    } = usePurchaseBarcodeTag();

    const [barcodeItem, setBarcodeItem] = useState(null);

    const {
      data: products,
      loading: productLoading,
      fetchItems: fetchProducts,
      createItem: createProduct,
      baseMetals: baseMetalsData,
      fetchBaseMetalTypes,
      refreshTrigger,
    } = useProducts();

    const { data: dealerList, fetchItems: fetchDealers } = useDealers();
    const { data: barCodeLocations, fetchItems: fetchBarCodeLocations } = useBarcodeLocations();

    // Fetch dropdown options For Diamond
    const { carats: diamondCarats, fetchDiamondCarats } = useDiamonds();
    const { data: diamondShapes, fetchItems: fetchShapes } = useDiamondDetails('shape');
    const { data: diamondSizeRanges, fetchItems: fetchSizeRanges } = useDiamondDetails('sizeRange');
    const { data: diamondColors, fetchItems: fetchColors } = useDiamondDetails('color');
    const { data: diamondCertificateTypes, fetchItems: fetchCertificateTypes } =
      useDiamondDetails('certificateType');

    const { data: metalTypes, fetchItems: fetchMetalTypes } = useDiamondDetails('metal');
    const { data: metalColors, fetchItems: fetchMetalColors } = useMetalColors();
    const { data: productsMasterData, fetchCaratsByMetalType } = useProductsMasters();

    const router = useRouter();
    const { id: barcode_item_id } = useParams();

    // Modals States
    const [subProductModalOpen, setSubProductModalOpen] = useState(false);
    const [chargesModalOpen, setChargesModalOpen] = useState(false);
    const [huidDetailsModalOpen, setHuidDetailsModalOpen] = useState(false);
    const [purchaseDetailsModalOpen, setPurchaseDetailsModalOpen] = useState(false);
    const [gemstoneModalOpen, setGemstoneModalOpen] = useState(false);
    const [mediaModalOpen, setMediaModalOpen] = useState(false);

    const handleDecimalInput = useCallback((event) => {
      const value = event.target.value;
      if (value.includes('.') && value.split('.')[1].length > 3) {
        event.target.value = value.slice(0, value.indexOf('.') + 4);
      }
    }, []);

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [activeButton, setActiveButton] = useState(null); // [save, save & add new , save & print]

    const barcodePageRef = useRef(null);

    const productsMasterCarats = useMemo(() => {
      const finalResult = productsMasterData?.carats?.flatMap((item) => item?.carats || []);
      return finalResult;
    }, [productsMasterData?.carats]);

    const FormSchema = useMemo(() => {
      if (isVariant) {
        return TagVariantItemSchema;
      }
      return TagItemSchema;
    }, [isVariant]);

    const FormInitialValues = useMemo(() => {
      if (isVariant) {
        return defaultVariantValues;
      }
      return defaultValues;
    }, [isVariant]);

    const methods = useForm({
      resolver: zodResolver(FormSchema),
      defaultValues: FormInitialValues,
      mode: 'onChange',
      reValidateMode: 'onChange',
    });

    const chargesMethods = useForm({
      resolver: zodResolver(AllChargesSchema),
      defaultValues: ALL_charges_default_values,
    });

    const huIdDetailsMethods = useForm({
      resolver: zodResolver(HuIdDetailsSchema),
      defaultValues: huId_details_default_values,
    });

    const {
      reset,
      handleSubmit,
      watch,
      setValue,
      resetField,
      getValues,
      formState: { isSubmitting, isValid, errors },
    } = methods;

    const {
      reset: resetCharges,
      watch: watchCharges,
      setValue: setChargesValue,
      handleSubmit: handleChargesSubmit,
      formState: { isSubmitting: isChargesSubmitting },
    } = chargesMethods;

    const {
      reset: resetHuidDetails,
      handleSubmit: handleHuidDetailsSubmit,
      formState: { isSubmitting: isHuidDetailsSubmitting },
    } = huIdDetailsMethods;

    // --- Payload Creator ---
    const createPayload = useCallback(
      (formData) => {
        // Gemstones
        const gemstone_details = Array.isArray(formData?.gemstone_details)
          ? [...formData.gemstone_details]
          : [];

        const formMedia = Array.isArray(formData?.media_ids) ? [...formData.media_ids] : [];

        // Media IDs
        let media_ids = [
          ...formMedia
            .filter((item) => item?.media_type === 'image')
            .map((item) => item?.id)
            .filter(Boolean),
        ];

        if (formData?.show_e_showroom) {
          media_ids.push(
            ...formMedia
              .filter((item) => item?.media_type === 'video')
              .map((item) => item?.id)
              .filter(Boolean)
          );
        }
        // Use setValue only if needed for side effects in CURRENT form, but avoid for pure transformation
        // setValue('media_ids', media_ids); // validation might fail if we mutate form state here unexpectedly

        const diamond_details = Array.isArray(formData.diamond_details)
          ? [...formData.diamond_details]
          : [];

        const updatedDiamondDetails = diamond_details.map((item) => {
          const weight = parseFloat(item.diamond_weight) || 0;
          const rate = parseFloat(item.diamond_rate) || 0;
          return {
            ...item,
            amount: weight * rate,
          };
        });

        // Decimal fields to format to string with 3 decimal places
        const decimalFields = [
          'gross_weight',
          'less_weight',
          'wastage_gram',
          'value',
          'per_gram_value',
          'mrp',
          'platinum_net_weight',
        ];

        // Format decimal fields
        const formattedData = { ...formData };
        decimalFields.forEach((field) => {
          if (formattedData[field] !== undefined && formattedData[field] !== null) {
            formattedData[field] = (parseFloat(formattedData[field]) || 0).toFixed(3);
          }
        });

        // Handle wastage_percentage separately if needed or include in decimalFields
        // Based on payload, variant usage suggests string, parent number?
        // Let's format it to string for consistency if non-zero, or just number?
        // User example: parent: 0, variant: '0.000'.
        // Let's force it to string 3 decimals to be safe for API if it accepts strings.
        // Actually, let's keep it consistent:
        if (formattedData.wastage_percentage !== undefined) {
          formattedData.wastage_percentage = (
            parseFloat(formattedData.wastage_percentage) || 0
          ).toFixed(3);
        }

        // Removing unwanted keys
        const filtered = Object.fromEntries(
          Object.entries(formattedData).filter(([key]) => !unwantedKeys.includes(key))
        );

        const finalPayload = {
          ...filtered,
          gemstone_details,
          media_ids,
          diamond_details: updatedDiamondDetails,
        };

        return finalPayload;
      },

      []
    );

    const handleSaveAPICall = useCallback(
      async (data) => {
        try {
          const formData = { ...data, ...getValues() };
          const payload = createPayload(formData);
          let resp = { success: false, message: '' };

          if (barcode_item_id) {
            if (availableVariants && availableVariants.length > 0) {
              // Process variants
              const variantsPayload = availableVariants.map((variant) => ({
                ...createPayload(variant.data),
                quantity: payload.quantity,
                per_gram_value: payload.per_gram_value, // Already formatted in createPayload(parent) >> payload >> payload.per_gram_value
              }));

              const finalPayload = {
                ...payload,
                variants: variantsPayload,
              };
              resp = await updateBarcodeTag(barcode_item_id, finalPayload);
            } else {
              resp = await updateBarcodeTag(barcode_item_id, payload);
            }
          } else {
            if (availableVariants && availableVariants.length > 0) {
              // Process variants
              const variantsPayload = availableVariants.map((variant) => ({
                ...createPayload(variant.data),
                quantity: payload.quantity,
                per_gram_value: payload.per_gram_value, // Already formatted in createPayload(parent) >> payload >> payload.per_gram_value
              }));

              const finalPayload = {
                ...payload,
                variants: variantsPayload,
              };

              resp = await createBarcodeTagWithVariants(finalPayload);
            } else {
              resp = await createBarcodeTag(payload);
            }
          }

          if (resp.success) {
            toast.success(`Tag item ${barcode_item_id ? 'updated' : 'saved'}  successfully!`);
            return true;
          }
          return false;
        } catch (error) {
          console.error(error);
          return false;
        }
      },
      [
        createBarcodeTag,
        updateBarcodeTag,
        createBarcodeTagWithVariants,
        barcode_item_id,
        getValues,
        createPayload,
        availableVariants,
      ]
    );

    const handlePrimarySubmit = useCallback(
      async (data, action) => {
        const success = await handleSaveAPICall(data);
        if (success) {
          if (action === 'save') {
            router.push(paths.barcodeItem.list);
          } else if (action === 'save_more') {
            router.push(paths.barcodeItem.add);
          } else if (action === 'save_print') {
            // navigate to print or just save for now
            router.push(paths.barcodeItem.list);
          }
        }
      },
      [handleSaveAPICall, reset, router, toast]
    );

    const getErrorMessage = useCallback(
      (formErrors) => {
        const isErrorObj = Object.keys(formErrors).length > 0;
        if (!isErrorObj) return;
        Object.values(formErrors).forEach((error, index) => {
          if (index === 0) {
            if (error?.message) {
              toast.error(error.message);
            } else {
              getErrorMessage(error);
            }
          }
        });
      },
      [toast]
    );

    const handleValidationError = useCallback((formErrors) => {
      getErrorMessage(formErrors);
    }, []);

    const onSubmitForm = (action) => {
      setActiveButton(action);
      handleSubmit(
        (data) => handlePrimarySubmit(data, action),
        (err) => handleValidationError(err)
      )();
    };

    const validateVariantForm = useCallback(() => {
      handleSubmit(
        (data) => void 0,
        (err) => handleValidationError(err)
      )();
      return isValid;
    }, [isValid]);

    //  For getting changes in the Add Barcode Page
    useEffect(() => {
      const subscription = watch((value) => {
        onFormValueChange(value);
      });

      return () => subscription.unsubscribe();
    }, [watch, onFormValueChange]);

    // useEffect(() => {
    //   if (!isVariant && availableVariants.length > 0) {
    //     setValue('is_variant', true);
    //     const variants = availableVariants.map((variant) => variant.data);
    //     setValue('variants', variants);
    //   }
    // }, [isVariant, availableVariants, setValue]);

    // Expose methods to Barcode Add Parent component
    useImperativeHandle(ref, () => ({
      validateVariantForm,
      onSubmitForm,
      formData: getValues(),
    }));

    const handleCancel = useCallback(() => {
      router.push(paths.barcodeItem.list);
    }, [router]);

    const handleAdd = useCallback(() => {
      router.push(paths.barcodeItem.add);
    }, [router]);

    const handleFetchBarcodeItem = useCallback(
      async (id) => {
        try {
          await fetchBarcodeItem(id);
        } catch (error) {
          console.error('Error fetching barcode item:', error);
        }
      },
      [fetchBarcodeItem]
    );

    //  Load Initial Data
    const loadCode = useCallback(async () => {
      if (barcodeFormData) {
        setBarcodeItem(barcodeFormData);
      } else {
        if (itemCode) {
          setValue('item_code', itemCode);
        }
      }
    }, [barcode_item_id, itemCode]);

    const loadSubType = useCallback(async () => {
      await fetchProducts({ pagination: false });
    }, []);

    const loadMetalTypes = useCallback(async () => {
      await fetchMetalTypes(1, 10, '', 'all', { pagination: false });
    }, []);

    const loadMetalColors = useCallback(async () => {
      await fetchMetalColors(1, 10, '', { pagination: false });
    }, []);

    const loadStockTypes = useCallback(async () => {
      await fetchStockTypes();
    }, []);

    const loadDealers = useCallback(async () => {
      await fetchDealers({ pagination: false });
    }, []);

    const loadBarCodeLocations = useCallback(async () => {
      await fetchBarCodeLocations({ pagination: false });
    }, []);

    const loadInitialData = useCallback(() => {
      if (isVariant) {
        loadCode();
        loadMetalTypes();
        loadMetalColors();
      } else {
        loadSubType();
        loadCode();
        loadMetalTypes();
        loadStockTypes();
        loadDealers();
        loadBarCodeLocations();
      }
    }, [isVariant]);

    const getCaratFromMetalType = useCallback(async (metalTypeId) => {
      try {
        await fetchCaratsByMetalType(metalTypeId);
      } catch (error) {
        console.error('Error fetching carats by metal type:', error);
      }
    }, []);

    const findProductSelection = useCallback(
      async (productId) => {
        try {
          if (!products.length) return;
          const selected_product = products.find((item) => item.id === productId);
          if (!selected_product) return;
          setSelectedProduct(selected_product);
          const id = selected_product?.product_category?.metal_type?.id;
          await handleGetBaseMetalType(productId);
        } catch (error) {
          console.error('Error finding product:', error);
        }
      },
      [products, setSelectedProduct]
    );

    const findDealerCode = useCallback(
      async (dealerId) => {
        const selectedDealer = dealerList.find((item) => item.id === dealerId);
        setValue('dealer_code', selectedDealer?.dealer_code ?? '');
      },
      [dealerList, setValue]
    );

    useEffect(() => {
      if (barcodePageRef?.current) return;
      barcodePageRef.current = true;
      loadInitialData();
    }, []);

    //  Update Section
    useEffect(() => {
      if (barcode_item_id && barcodeItem && products?.length) {
        const selected_product = products.find((item) => item.id === barcodeItem.product_type);
        if (!selected_product) return;
        setSelectedProduct(selected_product);
        const id = selected_product?.product_category?.metal_type?.id;
        handleGetBaseMetalType(selected_product.id);
      }
    }, [barcode_item_id, products, barcodeItem]);

    //  Only When Update need to filter the product Options of Metal Type
    const filteredProducts = useMemo(
      () => [
        ...(barcode_item_id
          ? products
              .filter(
                (item) => item?.product_category?.metal_type?.id === barcodeItem?.metal_category
              )
              .map((item) => ({
                value: item.id,
                label: item.product_name,
              }))
          : products.map((item) => ({
              value: item.id,
              label: item.product_name,
            }))),
      ],
      [products, barcode_item_id, barcodeItem?.metal_category]
    );

    useEffect(() => {
      if (barcodeItem) {
        handleResettingForm(barcodeItem);
      }
    }, [barcodeItem]);

    const handleResettingForm = useCallback((item) => {
      const media_ids = Array.isArray(item?.media_files)
        ? item?.media_files?.map((media) => media.id)
        : [];
      reset({
        ...item,
        gross_weight: Number(item.gross_weight) || 0,
        mrp: Number(item.mrp) || 0,
        value: Number(item.value) || 0,
        total_charges: Number(item.total_charges) || 0,
        per_gram_value: Number(item.per_gram_value) || 0,
        media_ids: media_ids,
        huid_details: item.huid_details || defaultValues.huid_details,
        purchase_details: item.purchase_details || defaultValues.purchase_details,
      });
      // findProductSelection(item.product_type);
      const rawCharges =
        Array.isArray(item?.other_charges) && item?.other_charges?.length
          ? item.other_charges
          : ALL_charges_default_values.charges;

      const otherCharges = rawCharges.map((charge) => ({
        charge_type: charge?.charge_type ?? '',
        charge_amount: (() => {
          const n = parseFloat(charge?.charge_amount);
          return Number.isFinite(n) ? n : 0;
        })(),
      }));

      resetCharges({ charges: [...otherCharges] });
      if (item?.huid_details) {
        resetHuidDetails({ ...item.huid_details });
        handleSaveStrForHuID(item.huid_details, false);
      }
      // STR Fields Setup
      handleSaveStrForPurchaseDetails(item.purchase_details, false);
      handleSaveStrForGemstone(item.gemstone_details, false);
    }, []);

    const handleGetBaseMetalType = useCallback(
      async (productId) => {
        try {
          await fetchBaseMetalTypes(productId, {
            exclude_diamond: true, // To exclude Diamond
            exclude_gemstone: true, // To exclude gemstone
          });
        } catch (error) {
          console.error('Error fetching carats by metal type:', error);
        }
      },
      [getCaratFromMetalType]
    );

    const loadDiamondDropdown = useCallback(async () => {
      // Fetch all dropdown data without pagination
      fetchDiamondCarats();
      fetchShapes(1, 100, '', 'all', { pagination: false });
      fetchSizeRanges(1, 100, '', 'all', { pagination: false });
      fetchColors(1, 100, '', 'all', { pagination: false });
      fetchCertificateTypes(1, 100, '', 'all', { pagination: false });
    }, []);

    useEffect(() => {
      if (!baseMetalsData?.having_platinum) {
        resetField('platinum_net_weight');
      } else {
        const platinum_net_weight = Number(barcodeItem?.platinum_net_weight) || null;
        setValue('platinum_net_weight', platinum_net_weight);
      }
      setValue('having_diamond', baseMetalsData?.having_diamond || false);
      if (!baseMetalsData?.having_diamond) {
        resetField('diamond_details');
      } else {
        async function loadDiamondDetails() {
          await loadDiamondDropdown();
          if (barcodeItem && barcode_item_id) {
            const updatedDetails = barcodeItem.diamond_details.map((detail) => ({
              diamond_colour_clarity: detail.diamond_colour_clarity,
              diamond_shape: detail.diamond_shape,
              diamond_size_range: detail.diamond_size_range,
              diamond_colour: detail.diamond_colour,
              diamond_certificate: detail.diamond_certificate,
              diamond_piece: detail.diamond_piece || 1,
              certificate_number: detail.certificate_number || '',
              diamond_details: detail.diamond_details || '',
              diamond_weight: Number(detail.diamond_weight) || 0,
              diamond_rate: Number(detail.diamond_rate) || 0,
              amount: Number(detail.amount) || 0,
            }));
            setValue('diamond_details', updatedDetails);
          } else {
            setValue('diamond_details', diamond_details_default_values.diamond_details);
          }
        }
        loadDiamondDetails();
      }
    }, [
      baseMetalsData?.having_diamond,
      baseMetalsData?.having_platinum,
      resetField,
      setValue,
      defaultValues,
      barcodeItem,
      barcode_item_id,
    ]);

    const OPTIONS_MAP = {
      diamond_colour_clarity: diamondCarats,
      diamond_shape: diamondShapes,
      diamond_size_range: diamondSizeRanges,
      diamond_colour: diamondColors,
      diamond_certificate: diamondCertificateTypes,
    };

    diamondFields
      .filter((field) => field.type === 'select')
      .forEach((field) => {
        field.options = OPTIONS_MAP[field.name];
      });

    useEffect(() => {
      if (selectedProduct) {
        const { product_category, carats } = selectedProduct;
        const { stock_type, metal_type } = product_category;
        setValue('stock_type', stock_type.id);
        setValue('metal_category', metal_type.id);
        setValue('metal_category_name', metal_type.name);
        const carat_code = carats.map((carat) => carat.hsn_code).join(',');
        carat_code && setValue('carat', carat_code);
      }
    }, [selectedProduct, setValue]);

    const handleSubTypeChange = useCallback(
      (event) => {
        const { value } = event.target;
        if (value === -1) handleOpenSubProductModal();
        setValue('product_type', value === -1 ? null : value);
        findProductSelection(value);
      },
      [setValue, findProductSelection]
    );

    // For Variant Items only
    const handleChangeCategory = useCallback(
      async (event) => {
        const { value } = event.target;
        const metalCategory = metalTypes.find((item) => item.id === Number(value));
        setValue('metal_category', metalCategory?.id ?? null);
        setValue('metal_category_name', metalCategory?.name ?? null);
        await getCaratFromMetalType(metalCategory?.id ?? null);
      },
      [setValue, metalTypes]
    );

    const handleDealerChange = useCallback(
      (event) => {
        const { value } = event.target;
        setValue('dealer', value ?? null);
        findDealerCode(value ?? null);
      },
      [setValue, findDealerCode]
    );

    const saveFile = useCallback(
      async (file, type) => {
        try {
          if (!file) return;
          const resp = await uploadFile(file, type);
          if (resp.success) {
            //   setSavedFiles((pre) => {
            //     if (resp.media_type === 'image') {
            //       return { ...pre, image: [...pre.image, resp] };
            //     }
            //     if (resp.media_type === 'video') {
            //       return { ...pre, video: [...pre.video, resp] };
            //     }
            //     return pre;
            //   });
            toast.success('File uploaded successfully.');
          }
        } catch (error) {
          console.error('Error uploading file:', error);
        }
      },
      [uploadFile, savedFiles]
    );

    const handleImageUpload = useCallback(
      async (event, files) => {
        const selectedFiles = Array.from(event.target.files);
        if (files.image.length > 4) {
          toast.error('You have reached the maximum limit of images to upload.');
        } else if (selectedFiles.length > 0) {
          for (const element of selectedFiles) {
            await saveFile(element, 'image');
          }
        }
      },
      [saveFile]
    );

    const handleVideoUpload = useCallback(
      async (event, files) => {
        const selectedVideoFile = event.target.files[0];
        if (files.video.length > 1 || event.target.files.length > 1) {
          toast.error('You can only upload a maximum of 1 video.');
        } else if (selectedVideoFile) {
          await saveFile(selectedVideoFile, 'video');
        }
      },
      [saveFile]
    );

    const handleOpenSubProductModal = useCallback(() => {
      setSubProductModalOpen(true);
    }, []);

    const handleCloseSubProductModal = useCallback(() => {
      setSubProductModalOpen(false);
    }, []);

    const handleProductSave = useCallback(
      async (formData) => {
        try {
          let result;
          result = await createProduct(formData);
          if (result.success || result.id) {
            loadSubType();
            return result;
          } else {
            throw new Error(result.message || 'Operation failed!');
          }
        } catch (error) {
          const errorMessage = getApiErrorMessage(null, error, 'Operation failed!');
          toast.error(errorMessage);
          throw error;
        }
      },
      [createProduct]
    );

    const handleOpenChargesModal = useCallback(() => {
      setChargesModalOpen(true);
    }, []);

    const handleCloseChargesModal = useCallback(() => {
      setChargesModalOpen(false);
    }, []);

    const handleAddCharge = useCallback(() => {
      const currentCharges = watchCharges('charges') || [];
      setChargesValue('charges', [...currentCharges, { charge_type: '', charge_amount: '' }]);
    }, [watchCharges, setChargesValue]);

    const handleRemoveCharge = useCallback(
      (index) => {
        const currentCharges = watchCharges('charges') || [];
        const newCharges = currentCharges.filter((_, i) => i !== index);
        setChargesValue('charges', newCharges);
      },
      [watchCharges, setChargesValue]
    );

    const handleChargesSave = handleChargesSubmit(async (data) => {
      try {
        // Calculate total charges
        const totalCharges = data.charges.reduce(
          (sum, charge) => sum + (Number(charge.charge_amount) || 0),
          0
        );

        // Update the main form's total_charges field
        setValue('total_charges', totalCharges);
        setValue('other_charges', data.charges);

        toast.success(`Charges saved! Total: ${totalCharges}`);
        handleCloseChargesModal();
      } catch (error) {
        console.error(error);
        toast.error('Failed to save charges!');
      }
    });

    const handleOpenHuidDetailsModal = useCallback(() => {
      setHuidDetailsModalOpen(true);
    }, []);

    const handleCloseHuidDetailsModal = useCallback(() => {
      setHuidDetailsModalOpen(false);
    }, []);

    const handleHuidDetailsSave = handleHuidDetailsSubmit(async (data) => {
      try {
        await handleSaveStrForHuID(data);
        // Update the main form's huid_details field
        const huIDData = {
          ...data,
          gram_option_1: data.gram_option_1 || '0',
          gram_option_2: data.gram_option_2 || '0',
        };
        setValue('huid_details', huIDData);
        handleCloseHuidDetailsModal();
      } catch (error) {
        console.error(error);
        toast.error('Failed to save HUID Details!');
      }
    });

    const handleSaveStrForHuID = useCallback(
      async (data, isToast = true) => {
        if (!data) return;
        // Combine all HUID details into a single string
        const huidDetails = [
          data.huid,
          data.huid2,
          data.huid3,
          data.gram_option_1,
          data.gram_option_2,
        ]
          .filter(Boolean)
          .join(', ');

        setValue('huid_details_str', huidDetails);
        if (!isToast) return;
        if (huidDetails.trim().length === 0)
          toast.warning('You have not entered any of the HUID details.');
        else toast.success('HUID Details saved successfully!');
      },
      [setValue, toast]
    );

    const handleOpenPurchaseDetailsModal = useCallback(() => {
      if (!watch('product_type')) {
        toast.error('Please select a Product first.');
        return;
      }
      if (baseMetalsData?.base_metal_types && baseMetalsData.base_metal_types?.length === 0) {
        toast.error('Please add base metals first.');
        return;
      }
      setPurchaseDetailsModalOpen(true);
    }, []);

    const handleClosePurchaseDetailsModal = useCallback(() => {
      setPurchaseDetailsModalOpen(false);
    }, []);

    const handlePurchaseDetailsSave = useCallback(
      async (data) => {
        try {
          await handleSaveStrForPurchaseDetails(data);
          // Update the main form's purchase_details field
          setValue('purchase_details', data);
          handleClosePurchaseDetailsModal();
        } catch (error) {
          console.error(error);
          toast.error('Failed to save Purchase Details!');
        }
      },
      [handleClosePurchaseDetailsModal, setValue, toast]
    );

    const handleSaveStrForPurchaseDetails = useCallback(
      async (data, isToast = true) => {
        const purchaseDetails = (data || [])
          .map((item) => {
            const metalLabel = item.metal_type_name || 'Metal';
            const parts = [
              item.wastage_charges ? `${metalLabel} Wastage: ${item.wastage_charges}` : '',
              item.purchase_rate ? `${metalLabel} Rate: ${item.purchase_rate}` : '',
              item.purchase_making_charges
                ? `${metalLabel} Making: ${item.purchase_making_charges}`
                : '',
              item.purchase_value ? `${metalLabel} Value: ${item.purchase_value}` : '',
              item.purchase_mrp ? `${metalLabel} MRP: ${item.purchase_mrp}` : '',
            ].filter(Boolean);

            return parts.join(', ');
          })
          .filter(Boolean)
          .join(', ');

        setValue('purchase_details_str', purchaseDetails);
        if (!isToast) return;
        if (purchaseDetails.trim().length === 0)
          toast.warning('You have not entered any of the purchase details.');
        else toast.success('Purchase Details saved successfully!');
      },
      [setValue, toast]
    );

    const handleOpenGemstoneModal = useCallback(() => {
      setGemstoneModalOpen(true);
    }, []);

    const handleCloseGemstoneModal = useCallback(() => {
      setGemstoneModalOpen(false);
    }, []);

    const handleGemstoneSave = useCallback(
      async (data) => {
        await handleSaveStrForGemstone(data);
        setValue('gemstone_details', [...data]);
        setGemstoneModalOpen(false);
      },
      [setValue]
    );

    const handleSaveStrForGemstone = useCallback(
      async (data) => {
        const GemstoneDetails = (data || [])
          .map((item) => {
            const parts = [
              item.main_type ? ` Gemstone  Main type: ${item.main_type}` : '',
              item.sub_type ? ` Sub Type: ${item.sub_type}` : '',
              item.code ? ` Code: ${item.code}` : '',
              item.shape ? ` Value: ${item.shape}` : '',
              item.dimension ? ` Dimension: ${item.dimension}` : '',
              item.carat_weight ? `Carat_weight: ${item.carat_weight}` : '',
              item.rate ? `Rate: ${item.rate}` : '',
              item.amount ? `Amount: ${item.amount}` : '',
              item.certificate_charges ? `Certificate_charges: ${item.certificate_charges}` : '',
              item.pieces ? `Pieces: ${item.pieces}` : '',
            ].filter(Boolean);

            return parts.join(', ');
          })
          .filter(Boolean)
          .join(', ');
        setValue('gemstone_details_str', GemstoneDetails);
      },
      [setValue]
    );

    const handleCloseMediaModal = useCallback(() => {
      setMediaModalOpen(false);
    }, []);

    const handleOpenMediaModal = useCallback(() => {
      setMediaModalOpen(true);
    }, []);

    return (
      <Fragment>
        {/* <CustomBreadcrumbs
        heading={barcode_item_id ? 'Edit Tag Item' : 'Add Tag Item'}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Barcode Item', href: paths.barcodeItem.list },
          { name: `${barcode_item_id ? 'Edit Item' : 'Add Item'}` },
        ]}
        sx={{ mb: 2 }}
        action={
          <Button
            variant="outlined"
            color="black"
            onClick={handleCancel}
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
          >
            Back
          </Button>
        }
      /> */}

        <Form methods={methods}>
          <Card
            sx={{
              p: 2,
              py: 3,
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
              mt: !isVariant ? 0 : 2,
            }}
          >
            {/* Row 1 */}
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(6, 1fr)',
              }}
            >
              {isVariant && (
                <>
                  <Box>
                    <Button
                      variant="soft"
                      color="error"
                      startIcon={<Iconify icon="eva:trash-2-fill" />}
                      onClick={() => onRemoveVariant(variantIndex)}
                    >
                      {`Remove Variant `}
                      {/* ${variantIndex + 1} */}
                    </Button>
                  </Box>
                </>
              )}
              <Field.Text
                name="item_code"
                label="Item Code"
                InputProps={{
                  readOnly: true,
                }}
              />
              {!isVariant && (
                <>
                  <Field.Text name="quantity" label="Qty." type="number" valueAsNumber />
                  <Field.Select
                    name="product_type"
                    label="Product"
                    required
                    isWithMenuItem
                    onChange={handleSubTypeChange}
                    options={[
                      { value: -1, label: '+ Add New Product', actionType: true },
                      ...filteredProducts,
                    ]}
                  />
                  <Field.Select
                    name="stock_type"
                    label="Stock Type"
                    required
                    isWithMenuItem
                    InputProps={{
                      readOnly: true,
                    }}
                    options={stockTypes.map((option) => ({
                      value: option.id,
                      label: option.name,
                    }))}
                  />
                  <Field.Select
                    name="metal_category"
                    label="Category"
                    required
                    isWithMenuItem
                    InputProps={{
                      readOnly: true,
                    }}
                    options={metalTypes.map((option) => ({
                      value: option.id,
                      label: option.name,
                    }))}
                  />
                  {watch('metal_category') && (
                    <Field.Text
                      name="carat"
                      label={`${watch('metal_category_name')} Carat *`}
                      placeholder={`${watch('metal_category_name')} Carat`}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  )}
                </>
              )}

              {isVariant && (
                <>
                  <Field.Select
                    name="metal_category"
                    label="Category"
                    required
                    onChange={handleChangeCategory}
                    isWithMenuItem
                    options={metalTypes.map((option) => ({
                      value: option.id,
                      label: option.name,
                    }))}
                  />
                  {watch('metal_category') && (
                    <Field.Select
                      name="carat"
                      required
                      label={`${watch('metal_category_name')} Carat`}
                      isWithMenuItem
                      options={productsMasterCarats?.map((carat) => ({
                        value: carat.id,
                        label: carat.name,
                      }))}
                      // options={carats
                      //   .filter((c) => c.metal_type === watch('metal_category'))
                      //   .map((carat) => ({
                      //     value: carat.id,
                      //     label: carat.name,
                      //   }))}
                    />
                  )}
                  <Field.Select
                    name="metal_colour"
                    label="Metal Color"
                    isWithMenuItem
                    options={metalColors.map((option) => ({
                      value: option.id,
                      label: option.metal_color,
                    }))}
                  />
                  <Box sx={{ marginLeft: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Show E-showroom
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          // name="show_e_showroom"
                          checked={watch('show_e_showroom')}
                          onChange={(e) => setValue('show_e_showroom', e.target.checked)}
                          color="primary"
                        />
                      }
                    />
                  </Box>
                </>
              )}
            </Box>
            {/* Row 2 */}
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(6, 1fr)',
              }}
            >
              {!isVariant && (
                <>
                  <Field.Select
                    name="dealer"
                    label="Dealer*"
                    onChange={handleDealerChange}
                    isWithMenuItem
                    options={dealerList.map((option) => ({
                      value: option.id,
                      label: option.name,
                    }))}
                  />
                  <Field.Text
                    name="dealer_code"
                    label="D.Code"
                    placeholder="D.Code"
                    InputProps={{
                      readOnly: true,
                    }}
                  />

                  <Field.Select
                    name="box_counter"
                    label="Box / Counter "
                    required
                    isWithMenuItem
                    options={barCodeLocations.map((option) => ({
                      value: option.id,
                      label: `${option.location_name}`,
                    }))}
                  />
                </>
              )}

              <Field.Text name="remarks" label="Remarks" placeholder="Remarks" />
              <Field.Text name="design_code" label="Design Code" placeholder="Design Code" />
              <Field.Text
                name="certificate_number"
                label="Certificate Number"
                placeholder="Certificate Number"
              />
            </Box>
            {/* Row 3 - Media Uploads */}

            {!isVariant && (
              <Box
                rowGap={3}
                columnGap={2}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                }}
              >
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Image
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button
                      disabled={uploadingFile.image}
                      loading={uploadingFile.image}
                      loadingPosition="start"
                      variant="outlined"
                      component="label"
                      startIcon={<Iconify icon="eva:upload-fill" />}
                    >
                      {uploadingFile.image ? 'Uploading...' : 'Choose files'}
                      <input
                        type="file"
                        multiple
                        accept="image/jpeg, image/jpg, image/png, image/gif"
                        hidden
                        onChange={(e) => handleImageUpload(e, savedFiles)}
                      />
                    </Button>
                    <Typography variant="body2" color="text.secondary">
                      {savedFiles?.image?.length > 0
                        ? `${savedFiles?.image?.length} file(s) chosen`
                        : 'No file chosen'}
                    </Typography>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        border: '1px dashed',
                        borderColor: 'grey.300',
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'grey.50',
                      }}
                    >
                      {savedFiles?.image?.length > 0 ? (
                        <Image
                          src={savedFiles?.image?.[0]?.file_url}
                          alt={savedFiles?.image?.[0]?.file}
                        />
                      ) : (
                        <Iconify icon="solar:gallery-bold" width={20} />
                      )}
                    </Box>

                    {barcode_item_id &&
                      barcodeItem &&
                      barcodeItem?.media_files?.filter((media) => media.media_type === 'image')
                        .length > 0 && (
                        <Tooltip title="View Images">
                          <IconButton id="image" sx={{ color: 'info.main' }}>
                            <Iconify
                              onClick={handleOpenMediaModal}
                              width={22}
                              icon="mdi:play-box-multiple-outline"
                              sx={{ cursor: 'pointer' }}
                            />
                          </IconButton>
                        </Tooltip>
                      )}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 4 }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Show E-showroom
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          // name="show_e_showroom"
                          checked={watch('show_e_showroom')}
                          onChange={(e) => setValue('show_e_showroom', e.target.checked)}
                          color="primary"
                        />
                      }
                    />
                  </Box>
                  {watch('show_e_showroom') && (
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Video
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Button
                          disabled={uploadingFile.video}
                          loading={uploadingFile.video}
                          variant="outlined"
                          loadingPosition="start"
                          component="label"
                          startIcon={<Iconify icon="eva:upload-fill" />}
                        >
                          {uploadingFile.video ? 'Uploading...' : ' Choose file'}
                          <input
                            type="file"
                            accept="video/*"
                            hidden
                            onChange={(e) => handleVideoUpload(e, savedFiles)}
                          />
                        </Button>
                        <Typography variant="body2" color="text.secondary">
                          {savedFiles.video?.length ? 'Video File Uploaded' : 'No file chosen'}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>
            )}
            {/* Row 4 - Weight and Percentage Details */}
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(5, 1fr)',
                lg: 'repeat(6, 1fr)',
              }}
            >
              <Field.Text
                name="gross_weight"
                label="Gr. Wt"
                required
                placeholder="Gr.Wt"
                type="number"
                valueAsNumber
                onInput={handleDecimalInput}
              />
              <Field.Text
                name="less_weight"
                label="Less Wt."
                placeholder="Less Weight"
                type="number"
                valueAsNumber
                onInput={handleDecimalInput}
              />
              <Field.Text
                name="net_weight"
                // watch('metal_category_name')
                label="Net Wt.*"
                placeholder="Net Wt."
                type="number"
                valueAsNumber
                value={watch('gross_weight') - watch('less_weight')}
                InputProps={{
                  readOnly: true,
                }}
              />
              {baseMetalsData?.having_platinum && (
                <Field.Text
                  name="platinum_net_weight"
                  required
                  label="Platinum Net Wt."
                  placeholder="Platinum Net Wt."
                  type="number"
                  valueAsNumber
                  onInput={handleDecimalInput}
                />
              )}

              <Field.Text
                name="wastage_percentage"
                label="Wstg. %"
                type="number"
                valueAsNumber
                inputProps={{ step: '0.01' }}
                onInput={handleDecimalInput}
              />
              <Field.Text
                name="wastage_gram"
                label="Wstg. Gr"
                type="number"
                valueAsNumber
                value={
                  ((watch('wastage_percentage') || 0 * watch('net_weight') || 0) / 100).toFixed(
                    3
                  ) ?? 0
                }
                InputProps={{
                  readOnly: true,
                }}
                inputProps={{ step: '0.001' }}
              />
              <Field.Select
                name="wastage_type"
                label="Wstg. Type"
                isWithMenuItem
                options={[
                  { value: 'percentage', label: 'Percentage' },
                  { value: 'total_amount', label: 'Total Amount' },
                  { value: 'per_gram', label: 'Pre Gram' },
                ]}
              />

              <Field.Text
                name="value"
                label={watch('wastage_type') === 'percentage' ? 'Percentage' : 'Value'}
                type="number"
                valueAsNumber
                onInput={handleDecimalInput}
              />
              {watch('wastage_type') === 'per_gram' && (
                <Field.Text
                  name="per_gram_value"
                  required
                  label="Per Gram"
                  value={watch('value') || 0 * watch('net_weight') || 0}
                  type="number"
                  valueAsNumber
                  InputProps={{
                    readOnly: true,
                  }}
                />
              )}
              <Field.Text name="size" label="Size" placeholder="Size" />
            </Box>

            {/* Row 5 - Diamond details Details */}
            {baseMetalsData?.having_diamond && (
              <DynamicFormFields
                containerStyle={{
                  rowGap: 3,
                  columnGap: 2,
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'repeat(1, 1fr)',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(5, 1fr)',
                    lg: 'repeat(6, 1fr)',
                  },
                }}
                formTitle="Diamond Details"
                formName="diamond_details"
                isMultiple
                FormFields={diamondFields}
                methods={methods}
                defaultValues={diamond_details_default_values.diamond_details}
                initialFormValues={{ ...watch('diamond_details') }}
                isUpdate={barcode_item_id ? true : false}
              />
            )}

            {/* Row 6 - Financial and Other Details */}
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(5, 1fr)',
              }}
            >
              <Field.Text
                name="total_charges"
                label="Total Charges"
                placeholder="Total Charges"
                type="number"
                valueAsNumber
                InputProps={{
                  readOnly: true,
                  onClick: handleOpenChargesModal,
                  style: { cursor: 'pointer' },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton edge="end" onClick={handleOpenChargesModal} size="small">
                        <Iconify icon="eva:edit-fill" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Field.Text
                name="huid_details_str"
                label="HUID Details"
                placeholder="Press Enter"
                InputProps={{
                  readOnly: true,
                  onClick: handleOpenHuidDetailsModal,
                  style: { cursor: 'pointer' },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton edge="end" onClick={handleOpenHuidDetailsModal} size="small">
                        <Iconify icon="eva:edit-fill" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Field.Text
                name="purchase_details_str"
                label="Purchase Details"
                placeholder="Purchase Details"
                InputProps={{
                  focus: true,
                  readOnly: !isVariant,
                  // TODO: Make this field editable
                  onClick: isVariant ? void 0 : handleOpenPurchaseDetailsModal,
                  style: { cursor: 'pointer' },
                  endAdornment: isVariant ? null : (
                    <InputAdornment position="end">
                      <IconButton edge="end" size="small">
                        <Iconify icon="eva:edit-fill" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Field.Text
                name="mrp"
                label="MRP*"
                placeholder="MRP"
                type="number"
                valueAsNumber
                onInput={handleDecimalInput}
              />

              {!isVariant && (
                <Field.Text
                  name="gemstone_details_str"
                  label="Gemstone Details"
                  placeholder="Gemstone Details"
                  InputProps={{
                    onClick: handleOpenGemstoneModal,
                    readOnly: true,
                    style: { cursor: 'pointer' },
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton edge="end" size="small">
                          <Iconify icon="eva:edit-fill" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            </Box>
            {/* <Stack direction="row" spacing={2} sx={{ mt: 3 }} justifyContent="flex-end">
            <LoadingButton
              variant="contained"
              color="black"
              disabled={isSubmitting}
              loading={activeButton === 'save' && isSubmitting}
              onClick={() => onSubmitForm('save')}
              startIcon={<Iconify icon="eva:save-fill" />}
              sx={{ minWidth: 100 }}
            >
              {barcode_item_id ? 'Update' : 'Save'}
            </LoadingButton>

            <LoadingButton
              variant="outlined"
              color="black"
              disabled={isSubmitting}
              loading={activeButton === 'save_more' && isSubmitting}
              onClick={() => onSubmitForm('save_more')}
              startIcon={<Iconify icon="eva:plus-fill" />}
              sx={{ minWidth: 160 }}
            >
              {barcode_item_id ? 'Update' : 'Save'} & Add More
            </LoadingButton>

            <LoadingButton
              variant="outlined"
              color="black"
              disabled={isSubmitting}
              loading={activeButton === 'save_print' && isSubmitting}
              onClick={() => onSubmitForm('save_print')}
              startIcon={<Iconify icon="eva:printer-fill" />}
              sx={{ minWidth: 140 }}
            >
              {barcode_item_id ? 'Update' : 'Save'} & Print
            </LoadingButton>
          </Stack> */}
          </Card>
        </Form>

        <ProductFormModal
          open={subProductModalOpen}
          onClose={handleCloseSubProductModal}
          onSave={handleProductSave}
          loading={productLoading}
        />

        {/* HUID Details Modal */}
        <Dialog
          open={huidDetailsModalOpen}
          onClose={handleCloseHuidDetailsModal}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Huid Details</Typography>
              <IconButton onClick={handleCloseHuidDetailsModal} size="small">
                <Iconify icon="eva:close-fill" />
              </IconButton>
            </Box>
          </DialogTitle>
          <Form methods={huIdDetailsMethods}>
            <DialogContent>
              <Box
                sx={{ py: 1 }}
                rowGap={3}
                columnGap={2}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  lg: 'repeat(2, 1fr)',
                }}
              >
                <Field.Text name="huid" label="HUID" placeholder="Enter HUID" />
                <Field.Text name="huid2" label="HUID 2" placeholder="Enter HUID 2" />
                <Field.Text name="huid3" label="HUID 3" placeholder="Enter HUID 3" />
                <Field.Text
                  name="gram_option_1"
                  label="Gram Option 1"
                  placeholder="Enter Gram Option 1"
                />
                <Field.Text
                  name="gram_option_2"
                  label="Gram Option 2"
                  placeholder="Enter Gram Option 2"
                />
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 0 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleHuidDetailsSave}
                loading={isHuidDetailsSubmitting}
                startIcon={<Iconify icon="eva:save-fill" />}
              >
                Save
              </Button>
              <Button variant="outlined" color="inherit" onClick={handleCloseHuidDetailsModal}>
                Close
              </Button>
            </DialogActions>
          </Form>
        </Dialog>

        {/* Purchase Details Modal */}
        <Dialog
          open={purchaseDetailsModalOpen}
          onClose={handleClosePurchaseDetailsModal}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Purchase Details</Typography>
              <IconButton onClick={handleClosePurchaseDetailsModal} size="small">
                <Iconify icon="eva:close-fill" />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <PurchaseDetailsForm
              BaseMetalItems={baseMetalsData?.base_metal_types || []}
              onSubmitHandler={handlePurchaseDetailsSave}
              handleClose={handleClosePurchaseDetailsModal}
              initialFormValues={watch('purchase_details') || []}
            />
          </DialogContent>
        </Dialog>

        {/* All Charges Modal */}
        <Dialog open={chargesModalOpen} onClose={handleCloseChargesModal} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">All Charges</Typography>
              <IconButton onClick={handleCloseChargesModal} size="small">
                <Iconify icon="eva:close-fill" />
              </IconButton>
            </Box>
          </DialogTitle>

          <Form methods={chargesMethods}>
            <DialogContent>
              <Box sx={{ maxHeight: 400, overflow: 'auto', pt: 2 }}>
                {watchCharges('charges')?.map((charge, index) => (
                  <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                    <Field.Text
                      name={`charges.${index}.charge_type`}
                      label="Chrg. Ty."
                      placeholder="Charge Type"
                      sx={{ flex: 1 }}
                    />
                    <Field.Text
                      name={`charges.${index}.charge_amount`}
                      label="Chrg."
                      placeholder="Charge Value"
                      type="number"
                      valueAsNumber
                      onInput={handleDecimalInput}
                      sx={{ flex: 1 }}
                    />
                    {index === 0 ? (
                      <IconButton
                        color="success"
                        onClick={handleAddCharge}
                        sx={{ minWidth: 40, height: 40 }}
                      >
                        <Iconify icon="mingcute:add-line" />
                      </IconButton>
                    ) : (
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveCharge(index)}
                        sx={{ minWidth: 40, height: 40 }}
                      >
                        <Iconify icon="mingcute:delete-2-line" />
                      </IconButton>
                    )}
                  </Box>
                ))}
              </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 0 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleChargesSave}
                loading={isChargesSubmitting}
                startIcon={<Iconify icon="eva:save-fill" />}
              >
                Save
              </Button>
              <Button variant="outlined" color="inherit" onClick={handleCloseChargesModal}>
                Close
              </Button>
            </DialogActions>
          </Form>
        </Dialog>

        <Dialog open={gemstoneModalOpen} onClose={handleCloseGemstoneModal} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Gemstone Details</Typography>
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      color="primary"
                      checked={watch('gemstone')}
                      onChange={(e) => setValue('gemstone', e.target.checked)}
                    />
                  }
                  label="Gemstone"
                  labelPlacement="end"
                />
                <IconButton onClick={handleCloseGemstoneModal} size="small">
                  <Iconify icon="eva:close-fill" />
                </IconButton>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ pt: 1 }}>
            <GemstoneFormComponent
              initialFormValues={watch('gemstone_details') || []}
              handleSubmitForm={handleGemstoneSave}
              disabledForm={watch('gemstone')}
              handleCancel={handleCloseGemstoneModal}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }} />
        </Dialog>

        {/* Media Modal  */}
        <MediaModal
          open={mediaModalOpen}
          onClose={handleCloseMediaModal}
          mediaData={barcodeItem?.media_files || []}
          mediaType="image"
        />
      </Fragment>
    );
  }
);

// export function BarcodeItemForm({
//   itemCode,
//   isVariant,
//   variantIndex,
//   onRemoveVariant,
//   onSubmitHandler,
// }) {}
