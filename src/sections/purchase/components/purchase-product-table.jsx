import React, { useCallback, useEffect, useMemo } from 'react';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableFooter from '@mui/material/TableFooter';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

// This is a simple, controlled text field for the table
const TableInput = ({ value, onChange, disabled = false, type = 'text', ...props }) => (
  <TextField
    size="small"
    type={type}
    value={value || ''}
    onChange={onChange}
    disabled={disabled}
    variant="outlined"
    sx={{
      width: type === 'number' ? '100px' : '100%',
      minWidth: '80px',
      '& .MuiInputBase-input': {
        textAlign: type === 'number' ? 'right' : 'left',
      },
    }}
    {...props}
  />
);

export function PurchaseProductTable({
  products,
  onProductsChange,
  tagSelected,
  category,
  apiData,
}) {
  const isTagPurchase = tagSelected === 'TAG';
  const subTypeProducts = apiData?.products || [];

  // Calculate derived fields when inputs change
  const calculateProduct = useCallback((product) => {
    const grossWeight = parseFloat(product.grossWeight) || 0;
    const lessWeight = parseFloat(product.lessWeight) || 0;
    const purity = parseFloat(product.touch || product.purity) || 0;
    const wastage = parseFloat(product.wastagePercent || product.wastage) || 0;
    const purchaseRate = parseFloat(product.purchaseRate) || 0;
    const purchaseMrp = parseFloat(product.purchaseMrp) || 0;
    const otherCharges = parseFloat(product.otherCharges) || 0;
    const makingCharges = parseFloat(product.labourRate || product.makingCharges) || 0;

    // Net Weight = Gross Weight - Less Weight
    const netWeight = grossWeight - lessWeight;

    // Pure Weight = ((Purity + Wastage) / 100) * Net Weight
    const pureWeight = ((purity + wastage) / 100) * netWeight;

    // Calculate Purchase Total Amount
    let totalAmount = 0;
    if (purchaseMrp > 0) {
      // If MRP is entered, use it directly
      totalAmount = purchaseMrp;
    } else {
      // Otherwise: Pure wt * Purchase Rate + Other charges + Making charges
      totalAmount = pureWeight * purchaseRate + otherCharges + makingCharges;
    }

    return {
      ...product,
      netWeight: netWeight.toFixed(3),
      pureWeight: pureWeight.toFixed(3),
      totalPureWeight: pureWeight.toFixed(3),
      amount: totalAmount.toFixed(2),
    };
  }, []);

  // This handler updates the product list in the parent component
  const handleProductChange = useCallback(
    (index, field, value) => {
      // Create a new array to avoid state mutation
      const updatedProducts = products.map((product, i) => {
        if (i === index) {
          const updated = {
            ...product,
            [field]: value,
          };
          // Recalculate derived fields
          return calculateProduct(updated);
        }
        return product;
      });

      // Send the entire updated list to the parent
      onProductsChange(updatedProducts);
    },
    [products, onProductsChange, calculateProduct]
  );

  // Handler to update multiple fields at once
  const handleMultipleFieldsChange = useCallback(
    (index, updates) => {
      const updatedProducts = products.map((product, i) => {
        if (i === index) {
          const updated = {
            ...product,
            ...updates,
          };
          // Recalculate derived fields
          return calculateProduct(updated);
        }
        return product;
      });

      onProductsChange(updatedProducts);
    },
    [products, onProductsChange, calculateProduct]
  );

  // Calculate totals
  const totals = useMemo(() => {
    const filled = products.filter((p) => p.description);
    return {
      totalPcs: filled.reduce((sum, p) => sum + (parseInt(p.pcs) || 0), 0),
      totalGrossWeight: filled.reduce((sum, p) => sum + (parseFloat(p.grossWeight) || 0), 0),
      totalLessWeight: filled.reduce((sum, p) => sum + (parseFloat(p.lessWeight) || 0), 0),
      totalNetWeight: filled.reduce((sum, p) => sum + (parseFloat(p.netWeight) || 0), 0),
      totalPureWeight: filled.reduce((sum, p) => sum + (parseFloat(p.totalPureWeight) || 0), 0),
      totalOtherCharges: filled.reduce((sum, p) => sum + (parseFloat(p.otherCharges) || 0), 0),
      totalMakingCharges: filled.reduce(
        (sum, p) => sum + (parseFloat(p.labourRate || p.makingCharges) || 0),
        0
      ),
      totalAmount: filled.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0),
    };
  }, [products]);

  const columns = [
    { id: 'srNo', label: 'Sr no', width: 50, align: 'center' },
    { id: 'description', label: 'Description', width: 150 },
    { id: 'subType', label: 'Sub Type*', width: 120 },
    { id: 'pcs', label: 'Quantity', width: 70 },
    { id: 'grossWeight', label: 'Gross Weight *', width: 110 },
    { id: 'lessWeight', label: 'Less Weight', width: 100 },
    { id: 'netWeight', label: 'Net Weight', width: 100 },
    { id: 'touch', label: 'Purity /Touch', width: 110 },
    { id: 'wastagePercent', label: 'Purchase Wastage', width: 130 },
    { id: 'totalPureWeight', label: 'Pure Weight', width: 100 },
    { id: 'otherCharges', label: 'Other Charges', width: 110 },
    { id: 'makingCharges', label: 'Purchase Making Charges', width: 180 },
    { id: 'purchaseRate', label: 'Purchase Rate', width: 120 },
    { id: 'purchaseMrp', label: 'Purchase MRP', width: 120 },
    { id: 'saleMrp', label: 'Sale MRP', width: 120 },
    { id: 'amount', label: 'Purchase Total Amount', width: 170 },
    { id: 'otherDetails', label: 'Other Tag Details', width: 130 },
  ];

  return (
    <Table sx={{ minWidth: 2200 }} size="small">
      <TableHead>
        <TableRow>
          {columns.map((col) => (
            <TableCell
              key={col.id}
              align={col.align || 'left'}
              sx={{
                bgcolor: 'grey.100',
                fontWeight: 700,
                fontSize: '0.875rem',
                width: col.width,
                minWidth: col.width,
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
        {products.map((product, index) => (
          <TableRow key={product.id} hover>
            {/* SR No */}
            <TableCell align="center" sx={{ color: 'text.secondary' }}>
              {product.id}
            </TableCell>

            {/* Description */}
            <TableCell>
              <TableInput
                value={product.description}
                onChange={(e) => handleProductChange(index, 'description', e.target.value)}
                placeholder="Product Name"
              />
            </TableCell>

            {/* Sub Type - Dropdown */}
            <TableCell>
              <Select
                size="small"
                value={product.subTypeId || ''}
                onChange={(e) => {
                  const selectedProduct = subTypeProducts.find((p) => p.id === e.target.value);
                  if (selectedProduct) {
                    handleMultipleFieldsChange(index, {
                      subTypeId: selectedProduct.id,
                      subType: selectedProduct.product_name || selectedProduct.name,
                    });
                  } else {
                    handleMultipleFieldsChange(index, {
                      subTypeId: '',
                      subType: '',
                    });
                  }
                }}
                displayEmpty
                fullWidth
                sx={{ minWidth: '120px' }}
              >
                <MenuItem value="">
                  <em>Select Sub Type</em>
                </MenuItem>
                {subTypeProducts.map((prod) => (
                  <MenuItem key={prod.id} value={prod.id}>
                    {prod.product_name || prod.name}
                  </MenuItem>
                ))}
              </Select>
            </TableCell>

            {/* Quantity - Fixed to 1 if TAG selected */}
            <TableCell>
              <TableInput
                type="number"
                value={isTagPurchase ? 1 : product.pcs}
                onChange={(e) =>
                  handleProductChange(index, 'pcs', parseInt(e.target.value, 10) || 1)
                }
                disabled={isTagPurchase}
                inputProps={{ min: 1 }}
              />
            </TableCell>

            {/* Gross Weight */}
            <TableCell>
              <TableInput
                type="number"
                value={product.grossWeight}
                onChange={(e) => handleProductChange(index, 'grossWeight', e.target.value)}
                placeholder="0.000"
                inputProps={{ step: '0.001', min: 0 }}
              />
            </TableCell>

            {/* Less Weight - Can be manual or popup */}
            <TableCell>
              <TableInput
                type="number"
                value={product.lessWeight}
                onChange={(e) => handleProductChange(index, 'lessWeight', e.target.value)}
                placeholder="0.000"
                inputProps={{ step: '0.001', min: 0 }}
              />
            </TableCell>

            {/* Net Weight (Calculated) - Gross - Less */}
            <TableCell sx={{ bgcolor: 'grey.50' }}>
              <TextField
                size="small"
                value={product.netWeight || '0.000'}
                disabled
                sx={{
                  width: '100px',
                  '& .MuiInputBase-input': { textAlign: 'right', fontWeight: 600 },
                }}
              />
            </TableCell>

            {/* Purity/Touch % */}
            <TableCell>
              <TableInput
                type="number"
                value={product.touch}
                onChange={(e) => handleProductChange(index, 'touch', e.target.value)}
                placeholder="0"
                inputProps={{ step: '0.01', min: 0, max: 100 }}
              />
            </TableCell>

            {/* Wastage % */}
            <TableCell>
              <TableInput
                type="number"
                value={product.wastagePercent}
                onChange={(e) => handleProductChange(index, 'wastagePercent', e.target.value)}
                placeholder="0"
                inputProps={{ step: '0.01', min: 0, max: 100 }}
              />
            </TableCell>

            {/* Pure Weight (Calculated) - (Purity + Wastage) * Net Weight / 100 */}
            <TableCell sx={{ bgcolor: 'primary.lighter' }}>
              <TextField
                size="small"
                value={product.totalPureWeight || '0.000'}
                disabled
                sx={{
                  width: '100px',
                  '& .MuiInputBase-input': {
                    textAlign: 'right',
                    fontWeight: 600,
                    color: 'primary.main',
                  },
                }}
              />
            </TableCell>

            {/* Other Charges */}
            <TableCell>
              <TableInput
                type="number"
                value={product.otherCharges}
                onChange={(e) => handleProductChange(index, 'otherCharges', e.target.value)}
                placeholder="0"
                inputProps={{ step: '0.01', min: 0 }}
              />
            </TableCell>

            {/* Making Charges */}
            <TableCell>
              <TableInput
                type="number"
                value={product.labourRate || product.makingCharges}
                onChange={(e) => handleProductChange(index, 'labourRate', e.target.value)}
                placeholder="0"
                inputProps={{ step: '0.01', min: 0 }}
              />
            </TableCell>

            {/* Purchase Rate - Frozen when MRP is entered */}
            <TableCell>
              <TableInput
                type="number"
                value={product.purchaseRate}
                onChange={(e) => handleProductChange(index, 'purchaseRate', e.target.value)}
                placeholder="0"
                disabled={product.purchaseMrp > 0}
                inputProps={{ step: '0.01', min: 0 }}
              />
            </TableCell>

            {/* Purchase MRP */}
            <TableCell>
              <TableInput
                type="number"
                value={product.purchaseMrp}
                onChange={(e) => handleProductChange(index, 'purchaseMrp', e.target.value)}
                placeholder="0"
                inputProps={{ step: '0.01', min: 0 }}
              />
            </TableCell>

            {/* Sale MRP - Frozen when MRP is entered */}
            <TableCell>
              <TableInput
                type="number"
                value={product.saleMrp}
                onChange={(e) => handleProductChange(index, 'saleMrp', e.target.value)}
                placeholder="0"
                disabled={product.purchaseMrp > 0}
                inputProps={{ step: '0.01', min: 0 }}
              />
            </TableCell>

            {/* Total Amount (Calculated) */}
            <TableCell sx={{ bgcolor: 'success.lighter' }}>
              <TextField
                size="small"
                value={product.amount || '0.00'}
                disabled
                sx={{
                  width: '120px',
                  '& .MuiInputBase-input': {
                    textAlign: 'right',
                    fontWeight: 700,
                    color: 'success.dark',
                  },
                }}
              />
            </TableCell>

            {/* Other Tag Details Button */}
            <TableCell>
              <Button
                size="small"
                variant="outlined"
                color="info"
                fullWidth
                sx={{ minWidth: '100px' }}
              >
                Details
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow sx={{ bgcolor: 'warning.lighter' }}>
          <TableCell colSpan={2} align="right" sx={{ fontWeight: 700 }}>
            <Typography variant="subtitle2">Total:</Typography>
          </TableCell>
          <TableCell />
          <TableCell align="right" sx={{ fontWeight: 700 }}>
            {totals.totalPcs}
          </TableCell>
          <TableCell align="right" sx={{ fontWeight: 700 }}>
            {totals.totalGrossWeight.toFixed(3)}
          </TableCell>
          <TableCell align="right" sx={{ fontWeight: 700 }}>
            {totals.totalLessWeight.toFixed(3)}
          </TableCell>
          <TableCell align="right" sx={{ fontWeight: 700 }}>
            {totals.totalNetWeight.toFixed(3)}
          </TableCell>
          <TableCell />
          <TableCell />
          <TableCell align="right" sx={{ fontWeight: 700, color: 'primary.main' }}>
            {totals.totalPureWeight.toFixed(3)}
          </TableCell>
          <TableCell align="right" sx={{ fontWeight: 700 }}>
            {totals.totalOtherCharges.toFixed(2)}
          </TableCell>
          <TableCell align="right" sx={{ fontWeight: 700 }}>
            {totals.totalMakingCharges.toFixed(2)}
          </TableCell>
          <TableCell />
          <TableCell />
          <TableCell />
          <TableCell align="right" sx={{ fontWeight: 700, color: 'success.dark' }}>
            {totals.totalAmount.toFixed(2)}
          </TableCell>
          <TableCell />
        </TableRow>
      </TableFooter>
    </Table>
  );
}
