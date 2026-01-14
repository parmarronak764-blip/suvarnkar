import { useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

import { Iconify } from 'src/components/iconify';

import { MOCK_CATEGORIES, MOCK_DEALERS } from 'src/_mock';

// ----------------------------------------------------------------------

export function PurchaseTableFiltersResult({ filters, totalResults, onResetPage, sx, ...other }) {
  const handleRemoveKeyword = useCallback(() => {
    onResetPage();
    filters.setState({ name: '' });
  }, [filters, onResetPage]);

  const handleRemoveStatus = useCallback(() => {
    onResetPage();
    filters.setState({ status: 'all' });
  }, [filters, onResetPage]);

  const handleRemoveCategory = useCallback(() => {
    onResetPage();
    filters.setState({ category: 'all' });
  }, [filters, onResetPage]);

  const handleRemoveDealer = useCallback(() => {
    onResetPage();
    filters.setState({ dealerId: 'all' });
  }, [filters, onResetPage]);

  const handleReset = useCallback(() => {
    onResetPage();
    filters.onResetState();
  }, [filters, onResetPage]);

  const getCategoryLabel = (value) => {
    const category = MOCK_CATEGORIES.find((cat) => cat.value === value);
    return category ? category.label : value;
  };

  const getDealerLabel = (value) => {
    const dealer = MOCK_DEALERS.find((d) => d.id.toString() === value);
    return dealer ? dealer.dealerName : value;
  };

  return (
    <Stack spacing={1.5} sx={{ ...sx }} {...other}>
      <Box sx={{ typography: 'body2' }}>
        <strong>{totalResults}</strong>
        <Box component="span" sx={{ color: 'text.secondary', ml: 0.25 }}>
          results found
        </Box>
      </Box>

      <Stack flexGrow={1} spacing={1} direction="row" flexWrap="wrap" alignItems="center">
        {filters.state.name && (
          <Paper
            sx={{
              p: 1,
              gap: 0.5,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Box sx={{ typography: 'subtitle2' }}>Keyword:</Box>
            <Chip
              size="small"
              label={filters.state.name}
              onDelete={handleRemoveKeyword}
              deleteIcon={<Iconify icon="mingcute:close-line" />}
            />
          </Paper>
        )}

        {filters.state.status !== 'all' && (
          <Paper
            sx={{
              p: 1,
              gap: 0.5,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Box sx={{ typography: 'subtitle2' }}>Status:</Box>
            <Chip
              size="small"
              label={filters.state.status}
              onDelete={handleRemoveStatus}
              deleteIcon={<Iconify icon="mingcute:close-line" />}
            />
          </Paper>
        )}

        {filters.state.category !== 'all' && (
          <Paper
            sx={{
              p: 1,
              gap: 0.5,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Box sx={{ typography: 'subtitle2' }}>Category:</Box>
            <Chip
              size="small"
              label={getCategoryLabel(filters.state.category)}
              onDelete={handleRemoveCategory}
              deleteIcon={<Iconify icon="mingcute:close-line" />}
            />
          </Paper>
        )}

        {filters.state.dealerId !== 'all' && (
          <Paper
            sx={{
              p: 1,
              gap: 0.5,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Box sx={{ typography: 'subtitle2' }}>Dealer:</Box>
            <Chip
              size="small"
              label={getDealerLabel(filters.state.dealerId)}
              onDelete={handleRemoveDealer}
              deleteIcon={<Iconify icon="mingcute:close-line" />}
            />
          </Paper>
        )}

        <Button
          color="error"
          onClick={handleReset}
          startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
        >
          Clear
        </Button>
      </Stack>
    </Stack>
  );
}
