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
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Field, Form } from 'src/components/hook-form';
import { getApiErrorMessage } from 'src/utils/error-handler';
import { DynamicFormFields } from 'src/components/dynamic-form-fields';

import { useBarcodeLocations } from 'src/hooks/useBarcodeLocations';
import { useSelector } from 'react-redux';

// ----------------------------------------------------------------------

// Schema for individual bulk entry items
const BulkEntryItemSchema = z.object({
  location_name: z
    .string()
    .min(1, 'Location name is required')
    .max(255, 'Location name must be less than 255 characters'),
  box_weight: z
    .union([z.string(), z.number()])
    .refine(
      (val) => {
        const num = typeof val === 'string' ? parseFloat(val) : val;
        return !isNaN(num) && num > 0;
      },
      'Box weight must be a valid positive number'
    )
    .transform((val) => typeof val === 'number' ? val : parseFloat(val)),
  box_code: z.string().optional(), // Auto-generated, not validated
});

// Simple main form schema - we'll handle conditional validation in the component
const BarcodeLocationSchema = z.object({
  // Fields are optional by default, we'll validate conditionally in the component
  location_name: z.string().optional(),
  box_weight: z.union([z.string(), z.number()]).optional(),
  company_id: z.number().optional(),
  isBulkEntry: z.boolean().optional(),
  bulkCount: z.number().min(1).max(10).optional(),
});

// ----------------------------------------------------------------------

