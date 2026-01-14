import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Field, Form } from 'src/components/hook-form';
import { getApiErrorMessage } from 'src/utils/error-handler';

import { useProductCategories } from 'src/hooks/useProductCategories';
import { useDiamondDetails } from 'src/hooks/useDiamondDetails';
import { useApi } from 'src/hooks/useApi';
import { API_ROUTES } from 'src/utils/apiRoute';
import { useSelector } from 'react-redux';
import { CaratSelect } from 'src/components/CaratSelect/CaratSelect';
import { objectClean } from 'src/utils/objectOptimizer';

// ----------------------------------------------------------------------

const ProductSchema = z.object({
  // 1. Product category (required)
  product_category: z.number().min(1, 'Product category is required'),

  // 2. Product name (required)
  product_name: z
    .string()
    .min(1, 'Product name is required')
    .max(255, 'Product name must be less than 255 characters'),

  // 3. Tag prefix (optional - uses company tag prefix if not provided)
  tag_prefix: z.string().max(50, 'Tag prefix must be less than 50 characters').optional(),

  // 4. Opening gross weight (required) - accept both string and number
  opening_gross_weight: z.coerce.string(),
  // .union([z.string(), z.number()])
  // .refine((val) => {
  //   const num = typeof val === 'string' ? parseFloat(val) : val;
  //   return !isNaN(num) && num >= 0;
  // }, 'Opening gross weight must be a valid positive number')
  // .transform((val) => (typeof val === 'number' ? val.toString() : val)),

  // 5. Opening less weight (required) - accept both string and number
  opening_less_weight: z.coerce.string(),
  // .union([z.string(), z.number()])
  // .refine((val) => {
  //   const num = typeof val === 'string' ? parseFloat(val) : val;
  //   return !isNaN(num) && num >= 0;
  // }, 'Opening less weight must be a valid positive number')
  // .transform((val) => (typeof val === 'number' ? val.toString() : val)),

  // 6. Opening net weight (calculated: gross - less)
  opening_net_weight: z.coerce.string(),
  // .union([z.string(), z.number()])
  // .optional()
  // .transform((val) => (val ? (typeof val === 'number' ? val.toString() : val) : '')),

  // 7. Opening quantity (required)
  opening_quantity: z.coerce
    .number() // OutPut needed to be number
    // .min(1, 'Opening quantity is required')
    .max(2147483647, 'Opening quantity is too large'),

  // 8. Average rate (required) - accept both string and number
  average_rate: z.coerce.string(),
  // .union([z.string(), z.number()])
  // .refine((val) => {
  //   const num = typeof val === 'string' ? parseFloat(val) : val;
  //   return !isNaN(num) && num >= 0;
  // }, 'Average rate must be a valid positive number')
  // .transform((val) => (typeof val === 'number' ? val.toString() : val)),

  // 9. Tag weight (required) - accept both string and number
  tag_weight: z.coerce.string(),
  // .union([z.string(), z.number()])
  // .refine((val) => {
  //   const num = typeof val === 'string' ? parseFloat(val) : val;
  //   return !isNaN(num) && num >= 0;
  // }, 'Tag weight must be a valid positive number')
  // .transform((val) => (typeof val === 'number' ? val.toString() : val)),

  // 10. Box weight (required) - accept both string and number
  box_weight: z.coerce.string(),
  // .union([z.string(), z.number()])
  // .refine((val) => {
  //   const num = typeof val === 'string' ? parseFloat(val) : val;
  //   return !isNaN(num) && num >= 0;
  // }, 'Box weight must be a valid positive number')
  // .transform((val) => (typeof val === 'number' ? val.toString() : val)),

  // 11. Carats (required) - array of carat IDs for each metal component
  carats: z.array(z.number().min(1, 'Carat is required')).min(1, 'At least one carat is required'),
});

// ----------------------------------------------------------------------

