import { useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function DiamondsTableFiltersResult({
  filters,
  totalResults,
  onResetPage,
  sx,
  ...other
}) {
  const { state: currentFilters, setState: updateFilters } = filters;

  const handleRemoveKeyword = useCallback(() => {
    onResetPage();
    updateFilters({ name: '' });
  }, [onResetPage, updateFilters]);

  const handleRemoveStatus = useCallback(() => {
    onResetPage();
    updateFilters({ status: 'all' });
  }, [onResetPage, updateFilters]);

  const handleReset = useCallback(() => {
    onResetPage();
    updateFilters({ name: '', status: 'all' });
  }, [onResetPage, updateFilters]);

  return (
    <Stack spacing={1.5} sx={{ ...sx }} {...other}>
      <Box sx={{ typography: 'body2' }}>
        <strong>{totalResults}</strong>
        <Box component="span" sx={{ color: 'text.secondary', ml: 0.5 }}>
          results found
        </Box>
      </Box>

      <Stack flexGrow={1} spacing={1} direction="row" flexWrap="wrap" alignItems="center">
        {!!currentFilters.name && (
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
              label={currentFilters.name}
              onDelete={handleRemoveKeyword}
            />
          </Paper>
        )}

        {currentFilters.status !== 'all' && (
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
              label={currentFilters.status}
              onDelete={handleRemoveStatus}
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