export function BarcodeLocationFormModal({
  open,
  onClose,
  currentItem,
  onSave,
  loading = false,
}) {
  const isEdit = Boolean(currentItem);
  
  const { getNextCodes } = useBarcodeLocations();
  const [dynamicItems, setDynamicItems] = useState([]);
  const [generatedCodes, setGeneratedCodes] = useState([]);
  const [singleCode, setSingleCode] = useState('');
  const [generatingCodes, setGeneratingCodes] = useState(false);
  const selectedCompany = useSelector((state) => state.user.selectedCompany);

  const methods = useForm({
    resolver: zodResolver(BarcodeLocationSchema),
    defaultValues: {
      location_name: '',
      box_weight: '',
      company_id: 0,
      isBulkEntry: false,
      bulkCount: 1,
    },
  });

  const {
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isSubmitting },
  } = methods;

  const watchedValues = watch();
  const isBulkEntry = watchedValues.isBulkEntry;
  const bulkCount = watchedValues.bulkCount || 1;

  // Initialize dynamic items when bulk entry is toggled
  useEffect(() => {
    if (isBulkEntry && dynamicItems.length === 0) {
      setDynamicItems([
        {
          location_name: '',
          box_weight: '',
          box_code: '', // Will be generated
        },
      ]);
    }
  }, [isBulkEntry, dynamicItems.length]);

  // Reset form when modal opens/closes or item changes
  useEffect(() => {
    if (open) {
      if (currentItem) {
        reset({
          location_name: currentItem.location_name || '',
          box_weight: currentItem.box_weight || '',
          company_id: currentItem.company_id || 0,
          isBulkEntry: false, // Always single entry for editing
          bulkCount: 1,
        });
      } else {
        const companyId = selectedCompany?.company?.id || selectedCompany?.id || 0;
        reset({
          location_name: '',
          box_weight: '',
          company_id: companyId,
          isBulkEntry: false,
          bulkCount: 1,
        });
        setDynamicItems([
          {
            location_name: '',
            box_weight: '',
            box_code: '',
          },
        ]);
      }
      setGeneratedCodes([]);
    }
  }, [open, currentItem, reset, selectedCompany]);

  // Generate single code for new single entries
  const generateSingleCode = useCallback(async () => {
    if (isEdit) return; // Don't generate for editing

    setGeneratingCodes(true);
    try {
      const result = await getNextCodes(1);
      if (result.success && result.codes && result.codes.length > 0) {
        setSingleCode(result.codes[0]);
      } else {
        toast.error(result.message || 'Failed to generate box code');
        setSingleCode('');
      }
    } catch (error) {
      console.error('Failed to generate single code:', error);
      toast.error('Failed to generate box code');
      setSingleCode('');
    } finally {
      setGeneratingCodes(false);
    }
  }, [getNextCodes, isEdit]);

  // Auto-generate single code for new entries
  useEffect(() => {
    if (open && !currentItem && !isBulkEntry) {
      generateSingleCode();
    }
  }, [open, currentItem, isBulkEntry, generateSingleCode]);

  // Generate codes when bulk count changes
  const handleGenerateCodes = useCallback(async () => {
    if (!isBulkEntry || bulkCount < 1 || bulkCount > 10) return;

    setGeneratingCodes(true);
    try {
      const result = await getNextCodes(bulkCount);
      if (result.success && result.codes) {
        setGeneratedCodes(result.codes);
        
        // Update dynamic items with generated codes
        const newDynamicItems = [];
        for (let i = 0; i < bulkCount; i++) {
          newDynamicItems.push({
            location_name: dynamicItems[i]?.location_name || '',
            box_weight: dynamicItems[i]?.box_weight || '',
            box_code: result.codes[i] || '',
          });
        }
        setDynamicItems(newDynamicItems);
      } else {
        toast.error(result.message || 'Failed to generate codes');
      }
    } catch (error) {
      console.error('Failed to generate codes:', error);
      toast.error('Failed to generate codes');
    } finally {
      setGeneratingCodes(false);
    }
  }, [isBulkEntry, bulkCount, getNextCodes, dynamicItems]);

  // Auto-generate codes when bulk count changes
  useEffect(() => {
    if (isBulkEntry && bulkCount > 0 && bulkCount <= 10) {
      handleGenerateCodes();
    }
  }, [isBulkEntry, bulkCount]); // Remove handleGenerateCodes from deps to avoid infinite loop

  const onSubmit = async (data) => {
    try {
      // Get company ID from selected company (system-determined, not user input)
      const companyId = selectedCompany?.company?.id || selectedCompany?.id;
      if (!companyId) {
        console.error('No company selected - this should not happen in normal flow');
        throw new Error('System error: No company context available');
      }

      if (data.isBulkEntry) {
        // Validate dynamic items using Zod schema
        if (!dynamicItems || dynamicItems.length === 0) {
          toast.error('Please add at least one barcode location');
          return;
        }

        // Filter items that have any data (to avoid empty rows)
        const itemsWithData = dynamicItems.filter(
          (item) => item.location_name?.trim() || item.box_weight
        );

        if (itemsWithData.length === 0) {
          toast.error('Please fill in at least one complete barcode location with valid data');
          return;
        }

        // Validate each item using Zod schema
        const validItems = [];
        for (let i = 0; i < itemsWithData.length; i++) {
          const item = itemsWithData[i];
          const itemIndex = dynamicItems.indexOf(item) + 1; // Get original index for error messages
          
          try {
            // Use Zod schema to validate and transform the item
            const validatedItem = BulkEntryItemSchema.parse({
              location_name: item.location_name?.trim() || '',
              box_weight: item.box_weight,
              box_code: item.box_code
            });
            validItems.push(validatedItem);
          } catch (zodError) {
            // Extract Zod validation errors
            const errors = zodError.errors || [];
            if (errors.length > 0) {
              const errorMessage = errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
              toast.error(`Item ${itemIndex} - ${errorMessage}`);
            } else {
              toast.error(`Item ${itemIndex} has validation errors`);
            }
            return;
          }
        }

        if (validItems.length > 10) {
          toast.error('Cannot create more than 10 barcode locations at once');
          return;
        }

        // Check for duplicate names within the form
        const names = validItems.map((item) => item.location_name.trim());
        const uniqueNames = [...new Set(names)];

        if (names.length !== uniqueNames.length) {
          toast.error('Duplicate location names found. Please remove duplicates before submitting.');
          return;
        }

        // Create bulk data object (box_code should not be sent to API)
        const bulkData = {
          company_id: companyId,
          barcode_locations: validItems.map((item) => ({
            location_name: item.location_name.trim(),
            box_weight: parseFloat(item.box_weight),
            // Note: box_code is NOT sent to API as it's auto-generated
          })),
        };

        await onSave(bulkData, true); // true indicates bulk operation
        reset();
        setDynamicItems([
          {
            location_name: '',
            box_weight: '',
            box_code: '',
          },
        ]);
        setGeneratedCodes([]);
        onClose();
        toast.success(`${validItems.length} barcode location(s) created successfully!`);
      } else {
        // Single entry - validate using the same Zod schema as bulk items
        const singleEntryData = {
          location_name: data.location_name?.trim() || '',
          box_weight: data.box_weight,
          box_code: '', // Not used for single entry
        };

        try {
          // Use Zod schema to validate single entry
          const validatedData = BulkEntryItemSchema.parse(singleEntryData);
          
          // Prepare single item data (box_code is auto-generated by backend)
          const processedData = {
            location_name: validatedData.location_name,
            box_weight: validatedData.box_weight,
            company_id: companyId,
          };

          await onSave(processedData, false); // false indicates single operation
          reset();
          onClose();
          toast.success(isEdit ? 'Barcode location updated successfully!' : 'Barcode location created successfully!');
        } catch (zodError) {
          // Extract Zod validation errors for single entry
          const errors = zodError.errors || [];
          if (errors.length > 0) {
            const errorMessage = errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
            toast.error(errorMessage);
          } else {
            toast.error('Please fill in all required fields');
          }
          return;
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
      const errorMessage = getApiErrorMessage(null, error, 'Failed to save barcode location');
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
    setDynamicItems([]);
    setGeneratedCodes([]);
    setSingleCode('');
    onClose();
  };

  const handleDynamicItemsChange = (newItems) => {
    setDynamicItems(newItems);
  };

  const dynamicFields = [
    {
      name: 'location_name',
      label: 'Location Name',
      type: 'text',
      flex: 1,
    },
    {
      name: 'box_weight',
      label: 'Box Weight',
      type: 'number',
      flex: 1,
      inputProps: { step: '0.001', min: '0' },
    },
    {
      name: 'box_code',
      label: 'Box Code (Auto-generated)',
      type: 'text',
      flex: 1,
      disabled: true,
    },
  ];

  const title = isEdit ? 'Edit Barcode Location' : 'Add Barcode Location';

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: 400 },
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">{title}</Typography>
          <IconButton onClick={handleClose}>
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <Form methods={methods} onSubmit={handleSubmit(onSubmit, onInvalid)}>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={3}>
            {/* Bulk Entry Toggle - Only for new items */}
            {!isEdit && (
              <FormControlLabel
                control={
                  <Switch
                    checked={isBulkEntry}
                    onChange={(e) => setValue('isBulkEntry', e.target.checked)}
                  />
                }
                label="Bulk Entry Mode"
                sx={{ alignSelf: 'flex-start' }}
              />
            )}

            {isBulkEntry ? (
              <Stack spacing={3}>
                {/* Bulk Count Input */}
                <Box>
                  <TextField
                    label="Number of Locations (Max 10)"
                    type="number"
                    value={bulkCount}
                    onChange={(e) => {
                      const count = Math.max(1, Math.min(10, parseInt(e.target.value, 10) || 1));
                      setValue('bulkCount', count);
                    }}
                    inputProps={{ min: 1, max: 10 }}
                    size="small"
                    sx={{ width: 200 }}
                  />
                </Box>

                {/* Bulk Entry Limit Alert */}
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Bulk Entry Rules:</strong>
                    <br />
                    • Maximum 10 barcode locations can be created at once
                    <br />
                    • Box codes are automatically generated and shown for preview
                    <br />
                    • Box codes are NOT sent to the API (auto-generated by backend)
                  </Typography>
                </Alert>

                {/* Generated Codes Preview */}
                {generatedCodes.length > 0 && (
                  <Card variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Generated Box Codes (Preview Only)
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {generatedCodes.map((code, index) => (
                        <Chip
                          key={index}
                          label={code}
                          size="small"
                          variant="outlined"
                          color="primary"
                        />
                      ))}
                    </Box>
                  </Card>
                )}

                {/* Dynamic Form Fields */}
                <DynamicFormFields
                  title="Barcode Locations"
                  fields={dynamicFields}
                  values={dynamicItems}
                  onChange={handleDynamicItemsChange}
                  disabled={isSubmitting || generatingCodes}
                  minItems={1}
                  maxItems={10}
                />

                {/* Regenerate Codes Button */}
                <Box>
                  <Button
                    variant="outlined"
                    startIcon={<Iconify icon="mingcute:refresh-2-line" />}
                    onClick={handleGenerateCodes}
                    disabled={generatingCodes || isSubmitting}
                    size="small"
                  >
                    {generatingCodes ? 'Generating...' : 'Regenerate Codes'}
                  </Button>
                </Box>
              </Stack>
            ) : (
              <Stack spacing={3}>
                {/* Single Entry Form */}
                <Field.Text
                  name="location_name"
                  label="Location Name"
                  placeholder="Enter location name"
                  required
                />

                <Field.Text
                  name="box_weight"
                  label="Box Weight"
                  placeholder="Enter box weight"
                  type="number"
                  inputProps={{ step: '0.001', min: '0' }}
                  required
                />

                {/* Box Code Display for Single Entry */}
                {!isEdit && (
                  <Stack spacing={2}>
                    <TextField
                      label="Box Code (Auto-generated)"
                      value={singleCode}
                      disabled
                      variant="outlined"
                      fullWidth
                      sx={{
                        '& .MuiInputBase-input.Mui-disabled': {
                          WebkitTextFillColor: 'rgba(0, 0, 0, 0.6)',
                          fontFamily: 'monospace',
                          fontWeight: 'bold',
                        },
                        '& .MuiOutlinedInput-root.Mui-disabled': {
                          backgroundColor: 'rgba(0, 0, 0, 0.05)',
                        },
                      }}
                      InputProps={{
                        endAdornment: (
                          <IconButton
                            size="small"
                            onClick={generateSingleCode}
                            disabled={generatingCodes}
                            title="Regenerate code"
                          >
                            <Iconify icon="mingcute:refresh-2-line" width={16} />
                          </IconButton>
                        ),
                      }}
                    />

                    <Alert severity="info">
                      <Typography variant="body2">
                        <strong>Preview Box Code:</strong> This code is generated for preview only and will not be sent to the API. The actual code will be auto-generated by the backend.
                      </Typography>
                    </Alert>
                  </Stack>
                )}

                {/* Note about box code for editing */}
                {isEdit && (
                  <Alert severity="info">
                    <Typography variant="body2">
                      Box code cannot be changed when editing a location.
                    </Typography>
                  </Alert>
                )}
              </Stack>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button onClick={handleClose} color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            loading={isSubmitting || generatingCodes}
            disabled={isSubmitting || generatingCodes}
          >
            {isEdit ? 'Update Location' : 'Create Location(s)'}
          </Button>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
