import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function ProductCategoriesTableToolbar({
  showAddButton = false,
  onAddClick,
}) {
  return (
    <Box
      sx={{
        p: 2.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
      }}
    >
      {showAddButton && (
        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={onAddClick}
        >
          Add New
        </Button>
      )}
    </Box>
  );
}
