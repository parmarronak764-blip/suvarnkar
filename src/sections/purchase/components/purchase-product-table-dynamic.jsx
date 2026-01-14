import React, { useCallback, useMemo, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
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
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import { Iconify } from 'src/components/iconify';
import { DiamondDetailsTable } from './diamond-details-table';
import { OtherTagDetailsModal } from './other-tag-details-modal';
import { OtherChargesModal } from './other-charges-modal';
import { MakingChargesModal } from './making-charges-modal';
import { LessWeightModal } from './less-weight-modal';

// ----------------------------------------------------------------------

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

export function PurchaseProductTableDynamic({
  products,
  onProductsChange,
  tagSelected,
  category,
  apiData,
  totals,
  getProductBaseMetalTypes,
}) {
  const isTagPurchase = tagSelected === 'TAG';
  const subTypeProducts = apiData?.products || [];

  // Use category.metal_type_name for accurate bill type detection
  const metalTypeName = (category?.metal_type_name || '').toUpperCase();

  // State for expandable diamond details rows - Default all expanded
  const [expandedRows, setExpandedRows] = useState(() => {
    const initial = {};
    products.forEach((_, index) => {
      initial[index] = true; // Default expanded
    });
    return initial;
  });
  const [tagDetailsModalOpen, setTagDetailsModalOpen] = useState(false);
  const [currentTagDetailsIndex, setCurrentTagDetailsIndex] = useState(null);

  // Modal states for charges
  const [otherChargesModalOpen, setOtherChargesModalOpen] = useState(false);
  const [makingChargesModalOpen, setMakingChargesModalOpen] = useState(false);
  const [lessWeightModalOpen, setLessWeightModalOpen] = useState(false);
  const [currentChargeIndex, setCurrentChargeIndex] = useState(null);

  // Update expandedRows when products length changes to ensure all rows are expanded by default
  useEffect(() => {
    const newExpandedRows = {};
    products.forEach((_, index) => {
      newExpandedRows[index] = true; // Default all rows to expanded
    });
    setExpandedRows(newExpandedRows);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products.length]);

  // Determine which type of table to show based on metal_type_name
  const isOnlyGold = metalTypeName === 'GOLD';
  const isOnlyDiamond = metalTypeName === 'DIAMOND';
  const isOnlySilver = metalTypeName === 'SILVER';
  const isGoldDiamond =
    metalTypeName.includes('GOLD') &&
    metalTypeName.includes('DIAMOND') &&
    !metalTypeName.includes('PLATINUM');
  const isGoldPlatinum =
    metalTypeName.includes('GOLD') &&
    metalTypeName.includes('PLATINUM') &&
    !metalTypeName.includes('DIAMOND');
  const isGoldPlatinumDiamond =
    metalTypeName.includes('GOLD') &&
    metalTypeName.includes('PLATINUM') &&
    metalTypeName.includes('DIAMOND');

  // Generic flags for conditional rendering
  const hasDiamond = isOnlyDiamond || isGoldDiamond || isGoldPlatinumDiamond;
  const hasPlatinum = isGoldPlatinum || isGoldPlatinumDiamond;
  const hasGold = isOnlyGold || isGoldDiamond || isGoldPlatinum || isGoldPlatinumDiamond;

  // Calculate derived fields
  const calculateProduct = useCallback(
    (product, allProducts = []) => {
      // For DIAMOND-ONLY products, calculate diamond amounts
      if (isOnlyDiamond) {
        // Treat empty string as 0 for calculations
        const weight =
          product.diamondWeight === '' ||
          product.diamondWeight === null ||
          product.diamondWeight === undefined
            ? 0
            : parseFloat(product.diamondWeight) || 0;
        const purchaseRate =
          product.diamondPurchaseRate === '' ||
          product.diamondPurchaseRate === null ||
          product.diamondPurchaseRate === undefined
            ? 0
            : parseFloat(product.diamondPurchaseRate) || 0;
        const saleRate =
          product.diamondSaleRate === '' ||
          product.diamondSaleRate === null ||
          product.diamondSaleRate === undefined
            ? 0
            : parseFloat(product.diamondSaleRate) || 0;

        const purchaseAmount = (weight * purchaseRate).toFixed(2);
        const saleAmount = (weight * saleRate).toFixed(2);

        return {
          ...product,
          diamondPurchaseAmount: purchaseAmount,
          diamondSaleAmount: saleAmount,
        };
      }

      // For platinum rows
      if (product.isPlatinumRow) {
        // Preserve manually entered netWeight - allow empty values
        const netWeightStr =
          product.netWeight !== undefined && product.netWeight !== null
            ? String(product.netWeight).trim()
            : '';
        const netWeightValue = netWeightStr !== '' ? parseFloat(netWeightStr) || 0 : 0;

        const purity = parseFloat(product.touch || product.purity) || 0;
        const wastage = parseFloat(product.wastagePercent || product.wastage) || 0;
        const purchaseRate = parseFloat(product.purchaseRate) || 0;
        const purchaseMrp = parseFloat(product.purchaseMrp) || 0;
        const otherCharges = parseFloat(product.otherCharges) || 0;
        const makingCharges = parseFloat(product.labourRate || product.makingCharges) || 0;

        const pureWeight = netWeightValue > 0 ? ((purity + wastage) / 100) * netWeightValue : 0;

        let totalAmount = 0;
        if (purchaseMrp > 0) {
          totalAmount = purchaseMrp;
        } else {
          totalAmount = pureWeight * purchaseRate + otherCharges + makingCharges;
        }

        return {
          ...product,
          // Preserve baseMetalTypes and productMetalType (from parent product)
          baseMetalTypes: product.baseMetalTypes,
          productMetalType: product.productMetalType,
          // Preserve the original netWeight value - allow empty string if cleared
          netWeight: netWeightStr !== '' ? netWeightStr : '',
          pureWeight: pureWeight.toFixed(3),
          totalPureWeight: pureWeight.toFixed(3),
          amount: totalAmount.toFixed(2),
        };
      }

      // For regular products (GOLD, SILVER, etc.)
      // Parse all input values, defaulting to 0 if empty or invalid
      const grossWeight = parseFloat(product.grossWeight) || 0;
      const enteredLessWeight = parseFloat(product.lessWeight) || 0; // User-entered less weight (total from popup)
      const purity = parseFloat(product.touch || product.purity) || 0;
      const wastage = parseFloat(product.wastagePercent || product.wastage) || 0;
      const purchaseRate = parseFloat(product.purchaseRate) || 0;
      const purchaseMrp = parseFloat(product.purchaseMrp) || 0;
      const otherCharges = parseFloat(product.otherCharges) || 0;
      const makingCharges = parseFloat(product.labourRate || product.makingCharges) || 0;

      // If this product has a platinum row, subtract platinum net weight from less weight for calculation
      // But keep the displayed lessWeight as entered by user
      let calculatedLessWeight = enteredLessWeight;
      if (hasPlatinum && product.id && !product.isPlatinumRow) {
        const platinumRow = allProducts.find(
          (p) => p.isPlatinumRow && p.parentProductId === product.id
        );
        if (platinumRow) {
          // Use manually entered netWeight from platinum row
          const platinumNetWeight =
            platinumRow.netWeight !== undefined &&
            platinumRow.netWeight !== null &&
            platinumRow.netWeight !== ''
              ? parseFloat(platinumRow.netWeight) || 0
              : 0;
          // Only adjust for calculation, not the displayed value
          calculatedLessWeight = Math.max(0, enteredLessWeight - platinumNetWeight);
        }
      }

      // Formula 1: Net Weight = Gross Weight - Less Weight
      const netWeight = grossWeight - calculatedLessWeight;

      // Formula 2: Pure Weight = (Purity + Wastage) / 100 * Net Weight
      const pureWeight = ((purity + wastage) / 100) * netWeight;

      // Formula 3: Purchase Total Amount calculation
      let totalAmount = 0;
      if (purchaseMrp > 0) {
        // If Purchase MRP is entered, total amount will be simply reflected from MRP
        totalAmount = purchaseMrp;
      } else {
        // Purchase Total Amount = Pure wt * Purchase Rate + Other charges + Making charges
        totalAmount = +pureWeight.toFixed(3) * purchaseRate + otherCharges + makingCharges;
      }

      return {
        ...product,
        // Preserve baseMetalTypes and productMetalType
        baseMetalTypes: product.baseMetalTypes,
        productMetalType: product.productMetalType,
        netWeight: netWeight.toFixed(3),
        pureWeight: pureWeight.toFixed(3),
        totalPureWeight: pureWeight.toFixed(3),
        amount: totalAmount.toFixed(2),
      };
    },
    [isOnlyDiamond, hasPlatinum]
  );

  const handleProductChange = useCallback(
    (index, field, value) => {
      const updatedProducts = products.map((product, i) => {
        if (i === index) {
          // Handle empty strings and '0' values for diamond fields in only diamond mode
          let normalizedValue = value;
          if (
            isOnlyDiamond &&
            (field === 'diamondWeight' ||
              field === 'diamondPurchaseRate' ||
              field === 'diamondSaleRate') &&
            (value === '0' || value === 0)
          ) {
            normalizedValue = '';
          }
          // For platinum rows netWeight, allow empty string
          const updatedValue =
            product.isPlatinumRow && field === 'netWeight' && value === '' ? '' : normalizedValue;
          const updated = { ...product, [field]: updatedValue };
          // For platinum rows, if editing netWeight, preserve the raw value (including empty)
          if (product.isPlatinumRow && field === 'netWeight') {
            // Don't calculate immediately - preserve user input including empty string
            return updated;
          }
          return calculateProduct(updated, products);
        }
        return product;
      });

      // When editing platinum netWeight, only recalculate the platinum row itself
      // Don't recalculate parent gold row to prevent unwanted changes
      const recalculatedProducts = updatedProducts.map((product, i) => {
        // If we're editing platinum netWeight
        if (products[index]?.isPlatinumRow && field === 'netWeight') {
          // Recalculate the platinum row itself (for pureWeight, amount, etc.) but preserve netWeight
          if (i === index) {
            return calculateProduct(product, updatedProducts);
          }
          // Don't recalculate other products (including parent gold row)
          return product;
        }
        // For all other changes, recalculate normally
        return calculateProduct(product, updatedProducts);
      });
      onProductsChange(recalculatedProducts);
    },
    [products, onProductsChange, calculateProduct, isOnlyDiamond]
  );

  const handleMultipleFieldsChange = useCallback(
    (index, updates) => {
      // Use functional update to ensure we have the latest products state
      onProductsChange((currentProducts) => {
        const updatedProducts = currentProducts.map((product, i) => {
          if (i === index) {
            const updated = { ...product, ...updates };
            return calculateProduct(updated, currentProducts);
          }
          return product;
        });
        // Recalculate all products to handle platinum net weight updates
        const recalculatedProducts = updatedProducts.map((product) =>
          calculateProduct(product, updatedProducts)
        );

        return recalculatedProducts;
      });
    },
    [onProductsChange, calculateProduct]
  );

  const handleDiamondDetailsChange = useCallback(
    (productIndex, diamondDetails) => {
      const updatedProducts = products.map((product, i) => {
        if (i === productIndex) {
          return { ...product, diamondDetails };
        }
        return product;
      });
      onProductsChange(updatedProducts);
    },
    [products, onProductsChange]
  );

  // Initialize diamond details with one empty row if not present
  useEffect(() => {
    if (hasDiamond && !isOnlyDiamond && products.length > 0) {
      const needsInitialization = products.some(
        (p) => !p.diamondDetails || p.diamondDetails.length === 0
      );
      if (needsInitialization) {
        const updatedProducts = products.map((p) => ({
          ...p,
          diamondDetails:
            p.diamondDetails && p.diamondDetails.length > 0
              ? p.diamondDetails
              : [
                  {
                    id: Date.now(),
                    diamond_colour_clarity: '',
                    diamond_size_range: '',
                    diamond_colour: '',
                    diamond_certificate: '',
                    diamond_piece: 0,
                    diamond_weight: '0',
                    certificate_number: '',
                    diamond_purchase_rate: '0',
                    diamond_sale_rate: '0',
                    purchase_amount: '0',
                    sale_amount: '0',
                  },
                ],
        }));
        onProductsChange(updatedProducts);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasDiamond, isOnlyDiamond, products.length]); // Only run when bill type or products count changes

  const toggleDiamondDetails = (index) => {
    setExpandedRows((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const openTagDetailsModal = (index) => {
    setCurrentTagDetailsIndex(index);
    setTagDetailsModalOpen(true);
  };

  const saveTagDetails = (tagDetails) => {
    if (currentTagDetailsIndex !== null) {
      handleProductChange(currentTagDetailsIndex, 'otherTagDetails', tagDetails);
    }
  };

  // Other Charges Modal handlers
  const openOtherChargesModal = (index) => {
    setCurrentChargeIndex(index);
    setOtherChargesModalOpen(true);
  };

  const saveOtherCharges = (data) => {
    if (currentChargeIndex !== null) {
      // Calculate total purchase charges from other charges details
      const otherChargesPurchaseCharges = data.otherChargesDetails
        ? data.otherChargesDetails.reduce(
            (sum, charge) => sum + (parseFloat(charge.purchase_charges) || 0),
            0
          )
        : 0;

      // Get current product to get less weight purchase charges
      const currentProduct = products[currentChargeIndex];
      const lessWeightPurchaseCharges = parseFloat(currentProduct.lessWeightPurchaseCharges || 0);

      // Sum both purchase charges
      const combinedOtherCharges = otherChargesPurchaseCharges + lessWeightPurchaseCharges;

      handleMultipleFieldsChange(currentChargeIndex, {
        otherChargesDetails: data.otherChargesDetails,
        otherCharges: String(combinedOtherCharges), // Store combined total
        otherChargesPurchaseCharges: String(otherChargesPurchaseCharges), // Store for reference
      });
    }
  };

  // Making Charges Modal handlers
  const openMakingChargesModal = (index) => {
    setCurrentChargeIndex(index);
    setMakingChargesModalOpen(true);
  };

  const saveMakingCharges = (data) => {
    if (currentChargeIndex !== null) {
      handleMultipleFieldsChange(currentChargeIndex, {
        makingChargesDetails: data.makingChargesDetails,
        labourRate: data.labourRate,
        makingCharges: data.makingCharges,
      });
    }
  };

  // Less Weight Modal handlers
  const openLessWeightModal = (index) => {
    setCurrentChargeIndex(index);
    setLessWeightModalOpen(true);
  };

  const saveLessWeight = (data) => {
    if (currentChargeIndex !== null) {
      // Use less weight after variation for calculation (if provided), otherwise use regular less weight
      const finalLessWeight = data.lessWeightAfterVariation || data.lessWeight || '0';

      // Calculate total purchase charges from less weight details
      const lessWeightPurchaseCharges = data.lessWeightDetails
        ? data.lessWeightDetails.reduce(
            (sum, detail) => sum + (parseFloat(detail.purchase_charges) || 0),
            0
          )
        : 0;

      // Get current product to get other charges purchase charges (only from other charges modal, not combined)
      const currentProduct = products[currentChargeIndex];
      const otherChargesPurchaseCharges = parseFloat(
        currentProduct.otherChargesPurchaseCharges || 0
      );

      // Sum both purchase charges
      const combinedOtherCharges = otherChargesPurchaseCharges + lessWeightPurchaseCharges;

      handleMultipleFieldsChange(currentChargeIndex, {
        lessWeightDetails: data.lessWeightDetails,
        lessWeight: finalLessWeight, // Use after variation total for net weight calculation
        lessWeightPurchaseCharges: String(lessWeightPurchaseCharges), // Store for reference
        otherCharges: String(combinedOtherCharges), // Update other charges with combined total
      });
    }
  };

  // Define columns based on bill type
  const getColumns = () => {
    // For ONLY DIAMOND purchases - completely different table
    if (isOnlyDiamond) {
      return [
        { id: 'srNo', label: 'Sr no', width: 50 },
        { id: 'description', label: 'Description', width: 150 },
        { id: 'diamondColourClarity', label: 'Diamond Colour/Clarity', width: 160 },
        { id: 'diamondSize', label: 'Shape/Size', width: 160 },
        { id: 'diamondPcs', label: 'Diamond PCs', width: 100 },
        { id: 'diamondWt', label: 'Diamond Wt.', width: 110 },
        { id: 'diamondPurchaseRate', label: 'Diamond Purchase Rate', width: 150 },
        { id: 'diamondSaleRate', label: 'Diamond Sale Rate', width: 150 },
        { id: 'diamondColour', label: 'Diamond Colour', width: 130 },
        { id: 'certificateType', label: 'Certificate Type', width: 140 },
        { id: 'certificateNumber', label: 'Certificate Number', width: 150 },
        { id: 'purchaseAmount', label: 'Purchase Amount', width: 130 },
        { id: 'saleAmount', label: 'Sale Amount', width: 130 },
        { id: 'action', label: 'Action', width: 80, align: 'center' },
      ];
    }

    // For SILVER - simplified structure
    if (isOnlySilver) {
      return [
        { id: 'srNo', label: 'Sr no', width: 50 },
        { id: 'description', label: 'Description', width: 150 },
        { id: 'subType', label: 'Sub Type*', width: 120 },
        { id: 'pcs', label: 'Quantity', width: 70 },
        { id: 'netWeight', label: 'Net Weight', width: 100 },
        { id: 'otherCharges', label: 'Other Charges', width: 110 },
        { id: 'makingCharges', label: 'Making Charges', width: 150 },
        { id: 'purchaseRate', label: 'Purchase Rate', width: 120 },
        { id: 'purchaseMrp', label: 'Purchase MRP', width: 120 },
        { id: 'saleMrp', label: 'Sale MRP', width: 120 },
        { id: 'amount', label: 'Total Amount', width: 140 },
        { id: 'otherDetails', label: 'Other Tag Details', width: 130 },
        { id: 'action', label: 'Action', width: 80, align: 'center' },
      ];
    }

    // For GOLD, GOLD+DIAMOND, GOLD+PLATINUM, GOLD+PLATINUM+DIAMOND
    const columns = [
      { id: 'srNo', label: 'Sr no', width: 50 },
      { id: 'description', label: 'Description', width: 150 },
      { id: 'subType', label: 'Sub Type*', width: 120 },
      { id: 'pcs', label: 'Quantity', width: 70 },
      { id: 'grossWeight', label: 'Gross Weight *', width: 110 },
      { id: 'lessWeight', label: 'Less Weight', width: 150 },
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
      { id: 'action', label: 'Action', width: 80, align: 'center' },
    ];

    return columns;
  };

  const columns = getColumns();

  // Calculate local totals for table footer (only used if totals prop not provided)
  const localTotals = useMemo(() => {
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

  // Use provided totals or fallback to local totals
  const displayTotals = totals || localTotals;

  const renderDiamondOnlyRow = (product, index) => (
    <React.Fragment key={product.id}>
      <TableRow hover>
        <TableCell align="center">{product.id}</TableCell>
        <TableCell>
          <TableInput
            value={product.description}
            onChange={(e) => handleProductChange(index, 'description', e.target.value)}
            placeholder="Description"
          />
        </TableCell>
        {/* Diamond Colour/Clarity */}
        <TableCell>
          <Select
            size="small"
            value={product.diamondColourClarity || ''}
            onChange={(e) => handleProductChange(index, 'diamondColourClarity', e.target.value)}
            displayEmpty
            fullWidth
            sx={{ minWidth: 150 }}
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
        {/* Shape/Size */}
        <TableCell>
          <Select
            size="small"
            value={product.diamondSizeRange || ''}
            onChange={(e) => handleProductChange(index, 'diamondSizeRange', e.target.value)}
            displayEmpty
            fullWidth
            sx={{ minWidth: 150 }}
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
          <TableInput
            type="number"
            value={product.diamondPiece || 0}
            onChange={(e) => handleProductChange(index, 'diamondPiece', e.target.value)}
            placeholder="0"
            inputProps={{ min: 0 }}
          />
        </TableCell>
        {/* Diamond Weight */}
        <TableCell>
          <TableInput
            type="number"
            value={
              product.diamondWeight === 0 || product.diamondWeight === '0'
                ? ''
                : product.diamondWeight || ''
            }
            onChange={(e) => handleProductChange(index, 'diamondWeight', e.target.value)}
            placeholder="0.000"
            inputProps={{ step: '0.001', min: 0 }}
          />
        </TableCell>
        {/* Diamond Purchase Rate */}
        <TableCell>
          <TableInput
            type="number"
            value={
              product.diamondPurchaseRate === 0 || product.diamondPurchaseRate === '0'
                ? ''
                : product.diamondPurchaseRate || ''
            }
            onChange={(e) => handleProductChange(index, 'diamondPurchaseRate', e.target.value)}
            placeholder="0.00"
            inputProps={{ step: '0.01', min: 0 }}
          />
        </TableCell>
        {/* Diamond Sale Rate */}
        <TableCell>
          <TableInput
            type="number"
            value={
              product.diamondSaleRate === 0 || product.diamondSaleRate === '0'
                ? ''
                : product.diamondSaleRate || ''
            }
            onChange={(e) => handleProductChange(index, 'diamondSaleRate', e.target.value)}
            placeholder="0.00"
            inputProps={{ step: '0.01', min: 0 }}
          />
        </TableCell>
        {/* Diamond Colour */}
        <TableCell>
          <Select
            size="small"
            value={product.diamondColour || ''}
            onChange={(e) => handleProductChange(index, 'diamondColour', e.target.value)}
            displayEmpty
            fullWidth
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
            value={product.diamondCertificate || ''}
            onChange={(e) => handleProductChange(index, 'diamondCertificate', e.target.value)}
            displayEmpty
            fullWidth
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
          <TableInput
            value={product.certificateNumber || ''}
            onChange={(e) => handleProductChange(index, 'certificateNumber', e.target.value)}
            placeholder="Cert. No"
          />
        </TableCell>
        {/* Purchase Amount (Calculated) */}
        <TableCell sx={{ bgcolor: 'success.lighter' }}>
          <TextField
            size="small"
            value={product.diamondPurchaseAmount || '0.00'}
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
            value={product.diamondSaleAmount || '0.00'}
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
        <TableCell align="center">
          <IconButton
            size="small"
            color="error"
            onClick={() => {
              const updatedProducts = products.filter((_, i) => i !== index);
              onProductsChange(updatedProducts);
            }}
            sx={{ minWidth: '32px', width: '32px', height: '32px' }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" width={18} />
          </IconButton>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );

  const renderProductRow = (product, index) => {
    // For ONLY DIAMOND type, use special rendering
    if (isOnlyDiamond) {
      return renderDiamondOnlyRow(product, index);
    }

    // Check if this is a platinum sub-row
    const isPlatinumRow = product.isPlatinumRow;

    return (
      <React.Fragment key={product.id}>
        <TableRow hover sx={{ bgcolor: isPlatinumRow ? 'secondary.lighter' : 'inherit' }}>
          {/* Sr no with collapse icon for diamond details */}
          <TableCell align="center" sx={{ color: 'text.secondary' }}>
            {isPlatinumRow ? (
              ''
            ) : hasDiamond && !isOnlyDiamond ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconButton size="small" onClick={() => toggleDiamondDetails(index)}>
                  <Iconify
                    icon={
                      expandedRows[index]
                        ? 'eva:arrow-ios-downward-fill'
                        : 'eva:arrow-ios-forward-fill'
                    }
                    width={16}
                  />
                </IconButton>
                <Typography variant="body2">{product.id}</Typography>
              </Box>
            ) : (
              product.id
            )}
          </TableCell>

          {/* Description */}
          <TableCell>
            {isPlatinumRow ? (
              <Typography variant="caption" color="text.secondary">
                NA
              </Typography>
            ) : (
              <TableInput
                value={product.description}
                onChange={(e) => handleProductChange(index, 'description', e.target.value)}
                placeholder="Product Name"
              />
            )}
          </TableCell>

          {/* Sub Type */}
          <TableCell>
            {isPlatinumRow ? (
              <Typography variant="body2" fontWeight={600} color="secondary.dark">
                PLATINUM
              </Typography>
            ) : (
              <Select
                size="small"
                value={product.subTypeId ? Number(product.subTypeId) : ''}
                onChange={async (e) => {
                  const selectedValue = e.target.value === '' ? null : Number(e.target.value);
                  const selectedProduct = subTypeProducts.find(
                    (p) => Number(p.id) === selectedValue
                  );
                  const currentIndex = index; // Capture index in closure
                  const selectedId = selectedProduct?.id;
                  const selectedName = selectedProduct?.product_name || selectedProduct?.name;

                  if (selectedProduct) {
                    // First update the subType immediately
                    handleMultipleFieldsChange(currentIndex, {
                      subTypeId: selectedId,
                      subType: selectedName,
                    });

                    // Call API to get base metal types for the selected product
                    if (getProductBaseMetalTypes && selectedId) {
                      try {
                        const result = await getProductBaseMetalTypes(selectedId);

                        // Store base metal types in the product
                        // Handle different response structures
                        const baseMetalTypes = result.success
                          ? result.base_metal_types ||
                            result.data?.base_metal_types ||
                            result.data ||
                            []
                          : [];
                        const productMetalType = result.success
                          ? result.metal_type || result.data?.metal_type || null
                          : null;

                        // Update with API response - preserve subTypeId and subType
                        handleMultipleFieldsChange(currentIndex, {
                          baseMetalTypes,
                          productMetalType,
                          // Explicitly preserve subTypeId and subType in case they got cleared
                          subTypeId: selectedId,
                          subType: selectedName,
                        });
                      } catch (error) {
                        console.error('Error fetching product base metal types:', error);
                      }
                    } else {
                      console.warn(
                        'getProductBaseMetalTypes not available or selectedId missing:',
                        {
                          getProductBaseMetalTypes: !!getProductBaseMetalTypes,
                          selectedId,
                        }
                      );
                    }
                  } else {
                    handleMultipleFieldsChange(currentIndex, {
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
            )}
          </TableCell>

          {/* Quantity */}
          <TableCell>
            {isPlatinumRow ? (
              <Typography variant="caption" color="text.secondary">
                NA
              </Typography>
            ) : (
              <TableInput
                type="number"
                value={isTagPurchase ? 1 : product.pcs}
                onChange={(e) =>
                  handleProductChange(index, 'pcs', parseInt(e.target.value, 10) || 1)
                }
                disabled={isTagPurchase}
                inputProps={{ min: 1 }}
              />
            )}
          </TableCell>

          {/* Gross Weight - Not for SILVER */}
          {!isOnlySilver && (
            <TableCell>
              {isPlatinumRow ? (
                <Typography variant="caption" color="text.secondary">
                  NA
                </Typography>
              ) : (
                <TableInput
                  type="number"
                  value={product.grossWeight}
                  onChange={(e) => handleProductChange(index, 'grossWeight', e.target.value)}
                  placeholder="0.000"
                  inputProps={{ step: '0.001', min: 0 }}
                />
              )}
            </TableCell>
          )}

          {/* Less Weight - Not for SILVER */}
          {!isOnlySilver && (
            <TableCell>
              {isPlatinumRow ? (
                <Typography variant="caption" color="text.secondary">
                  NA
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                  <TableInput
                    type="number"
                    value={product.lessWeight}
                    onChange={(e) => handleProductChange(index, 'lessWeight', e.target.value)}
                    placeholder="0.000"
                    inputProps={{ step: '0.001', min: 0 }}
                    sx={{ width: '150px', minWidth: '150px' }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => openLessWeightModal(index)}
                    color="primary"
                    sx={{ minWidth: '32px', width: '32px', height: '32px' }}
                  >
                    <Iconify icon="solar:settings-bold" width={18} />
                  </IconButton>
                </Box>
              )}
            </TableCell>
          )}

          {/* Net Weight */}
          <TableCell sx={{ bgcolor: isPlatinumRow ? 'inherit' : 'grey.50' }}>
            {isPlatinumRow ? (
              <TableInput
                type="number"
                value={product.netWeight ?? ''}
                onChange={(e) => handleProductChange(index, 'netWeight', e.target.value)}
                placeholder="0.000"
                inputProps={{ step: '0.001', min: 0 }}
                sx={{
                  width: '100px',
                  '& .MuiInputBase-input': {
                    textAlign: 'right',
                  },
                }}
              />
            ) : (
              <TextField
                size="small"
                value={product.netWeight || '0.000'}
                disabled
                sx={{
                  width: '100px',
                  '& .MuiInputBase-input': { textAlign: 'right', fontWeight: 600 },
                }}
              />
            )}
          </TableCell>

          {/* Purity/Touch - Not for SILVER */}
          {!isOnlySilver && (
            <TableCell>
              <TableInput
                type="number"
                value={product.touch}
                onChange={(e) => handleProductChange(index, 'touch', e.target.value)}
                placeholder="0"
                inputProps={{ step: '0.01', min: 0, max: 100 }}
              />
            </TableCell>
          )}

          {/* Wastage % - Not for SILVER */}
          {!isOnlySilver && (
            <TableCell>
              <TableInput
                type="number"
                value={product.wastagePercent}
                onChange={(e) => handleProductChange(index, 'wastagePercent', e.target.value)}
                placeholder="0"
                inputProps={{ step: '0.01', min: 0, max: 100 }}
              />
            </TableCell>
          )}

          {/* Pure Weight - Not for SILVER */}
          {!isOnlySilver && (
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
          )}

          {/* Other Charges */}
          <TableCell>
            {isPlatinumRow ? (
              <Typography variant="caption" color="text.secondary">
                NA
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                <TableInput
                  type="number"
                  value={product.otherCharges}
                  onChange={(e) => handleProductChange(index, 'otherCharges', e.target.value)}
                  placeholder="0"
                  inputProps={{ step: '0.01', min: 0 }}
                  disabled
                  sx={{ flex: 1, bgcolor: 'grey.50' }}
                />
                <IconButton
                  size="small"
                  onClick={() => openOtherChargesModal(index)}
                  color="primary"
                  sx={{ minWidth: '32px', width: '32px', height: '32px' }}
                >
                  <Iconify icon="solar:settings-bold" width={18} />
                </IconButton>
              </Box>
            )}
          </TableCell>

          {/* Making Charges */}
          <TableCell>
            {isPlatinumRow ? (
              <Typography variant="caption" color="text.secondary">
                NA
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                <TableInput
                  type="number"
                  value={product.labourRate || product.makingCharges}
                  onChange={(e) => handleProductChange(index, 'labourRate', e.target.value)}
                  placeholder="0"
                  inputProps={{ step: '0.01', min: 0 }}
                  sx={{ flex: 1 }}
                />
                <IconButton
                  size="small"
                  onClick={() => openMakingChargesModal(index)}
                  color="primary"
                  sx={{ minWidth: '32px', width: '32px', height: '32px' }}
                >
                  <Iconify icon="solar:settings-bold" width={18} />
                </IconButton>
              </Box>
            )}
          </TableCell>

          {/* Purchase Rate */}
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
            {isPlatinumRow ? (
              <TableInput
                type="number"
                value={product.purchaseMrp || 0}
                onChange={(e) => handleProductChange(index, 'purchaseMrp', e.target.value)}
                placeholder="0"
                inputProps={{ step: '0.01', min: 0 }}
              />
            ) : (
              <TableInput
                type="number"
                value={product.purchaseMrp}
                onChange={(e) => handleProductChange(index, 'purchaseMrp', e.target.value)}
                placeholder="0"
                inputProps={{ step: '0.01', min: 0 }}
              />
            )}
          </TableCell>

          {/* Sale MRP - Not for SILVER */}
          {!isOnlySilver && (
            <TableCell>
              {isPlatinumRow ? (
                <Typography variant="caption" color="text.secondary">
                  NA
                </Typography>
              ) : (
                <TableInput
                  type="number"
                  value={product.saleMrp}
                  onChange={(e) => handleProductChange(index, 'saleMrp', e.target.value)}
                  placeholder="0"
                  disabled={product.purchaseMrp > 0}
                  inputProps={{ step: '0.01', min: 0 }}
                />
              )}
            </TableCell>
          )}

          {/* Total Amount */}
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
            {isPlatinumRow ? (
              <Typography variant="caption" color="text.secondary">
                NA
              </Typography>
            ) : (
              <Button
                size="small"
                variant="outlined"
                color="info"
                onClick={() => openTagDetailsModal(index)}
                fullWidth
                sx={{ minWidth: '100px' }}
              >
                Details
              </Button>
            )}
          </TableCell>

          {/* Delete Action */}
          <TableCell align="center">
            {isPlatinumRow ? (
              <Typography variant="caption" color="text.secondary">
                NA
              </Typography>
            ) : (
              <IconButton
                size="small"
                color="error"
                onClick={() => {
                  // debugger;
                  // Remove both the product and its platinum row if exists
                  const updatedProducts = products.filter((_, i) => {
                    if (i === index) return false; // Remove the product
                    if (products[index]?.isPlatinumRow === false) {
                      // If removing a regular product, also remove its platinum row
                      const platinumIndex = products.findIndex(
                        (p) => p.isPlatinumRow && p.parentProductId === products[index].id
                      );
                      if (platinumIndex === i) return false;
                    }
                    return true;
                  });
                  onProductsChange(updatedProducts);
                }}
                sx={{ minWidth: '32px', width: '32px', height: '32px' }}
              >
                <Iconify icon="eva:trash-2-fill" width={18} />
              </IconButton>
            )}
          </TableCell>
        </TableRow>

        {/* Expandable Diamond Details Row for GOLD+DIAMOND types */}
        {hasDiamond && !isOnlyDiamond && !isPlatinumRow && (
          <TableRow>
            <TableCell colSpan={columns.length} sx={{ p: 0, border: 0 }}>
              <Collapse in={expandedRows[index]} timeout="auto">
                <DiamondDetailsTable
                  diamondDetails={product.diamondDetails || []}
                  onDiamondDetailsChange={(details) => handleDiamondDetailsChange(index, details)}
                  apiData={apiData}
                />
              </Collapse>
            </TableCell>
          </TableRow>
        )}
      </React.Fragment>
    );
  };

  return (
    <>
      <Table sx={{ minWidth: isOnlyDiamond ? 1000 : 2200 }} size="small">
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
            <React.Fragment key={product.id}>{renderProductRow(product, index)}</React.Fragment>
          ))}
        </TableBody>

        {/* Totals Footer - Metal-type-wise totals matching requirements */}
        {/* {displayTotals} */}
        <TableFooter>
          {/* Total Gold Details Row */}
          {hasGold && !isOnlyDiamond && !isOnlySilver && (
            <TableRow sx={{ bgcolor: 'warning.lighter' }}>
              <TableCell colSpan={2} sx={{ fontWeight: 700 }}>
                Total Gold Details
              </TableCell>
              <TableCell />
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                {displayTotals?.totalGoldPcs || 0}
              </TableCell>
              {!isOnlySilver && (
                <>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {(displayTotals?.totalGrossWeight || 0).toFixed(3)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {(displayTotals?.totalLessWeight || 0).toFixed(3)}
                  </TableCell>
                </>
              )}
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                {(displayTotals?.totalNetWeight || 0).toFixed(3)}
              </TableCell>
              {!isOnlySilver && (
                <>
                  <TableCell />
                  <TableCell />
                  <TableCell align="right" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {(displayTotals?.totalPureWeight || 0).toFixed(3)}
                  </TableCell>
                </>
              )}
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                {(displayTotals?.totalOtherCharges || 0).toFixed(2)}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                {(displayTotals?.totalMakingCharges || 0).toFixed(2)}
              </TableCell>
              <TableCell />
              <TableCell />
              {!isOnlySilver && <TableCell />}
              <TableCell align="right" sx={{ fontWeight: 700, color: 'success.dark' }}>
                {(displayTotals?.totalGoldAmount || 0).toFixed(2)}
              </TableCell>
              <TableCell />
            </TableRow>
          )}

          {/* Total Platinum Details Row */}
          {hasPlatinum && displayTotals?.totalPlatNetWeight > 0 && !isOnlySilver && (
            <TableRow sx={{ bgcolor: 'secondary.lighter' }}>
              <TableCell colSpan={2} sx={{ fontWeight: 700 }}>
                Total Platinum Details
              </TableCell>
              <TableCell />
              <TableCell />
              {!isOnlySilver && (
                <>
                  <TableCell />
                  <TableCell />
                </>
              )}
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                {(displayTotals?.totalPlatNetWeight || 0).toFixed(3)}
              </TableCell>
              {!isOnlySilver && (
                <>
                  <TableCell />
                  <TableCell />
                  <TableCell align="right" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                    {(displayTotals?.totalPlatNetWeight || 0).toFixed(3)}
                  </TableCell>
                </>
              )}
              <TableCell />
              <TableCell />
              <TableCell />
              <TableCell />
              {!isOnlySilver && <TableCell />}
              <TableCell align="right" sx={{ fontWeight: 700, color: 'secondary.dark' }}>
                {(displayTotals?.totalPlatAmount || 0).toFixed(2)}
              </TableCell>
              <TableCell />
            </TableRow>
          )}

          {/* Total Diamond Details Row - Show for GOLD+DIAMOND, GOLD+PLATINUM+DIAMOND categories */}
          {hasDiamond && !isOnlySilver && !isOnlyGold && (
            <TableRow sx={{ bgcolor: 'info.lighter' }}>
              <TableCell colSpan={2} sx={{ fontWeight: 700 }}>
                Total Diamond Details
              </TableCell>
              <TableCell />
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                {displayTotals?.totalDiamondPcs || 0} (Dia Pcs)
              </TableCell>
              {!isOnlySilver && (
                <>
                  <TableCell />
                  <TableCell />
                </>
              )}
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                {(displayTotals?.totalDiamondWeight || 0).toFixed(3)}
              </TableCell>
              {!isOnlySilver && (
                <>
                  <TableCell />
                  <TableCell />
                  <TableCell />
                </>
              )}
              <TableCell />
              <TableCell />
              {!isOnlySilver && <TableCell />}
              <TableCell align="right" sx={{ fontWeight: 700, color: 'info.dark' }}>
                {(displayTotals?.totalDiamondAmount || 0).toFixed(2)}
              </TableCell>
            </TableRow>
          )}

          {/* Total Silver Details Row */}
          {isOnlySilver && (
            <TableRow sx={{ bgcolor: 'grey.100' }}>
              <TableCell colSpan={2} sx={{ fontWeight: 700 }}>
                Total Silver Details
              </TableCell>
              <TableCell />
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                {displayTotals?.totalGoldPcs || 0}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                {(displayTotals?.totalNetWeight || 0).toFixed(3)}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                {(displayTotals?.totalOtherCharges || 0).toFixed(2)}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                {(displayTotals?.totalMakingCharges || 0).toFixed(2)}
              </TableCell>
              <TableCell />
              <TableCell />
              <TableCell align="right" sx={{ fontWeight: 700, color: 'success.dark' }}>
                {(displayTotals?.totalGoldAmount || 0).toFixed(2)}
              </TableCell>
              <TableCell />
            </TableRow>
          )}

          {/* Bill Total Balance Row */}
          <TableRow
            sx={{ bgcolor: 'success.lighter', borderTop: '2px solid', borderColor: 'success.main' }}
          >
            <TableCell colSpan={columns.length - 1} sx={{ fontWeight: 700 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {hasGold && (
                  <Typography variant="body2" fontWeight={600} color="primary.main">
                    Gold Pure Weight = {(displayTotals?.totalPureWeight || 0).toFixed(3)}
                  </Typography>
                )}
                {hasPlatinum && (
                  <Typography variant="body2" fontWeight={600} color="secondary.main">
                    Platinum Pure Weight = {(displayTotals?.totalPlatNetWeight || 0).toFixed(3)}
                  </Typography>
                )}
              </Box>
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 700 }}>
              <Box
                sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}
              >
                <Typography variant="h6" fontWeight={700} color="success.dark">
                  {(
                    (displayTotals?.totalGoldAmount || 0) +
                    (displayTotals?.totalPlatAmount || 0) +
                    (displayTotals?.totalDiamondAmount || 0)
                  ).toFixed(2)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {hasGold && `${(displayTotals?.totalGoldAmount || 0).toFixed(2)} (Gold)`}
                  {hasGold && hasPlatinum && ` + `}
                  {hasPlatinum && `${(displayTotals?.totalPlatAmount || 0).toFixed(2)} (Platinum)`}
                  {hasDiamond && displayTotals?.totalDiamondAmount > 0 && ` + `}
                  {hasDiamond &&
                    displayTotals?.totalDiamondAmount > 0 &&
                    `${(displayTotals?.totalDiamondAmount || 0).toFixed(2)} (Diamond)`}
                </Typography>
              </Box>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>

      {/* Other Tag Details Modal */}
      {currentTagDetailsIndex !== null && (
        <OtherTagDetailsModal
          open={tagDetailsModalOpen}
          onClose={() => {
            setTagDetailsModalOpen(false);
            setCurrentTagDetailsIndex(null);
          }}
          tagDetails={products[currentTagDetailsIndex]?.otherTagDetails || {}}
          onSave={saveTagDetails}
        />
      )}

      {/* Other Charges Modal */}
      {currentChargeIndex !== null && (
        <OtherChargesModal
          open={otherChargesModalOpen}
          onClose={() => {
            setOtherChargesModalOpen(false);
            setCurrentChargeIndex(null);
          }}
          otherChargesDetails={products[currentChargeIndex]?.otherChargesDetails || []}
          onSave={saveOtherCharges}
        />
      )}

      {/* Making Charges Modal */}
      {currentChargeIndex !== null && (
        <MakingChargesModal
          open={makingChargesModalOpen}
          onClose={() => {
            setMakingChargesModalOpen(false);
            setCurrentChargeIndex(null);
          }}
          makingChargesDetails={products[currentChargeIndex]?.makingChargesDetails || []}
          onSave={saveMakingCharges}
          apiData={apiData}
          productData={products[currentChargeIndex] || {}}
        />
      )}

      {/* Less Weight Modal */}
      {currentChargeIndex !== null && (
        <LessWeightModal
          open={lessWeightModalOpen}
          onClose={() => {
            setLessWeightModalOpen(false);
            setCurrentChargeIndex(null);
          }}
          lessWeightDetails={products[currentChargeIndex]?.lessWeightDetails || []}
          onSave={saveLessWeight}
          apiData={apiData}
          productData={products[currentChargeIndex] || {}}
        />
      )}
    </>
  );
}
