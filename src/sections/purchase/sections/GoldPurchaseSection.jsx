import React, { useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  Button,
} from '@mui/material';
// import DeleteIcon from '@mui/icons-material/Delete';
// import AddIcon from '@mui/icons-material/Add';

export default function GoldPurchaseSection() {
  const [rows, setRows] = useState([
    {
      id: 1,
      description: 'GOLD CHAIN 22K',
      quantity: 1,
      grossWt: 10,
      purity: 92,
      wastage: 8,
      making: 1000,
      rate: 7000,
    },
  ]);

  const handleAddRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        description: '',
        quantity: 1,
        grossWt: 0,
        purity: 0,
        wastage: 0,
        making: 0,
        rate: 0,
      },
    ]);
  };

  const handleDeleteRow = (id) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const totalAmount = rows.reduce((sum, r) => {
    const pureWeight = (r.grossWt * (r.purity + r.wastage)) / 100;
    return sum + pureWeight * r.rate + r.making;
  }, 0);

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Gold Purchase Details
      </Typography>

      <Table size="small" sx={{ mb: 3 }}>
        <TableHead>
          <TableRow>
            <TableCell>Sr No</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Quantity</TableCell>
            <TableCell>Gross Wt</TableCell>
            <TableCell>Purity (%)</TableCell>
            <TableCell>Wastage (%)</TableCell>
            <TableCell>Making Charges</TableCell>
            <TableCell>Rate</TableCell>
            <TableCell>Total</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r) => {
            const pureWeight = (r.grossWt * (r.purity + r.wastage)) / 100;
            const total = pureWeight * r.rate + r.making;
            return (
              <TableRow key={r.id}>
                <TableCell>{r.id}</TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    value={r.description}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((row) =>
                          row.id === r.id ? { ...row, description: e.target.value } : row
                        )
                      )
                    }
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    type="number"
                    value={r.quantity}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((row) =>
                          row.id === r.id
                            ? { ...row, quantity: parseFloat(e.target.value) || 0 }
                            : row
                        )
                      )
                    }
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    type="number"
                    value={r.grossWt}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((row) =>
                          row.id === r.id
                            ? { ...row, grossWt: parseFloat(e.target.value) || 0 }
                            : row
                        )
                      )
                    }
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    type="number"
                    value={r.purity}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((row) =>
                          row.id === r.id
                            ? { ...row, purity: parseFloat(e.target.value) || 0 }
                            : row
                        )
                      )
                    }
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    type="number"
                    value={r.wastage}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((row) =>
                          row.id === r.id
                            ? { ...row, wastage: parseFloat(e.target.value) || 0 }
                            : row
                        )
                      )
                    }
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    type="number"
                    value={r.making}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((row) =>
                          row.id === r.id
                            ? { ...row, making: parseFloat(e.target.value) || 0 }
                            : row
                        )
                      )
                    }
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    type="number"
                    value={r.rate}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((row) =>
                          row.id === r.id ? { ...row, rate: parseFloat(e.target.value) || 0 } : row
                        )
                      )
                    }
                  />
                </TableCell>
                <TableCell>{total.toLocaleString()}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleDeleteRow(r.id)}>
                    {/* <DeleteIcon color="error" /> */}
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Button variant="outlined" onClick={handleAddRow} sx={{ mb: 2 }}>
        Add Item
      </Button>

      <Typography variant="body1">
        <b>Total Purchase Value:</b> {totalAmount.toLocaleString()}
      </Typography>
    </Box>
  );
}
