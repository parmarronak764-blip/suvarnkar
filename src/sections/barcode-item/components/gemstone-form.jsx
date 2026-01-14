import React, { memo, useCallback, useEffect, useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextField, MenuItem, Button, IconButton, Box } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { GemstoneSchema } from '../schema/formSchema';
import { GemstoneFormDefaultValues } from '../const/formInitial';
import useGemstone from 'src/hooks/useGemstone';
import { toast } from 'sonner';

const disabledOption = (Name) => [{ label: `Select ${Name}`, disabled: true }];
const gemstoneFields = [
  {
    name: 'main_type',
    label: 'Main Type',
    type: 'select',
    required: true,
    options: disabledOption('Main Type'),
  },
  {
    name: 'sub_type',
    label: 'Sub Type',
    type: 'select',
    required: true,
    options: disabledOption('Sub Type'),
  },
  { name: 'code', label: 'Code', type: 'text' },
  {
    name: 'shape',
    label: 'Shape',
    type: 'select',
    required: true,
    options: disabledOption('Shape'),
  },
  { name: 'dimension', label: 'Dimension', type: 'number', returnType: 'number' },
  { name: 'carat_weight', label: 'Carat/Wt', type: 'number', required: true },
  { name: 'rate', label: 'Rate', type: 'number', required: true },
  { name: 'amount', label: 'Amount', type: 'number', readOnly: true, required: true },
  { name: 'certificate_charges', label: 'Cert.Chrg', type: 'number' },
  { name: 'pieces', label: 'pieces', type: 'number', returnType: 'number' },
];