export function ProductFormModal({ open, onClose, currentItem, onSave, loading = false }) {
  const isEdit = Boolean(currentItem);

  // Hooks for fetching dropdown data
  const { fetchItems: fetchProductCategories } = useProductCategories();
  const { data: metalTypes, fetchItems: fetchMetalTypes } = useDiamondDetails('metal');
  const { callApi } = useApi();
  const [productCategories, setProductCategories] = useState([]);
  const [carats, setCarats] = useState([]);
  const selectedCompany = useSelector((state) => state.user.selectedCompany);

  const methods = useForm({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      product_category: 0,
      product_name: '',
      tag_prefix: '',
      opening_gross_weight: '',
      opening_less_weight: '',
      opening_net_weight: '',
      opening_quantity: 1,
      average_rate: '',
      tag_weight: '',
      box_weight: '',
      carats: [],
    },
  });

  const {
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isSubmitting },
  } = methods;

  // Watch gross and less weights to calculate net weight
  const grossWeight = watch('opening_gross_weight');
  const lessWeight = watch('opening_less_weight');

  // Watch selected product category to show carats
  const selectedCategoryId = watch('product_category');

  // Calculate and set net weight when gross or less weight changes
  useEffect(() => {
    const gross = parseFloat(grossWeight) || 0;
    const less = parseFloat(lessWeight) || 0;
    const net = gross - less;

    if (gross > 0 || less > 0) {
      setValue('opening_net_weight', net >= 0 ? net.toFixed(4) : '0.0000');
    }
  }, [grossWeight, lessWeight, setValue]);

  // Fetch carats
  const fetchCarats = useCallback(async () => {
    try {
      const companyId = selectedCompany?.company?.id || selectedCompany?.id;
      const response = await callApi({
        url: API_ROUTES.DIAMOND_DETAILS.CARAT.LIST,
        method: 'GET',
        query: {
          company_id: companyId,
          page: 1,
          page_size: 100,
        },
      });

      if (response.success) {
        // Handle the useApi hook's array spreading behavior
        let items = [];
        const caratItems = Object.values(response).filter(
          (v) => typeof v === 'object' && v !== null && 'id' in v
        );
        items = caratItems;
        setCarats(items);
      }
    } catch (error) {
      console.error('Failed to fetch carats:', error);
    }
  }, [callApi, selectedCompany?.company?.id, selectedCompany?.id]);

  // Fetch product categories and related data when modal opens
  useEffect(() => {
    if (open) {
      fetchProductCategories()
        .then((result) => {
          setProductCategories(result?.items || []);
        })
        .catch((error) => {
          console.error('Failed to fetch product categories:', error);
          toast.error('Failed to load product categories');
        });

      fetchMetalTypes();
      fetchCarats();
    }
  }, [open, fetchProductCategories, fetchMetalTypes, fetchCarats]);

  // Reset form when modal opens/closes or item changes
  useEffect(() => {
    if (open) {
      if (currentItem) {
        // Convert carats array of objects to array of IDs
        const caratIds = [];
        if (Array.isArray(currentItem.carats) && currentItem.carats.length > 0) {
          currentItem.carats.forEach((carat) => {
            // Handle both object format {id: 1, name: "22"} and direct ID format
            caratIds.push(typeof carat === 'object' && carat !== null ? carat.id : carat);
          });
        }

        reset({
          product_category: currentItem.product_category?.id || currentItem.product_category || 0,
          product_name: currentItem.product_name || '',
          tag_prefix: currentItem.tag_prefix || '',
          opening_gross_weight: String(currentItem.opening_gross_weight || ''),
          opening_less_weight: String(currentItem.opening_less_weight || ''),
          opening_net_weight: String(currentItem.opening_net_weight || ''),
          opening_quantity: Number(currentItem.opening_quantity) || 1,
          average_rate: String(currentItem.average_rate || ''),
          tag_weight: String(currentItem.tag_weight || ''),
          box_weight: String(currentItem.box_weight || ''),
          carats: caratIds,
        });
      } else {
        // For new products, set tag_prefix from company settings
        const companyTagPrefix = selectedCompany?.company?.tag_prefix || '';
        reset({
          product_category: 0,
          product_name: '',
          tag_prefix: companyTagPrefix,
          opening_gross_weight: '',
          opening_less_weight: '',
          opening_net_weight: '',
          opening_quantity: 1,
          average_rate: '',
          tag_weight: '',
          box_weight: '',
          carats: [],
        });
      }
    }
  }, [open, currentItem, reset, selectedCompany]);

  const onSubmit = async (data) => {
    try {
      // Get company ID from selected company (system-determined, not user input)
      const companyId = selectedCompany?.company?.id || selectedCompany?.id;
      if (!companyId) {
        console.error('No company selected - this should not happen in normal flow');
        throw new Error('System error: No company context available');
      }

      // Convert string numbers to appropriate types for API
      const processedData = {
        ...data,
        company: companyId, // Ensure company ID is included
        opening_gross_weight: data.opening_gross_weight ? parseFloat(data.opening_gross_weight) : 0,
        opening_less_weight: data.opening_less_weight ? parseFloat(data.opening_less_weight) : 0,
        opening_net_weight: data.opening_net_weight ? parseFloat(data.opening_net_weight || 0) : 0,
        average_rate: data.average_rate ? parseFloat(data.average_rate) : 0,
        tag_weight: data.tag_weight ? parseFloat(data.tag_weight) : 0,
        box_weight: data.box_weight ? parseFloat(data.box_weight) : 0,
        // Convert carats object to array format if needed by the API
        carats: data.carats ? data.carats.filter((value) => value > 0) : [],
      };
      const payload = objectClean(processedData);

      await onSave(payload);
      reset();
      onClose();
      toast.success(isEdit ? 'Product updated successfully!' : 'Product created successfully!');
    } catch (error) {
      console.error('Form submission error:', error);
      const errorMessage = getApiErrorMessage(null, error, 'Failed to save product');
      toast.error(errorMessage);
    }
  };

  const onInvalid = (errors) => {
    const errorMessages = Object.entries(errors).map(
      ([field, error]) => `${field}: ${error.message}`
    );
    toast.error(`Please fix the following errors:\n${errorMessages.join('\n')}`);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const title = isEdit ? 'Edit Product' : 'Add Product';

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </Box>
      </DialogTitle>

      <Form methods={methods} onSubmit={handleSubmit(onSubmit, onInvalid)}>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={3} sx={{ pt: 1 }}>
            {/* 1. Product Category */}
            <Field.Select name="product_category" label="Product Category" required>
              <MenuItem value={0} disabled>
                Select product category
              </MenuItem>
              {productCategories?.map((category) => {
                const metalType = metalTypes.find((m) => m.id === category.metal_type);
                const metalTypeName = metalType ? metalType.name : 'Unknown Metal';
                return (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name} ({metalTypeName})
                  </MenuItem>
                );
              })}
            </Field.Select>

            {/* 2. Carats Section - Dynamic based on selected product category */}
            {(() => {
              const selectedCategory = productCategories.find(
                (cat) => cat.id === selectedCategoryId
              );
              if (!selectedCategory || !selectedCategory.metal_type) return null;

              const selectedMetal = metalTypes.find((m) => m.id === selectedCategory.metal_type);
              if (!selectedMetal) return null;

              return (
                <>
                  <Typography variant="h6" sx={{ mt: 1, mb: 1 }}>
                    Carat Selection
                  </Typography>
                  <Stack spacing={2}>
                    {selectedMetal.components.map((compId, index) => {
                      const compMetal = metalTypes.find((m) => m.id === compId);
                      return (
                        <CaratSelect
                          key={compId}
                          index={index}
                          metalId={compId}
                          metalName={compMetal?.name || 'Metal'}
                          carats={carats}
                        />
                      );
                    })}
                  </Stack>
                </>
              );
            })()}

            {/* 3. Product Name */}
            <Field.Text
              name="product_name"
              label="Product Name"
              placeholder="Enter product name"
              required
            />

            {/* 4. Tag Prefix */}
            <Field.Text
              name="tag_prefix"
              label="Tag Prefix"
              placeholder="Tag prefix for the product"
              helperText="If not provided, will use company's tag prefix"
            />

            {/* Weight Section */}
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              Weight Details
            </Typography>

            {/* 5. Opening Gross Weight */}
            <Field.Text
              name="opening_gross_weight"
              label="Opening Gross Weight"
              placeholder="Enter opening gross weight"
              type="number"
              inputProps={{ step: '0.0001', min: '0' }}
              // required
            />

            {/* 6. Opening Less Weight */}
            <Field.Text
              name="opening_less_weight"
              label="Opening Less Weight"
              placeholder="Enter opening less weight"
              type="number"
              inputProps={{ step: '0.0001', min: '0' }}
              // required
            />

            {/* 7. Opening Net Weight (calculated) */}
            <Field.Text
              name="opening_net_weight"
              label="Opening Net Weight"
              placeholder="Calculated automatically"
              InputProps={{ readOnly: true }}
              helperText="Automatically calculated: Gross Weight - Less Weight"
            />

            {/* Quantity & Rate Section */}
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              Quantity & Rate
            </Typography>

            {/* 8. Opening Quantity */}
            <Field.Text
              name="opening_quantity"
              label="Opening Quantity"
              placeholder="Enter opening quantity"
              type="number"
              inputProps={{ min: '1', step: '1' }}
              // required
            />

            {/* 9. Average Rate */}
            <Field.Text
              name="average_rate"
              label="Average Rate"
              placeholder="Enter average rate"
              type="number"
              inputProps={{ step: '0.01', min: '0' }}
              // required
            />

            {/* Additional Weights Section */}
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              Additional Weights
            </Typography>

            {/* 10. Tag Weight */}
            <Field.Text
              name="tag_weight"
              label="Tag Weight"
              placeholder="Enter tag weight"
              type="number"
              inputProps={{ step: '0.0001', min: '0' }}
              // required
            />

            {/* 11. Box Weight */}
            <Field.Text
              name="box_weight"
              label="Box Weight"
              placeholder="Enter box weight"
              type="number"
              inputProps={{ step: '0.0001', min: '0' }}
              // required
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose} variant="outlined" disabled={isSubmitting || loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || loading}
            startIcon={
              isSubmitting || loading ? (
                <Iconify icon="svg-spinners:8-dots-rotate" width={16} />
              ) : (
                <Iconify icon="mingcute:check-line" />
              )
            }
          >
            {isSubmitting || loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
