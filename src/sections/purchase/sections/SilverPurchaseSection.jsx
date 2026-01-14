import React, { useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TextField,
  Button,
  IconButton,
} from '@mui/material';
// import AddIcon from '@mui/icons-material/Add';
// import DeleteIcon from '@mui/icons-material/Delete';

export default function SilverPurchaseSection() {
  const [rows, setRows] = useState([
    { id: 1, description: 'SILVER CHAIN', grossWt: 50, rate: 1200 },
  ]);

  const handleChange = (id, field, val) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: val } : r)));
  };

  const handleAdd = () =>
    setRows((prev) => [...prev, { id: prev.length + 1, description: '', grossWt: 0, rate: 0 }]);

  const handleDelete = (id) => setRows((prev) => prev.filter((r) => r.id !== id));

  const total = rows.reduce((sum, r) => sum + r.grossWt * r.rate, 0);

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Silver Purchase Details
      </Typography>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Sr No</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Gross Wt</TableCell>
            <TableCell>Rate</TableCell>
            <TableCell>Total</TableCell>
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
                  value={r.rate}
                  onChange={(e) => handleChange(r.id, 'rate', e.target.value)}
                />
              </TableCell>
              <TableCell>{(r.grossWt * r.rate).toLocaleString()}</TableCell>
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
        Add Silver Item
      </Button>

      <Typography sx={{ mt: 2 }}>
        <b>Total Silver Purchase:</b> {total.toLocaleString()}
      </Typography>
    </Box>
  );
}
