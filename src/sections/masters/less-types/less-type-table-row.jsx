import { useBoolean, usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomPopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export function LessTypeTableRow({ row, selected, onEditRow, onSelectRow, onDeleteRow }) {
  const confirmDialog = useBoolean();
  const popover = usePopover();

  const renderPrimary = (
    <TableRow hover selected={selected}>
      <TableCell padding="checkbox">
        <Checkbox
          checked={selected}
          onClick={onSelectRow}
          inputProps={{ id: `row-checkbox-${row.id}`, 'aria-label': `Row checkbox ${row.id}` }}
        />
      </TableCell>

      <TableCell>
        <Stack spacing={2} direction="row" alignItems="center">
          <Stack sx={{ typography: 'body2', flex: '1 1 auto', alignItems: 'flex-start' }}>
            <Typography variant="subtitle2" noWrap>
              {row.less_type_name}
            </Typography>
            <Box component="span" sx={{ color: 'text.disabled', fontSize: '0.875rem' }}>
              ID: {row.id}
            </Box>
          </Stack>
        </Stack>
      </TableCell>

      <TableCell>
        <Label
          variant="soft"
          color={
            (row.variation_type === 'ADD' && 'success') ||
            (row.variation_type === 'LESS' && 'warning') ||
            'default'
          }
        >
          {row.variation_type === 'ADD' ? 'Add' : 'Less'}
        </Label>
      </TableCell>

      <TableCell>
        <Typography variant="body2">{row.variation_percentage}%</Typography>
      </TableCell>

      <TableCell>
        <Typography variant="body2">{row.company_name}</Typography>
      </TableCell>

      <TableCell>
        <Label variant="soft" color={row.is_active ? 'success' : 'error'}>
          {row.is_active ? 'Active' : 'Inactive'}
        </Label>
      </TableCell>

      <TableCell>
        <Typography variant="body2" color="text.secondary">
          {new Date(row.created_at).toLocaleDateString()}
        </Typography>
      </TableCell>

      <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
        <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>
      </TableCell>
    </TableRow>
  );

  return (
    <>
      {renderPrimary}

      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{
          arrow: { placement: 'right-top' },
        }}
      >
        <MenuList>
          <MenuItem
            onClick={() => {
              onEditRow();
              popover.onClose();
            }}
          >
            <Iconify icon="solar:pen-bold" />
            Edit
          </MenuItem>

          <MenuItem
            onClick={() => {
              confirmDialog.onTrue();
              popover.onClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
            Delete
          </MenuItem>
        </MenuList>
      </CustomPopover>

      <ConfirmDialog
        open={confirmDialog.value}
        onClose={confirmDialog.onFalse}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Delete
          </Button>
        }
      />
    </>
  );
}
