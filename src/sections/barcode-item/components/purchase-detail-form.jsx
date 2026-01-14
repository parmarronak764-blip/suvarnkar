import React, { useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, TextField, Button, Typography } from '@mui/material';
import { Iconify } from 'src/components/iconify';

const formFields = [
  { name: 'metal_type', type: 'number', required: true, label: 'Metal Type', isHidden: true },
  { name: 'wastage_charges', type: 'number', required: false, label: 'Wastage Charges' },
  { name: 'purchase_rate', type: 'number', required: false, label: 'Purchase Rate' },
  {
    name: 'purchase_making_charges',
    type: 'number',
    required: false,
    label: 'Purchase Making Charges',
  },
  { name: 'purchase_value', type: 'number', required: false, label: 'Purchase Value' },
  { name: 'purchase_mrp', type: 'number', required: false, label: 'Purchase MRP' },
];

const PurchaseOrderSchema = z.object(
  Object.fromEntries(formFields.map((field) => [field.name, z.coerce.number()]))
);

const formSchema = z.object({
  purchase_details: z.array(PurchaseOrderSchema),
});

const PurchaseDetailsForm = (props) => {
  const {
    BaseMetalItems = [],
    handleClose = () => {},
    onSubmitHandler = () => {},
    initialFormValues = [],
  } = props;
  const PurchaseOrderMethod = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      purchase_details: BaseMetalItems?.map(() =>
        Object.fromEntries(formFields.map((field) => [field.name, '']))
      ),
    },
  });

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting, errors },
  } = PurchaseOrderMethod;

  const { fields } = useFieldArray({
    control,
    name: 'purchase_details',
  });

  useEffect(() => {
    if (!BaseMetalItems?.length) return;
    if (initialFormValues?.length) {
      setValue('purchase_details', initialFormValues);
    } else if (BaseMetalItems?.length) {
      const newDetails = BaseMetalItems.map((item) => ({
        metal_type: Number(item?.id) || '',
        wastage_charges: '',
        purchase_rate: '',
        purchase_making_charges: '',
        purchase_value: '',
        purchase_mrp: '',
      }));
      setValue('purchase_details', newDetails);
    }
  }, [BaseMetalItems, setValue, initialFormValues]);

  const onSubmit = (data) => {
    onSubmitHandler(data.purchase_details);
  };

  return (
    <Box sx={{ p: 2 }} component="form" onSubmit={handleSubmit(onSubmit)}>
      {fields.map((field, index) => (
        <Box
          key={`purchase_details_${index}_${field.id}`}
          mb={3}
          p={2}
          border="1px solid #ccc"
          borderRadius={2}
        >
          <Typography variant="h6" sx={{ mb: 1.5 }}>
            {BaseMetalItems[index]?.name + ' Details'}
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 2,
            }}
          >
            {formFields
              .filter((e) => !e?.isHidden)
              .map((i) => (
                <Controller
                  key={`purchase_details.${index}.${i.name}`}
                  name={`purchase_details.${index}.${i.name}`}
                  control={control}
                  render={({ field: fieldController }) => (
                    <TextField
                      {...fieldController}
                      fullWidth
                      label={i.label}
                      type={i.type}
                      disabled={isSubmitting}
                      error={!!errors.purchase_details?.[index]?.[i.name]}
                      helperText={errors.purchase_details?.[index]?.[i.name]?.message}
                      onChange={(e) => {
                        const val = i.type === 'number' ? +e.target.value : e.target.value;
                        fieldController.onChange(val);
                      }}
                    />
                  )}
                />
              ))}
          </Box>
        </Box>
      ))}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
        <Button
          variant="contained"
          color="primary"
          type="submit"
          disabled={isSubmitting}
          loading={isSubmitting}
          loadingPosition="start"
          startIcon={<Iconify icon="eva:save-fill" />}
        >
          Save
        </Button>
        <Button variant="outlined" color="inherit" onClick={handleClose}>
          Close
        </Button>
      </Box>
    </Box>
  );
};

export default PurchaseDetailsForm;
