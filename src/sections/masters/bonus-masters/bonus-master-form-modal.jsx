import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z as zod } from 'zod';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import LoadingButton from '@mui/lab/LoadingButton';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Field, Form } from 'src/components/hook-form';
import { DynamicFormFields } from 'src/components/dynamic-form-fields';

// ----------------------------------------------------------------------

const POINTS_GIVEN_TYPE_OPTIONS = [
  { value: 'GROSS_WEIGHT', label: 'Gross Weight' },
  { value: 'NET_WEIGHT', label: 'Net Weight' },
  { value: 'TAXABLE_AMOUNT', label: 'Taxable Amount' },
];

const BonusMasterSchema = zod.object({
  name: zod.string().min(1, { message: 'Name is required!' }),
  points_given_type: zod.enum(['GROSS_WEIGHT', 'NET_WEIGHT', 'TAXABLE_AMOUNT'], {
    message: 'Please select a valid points given type!',
  }),
  per_unit_value: zod
    .number({
      required_error: 'Per unit value is required!',
      invalid_type_error: 'Per unit value must be a number!',
    })
    .positive({ message: 'Per unit value must be greater than 0!' }),
  bonus_points: zod
    .number({
      required_error: 'Bonus points is required!',
      invalid_type_error: 'Bonus points must be a number!',
    })
    .positive({ message: 'Bonus points must be greater than 0!' }),
});
  
const BulkBonusMasterSchema = zod.object({
  bonusMasters: zod
    .array(
      zod.object({
        name: zod.string().min(1, { message: 'Name is required!' }),
        points_given_type: zod.enum(['GROSS_WEIGHT', 'NET_WEIGHT', 'TAXABLE_AMOUNT'], {
          message: 'Please select a valid points given type!',
        }),
        per_unit_value: zod.string().min(1, { message: 'Per unit value is required!' }),
        bonus_points: zod.string().min(1, { message: 'Bonus points is required!' }),
      })
    )
    .min(1, { message: 'Please add at least one bonus master!' }),
});

// ----------------------------------------------------------------------

