import React, { useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  IconButton,
  Button,
} from '@mui/material';
// import DeleteIcon from "@mui/icons-material/Delete";
// import AddIcon from "@mui/icons-material/Add";

export default function PlatinumPurchaseSection() {
  const [rows, setRows] = useState([
    {
      id: 1,
      description: 'PLATINUM RING',
      grossWt: 5,
      lessWt: 0,
      netWt: 5,
      purity: 95.2,
      wastage: 10,
      rate: 6000,
      other: 50,
      making: 100,
    },
  ]);

  const handleChange = (id, field, val) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: parseFloat(val) || 0 } : r)));
  };

  const handleAdd = () => {
    setRows((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        description: '',
        grossWt: 0,
        lessWt: 0,
        netWt: 0,
        purity: 0,
        wastage: 0,
        rate: 0,
        other: 0,
        making: 0,
      },
    ]);
  };

  const handleDelete = (id) => setRows((prev) => prev.filter((r) => r.id !== id));

  const total = rows.reduce((sum, r) => {
    const pureWt = (r.netWt * (r.purity + r.wastage)) / 100;
    return sum + pureWt * r.rate + r.making + r.other;
  }, 0);

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Platinum Purchase Details
      </Typography>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Sr No</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Gross Wt</TableCell>
            <TableCell>Less Wt</TableCell>
            <TableCell>Net Wt</TableCell>
            <TableCell>Purity</TableCell>
            <TableCell>Wastage</TableCell>
            <TableCell>Rate</TableCell>
            <TableCell>Other</TableCell>
            <TableCell>Making</TableCell>
            <TableCell>Total</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r) => {
            const pureWt = (r.netWt * (r.purity + r.wastage)) / 100;
            const totalRow = pureWt * r.rate + r.making + r.other;
            return (
              <TableRow key={r.id}>
                <TableCell>{r.id}</TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    value={r.description}
                    onChange={(e) => handleChange(r.id, 'description', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    type="number"
                    value={r.grossWt}
                    onChange={(e) => handleChange(r.id, 'grossWt', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    type="number"
                    value={r.lessWt}
                    onChange={(e) => handleChange(r.id, 'lessWt', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    type="number"
                    value={r.netWt}
                    onChange={(e) => handleChange(r.id, 'netWt', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    type="number"
                    value={r.purity}
                    onChange={(e) => handleChange(r.id, 'purity', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    type="number"
                    value={r.wastage}
                    onChange={(e) => handleChange(r.id, 'wastage', e.target.value)}
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
                    value={r.other}
                    onChange={(e) => handleChange(r.id, 'other', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    type="number"
                    value={r.making}
                    onChange={(e) => handleChange(r.id, 'making', e.target.value)}
                  />
                </TableCell>
                <TableCell>{totalRow.toLocaleString()}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleDelete(r.id)}>
                    {/* <DeleteIcon color="error" /> */}
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Button onClick={handleAdd} sx={{ mt: 1 }}>
        Add Platinum Item
      </Button>

      <Typography sx={{ mt: 2 }}>
        <b>Total Platinum Purchase:</b> {total.toLocaleString()}
      </Typography>
    </Box>
  );
}
