import React, { useState, useEffect, useMemo } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Autocomplete from '@mui/material/Autocomplete';
import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';
import { threeDigitDecimalPointRegex, twoDigitDecimalPointRegex } from 'src/auth/utils/regex';

// ----------------------------------------------------------------------

export function LessWeightModal({
  open,
  onClose,
  lessWeightDetails = [],
  onSave,
  apiData = {},
  productData = {},
}) {
  const [details, setDetails] = useState([]);
  const lessTypesMaster = useMemo(() => apiData.lessTypes || [], [apiData.lessTypes]);

  useEffect(() => {
    if (open) {
      // Initialize with existing details or empty array
      setDetails(
        lessWeightDetails && lessWeightDetails.length > 0
          ? lessWeightDetails.map((detail, index) => {
              const lessTypeId = detail.less_type;
              const lessTypeMaster = lessTypesMaster.find((lt) => lt.id === lessTypeId);

              return {
                id: Date.now() + index,
                less_type: lessTypeId || '',
                less_type_name: lessTypeMaster?.less_type_name || detail.less_type || '',
                charges_type: detail.charges_type || 'GRM',
                pieces: detail.pieces || 0,
                grams: detail.grams || '',
                tag_variation_type: detail.tag_variation_type || 'LESS',
                tag_variation: detail.tag_variation || '',
                tag_variation_grams: detail.tag_variation_grams || '',
                purchase_rate: detail.purchase_rate || '',
                sale_rate: detail.sale_rate || '',
                purchase_charges: detail.purchase_charges || '',
                sale_charges: detail.sale_charges || '',
              };
            })
          : []
      );
    }
  }, [open, lessWeightDetails, lessTypesMaster]);

  const handleAddDetail = () => {
    const newDetail = {
      id: Date.now(),
      less_type: '',
      less_type_name: '',
      charges_type: 'GRM',
      pieces: 0,
      grams: '',
      tag_variation_type: 'LESS',
      tag_variation: '',
      tag_variation_grams: '',
      purchase_rate: '',
      sale_rate: '',
      purchase_charges: '',
      sale_charges: '',
    };

    setDetails([...details, newDetail]);
  };

  const handleRemoveDetail = (id) => {
    setDetails(details.filter((detail) => detail.id !== id));
  };

  const handleDetailChange = (id, field, value) => {
    setDetails(
      details.map((detail) => {
        if (detail.id === id) {
          const updated = { ...detail, [field]: value };

          // Handle less_type selection - only from master API
          if (field === 'less_type') {
            if (typeof value === 'object' && value !== null && value.id) {
              // Selected from master
              updated.less_type = value.id;
              updated.less_type_name = value.less_type_name || value.name || `ID: ${value.id}`;
            } else {
              // Empty or invalid
              updated.less_type = '';
              updated.less_type_name = '';
            }
          }

          // Calculate purchase_charges and sale_charges based on charges_type
          if (
            field === 'charges_type' ||
            field === 'grams' ||
            field === 'pieces' ||
            field === 'purchase_rate' ||
            field === 'sale_rate'
          ) {
            updated.purchase_charges = calculatePurchaseCharges(updated);
            updated.sale_charges = calculateSaleCharges(updated);
          }

          // Calculate tag_variation_grams when tag_variation changes
          if (field === 'tag_variation' || field === 'grams') {
            updated.tag_variation_grams = calculateTagVariationGrams(updated);
          }

          return updated;
        }
        return detail;
      })
    );
  };

  const calculatePurchaseCharges = (detail) => {
    const purchaseRate = parseFloat(detail.purchase_rate) || 0;
    if (detail.charges_type === 'PCS') {
      const pieces = parseInt(detail.pieces) || 0;
      return (pieces * purchaseRate).toFixed(2);
    } else {
      // GRM
      const grams = parseFloat(detail.grams) || 0;
      return (grams * purchaseRate).toFixed(2);
    }
  };

  const calculateSaleCharges = (detail) => {
    const saleRate = parseFloat(detail.sale_rate) || 0;
    if (detail.charges_type === 'PCS') {
      const pieces = parseInt(detail.pieces) || 0;
      return (pieces * saleRate).toFixed(2);
    } else {
      // GRM
      const grams = parseFloat(detail.grams) || 0;
      return (grams * saleRate).toFixed(2);
    }
  };

  const calculateTagVariationGrams = (detail) => {
    const grams = parseFloat(detail.grams) || 0;
    const tagVariation = parseFloat(detail.tag_variation) || 0;

    if (detail.tag_variation_type === 'LESS') {
      return (grams - (grams * tagVariation) / 100).toFixed(3);
    } else {
      // ADD
      return (grams + (grams * tagVariation) / 100).toFixed(3);
    }
  };

  const calculateTotalLessGrams = () =>
    details.reduce((sum, detail) => sum + (parseFloat(detail.grams) || 0), 0);

  const calculateTotalLessGramsAfterVariation = () =>
    details.reduce((sum, detail) => sum + (parseFloat(detail.tag_variation_grams) || 0), 0);

  const calculateTotalPurchaseCharges = () =>
    details.reduce((sum, detail) => sum + (parseFloat(detail.purchase_charges) || 0), 0);

  const calculateTotalSaleCharges = () =>
    details.reduce((sum, detail) => sum + (parseFloat(detail.sale_charges) || 0), 0);

  const handleSave = () => {
    if (details.length === 0) {
      toast.error('Please add at least one less weight detail');
      return;
    }

    // Validate required fields
    for (const detail of details) {
      if (!detail.less_type) {
        toast.error('Please select/enter Less Type for all entries');
        return;
      }
      if (!detail.purchase_rate) {
        toast.error('Please enter Purchase Rate for all entries');
        return;
      }
      if (!detail.sale_rate) {
        toast.error('Please enter Sale Rate for all entries');
        return;
      }
    }

    // Transform to match API payload structure
    const apiFormat = details
      .map((detail) => {
        // If less_type is a string (new type), we'll need to handle creation
        // For now, if it's a number, use it; if it's a string, we'll need to create it first
        const lessTypeValue =
          typeof detail.less_type === 'number' ? detail.less_type : detail.less_type;

        // Ensure less_type is an integer (required by API)
        // less_type should always be a number from master, but handle edge cases
        let lessTypeId = null;
        if (typeof lessTypeValue === 'number') {
          lessTypeId = lessTypeValue;
        } else if (typeof lessTypeValue === 'string' && !isNaN(parseInt(lessTypeValue, 10))) {
          lessTypeId = parseInt(lessTypeValue, 10);
        }

        // If less_type is not a valid integer, skip this detail (should not happen if validation works)
        if (lessTypeId === null || isNaN(lessTypeId)) {
          console.warn('Invalid less_type:', lessTypeValue, 'for detail:', detail);
          // Skip invalid entries
          return null;
        }

        return {
          less_type: lessTypeId,
          charges_type: detail.charges_type,
          pieces: detail.pieces || 0,
          grams: String(detail.grams || '0'),
          tag_variation_type: detail.tag_variation_type,
          tag_variation: String(detail.tag_variation || '0'),
          tag_variation_grams: String(detail.tag_variation_grams || '0'),
          purchase_rate: String(detail.purchase_rate || '0'),
          sale_rate: String(detail.sale_rate || '0'),
          purchase_charges: String(detail.purchase_charges || '0'),
          sale_charges: String(detail.sale_charges || '0'),
        };
      })
      .filter((item) => item !== null); // Remove any invalid entries

    // Calculate total less weight (sum of grams after variation)
    const totalLessWeight = calculateTotalLessGramsAfterVariation();

    onSave({
      lessWeightDetails: apiFormat,
      lessWeight: String(calculateTotalLessGrams()), // Total less grams before variation
      lessWeightAfterVariation: String(totalLessWeight), // Total less grams after variation
    });

    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Less Weight Details</Typography>
          <IconButton onClick={onClose} size="small">
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2 }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            onClick={handleAddDetail}
            startIcon={<Iconify icon="eva:plus-fill" />}
            sx={{ minWidth: '180px', whiteSpace: 'nowrap' }}
          >
            Add Less Type
          </Button>
        </Box>

        {/* Details Table */}
        {details.length > 0 ? (
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell sx={{ fontWeight: 700 }}>Sr. No</TableCell>
                  <TableCell sx={{ fontWeight: 700, minWidth: 120 }}>Less Type</TableCell>
                  <TableCell sx={{ fontWeight: 700, minWidth: 100 }}>Charges Type</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, minWidth: 80 }}>
                    Pcs
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, minWidth: 100 }}>
                    Grams
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, minWidth: 120 }}>Tag Variation Type</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, minWidth: 120 }}>
                    Tag Variation %
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, minWidth: 130 }}>
                    Tag Variation Grams
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, minWidth: 120 }}>
                    Purchase Rate
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, minWidth: 120 }}>
                    Sale Rate
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, minWidth: 130 }}>
                    Purchase Charges
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, minWidth: 130 }}>
                    Sale Charges
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {details.map((detail, index) => (
                  <TableRow key={detail.id} hover>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Autocomplete
                        size="small"
                        options={lessTypesMaster}
                        getOptionLabel={(option) =>
                          option.less_type_name || option.name || `ID: ${option.id}`
                        }
                        value={
                          detail.less_type
                            ? lessTypesMaster.find((lt) => lt.id === detail.less_type) || null
                            : null
                        }
                        onChange={(event, newValue) => {
                          handleDetailChange(detail.id, 'less_type', newValue);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="Select less type"
                            sx={{ minWidth: 150 }}
                          />
                        )}
                        noOptionsText="No less types available"
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        size="small"
                        value={detail.charges_type}
                        onChange={(e) =>
                          handleDetailChange(detail.id, 'charges_type', e.target.value)
                        }
                        sx={{ minWidth: 120 }}
                      >
                        <MenuItem value="PCS">Pcs</MenuItem>
                        <MenuItem value="GRM">Grm</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell align="right">
                      <TextField
                        size="small"
                        type="number"
                        value={detail.pieces || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleDetailChange(
                            detail.id,
                            'pieces',
                            value === '' ? 0 : parseInt(value, 10) || 0
                          );
                        }}
                        placeholder="0"
                        inputProps={{ min: 0 }}
                        sx={{
                          width: '80px',
                          '& .MuiInputBase-input': {
                            textAlign: 'right',
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <TextField
                        size="small"
                        type="number"
                        value={detail.grams || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Allow only numbers with up to 3 decimals
                          if (threeDigitDecimalPointRegex.test(value)) {
                            handleDetailChange(detail.id, 'grams', value);
                          }
                        }}
                        placeholder="0.000"
                        inputProps={{ step: '0.001', min: 0 }}
                        sx={{
                          width: '100px',
                          '& .MuiInputBase-input': {
                            textAlign: 'right',
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        size="small"
                        value={detail.tag_variation_type}
                        onChange={(e) =>
                          handleDetailChange(detail.id, 'tag_variation_type', e.target.value)
                        }
                        sx={{ minWidth: 120 }}
                      >
                        <MenuItem value="LESS">Less</MenuItem>
                        <MenuItem value="ADD">Add</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell align="right">
                      <TextField
                        size="small"
                        type="number"
                        value={detail.tag_variation || ''}
                        onChange={(e) =>
                          handleDetailChange(detail.id, 'tag_variation', e.target.value)
                        }
                        placeholder="0.00"
                        inputProps={{ step: '0.01', min: 0 }}
                        sx={{
                          width: '120px',
                          '& .MuiInputBase-input': {
                            textAlign: 'right',
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <TextField
                        size="small"
                        type="number"
                        value={detail.tag_variation_grams || ''}
                        disabled
                        placeholder="0.000"
                        sx={{
                          width: '130px',
                          bgcolor: 'grey.100',
                          '& .MuiInputBase-input': {
                            textAlign: 'right',
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <TextField
                        size="small"
                        type="number"
                        value={detail.purchase_rate || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Allow only numbers with up to 2 decimals
                          if (twoDigitDecimalPointRegex.test(value)) {
                            handleDetailChange(detail.id, 'purchase_rate', e.target.value);
                          }
                        }}
                        placeholder="0.00"
                        inputProps={{ step: '0.01', min: 0 }}
                        sx={{
                          width: '120px',
                          '& .MuiInputBase-input': {
                            textAlign: 'right',
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <TextField
                        size="small"
                        type="number"
                        value={detail.sale_rate || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Allow only numbers with up to 2 decimals
                          if (twoDigitDecimalPointRegex.test(value)) {
                            handleDetailChange(detail.id, 'sale_rate', e.target.value);
                          }
                        }}
                        placeholder="0.00"
                        inputProps={{ step: '0.01', min: 0 }}
                        sx={{
                          width: '120px',
                          '& .MuiInputBase-input': {
                            textAlign: 'right',
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <TextField
                        size="small"
                        type="number"
                        value={detail.purchase_charges || ''}
                        disabled
                        placeholder="0.00"
                        sx={{
                          width: '130px',
                          bgcolor: 'grey.100',
                          '& .MuiInputBase-input': {
                            textAlign: 'right',
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <TextField
                        size="small"
                        type="number"
                        value={detail.sale_charges || ''}
                        disabled
                        placeholder="0.00"
                        sx={{
                          width: '130px',
                          bgcolor: 'grey.100',
                          '& .MuiInputBase-input': {
                            textAlign: 'right',
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveDetail(detail.id)}
                      >
                        <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow sx={{ bgcolor: 'warning.lighter', fontWeight: 700 }}>
                  <TableCell colSpan={4} align="right" sx={{ fontWeight: 700 }}>
                    <Typography variant="subtitle2" fontWeight={700}>
                      Total Less Gram
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {calculateTotalLessGrams().toFixed(3)}
                  </TableCell>
                  <TableCell colSpan={2} />
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {calculateTotalLessGramsAfterVariation().toFixed(3)}
                  </TableCell>
                  <TableCell colSpan={2} />
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {calculateTotalPurchaseCharges().toFixed(2)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {calculateTotalSaleCharges().toFixed(2)}
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              No less weight details added. Click &quot;Add Less Type&quot; to add a new entry.
            </Typography>
          </Box>
        )}

        <Box sx={{ mt: 2, p: 1.5, bgcolor: 'info.lighter', borderRadius: 1 }}>
          <Typography variant="caption" component="div">
            <strong>Notes:</strong>
            <br />• Purchase Charges = {`{PCS or GRM}`} × Purchase Rate
            <br />• Sale Charges = {`{PCS or GRM}`} × Sale Rate
            <br />
            • Tag Variation Grams = Grams ± (Grams × Tag Variation % / 100)
            <br />• Purchase Charges saved for purchase calculation, Sale Charges for Barcode
            Details
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
