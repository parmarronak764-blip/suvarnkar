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

import { useDiamondDetails } from 'src/hooks/useDiamondDetails';
import { useApi } from 'src/hooks/useApi';
import { API_ROUTES } from 'src/utils/apiRoute';

// ----------------------------------------------------------------------

const ProductCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'Category name is required')
    .max(100, 'Name must be less than 100 characters'),
  stock_type: z.number().min(1, 'Stock type is required'),
  metal_type: z.number().min(1, 'Metal type is required'),
});

// ----------------------------------------------------------------------

export function ProductCategoriesFormModal({
  open,
  onClose,
  currentItem,
  onSave,
  loading = false,
}) {
  const isEdit = Boolean(currentItem);

  // Hooks for fetching dropdown data
  const { data: metalTypes, fetchItems: fetchMetalTypes } = useDiamondDetails('metal');
  const { callApi } = useApi();
  const [stockTypes, setStockTypes] = useState([]);
  const methods = useForm({
    resolver: zodResolver(ProductCategorySchema),
    defaultValues: {
      name: '',
      stock_type: 0,
      metal_type: 0,
    },
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  // Fetch stock types
  const fetchStockTypes = useCallback(async () => {
    try {
      const response = await callApi({
        url: API_ROUTES.STOCK_TYPES.LIST,
        method: 'GET',
        query: { search: '' }, // Use search parameter as shown in API
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
    } catch (error) {
      console.error('Failed to fetch stock types:', error);
    }
  }, [callApi]);

  // Fetch data when modal opens
  useEffect(() => {
    if (open) {
      fetchMetalTypes();
      fetchStockTypes();
    }
  }, [open, fetchMetalTypes, fetchStockTypes]);

  // Reset form when modal opens/closes or item changes
  useEffect(() => {
    if (open) {
      if (currentItem) {
        reset({
          name: currentItem.name || '',
          stock_type: currentItem.stock_type || 0,
          metal_type: currentItem.metal_type || 0,
        });
      } else {
        reset({
          name: '',
          stock_type: 0,
          metal_type: 0,
        });
      }
    }
  }, [open, currentItem, reset]);

  const onSubmit = async (data) => {
    try {
      await onSave(data);
      reset();
      onClose();
      // Success toast is handled by the parent view component
    } catch (error) {
      console.error('Form submission error:', error);
      const errorMessage = getApiErrorMessage(null, error, 'Failed to save product category');
      toast.error(errorMessage);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const title = isEdit ? 'Edit Product Category' : 'Add Product Category';

  const onInvalid = (errors) => {
    const errorMessages = Object.entries(errors).map(
      ([field, error]) => `${field}: ${error.message}`
    );
    toast.error(`\n${errorMessages.join('\n')}`);
  };

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
            <Field.Text
              name="name"
              label="Category Name"
              placeholder="Enter category name"
              required
            />

            <Field.Select name="stock_type" label="Stock Type" required>
              <MenuItem value={0} disabled>
                Select stock type
              </MenuItem>
              {stockTypes.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  {type.name}
                </MenuItem>
              ))}
            </Field.Select>

            <Field.Select name="metal_type" label="Metal Type" required>
              <MenuItem value={0} disabled>
                Select metal type
              </MenuItem>
              {metalTypes.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  {type.name}
                </MenuItem>
              ))}
            </Field.Select>
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
