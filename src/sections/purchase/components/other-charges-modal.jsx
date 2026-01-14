import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
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
import { useApi } from 'src/hooks/useApi';
import { API_ROUTES } from 'src/utils/apiRoute';
import { useSelector } from 'react-redux';

// ----------------------------------------------------------------------

export function OtherChargesModal({ open, onClose, otherChargesDetails = [], onSave }) {
  const [charges, setCharges] = useState([]);
  const [newChargeType, setNewChargeType] = useState('');
  const [otherChargesMaster, setOtherChargesMaster] = useState([]);
  const { callApi, loading } = useApi();
  const selectedCompany = useSelector((state) => state.user.selectedCompany);

  // Fetch other charges from API
  useEffect(() => {
    if (open) {
      const fetchOtherCharges = async () => {
        try {
          const companyId = selectedCompany?.company?.id || selectedCompany?.id;
          const response = await callApi({
            url: API_ROUTES.PURCHASE.OTHER_CHARGES.LIST,
            method: 'GET',
            query: {
              company_id: companyId,
              is_active: true, // Only fetch active charges
            },
          });

          // Handle different response structures
          // The useApi hook returns { success: true, ...response.data }
          // If API returns array directly, it might be spread into numeric keys
          let chargesList = [];

          // Check if response is directly an array
          if (Array.isArray(response)) {
            chargesList = response;
          }
          // Check if response has numeric keys (array was spread)
          else if (response && typeof response === 'object') {
            // Check for numeric keys (array was spread)
            const numericKeys = Object.keys(response).filter((key) => !isNaN(parseInt(key, 10)));
            if (numericKeys.length > 0) {
              chargesList = numericKeys.map((key) => response[key]);
            }
            // Check if response.data is an array
            else if (Array.isArray(response.data)) {
              chargesList = response.data;
            }
            // Check if response has results
            else if (Array.isArray(response.results)) {
              chargesList = response.results;
            }
            // Check if response.data.results exists
            else if (response.data?.results) {
              chargesList = response.data.results;
            }
          }

          // Filter active charges if needed (in case API doesn't filter)
          const activeCharges = chargesList.filter(
            (charge) => charge && charge.is_active !== false
          );
          setOtherChargesMaster(activeCharges);
        } catch (error) {
          console.error('Failed to fetch other charges:', error);
          // Don't show error toast, just use empty array
          setOtherChargesMaster([]);
        }
      };

      fetchOtherCharges();
    }
  }, [open, callApi, selectedCompany]);

  useEffect(() => {
    if (open) {
      // Initialize with existing charges or empty array
      setCharges(
        otherChargesDetails && otherChargesDetails.length > 0
          ? otherChargesDetails.map((charge, index) => ({
              id: Date.now() + index,
              charge_type: charge.charge_type || '',
              purchase_charges: charge.purchase_charges || '',
              sale_charges: charge.sale_charges || '',
            }))
          : []
      );
      setNewChargeType('');
    }
  }, [open, otherChargesDetails]);

  const handleAddCharge = () => {
    if (!newChargeType.trim()) {
      toast.error('Please enter a charge type');
      return;
    }

    // Check if charge type already exists
    if (charges.some((c) => c.charge_type.toLowerCase() === newChargeType.toLowerCase().trim())) {
      toast.error('This charge type already exists');
      return;
    }

    const newCharge = {
      id: Date.now(),
      charge_type: newChargeType.trim(),
      purchase_charges: '',
      sale_charges: '',
    };

    setCharges([...charges, newCharge]);
    setNewChargeType('');
  };

  const handleRemoveCharge = (id) => {
    setCharges(charges.filter((charge) => charge.id !== id));
  };

  const handleChargeChange = (id, field, value) => {
    setCharges(
      charges.map((charge) => (charge.id === id ? { ...charge, [field]: value } : charge))
    );
  };

  const calculateTotalPurchase = () =>
    charges.reduce((sum, charge) => sum + (parseFloat(charge.purchase_charges) || 0), 0);

  const calculateTotalSale = () =>
    charges.reduce((sum, charge) => sum + (parseFloat(charge.sale_charges) || 0), 0);

  const handleSave = () => {
    // Transform to match API payload structure
    const apiFormat = charges.map((charge) => ({
      charge_type: charge.charge_type,
      purchase_charges: String(charge.purchase_charges || '0'),
      sale_charges: String(charge.sale_charges || '0'),
    }));

    // Calculate total purchase charges
    const totalPurchaseCharges = calculateTotalPurchase();

    onSave({
      otherChargesDetails: apiFormat,
      otherCharges: String(totalPurchaseCharges),
    });

    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Other Charges</Typography>
          <IconButton onClick={onClose} size="small">
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2 }}>
        {/* Add New Charge Type */}
        <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Autocomplete
              freeSolo
              options={otherChargesMaster}
              getOptionLabel={(option) =>
                typeof option === 'string' ? option : option.charge_type || ''
              }
              isOptionEqualToValue={(option, value) => {
                if (typeof option === 'string' || typeof value === 'string') {
                  return option === value;
                }
                return option?.id === value?.id || option?.charge_type === value?.charge_type;
              }}
              value={null}
              inputValue={newChargeType}
              onChange={(event, newValue) => {
                if (newValue) {
                  // If option selected from list, use its charge_type
                  const chargeType =
                    typeof newValue === 'string' ? newValue : newValue.charge_type || '';
                  setNewChargeType(chargeType);
                }
              }}
              onInputChange={(event, newInputValue) => {
                setNewChargeType(newInputValue);
              }}
              renderOption={(props, option) => {
                const { key, ...optionProps } = props;
                return (
                  <li key={option.id || key} {...optionProps}>
                    {typeof option === 'string' ? option : option.charge_type || ''}
                  </li>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Charge Type"
                  placeholder="Select from existing or enter new charge type (e.g., Hallmark, Mino)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newChargeType.trim()) {
                      handleAddCharge();
                    }
                  }}
                />
              )}
              loading={loading}
              sx={{ flex: 1 }}
            />
            <Button
              variant="contained"
              onClick={handleAddCharge}
              startIcon={<Iconify icon="eva:plus-fill" />}
              sx={{ minWidth: '160px', whiteSpace: 'nowrap' }}
            >
              Add Charge Type
            </Button>
          </Box>
        </Box>

        {/* Charges Table */}
        {charges.length > 0 ? (
          <Box>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell sx={{ fontWeight: 700 }}>Sr. No</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Chrg. Type</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    Purchase Charges
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    Sale Charges
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {charges.map((charge, index) => (
                  <TableRow key={charge.id} hover>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {charge.charge_type}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <TextField
                        size="small"
                        type="number"
                        value={charge.purchase_charges || ''}
                        onChange={(e) =>
                          handleChargeChange(charge.id, 'purchase_charges', e.target.value)
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
                        value={charge.sale_charges || ''}
                        onChange={(e) =>
                          handleChargeChange(charge.id, 'sale_charges', e.target.value)
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
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveCharge(charge.id)}
                      >
                        <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow sx={{ bgcolor: 'warning.lighter', fontWeight: 700 }}>
                  <TableCell colSpan={2} align="right" sx={{ fontWeight: 700 }}>
                    <Typography variant="subtitle2" fontWeight={700}>
                      Total
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {calculateTotalPurchase().toFixed(2)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {calculateTotalSale().toFixed(2)}
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              No charges added. Add a charge type above.
            </Typography>
          </Box>
        )}

        <Box sx={{ mt: 2, p: 1.5, bgcolor: 'info.lighter', borderRadius: 1 }}>
          <Typography variant="caption" component="div">
            <strong>Note:</strong> Purchase Charges are used for purchase calculation. Sale Charges
            are saved for Barcode Details. Charge Type is common.
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
