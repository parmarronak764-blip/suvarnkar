import React, { useCallback, useEffect, useState } from 'react';
import { Controller, useFieldArray } from 'react-hook-form';
import { TextField, MenuItem, IconButton, Box, Typography } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { calcFormula } from '../helpers/formHeplers';
import { Field } from 'src/components/hook-form';

export default function DynamicFormFields({
  formTitle = '',
  formName,
  FormFields,
  methods,
  defaultValues,
  initialFormValues,
  disabledForm = true,
  containerStyle,
  isMultiple = false,
  isOptional = false,
  isUpdate = false,
}) {
  const [didReset, setDidReset] = useState(false);
  const {
    control,
    reset,
    watch,
    formState: { isSubmitting, errors },
  } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: formName,
  });

  const onRemove = (index) => {
    remove(index);
  };
  const onAdd = () => {
    append(defaultValues);
  };

  useEffect(() => {
    if (fields.length === 0 && !isUpdate) {
      onAdd();
    }
  }, []);

  useEffect(() => {
    if (isUpdate && !didReset) {
      // reset(initialFormValues);
      setDidReset(true);
    }
  }, [isUpdate, didReset, reset, initialFormValues]);

  const getActionButtons = useCallback(
    (index) => (
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
          disabled={(!isOptional ? fields.length === 1 : false) || isSubmitting || !disabledForm}
        >
          <Iconify icon="mingcute:delete-2-line" width={16} />
        </IconButton>
      </Box>
    ),
    [onAdd, onRemove]
  );

  const getFilteredOptions = useCallback(
    (field, index) => {
      let options = field.options;

      if (!options || options.length === 0) return [];

      // If field depends on another field → filter options
      if (field.optionsDependsOn) {
        const { field_name, key, compareKey } = field.optionsDependsOn;
        const dependencyValue = watch(`${formName}.${index}.${field_name}`);
        let selectedOption = null;

        const neededField = FormFields.find((f) => f.name === field_name);
        if (neededField) {
          selectedOption = neededField.options.find(
            (opt) => opt[neededField.optionValue] === dependencyValue
          );
        }

        if (selectedOption) {
          options = options.filter((opt) => opt[compareKey] === selectedOption[key]);
        }
      }

      // Normalize final options
      return options.map((opt) => ({
        label: opt[field.optionLabel] || opt.label || opt.name,
        value: opt[field.optionValue] || opt.value || opt.id,
        disabled: opt.disabled,
      }));
    },
    [watch, formName]
  );

  return (
    <>
      {formTitle && (
        <Typography variant="h6" sx={{ mt: 2 }}>
          {formTitle}
        </Typography>
      )}
      {fields.map((item, index) => (
        <Box key={`${formName}_${index}_${item.id}`} mb={3}>
          <Box
            flex={1}
            flexGrow={1}
            {...(isMultiple && {
              display: 'flex',
              gap: 2,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            })}
          >
            <Box {...containerStyle}>
              {FormFields.map((field) => {
                const formValue = (controllerField) => {
                  const value =
                    field.readOnly || !!field.formula
                      ? calcFormula(field.formula, index, watch, formName)
                      : controllerField.value;
                  // setValue(`${formName}.${index}.${field.name}`, value);
                  return value;
                };

                return (
                  <Controller
                    name={`${formName}.${index}.${field.name}`}
                    key={`${formName}.${index}.${field.name}`}
                    control={control}
                    render={({ field: controllerField }) =>
                      field.type === 'select' ? (
                        <Field.Select
                          select
                          {...controllerField}
                          label={field.label}
                          required={field.required}
                          fullWidth
                          disabled={!disabledForm || isSubmitting}
                          error={!!errors?.[formName]?.[index]?.[field.name]}
                          helperText={errors?.[formName]?.[index]?.[field.name]?.message || ''}
                          isWithMenuItem
                          options={getFilteredOptions(field, index)}
                          onChange={(e) => {
                            controllerField.onChange(e.target.value);
                          }}
                        />
                      ) : (
                        <Field.Text
                          {...controllerField}
                          label={field.label}
                          required={field.required}
                          type={field.type}
                          fullWidth
                          InputProps={
                            {
                              readOnly: field.readOnly || !!field.formula,
                              value: formValue(controllerField),
                            } // formula fields are read-only
                          }
                          disabled={!disabledForm || isSubmitting}
                          error={!!errors?.[formName]?.[index]?.[field.name]}
                          helperText={errors?.[formName]?.[index]?.[field.name]?.message || ''}
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
            {isMultiple && getActionButtons(index)}
          </Box>
        </Box>
      ))}
    </>
  );
}

const getFormLabel = (field) => (field.required ? `${field.label} *` : field.label);
