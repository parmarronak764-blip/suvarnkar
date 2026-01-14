import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function DynamicFormFields({
  title = 'Items',
  fields = [],
  values = [],
  onChange,
  disabled = false,
  minItems = 1,
  maxItems = 50,
  fieldStyling = {},
}) {
  const addItem = () => {
    if (values.length < maxItems) {
      const newItem = {};
      fields.forEach((field) => {
        newItem[field.name] = field.defaultValue || (field.type === 'select' ? 0 : '');
      });
      onChange([...values, newItem]);
    }
  };

  const removeItem = (index) => {
    if (values.length > minItems) {
      const newValues = values.filter((_, i) => i !== index);
      onChange(newValues);
    }
  };

  const updateItem = (index, fieldName, value) => {
    const newValues = [...values];
    newValues[index] = { ...newValues[index], [fieldName]: value };
    onChange(newValues);
  };

  const renderField = (field, item, index) => {
    const fieldValue = item[field.name] || field.defaultValue || '';

    switch (field.type) {
      case 'select':
        return (
          <Box key={field.name} sx={{ flex: field.flex || 1 }}>
            <FormControl fullWidth size="small">
              <InputLabel id={`${field.name}_${index}_label`}>{field.label}</InputLabel>
              <Select
                labelId={`${field.name}_${index}_label`}
                name={`${field.name}_${index}`}
                value={fieldValue}
                label={field.label}
                onChange={(e) => updateItem(index, field.name, e.target.value)}
                disabled={disabled || field.disabled}
              >
                <MenuItem value={0} disabled>
                  <em>Select {field.label}</em>
                </MenuItem>
                {(typeof field.options === 'function'
                  ? field.options(item, index)
                  : field.options
                )?.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        );

      case 'number':
        return (
          <Box key={field.name} sx={{ flex: field.flex || 1 }}>
            <TextField
              name={`${field.name}_${index}`}
              label={field.label}
              type="number"
              value={fieldValue}
              onChange={(e) => updateItem(index, field.name, e.target.value)}
              disabled={disabled || field.disabled}
              size="small"
              fullWidth
              variant="outlined"
              inputProps={field.inputProps}
              sx={{
                ...(field.disabled && {
                  '& .MuiInputBase-input.Mui-disabled': {
                    WebkitTextFillColor: 'rgba(0, 0, 0, 0.6)',
                    fontFamily: field.name === 'box_code' ? 'monospace' : 'inherit',
                    fontWeight: field.name === 'box_code' ? 'bold' : 'normal',
                  },
                  '& .MuiOutlinedInput-root.Mui-disabled': {
                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                  },
                }),
              }}
            />
          </Box>
        );

      case 'text':
      default:
        return (
          <Box key={field.name} sx={{ flex: field.flex || 1 }}>
            <TextField
              name={`${field.name}_${index}`}
              label={field.label}
              value={fieldValue}
              onChange={(e) => updateItem(index, field.name, e.target.value)}
              disabled={disabled || field.disabled}
              size="small"
              fullWidth
              variant="outlined"
              sx={{
                ...(field.disabled && {
                  '& .MuiInputBase-input.Mui-disabled': {
                    WebkitTextFillColor: 'rgba(0, 0, 0, 0.6)',
                    fontFamily: field.name === 'box_code' ? 'monospace' : 'inherit',
                    fontWeight: field.name === 'box_code' ? 'bold' : 'normal',
                  },
                  '& .MuiOutlinedInput-root.Mui-disabled': {
                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                  },
                }),
              }}
            />
          </Box>
        );
    }
  };

  return (
    <Box>
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
          py: 1,
          backgroundColor: 'background.paper',
          borderBottom: (theme) =>
            `1px dashed ${theme.vars ? theme.vars.palette.divider : '#e0e0e0'}`,
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {title} ({values.length})
        </Typography>
        {/* <Button
          size="small"
          variant="outlined"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={addItem}
          disabled={disabled || values.length >= maxItems}
          sx={{ minWidth: 'auto' }}
        >
          Add
        </Button> */}
      </Box>

      <Stack spacing={1.5}>
        {values.map((item, index) => (
          <Card
            key={index}
            variant="outlined"
            sx={{
              p: 2,
              position: 'relative',
              backgroundColor: 'grey.50',
              '&:hover': {
                backgroundColor: 'grey.100',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <Typography
                variant="caption"
                sx={{
                  minWidth: 20,
                  height: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'primary.main',
                  color: 'white',
                  borderRadius: '50%',
                  fontSize: '11px',
                  fontWeight: 600,
                  mt: 1,
                }}
              >
                {index + 1}
              </Typography>

              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {/* Group fields based on layout preference */}
                {fields.length <= 2 ? (
                  // Single row for 1-2 fields
                  <Stack spacing={1.5} {...fieldStyling}>
                    {fields.map((field) => renderField(field, item, index))}
                  </Stack>
                ) : (
                  // Multiple rows for 3+ fields
                  <Stack spacing={1.5} {...fieldStyling}>
                    {fields
                      .reduce((rows, field, fieldIndex) => {
                        const rowIndex = Math.floor(fieldIndex / 2);
                        if (!rows[rowIndex]) {
                          rows[rowIndex] = [];
                        }
                        rows[rowIndex].push(field);
                        return rows;
                      }, [])
                      .map((rowFields, rowIndex) => (
                        <Box key={rowIndex} sx={{ display: 'flex', gap: 1.5 }}>
                          {rowFields.map((field) => renderField(field, item, index))}
                        </Box>
                      ))}
                  </Stack>
                )}
              </Box>

              <Box>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => addItem()}
                  disabled={disabled || values.length >= maxItems}
                  sx={{
                    mt: 0.5,
                    '&:hover': {
                      backgroundColor: 'primary.lighter',
                    },
                  }}
                >
                  <Iconify icon="mingcute:add-line" width={16} />
                </IconButton>

                <IconButton
                  size="small"
                  color="error"
                  onClick={() => removeItem(index)}
                  disabled={disabled || values.length <= minItems}
                  sx={{
                    mt: 0.5,
                    '&:hover': {
                      backgroundColor: 'error.lighter',
                    },
                  }}
                >
                  <Iconify icon="mingcute:delete-2-line" width={16} />
                </IconButton>
              </Box>
            </Box>
          </Card>
        ))}

        {values.length === 0 && (
          <Box
            sx={{
              py: 4,
              textAlign: 'center',
              border: '2px dashed',
              borderColor: 'grey.300',
              borderRadius: 2,
              backgroundColor: 'grey.50',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Click &quot;Add&quot; to create your first item
            </Typography>
          </Box>
        )}
      </Stack>
    </Box>
  );
}

DynamicFormFields.propTypes = {
  title: PropTypes.string,
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['text', 'select']),
      flex: PropTypes.number,
      defaultValue: PropTypes.any,
      options: PropTypes.arrayOf(
        PropTypes.shape({
          value: PropTypes.any.isRequired,
          label: PropTypes.string.isRequired,
        })
      ),
    })
  ),
  values: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  minItems: PropTypes.number,
  maxItems: PropTypes.number,
};
