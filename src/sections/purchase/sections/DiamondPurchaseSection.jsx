import React, { useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  IconButton,
  Button,
} from '@mui/material';
// import AddIcon from '@mui/icons-material/Add';
// import DeleteIcon from '@mui/icons-material/Delete';

export default function DiamondPurchaseSection() {
  const [rows, setRows] = useState([
    {
      id: 1,
      shape: 'ROUND',
      clarity: 'VVS E-F',
      pcs: 2,
      weight: 0.25,
      rate: 65000,
      saleRate: 100000,
      certType: 'IGI',
      certNumber: '123456987',
    },
  ]);

  const handleChange = (id, field, value) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const handleAdd = () => {
    setRows((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        shape: '',
        clarity: '',
        pcs: 0,
        weight: 0,
        rate: 0,
        saleRate: 0,
        certType: '',
        certNumber: '',
      },
    ]);
  };

  const handleDelete = (id) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const totals = rows.reduce(
    (sum, r) => ({
      purchase: sum.purchase + r.weight * r.rate,
      sale: sum.sale + r.weight * r.saleRate,
    }),
    { purchase: 0, sale: 0 }
  );

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Diamond Purchase Details
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Sr No</TableCell>
            <TableCell>Shape</TableCell>
            <TableCell>Clarity</TableCell>
            <TableCell>Pcs</TableCell>
            <TableCell>Weight (ct)</TableCell>
            <TableCell>Rate</TableCell>
            <TableCell>Sale Rate</TableCell>
            <TableCell>Certificate Type</TableCell>
            <TableCell>Certificate Number</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell>{r.id}</TableCell>
              <TableCell>
                <TextField
                  size="small"
                  value={r.shape}
                  onChange={(e) => handleChange(r.id, 'shape', e.target.value)}
                />
              </TableCell>
              <TableCell>
                <TextField
                  size="small"
                  value={r.clarity}
                  onChange={(e) => handleChange(r.id, 'clarity', e.target.value)}
                />
              </TableCell>
              <TableCell>
                <TextField
                  size="small"
                  type="number"
                  value={r.pcs}
                  onChange={(e) => handleChange(r.id, 'pcs', e.target.value)}
                />
              </TableCell>
              <TableCell>
                <TextField
                  size="small"
                  type="number"
                  value={r.weight}
                  onChange={(e) => handleChange(r.id, 'weight', e.target.value)}
                />
              </TableCell>
              <TableCell>
                <TextField
                  size="small"
                  type="number"
                  value={r.rate}
                  onChange={(e) => handleChange(r.id, 'rate', e.target.value)}
                />
              </TableCell>
              <TableCell>
                <TextField
                  size="small"
                  type="number"
                  value={r.saleRate}
                  onChange={(e) => handleChange(r.id, 'saleRate', e.target.value)}
                />
              </TableCell>
              <TableCell>
                <TextField
                  size="small"
                  value={r.certType}
                  onChange={(e) => handleChange(r.id, 'certType', e.target.value)}
                />
              </TableCell>
              <TableCell>
                <TextField
                  size="small"
                  value={r.certNumber}
                  onChange={(e) => handleChange(r.id, 'certNumber', e.target.value)}
                />
              </TableCell>
              <TableCell>
                <IconButton onClick={() => handleDelete(r.id)}>
                  {/* <DeleteIcon color="error" /> */}
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Button onClick={handleAdd} sx={{ mt: 1 }}>
        Add Diamond
      </Button>

      <Typography sx={{ mt: 2 }}>
        <b>Purchase Total:</b> {totals.purchase.toLocaleString()} &nbsp; | &nbsp;
        <b>Sale Total:</b> {totals.sale.toLocaleString()}
      </Typography>
    </Box>
  );
}
