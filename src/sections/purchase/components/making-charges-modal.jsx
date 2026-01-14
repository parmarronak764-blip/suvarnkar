import React, { useState, useEffect } from 'react';
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
import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';

// ----------------------------------------------------------------------

export function MakingChargesModal({
  open,
  onClose,
  makingChargesDetails = [],
  onSave,
  apiData = {},
  productData = {},
}) {
  const [charges, setCharges] = useState([]);
  const makingChargesMaster = apiData.makingCharges || [];

  useEffect(() => {
    if (open) {
      // Initialize with existing charges or empty array
      setCharges(
        makingChargesDetails && makingChargesDetails.length > 0
          ? makingChargesDetails.map((charge, index) => ({
              id: charge.id,
              making_charges: charge.making_charges
                ? typeof charge.making_charges === 'number'
                  ? charge.making_charges
                  : parseInt(charge.making_charges, 10)
                : '',
              making_charges_on: charge.making_charges_on || 'GROSS_WEIGHT',
              weight: charge.weight || '',
              charge_type: charge.charge_type || 'PER_GRAM',
              purchase_labour_charge: charge.purchase_labour_charge || '',
              percentage_value: charge.percentage_value || '',
              total_amount_value: charge.total_amount_value || '',
              purchase_charges_amount: charge.purchase_charges_amount || '',
              sale_value: charge.sale_value || '',
            }))
          : []
      );
    }
  }, [open, makingChargesDetails]);

  const handleAddCharge = () => {
    const newCharge = {
      id: Date.now(),
      making_charges: '',
      making_charges_on: 'GROSS_WEIGHT',
      weight: productData.grossWeight || productData.netWeight || '',
      charge_type: 'PER_GRAM',
      purchase_labour_charge: '',
      percentage_value: '',
      total_amount_value: '',
      purchase_charges_amount: '',
      sale_value: '',
    };

    setCharges([...charges, newCharge]);
  };

  const handleRemoveCharge = (id) => {
    setCharges(charges.filter((charge) => charge.id !== id));
  };

  const handleChargeChange = (id, field, value) => {
    setCharges(
      charges.map((charge) => {
        if (charge.id === id) {
          const updated = { ...charge, [field]: value };

          // Auto-calculate purchase_charges_amount based on charge_type
          if (
            field === 'charge_type' ||
            field === 'weight' ||
            field === 'purchase_labour_charge' ||
            field === 'total_amount_value'
          ) {
            updated.purchase_charges_amount = calculatePurchaseCharges(updated);
          }

          return updated;
        }
        return charge;
      })
    );
  };

  const calculatePurchaseCharges = (charge) => {
    const weight = parseFloat(charge.weight) || 0;
    const labourCharge = parseFloat(charge.purchase_labour_charge) || 0;

    switch (charge.charge_type) {
      case 'PER_GRAM':
        return String(weight * labourCharge);
      case 'PERCENTAGE':
        // Percentage calculation will be done at sale time
        return '0';
      case 'TOTAL_VALUE':
        return String(charge.total_amount_value || '0');
      default:
        return '0';
    }
  };

  const calculateTotalPurchase = () =>
    charges.reduce((sum, charge) => sum + (parseFloat(charge.purchase_charges_amount) || 0), 0);

  const calculateTotalSale = () =>
    charges.reduce((sum, charge) => sum + (parseFloat(charge.sale_value) || 0), 0);

  const handleSave = () => {
    if (charges.length === 0) {
      toast.error('Please add at least one making charge');
      return;
    }

    // Validate required fields
    for (const charge of charges) {
      if (!charge.making_charges) {
        toast.error('Please select Making Charges Name for all entries');
        return;
      }
      if (!charge.weight) {
        toast.error('Please enter Weight for all entries');
        return;
      }
      if (!charge.purchase_labour_charge) {
        toast.error('Please enter Purchase Labour Charge for all entries');
        return;
      }
      if (charge.charge_type === 'PERCENTAGE' && !charge.percentage_value) {
        toast.error('Please enter Percentage Value for percentage type charges');
        return;
      }
      if (charge.charge_type === 'TOTAL_VALUE' && !charge.total_amount_value) {
        toast.error('Please enter Total Amount Value for total amount type charges');
        return;
      }
    }

    // Transform to match API payload structure
    const apiFormat = charges.map((charge) => {
      const makingChargeMaster = makingChargesMaster.find((mc) => mc.id === charge.making_charges);
      const chargeType = makingChargeMaster?.labour_charge || charge.charge_type;

      return {
        making_charges: charge.making_charges,
        making_charges_on: charge.making_charges_on,
        weight: String(charge.weight || '0'),
        charge_type: chargeType,
        purchase_labour_charge: String(charge.purchase_labour_charge || '0'),
        percentage_value: charge.percentage_value ? String(charge.percentage_value) : null,
        total_amount_value: charge.total_amount_value ? String(charge.total_amount_value) : null,
        purchase_charges_amount: String(charge.purchase_charges_amount || '0'),
        sale_value: String(charge.sale_value || '0'),
      };
    });

    // Calculate total making charges
    const totalMakingCharges = calculateTotalPurchase();

    onSave({
      makingChargesDetails: apiFormat,
      labourRate: String(totalMakingCharges),
      makingCharges: String(totalMakingCharges),
    });

    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Making Charges</Typography>
          <IconButton onClick={onClose} size="small">
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2 }}>
        {charges.length < 1 && (
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              onClick={handleAddCharge}
              startIcon={<Iconify icon="eva:plus-fill" />}
              sx={{ minWidth: '180px', whiteSpace: 'nowrap' }}
            >
              Add Making Charge
            </Button>
          </Box>
        )}

        {/* Charges Table */}
        {charges.length > 0 ? (
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell sx={{ fontWeight: 700 }}>Sr. No</TableCell>
                  <TableCell sx={{ fontWeight: 700, minWidth: 150 }}>Making Charges Name</TableCell>
                  <TableCell sx={{ fontWeight: 700, minWidth: 120 }}>Making Charges On</TableCell>
                  <TableCell sx={{ fontWeight: 700, minWidth: 100 }}>Weight</TableCell>
                  <TableCell sx={{ fontWeight: 700, minWidth: 120 }}>Chrg. Type</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, minWidth: 150 }}>
                    Purchase Labour Charge
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, minWidth: 150 }}>
                    Sale Labour Charges
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, minWidth: 150 }}>
                    Purchase Charges Amount
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, minWidth: 120 }}>Percentage Value</TableCell>
                  <TableCell sx={{ fontWeight: 700, minWidth: 120 }}>Total Amount Value</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, minWidth: 120 }}>
                    Sale Value
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
                      <Select
                        size="small"
                        value={
                          charge.making_charges !== undefined &&
                          charge.making_charges !== null &&
                          charge.making_charges !== ''
                            ? String(charge.making_charges)
                            : ''
                        }
                        onChange={(e) => {
                          const selectedId = e.target.value;
                          // Store as number for consistency
                          const numericId =
                            selectedId && selectedId !== '' ? Number(selectedId) : '';

                          // Update both making_charges and charge_type in a single update
                          if (selectedId && selectedId !== '') {
                            const selectedMaster = makingChargesMaster.find(
                              (mc) => Number(mc.id) === Number(selectedId)
                            );

                            // Update both fields together to avoid state race condition
                            setCharges((prevCharges) =>
                              prevCharges.map((c) => {
                                if (c.id === charge.id) {
                                  const updated = {
                                    ...c,
                                    making_charges: numericId,
                                    charge_type: selectedMaster?.labour_charge || c.charge_type,
                                  };

                                  // Recalculate if needed
                                  if (
                                    selectedMaster?.labour_charge === 'PER_GRAM' ||
                                    updated.charge_type === 'PER_GRAM'
                                  ) {
                                    updated.purchase_charges_amount =
                                      calculatePurchaseCharges(updated);
                                  }

                                  return updated;
                                }
                                return c;
                              })
                            );
                          } else {
                            // Just update making_charges if no selection
                            handleChargeChange(charge.id, 'making_charges', numericId);
                          }
                        }}
                        displayEmpty
                        fullWidth
                        sx={{ fontSize: '0.75rem', minWidth: 150 }}
                      >
                        <MenuItem value="">--Select--</MenuItem>
                        {makingChargesMaster
                          ?.filter((item) => item.is_active !== false)
                          .map((item) => (
                            <MenuItem key={item.id} value={String(item.id)}>
                              {item.charge_name || item.name || `ID: ${item.id}`}
                            </MenuItem>
                          ))}
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        size="small"
                        value={charge.making_charges_on}
                        onChange={(e) =>
                          handleChargeChange(charge.id, 'making_charges_on', e.target.value)
                        }
                        fullWidth
                      >
                        <MenuItem value="GROSS_WEIGHT">Gross Wt</MenuItem>
                        <MenuItem value="NET_WEIGHT">Net Wt</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={charge.weight || ''}
                        onChange={(e) => handleChargeChange(charge.id, 'weight', e.target.value)}
                        placeholder={
                          charge.making_charges_on === 'GROSS_WEIGHT'
                            ? productData.grossWeight || ''
                            : productData.netWeight || ''
                        }
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
                      <TextField
                        size="small"
                        value={
                          charge.charge_type === 'PER_GRAM'
                            ? 'Per Gram'
                            : charge.charge_type === 'PERCENTAGE'
                              ? 'Percentage'
                              : charge.charge_type === 'TOTAL_VALUE'
                                ? 'Total Amount'
                                : charge.charge_type
                        }
                        disabled
                        sx={{ width: '120px' }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <TextField
                        size="small"
                        type="number"
                        value={charge.purchase_labour_charge || ''}
                        onChange={(e) =>
                          handleChargeChange(charge.id, 'purchase_labour_charge', e.target.value)
                        }
                        placeholder="0.00"
                        inputProps={{ step: '0.01', min: 0 }}
                        sx={{
                          width: '130px',
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
                        value={charge.sale_value || ''}
                        onChange={(e) =>
                          handleChargeChange(charge.id, 'sale_value', e.target.value)
                        }
                        placeholder="0.00"
                        inputProps={{ step: '0.01', min: 0 }}
                        sx={{
                          width: '130px',
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
                        value={charge.purchase_charges_amount || ''}
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
                    <TableCell>
                      {charge.charge_type === 'PERCENTAGE' ? (
                        <TextField
                          size="small"
                          type="number"
                          value={charge.percentage_value || ''}
                          onChange={(e) =>
                            handleChargeChange(charge.id, 'percentage_value', e.target.value)
                          }
                          placeholder="0.00"
                          inputProps={{ step: '0.01', min: 0 }}
                          sx={{
                            width: '100px',
                            '& .MuiInputBase-input': {
                              textAlign: 'right',
                            },
                          }}
                        />
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          N/A
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {charge.charge_type === 'TOTAL_VALUE' ? (
                        <TextField
                          size="small"
                          type="number"
                          value={charge.total_amount_value || ''}
                          onChange={(e) =>
                            handleChargeChange(charge.id, 'total_amount_value', e.target.value)
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
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          N/A
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <TextField
                        size="small"
                        type="number"
                        value={charge.sale_value || ''}
                        onChange={(e) =>
                          handleChargeChange(charge.id, 'sale_value', e.target.value)
                        }
                        placeholder="0.00"
                        inputProps={{ step: '0.01', min: 0 }}
                        sx={{
                          width: '100px',
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
                  <TableCell colSpan={5} align="right" sx={{ fontWeight: 700 }}>
                    <Typography variant="subtitle2" fontWeight={700}>
                      Total
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {charges
                      .reduce(
                        (sum, charge) => sum + (parseFloat(charge.purchase_labour_charge) || 0),
                        0
                      )
                      .toFixed(2)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {calculateTotalSale().toFixed(2)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {calculateTotalPurchase().toFixed(2)}
                  </TableCell>
                  <TableCell />
                  <TableCell />
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
              No making charges added. Click &quot;Add Making Charge&quot; to add one.
            </Typography>
          </Box>
        )}

        <Box sx={{ mt: 2, p: 1.5, bgcolor: 'info.lighter', borderRadius: 1 }}>
          <Typography variant="caption" component="div">
            <strong>Calculation Notes:</strong>
            <br />
            • Per Gram = Weight × Per Gram Amount
            <br />
            • Percentage = Calculated at sale time on total metal amount
            <br />• Total Amount = Direct entry value
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