export function BonusMasterFormModal({ open, onClose, currentItem, onSave, loading }) {
  const isEdit = Boolean(currentItem);
  const [isBulkEntry, setIsBulkEntry] = useState(false);

  const methods = useForm({
    resolver: zodResolver(BonusMasterSchema),
    defaultValues: {
      name: '',
      points_given_type: 'GROSS_WEIGHT',
      per_unit_value: 0,
      bonus_points: 0,
    },
  });

  const bulkMethods = useForm({
    resolver: zodResolver(BulkBonusMasterSchema),
    defaultValues: {
      bonusMasters: [
        {
          name: '',
          points_given_type: 'GROSS_WEIGHT',
          per_unit_value: '',
          bonus_points: '',
        },
      ],
    },
  });

  const { reset, handleSubmit, control } = methods;
  const { reset: bulkReset, handleSubmit: handleBulkSubmit, control: bulkControl } = bulkMethods;

  useEffect(() => {
    if (currentItem) {
      reset({
        name: currentItem.name || '',
        points_given_type: currentItem.points_given_type || 'GROSS_WEIGHT',
        per_unit_value: parseFloat(currentItem.per_unit_value) || 0,
        bonus_points: parseFloat(currentItem.bonus_points) || 0,
      });
    } else {
      reset({
        name: '',
        points_given_type: 'GROSS_WEIGHT',
        per_unit_value: 0,
        bonus_points: 0,
      });
      bulkReset({
        bonusMasters: [
          {
            name: '',
            points_given_type: 'GROSS_WEIGHT',
            per_unit_value: '',
            bonus_points: '',
          },
        ],
      });
    }
  }, [currentItem, reset, bulkReset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const result = await onSave(currentItem?.id, data);
      if (result.success) {
        reset();
        onClose();
      } else {
        toast.error(result.message || 'Something went wrong!');
      }
    } catch {
      toast.error('Something went wrong!');
    }
  });

  const onBulkSubmit = handleBulkSubmit(async (data) => {
    try {
      const result = await onSave(null, { ...data, isBulkEntry: true });
      if (result.success) {
        const { bulkDetails } = result;
        if (bulkDetails) {
          const successMessage = `Successfully created ${bulkDetails.totalCreated} bonus master(s).`;
          const warningMessage =
            bulkDetails.totalExisting > 0
              ? ` ${bulkDetails.totalExisting} bonus master(s) already existed.`
              : '';
          toast.success(successMessage + warningMessage);
        } else {
          toast.success('Bonus masters created successfully!');
        }
        bulkReset({
          bonusMasters: [
            {
              name: '',
              points_given_type: 'GROSS_WEIGHT',
              per_unit_value: '',
              bonus_points: '',
            },
          ],
        });
        onClose();
      } else {
        toast.error(result.message || 'Something went wrong!');
      }
    } catch {
      toast.error('Something went wrong!');
    }
  });

  const handleClose = () => {
    onClose();
    reset();
    bulkReset({
      bonusMasters: [
        {
          name: '',
          points_given_type: 'GROSS_WEIGHT',
          per_unit_value: '',
          bonus_points: '',
        },
      ],
    });
    setIsBulkEntry(false);
  };

  return (
    <Dialog
      fullWidth
      maxWidth={isBulkEntry ? 'lg' : 'sm'}
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            {isEdit
              ? 'Edit Bonus Master'
              : isBulkEntry
                ? 'Bulk Add Bonus Masters'
                : 'Add Bonus Master'}
          </Typography>
          {!isEdit && (
            <FormControlLabel
              control={
                <Switch
                  checked={isBulkEntry}
                  onChange={(e) => setIsBulkEntry(e.target.checked)}
                  color="primary"
                />
              }
              label="Bulk Entry"
              labelPlacement="start"
              sx={{ mr: 0 }}
            />
          )}
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        {isBulkEntry ? (
          <Form methods={bulkMethods} onSubmit={onBulkSubmit}>
            <Controller
              name="bonusMasters"
              control={bulkControl}
              render={({ field }) => (
                <DynamicFormFields
                  title="Bonus Masters"
                  fields={[
                    {
                      name: 'name',
                      label: 'Name',
                      type: 'text',
                      flex: 1,
                    },
                    {
                      name: 'points_given_type',
                      label: 'Points Given Type',
                      type: 'select',
                      flex: 1,
                      options: POINTS_GIVEN_TYPE_OPTIONS,
                      defaultValue: 'GROSS_WEIGHT',
                    },
                    {
                      name: 'per_unit_value',
                      label: 'Per Unit Value',
                      type: 'number',
                      flex: 1,
                      inputProps: { step: '0.01', min: '0' },
                    },
                    {
                      name: 'bonus_points',
                      label: 'Bonus Points',
                      type: 'number',
                      flex: 1,
                      inputProps: { step: '0.01', min: '0' },
                    },
                  ]}
                  values={field.value}
                  onChange={field.onChange}
                  minItems={1}
                  maxItems={20}
                />
              )}
            />
          </Form>
        ) : (
          <Form methods={methods} onSubmit={onSubmit}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <Field.Text name="name" label="Name" />

              <Controller
                name="points_given_type"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth error={!!error}>
                    <InputLabel>Points Given Type</InputLabel>
                    <Select {...field} label="Points Given Type">
                      {POINTS_GIVEN_TYPE_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {error && (
                      <Typography variant="caption" sx={{ color: 'error.main', mt: 0.5 }}>
                        {error.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />

              <Field.Text
                name="per_unit_value"
                label="Per Unit Value"
                type="number"
                InputProps={{
                  inputProps: { step: '0.01', min: '0' },
                }}
                valueAsNumber
              />

              <Field.Text
                name="bonus_points"
                label="Bonus Points"
                type="number"
                InputProps={{
                  inputProps: { step: '0.01', min: '0' },
                }}
                valueAsNumber
              />
            </Box>
          </Form>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button variant="outlined" onClick={handleClose}>
          Cancel
        </Button>

        <LoadingButton
          type="submit"
          variant="contained"
          loading={loading}
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={isBulkEntry ? onBulkSubmit : onSubmit}
        >
          {isEdit ? 'Update' : 'Create'}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