const GemstoneFormComponent = (props) => {
  // Props Consts
  const {
    initialFormValues,
    handleSubmitForm = () => {},
    disabledForm = false,
    handleCancel = () => {},
  } = props;

  // States and Hooks
  const [subTypeOptions, setSubTypeOptions] = useState([]);
  const {
    fetchShapes: fetchGemstoneShape,
    fetchGemstonesCarats,
    fetchSubTypes: fetchGemstoneSubType,
  } = useGemstone();

  const [gemStoneDropdownOptions, setGemStoneDropdownOptions] = useState({
    gemstone_shape: [],
    gemstone_sub_type: [],
    gemstone_main_type: [],
  });

  // Form hooks
  const {
    control,
    handleSubmit,
    register,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(GemstoneSchema),
    defaultValues: { gemstones: [GemstoneFormDefaultValues] },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'gemstones',
  });

  const setInitialOptions = useCallback(() => {
    const updatedFields = gemstoneFields.map((field) => {
      if (field.name === 'main_type') {
        return {
          ...field,
          options: [
            ...disabledOption('Main Type'),
            ...(gemStoneDropdownOptions?.gemstone_main_type || []).map((item) => ({
              value: item.id,
              label: item.name,
            })),
          ],
        };
      }
      if (field.name === 'shape') {
        return {
          ...field,
          options: [
            ...disabledOption('Shape'),
            ...(gemStoneDropdownOptions?.gemstone_shape || []).map((item) => ({
              value: item.id,
              label: item.name,
            })),
          ],
        };
      }
      if (field.name === 'sub_type') {
        return {
          ...field,
          options: [
            ...disabledOption('Sub Type'),
            ...(gemStoneDropdownOptions?.gemstone_sub_type || []).map((subType) => ({
              value: subType.id,
              label: subType.sub_type_name,
            })),
          ],
        };
      }
      return field;
    });
    gemstoneFields.splice(0, gemstoneFields.length, ...updatedFields);
  }, [gemStoneDropdownOptions]);

  //  Fetch Gem stone dropdown lists  Functions
  const handleFetchShapes = useCallback(async () => {
    try {
      const result = await fetchGemstoneShape(1, 25, { pagination: false });
      if (result.success) {
        return result.data || [];
      } else {
        toast.error(result.message || 'Failed to load shapes');
      }
      return [];
    } catch (error) {
      console.error('Error fetching  shapes:', error);
      toast.error('Failed to load shapes');
      return [];
    }
  }, [fetchGemstoneShape]);

  const handleFetchMainTypeGemstone = useCallback(async () => {
    try {
      const result = await fetchGemstonesCarats({ search: '' });
      if (result.success) {
        return result?.data || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching main types:', error);
      toast.error('Failed to fetch main type');
      return [];
    }
  }, [fetchGemstonesCarats]);

  const handleFetchAllSubTypes = useCallback(async () => {
    try {
      const result = await fetchGemstoneSubType(1, 25, { pagination: false });
      if (result.success) {
        return result.data || [];
      } else {
        toast.error(result.message || 'Failed to load sub types');
      }
      return [];
    } catch (error) {
      console.error('Error fetching sub types:', error);
      toast.error('Failed to load sub types');
      return [];
    }
  }, [fetchGemstoneSubType]);

  const handleFetchSubTypes = useCallback(
    async (mainTypeValue, index) => {
      try {
        if (!mainTypeValue) {
          setSubTypeOptions((prev) => {
            const updated = [...prev];
            updated[index] = [...disabledOption('Sub Type')];
            return updated;
          });
          return;
        }

        const result = await fetchGemstoneSubType(1, 25, {
          pagination: false,
          carat: mainTypeValue,
        });

        if (result.success) {
          setSubTypeOptions((prev) => {
            const updated = [...prev];
            const subTypes = (result.data || []).map((subType) => ({
              value: subType.id,
              label: subType.sub_type_name,
            }));
            console.log('subTypes', subTypes);
            updated[index] = subTypes || [];
            return updated;
          });
        } else {
          toast.error(result.message || 'Failed to load sub types');
        }
      } catch (error) {
        console.error('Error fetching sub types:', error);
        toast.error('Failed to load sub types');
      }
    },
    [fetchGemstoneSubType, watch('main_type')]
  );

  const loadGemstoneDropdownData = useCallback(async () => {
    try {
      const [shapes, subTypes, mainType] = await Promise.all([
        handleFetchShapes(),
        handleFetchAllSubTypes(),
        handleFetchMainTypeGemstone(),
      ]);

      setGemStoneDropdownOptions({
        gemstone_sub_type: subTypes,
        gemstone_shape: shapes,
        gemstone_main_type: mainType,
      });
    } catch (error) {
      console.error(error);
    }
  }, [handleFetchShapes, handleFetchAllSubTypes, handleFetchMainTypeGemstone]);

  useEffect(() => {
    const fetchData = async () => {
      await loadGemstoneDropdownData();
    };
    fetchData();
  }, []);

  useEffect(() => {
    setInitialOptions();
  }, [setInitialOptions]);

  useEffect(() => {
    if (initialFormValues?.length > 0) {
      setValue('gemstones', initialFormValues);
    }
  }, [initialFormValues]);

  const onSubmit = (data) => {
    if (isSubmitting) return;
    handleSubmitForm(data.gemstones);
  };

  const onAdd = () => append(GemstoneFormDefaultValues);
  const onRemove = (index) => remove(index);

  useEffect(() => {
    const subscription = watch((values, { name }) => {
      // Only run when carat_weight or rate changes
      if (!name?.includes('carat_weight') && !name?.includes('rate')) return;
      const match = name.match(/gemstones\.(\d+)\./);
      if (!match) return;
      const index = Number(match[1]);
      const carat = values.gemstones[index]?.carat_weight || 0;
      const rate = values.gemstones[index]?.rate || 0;
      const amount = calculateAmount(carat, rate);
      setValue(`gemstones.${index}.amount`, amount, { shouldValidate: true });
    });

    return () => subscription.unsubscribe();
  }, [watch, setValue]);

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} p={2}>
      {fields.map((item, index) => (
        <Box
          key={`gemstone_${index}_${item.id}`}
          mb={3}
          p={2}
          border="1px solid #ccc"
          borderRadius={2}
        >
          <Box gap={2} display="flex" alignItems="flex-start">
            <Box
              flex={1}
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: 2,
                alignItems: 'start',
              }}
            >
              {gemstoneFields.map((field) => {
                const options =
                  field.name === 'sub_type'
                    ? [
                        ...disabledOption('Sub Type'),
                        ...(subTypeOptions[index] ||
                          field.options.filter(
                            (opt) => opt.value == watch(`gemstones.${index}.sub_type`)
                          )),
                      ]
                    : field.options;

                return (
                  <Controller
                    name={`gemstones.${index}.${field.name}`}
                    key={`gemstones.${index}.${field.name}`}
                    {...register(`gemstones.${index}.${field.name}`)}
                    control={control}
                    render={({ field: controllerField }) =>
                      field.type === 'select' ? (
                        <TextField
                          select
                          {...controllerField}
                          label={getFormLabel(field)}
                          fullWidth
                          onChange={(e) => {
                            const value = e.target.value;
                            controllerField.onChange(value);
                            if (field.name === 'main_type') {
                              handleFetchSubTypes(value, index);
                              setValue(`gemstones.${index}.sub_type`, '');
                            }
                          }}
                          disabled={!disabledForm || isSubmitting}
                          error={!!errors.gemstones?.[index]?.[field.name]}
                          helperText={errors.gemstones?.[index]?.[field.name]?.message || ''}
                        >
                          {options?.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value} disabled={opt.disabled}>
                              {opt.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      ) : (
                        <TextField
                          {...controllerField}
                          label={getFormLabel(field)}
                          type={field.type}
                          InputProps={{
                            readOnly: field?.readOnly || false,
                          }}
                          fullWidth
                          disabled={!disabledForm || isSubmitting}
                          error={!!errors.gemstones?.[index]?.[field.name]}
                          helperText={errors.gemstones?.[index]?.[field.name]?.message || ''}
                          onChange={(e) => {
                            const val =
                              field.returnType === 'number' ? +e.target.value : e.target.value;
                            controllerField.onChange(val);
                          }}
                        />
                      )
                    }
                  />
                );
              })}
            </Box>

            {/* Add / Remove buttons */}
            <Box display="flex" flexDirection="column" justifyContent="flex-end">
              <IconButton
                disabled={!disabledForm || isSubmitting}
                size="medium"
                color="primary"
                onClick={onAdd}
              >
                <Iconify icon="mingcute:add-line" width={16} />
              </IconButton>

              <IconButton
                size="medium"
                color="error"
                onClick={() => onRemove(index)}
                disabled={fields.length === 1 || isSubmitting || !disabledForm}
              >
                <Iconify icon="mingcute:delete-2-line" width={16} />
              </IconButton>
            </Box>
          </Box>
        </Box>
      ))}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button
          variant="contained"
          color="primary"
          type="submit"
          loading={isSubmitting}
          loadingPosition="start"
          disabled={isSubmitting || !disabledForm}
          startIcon={<Iconify icon="eva:save-fill" />}
        >
          Save
        </Button>

        <Button variant="outlined" color="inherit" onClick={handleCancel}>
          Close
        </Button>
      </Box>
    </Box>
  );
};

export default GemstoneFormComponent;

const getFormLabel = (field) => (field.required ? `${field.label} *` : field.label);
const calculateAmount = (caratWeight, rate) =>
  String(((+caratWeight || 0) * (+rate || 0)).toFixed(3));
