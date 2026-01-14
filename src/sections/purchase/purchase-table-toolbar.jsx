import { useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function PurchaseTableToolbar({ filters, onResetPage, numSelected }) {
  const handleFilterSearch = useCallback(
    (event) => {
      onResetPage();
      filters.setState({ search: event.target.value });
    },
    [filters, onResetPage]
  );

  const handleFilterTagType = useCallback(
    (event) => {
      onResetPage();
      filters.setState({ tag_selected: event.target.value });
    },
    [filters, onResetPage]
  );

  const handleFilterBillType = useCallback(
    (event) => {
      onResetPage();
      filters.setState({ bill_metal_type: event.target.value });
    },
    [filters, onResetPage]
  );

  return (
    <Stack
      spacing={2}
      alignItems={{ xs: 'flex-end', md: 'center' }}
      direction={{ xs: 'column', md: 'row' }}
      sx={{ p: 2.5, pr: { xs: 2.5, md: 1 } }}
    >
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} flexGrow={1} sx={{ width: 1 }}>
        <TextField
          fullWidth
          value={filters.state.search}
          onChange={handleFilterSearch}
          placeholder="Search by purchase number, bill number, or dealer name..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />

        <FormControl sx={{ minWidth: 140 }}>
          <InputLabel>Tag Type</InputLabel>
          <Select
            value={filters.state.tag_selected}
            onChange={handleFilterTagType}
            label="Tag Type"
          >
            <MenuItem value="all">All Types</MenuItem>
            <MenuItem value="TAG">TAG</MenuItem>
            <MenuItem value="NON_TAG">NON-TAG</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>Bill Type</InputLabel>
          <Select
            value={filters.state.bill_metal_type}
            onChange={handleFilterBillType}
            label="Bill Type"
          >
            <MenuItem value="all">All Bill Types</MenuItem>
            {/* Options will be populated from API metal types */}
          </Select>
        </FormControl>
      </Stack>

      {numSelected > 0 && (
        <Button
          color="primary"
          startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
          sx={{ flexShrink: 0 }}
        >
          Delete ({numSelected})
        </Button>
      )}
    </Stack>
  );
}
