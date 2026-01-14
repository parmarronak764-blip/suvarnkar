import { merge } from 'es-toolkit';
import { Controller, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

import { HelperText } from './help-text';
import Button from '@mui/material/Button';

// ----------------------------------------------------------------------

export function RHFSelect({
  name,
  children,
  helperText,
  slotProps = {},
  isWithMenuItem = false,
  options = [],
  ...other
}) {
  const { control } = useFormContext();

  const labelId = `${name}-select`;

  const baseSlotProps = {
    select: {
      sx: { textTransform: 'capitalize' },
      MenuProps: {
        slotProps: {
          paper: {
            sx: [{ maxHeight: 220 }],
          },
        },
      },
    },
    htmlInput: { id: labelId },
    inputLabel: { htmlFor: labelId },
  };
  const allOptions = isWithMenuItem
    ? [
        ...options.filter((option) => option?.actionType),
        { value: '', label: `Select ${other?.label}`, disabled: true },
        ...options.filter((option) => !option?.actionType),
      ]
    : options;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          {...other}
          select
          fullWidth
          error={!!error}
          helperText={error?.message ?? helperText}
          slotProps={merge(baseSlotProps, slotProps)}
          onChange={(e) => {
            field.onChange(e); // update RHF
            other?.onChange?.(e); // call your handler
          }}
        >
          {isWithMenuItem &&
            [
              ...options.filter((option) => option?.actionType),
              { value: '', label: `Select ${other?.label}`, disabled: true },
              ...options.filter((option) => !option?.actionType),
            ]?.map((option) => (
              <MenuItem
                key={`${name}_${option.value}`}
                value={option.value}
                disabled={option?.disabled}
              >
                {option.value && option.actionType ? (
                  <Button
                    sx={{ width: '100%' }}
                    size="small"
                    color="primary"
                    type="button"
                    onClick={(e) => e.preventDefault()}
                  >
                    {option.label}
                  </Button>
                ) : (
                  option.label
                )}
              </MenuItem>
            ))}

          {!isWithMenuItem && children}
        </TextField>
      )}
    />
  );
}

// ----------------------------------------------------------------------

export function RHFMultiSelect({
  name,
  chip,
  label,
  options,
  checkbox,
  placeholder,
  slotProps,
  helperText,
  ...other
}) {
  const { control } = useFormContext();

  const labelId = `${name}-multi-select`;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        // Ensure field value is always an array for multiselect
        const fieldValue = Array.isArray(field.value) ? field.value : [];
        const fieldWithArrayValue = { ...field, value: fieldValue };
        const renderLabel = () => (
          <InputLabel htmlFor={labelId} {...slotProps?.inputLabel}>
            {label}
          </InputLabel>
        );

        const renderOptions = () =>
          options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {checkbox && (
                <Checkbox
                  size="small"
                  disableRipple
                  checked={fieldValue.includes(option.value)}
                  {...slotProps?.checkbox}
                />
              )}

              {option.label}
            </MenuItem>
          ));

        return (
          <FormControl error={!!error} {...other}>
            {label && renderLabel()}

            <Select
              {...fieldWithArrayValue}
              multiple
              displayEmpty={!!placeholder}
              label={label}
              renderValue={(selected) => {
                const selectedArray = Array.isArray(selected) ? selected : [];
                const selectedItems = options.filter((item) => selectedArray.includes(item.value));

                if (!selectedItems.length && placeholder) {
                  return <Box sx={{ color: 'text.disabled' }}>{placeholder}</Box>;
                }

                if (chip) {
                  return (
                    <Box sx={{ gap: 0.5, display: 'flex', flexWrap: 'wrap' }}>
                      {selectedItems.map((item) => (
                        <Chip
                          key={item.value}
                          size="small"
                          variant="soft"
                          label={item.label}
                          {...slotProps?.chip}
                        />
                      ))}
                    </Box>
                  );
                }

                return selectedItems.map((item) => item.label).join(', ');
              }}
              {...slotProps?.select}
              inputProps={{
                id: labelId,
                ...slotProps?.select?.inputProps,
              }}
            >
              {renderOptions()}
            </Select>

            <HelperText
              {...slotProps?.helperText}
              errorMessage={error?.message}
              helperText={helperText}
            />
          </FormControl>
        );
      }}
    />
  );
}
