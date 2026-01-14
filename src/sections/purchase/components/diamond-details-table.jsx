import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const DiamondInput = ({ value, onChange, type = 'text', ...props }) => (
  <TextField
    size="small"
    type={type}
    value={value || ''}
    onChange={onChange}
    variant="outlined"
    sx={{
      width: type === 'number' ? '100px' : '120px',
      '& .MuiInputBase-input': {
        textAlign: type === 'number' ? 'right' : 'left',
        fontSize: '0.813rem',
      },
    }}
    {...props}
  />
);

export function DiamondDetailsTable({ diamondDetails = [], onDiamondDetailsChange, apiData = {} }) {
  const handleDiamondChange = (index, field, value) => {
    const updated = diamondDetails.map((d, i) => {
      if (i === index) {
        // Convert '0' or 0 to empty string for these fields to show placeholder
        let normalizedValue = value;
        if (
          (field === 'diamond_weight' ||
            field === 'diamond_purchase_rate' ||
            field === 'diamond_sale_rate') &&
          (value === '0' || value === 0)
        ) {
          normalizedValue = '';
        }
        const updatedDiamond = { ...d, [field]: normalizedValue };

        // Calculate purchase_amount and sale_amount
        // Treat empty string as 0 for calculations
        const weight =
          updatedDiamond.diamond_weight === '' ||
          updatedDiamond.diamond_weight === null ||
          updatedDiamond.diamond_weight === undefined
            ? 0
            : parseFloat(updatedDiamond.diamond_weight) || 0;
        const purchaseRate =
          updatedDiamond.diamond_purchase_rate === '' ||
          updatedDiamond.diamond_purchase_rate === null ||
          updatedDiamond.diamond_purchase_rate === undefined
            ? 0
            : parseFloat(updatedDiamond.diamond_purchase_rate) || 0;
        const saleRate =
          updatedDiamond.diamond_sale_rate === '' ||
          updatedDiamond.diamond_sale_rate === null ||
          updatedDiamond.diamond_sale_rate === undefined
            ? 0
            : parseFloat(updatedDiamond.diamond_sale_rate) || 0;

        updatedDiamond.purchase_amount = (weight * purchaseRate).toFixed(2);
        updatedDiamond.sale_amount = (weight * saleRate).toFixed(2);

        return updatedDiamond;
      }
      return d;
    });

    onDiamondDetailsChange(updated);
  };

  const addDiamondRow = () => {
    const newRow = {
      id: Date.now(),
      diamond_colour_clarity: '',
      diamond_size_range: '',
      diamond_colour: '',
      diamond_certificate: '',
      diamond_piece: '',
      diamond_weight: '',
      certificate_number: '',
      diamond_purchase_rate: '',
      diamond_sale_rate: '',
      purchase_amount: '',
      sale_amount: '',
    };
    onDiamondDetailsChange([...diamondDetails, newRow]);
  };

  const removeDiamondRow = (index) => {
    const updated = diamondDetails.filter((_, i) => i !== index);
    onDiamondDetailsChange(updated);
  };

  const columns = [
    { id: 'srNo', label: 'Sr', width: 40 },
    { id: 'colour_clarity', label: 'Diamond Colour/Clarity', width: 150 },
    { id: 'size', label: 'Shape/Size', width: 150 },
    { id: 'pcs', label: 'Diamond PCs', width: 90 },
    { id: 'weight', label: 'Diamond Wt.', width: 100 },
    { id: 'purchase_rate', label: 'Purchase Rate', width: 110 },
    { id: 'sale_rate', label: 'Sale Rate', width: 110 },
    { id: 'colour', label: 'Diamond Colour', width: 120 },
    { id: 'certificate', label: 'Certificate Type', width: 130 },
    { id: 'cert_number', label: 'Certificate Number', width: 140 },
    { id: 'purchase_amount', label: 'Purchase Amount', width: 130 },
    { id: 'sale_amount', label: 'Sale Amount', width: 130 },
    { id: 'action', label: 'Action', width: 100 },
  ];

  return (
    <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Iconify icon="solar:diamond-bold" sx={{ color: 'info.main' }} />
          <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Diamond Details</span>
        </Box>
        <Button
          size="small"
          variant="outlined"
          color="info"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={addDiamondRow}
        >
          Add Diamond
        </Button>
      </Box>

      {diamondDetails.length > 0 && (
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 1400 }}>
            <TableHead>
              <TableRow>
                {columns.map((col) => (
                  <TableCell
                    key={col.id}
                    sx={{
                      bgcolor: 'grey.200',
                      fontWeight: 700,
                      fontSize: '0.813rem',
                      width: col.width,
                      whiteSpace: 'nowrap',
                      py: 1.5,
                    }}
                  >
                    {col.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {diamondDetails.map((diamond, index) => (
                <TableRow key={diamond.id || index}>
                  <TableCell align="center" sx={{ fontSize: '0.75rem' }}>
                    {index + 1}
                  </TableCell>

                  {/* Diamond Colour/Clarity Dropdown */}
                  <TableCell>
                    <Select
                      size="small"
                      value={diamond.diamond_colour_clarity || ''}
                      onChange={(e) =>
                        handleDiamondChange(index, 'diamond_colour_clarity', e.target.value)
                      }
                      displayEmpty
                      fullWidth
                      sx={{ fontSize: '0.75rem' }}
                    >
                      <MenuItem value="">--Select--</MenuItem>
                      {apiData?.diamondColourClarity
                        ?.filter((item) => item.is_active !== false)
                        .map((item) => (
                          <MenuItem key={item.id} value={item.carat}>
                            {item.name ||
                              item.clarity_name ||
                              item.label ||
                              item.carat_name ||
                              `Carat: ${item.carat}`}
                          </MenuItem>
                        ))}
                    </Select>
                  </TableCell>

                  {/* Shape/Size Dropdown */}
                  <TableCell>
                    <Select
                      size="small"
                      value={diamond.diamond_size_range || ''}
                      onChange={(e) =>
                        handleDiamondChange(index, 'diamond_size_range', e.target.value)
                      }
                      displayEmpty
                      fullWidth
                      sx={{ fontSize: '0.75rem' }}
                    >
                      <MenuItem value="">--Select--</MenuItem>
                      {apiData?.diamondSizeRanges
                        ?.filter((item) => item.is_active !== false)
                        .map((item) => (
                          <MenuItem key={item.id} value={item.id}>
                            {item.range_value || item.name || item.label || `ID: ${item.id}`}
                          </MenuItem>
                        ))}
                    </Select>
                  </TableCell>

                  {/* Diamond PCs */}
                  <TableCell>
                    <DiamondInput
                      type="number"
                      value={diamond.diamond_piece}
                      onChange={(e) => handleDiamondChange(index, 'diamond_piece', e.target.value)}
                      placeholder="0"
                      inputProps={{ min: 0 }}
                    />
                  </TableCell>

                  {/* Diamond Weight */}
                  <TableCell>
                    <DiamondInput
                      type="number"
                      value={
                        diamond.diamond_weight === 0 || diamond.diamond_weight === '0'
                          ? ''
                          : diamond.diamond_weight || ''
                      }
                      onChange={(e) => handleDiamondChange(index, 'diamond_weight', e.target.value)}
                      placeholder="0.000"
                      inputProps={{ step: '0.001', min: 0 }}
                    />
                  </TableCell>

                  {/* Purchase Rate */}
                  <TableCell>
                    <DiamondInput
                      type="number"
                      value={
                        diamond.diamond_purchase_rate === 0 || diamond.diamond_purchase_rate === '0'
                          ? ''
                          : diamond.diamond_purchase_rate || ''
                      }
                      onChange={(e) =>
                        handleDiamondChange(index, 'diamond_purchase_rate', e.target.value)
                      }
                      placeholder="0.00"
                      inputProps={{ step: '0.01', min: 0 }}
                    />
                  </TableCell>

                  {/* Sale Rate */}
                  <TableCell>
                    <DiamondInput
                      type="number"
                      value={
                        diamond.diamond_sale_rate === 0 || diamond.diamond_sale_rate === '0'
                          ? ''
                          : diamond.diamond_sale_rate || ''
                      }
                      onChange={(e) =>
                        handleDiamondChange(index, 'diamond_sale_rate', e.target.value)
                      }
                      placeholder="0.00"
                      inputProps={{ step: '0.01', min: 0 }}
                    />
                  </TableCell>

                  {/* Diamond Colour Dropdown */}
                  <TableCell>
                    <Select
                      size="small"
                      value={diamond.diamond_colour || ''}
                      onChange={(e) => handleDiamondChange(index, 'diamond_colour', e.target.value)}
                      displayEmpty
                      fullWidth
                      sx={{ fontSize: '0.75rem' }}
                    >
                      <MenuItem value="">--Select--</MenuItem>
                      {apiData?.diamondColours
                        ?.filter((item) => item.is_active !== false)
                        .map((item) => (
                          <MenuItem key={item.id} value={item.id}>
                            {item.name || item.color_name || item.label || `ID: ${item.id}`}
                          </MenuItem>
                        ))}
                    </Select>
                  </TableCell>

                  {/* Certificate Type */}
                  <TableCell>
                    <Select
                      size="small"
                      value={diamond.diamond_certificate || ''}
                      onChange={(e) =>
                        handleDiamondChange(index, 'diamond_certificate', e.target.value)
                      }
                      displayEmpty
                      fullWidth
                      sx={{ fontSize: '0.75rem' }}
                    >
                      <MenuItem value="">--Select--</MenuItem>
                      {apiData?.diamondCertificateTypes
                        ?.filter((item) => item.is_active !== false)
                        .map((item) => (
                          <MenuItem key={item.id} value={item.id}>
                            {item.name || item.certificate_type || item.label || `ID: ${item.id}`}
                          </MenuItem>
                        ))}
                    </Select>
                  </TableCell>

                  {/* Certificate Number */}
                  <TableCell>
                    <DiamondInput
                      value={diamond.certificate_number}
                      onChange={(e) =>
                        handleDiamondChange(index, 'certificate_number', e.target.value)
                      }
                    />
                  </TableCell>

                  {/* Purchase Amount (Calculated) */}
                  <TableCell sx={{ bgcolor: 'success.lighter' }}>
                    <TextField
                      size="small"
                      value={diamond.purchase_amount || '0.00'}
                      disabled
                      sx={{
                        width: '100px',
                        '& .MuiInputBase-input': {
                          textAlign: 'right',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                        },
                      }}
                    />
                  </TableCell>

                  {/* Sale Amount (Calculated) */}
                  <TableCell sx={{ bgcolor: 'info.lighter' }}>
                    <TextField
                      size="small"
                      value={diamond.sale_amount || '0.00'}
                      disabled
                      sx={{
                        width: '100px',
                        '& .MuiInputBase-input': {
                          textAlign: 'right',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                        },
                      }}
                    />
                  </TableCell>

                  {/* Action */}
                  <TableCell>
                    <IconButton size="small" color="error" onClick={() => removeDiamondRow(index)}>
                      <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

      {diamondDetails.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 2, color: 'text.secondary' }}>
          <span style={{ fontSize: '0.813rem' }}>
            No diamond details added. Click &quot;Add Diamond&quot; to start.
          </span>
        </Box>
      )}
    </Box>
  );
}
