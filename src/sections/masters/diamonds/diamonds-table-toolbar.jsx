import { useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function DiamondsTableToolbar({ filters, onResetPage }) {
  const { state: currentFilters, setState: updateFilters } = filters;

  const handleFilterName = useCallback(
    (event) => {
      onResetPage();
      updateFilters({ name: event.target.value });
    },
    [onResetPage, updateFilters]
  );

  const handleFilterStatus = useCallback(
    (event) => {
      onResetPage();
      updateFilters({ status: event.target.value });
    },
    [onResetPage, updateFilters]
  );

  return (
    <Stack
      spacing={2}
      alignItems={{ xs: 'flex-end', md: 'center' }}
      direction={{ xs: 'column', md: 'row' }}
      sx={{ p: 2.5 }}
    >
      <Box
        sx={{
          width: { xs: 1, md: 240 },
        }}
      >
        <TextField
          fullWidth
          value={currentFilters.name}
          onChange={handleFilterName}
          placeholder="Search diamonds..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Box
        sx={{
          width: { xs: 1, md: 180 },
        }}
      >
        <TextField
          fullWidth
          select
          label="Status"
          value={currentFilters.status}
          onChange={handleFilterStatus}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
        </TextField>
      </Box>
    </Stack>
  );
}
