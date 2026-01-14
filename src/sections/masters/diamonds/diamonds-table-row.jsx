import Checkbox from '@mui/material/Checkbox';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';

import { useBoolean, usePopover } from 'minimal-shared/hooks';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomPopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export function DiamondsTableRow({ row, selected, onSelectRow, onDeleteRow, onEditRow }) {
  const menuActions = usePopover();
  const confirmDialog = useBoolean();

  const handleEdit = () => {
    if (onEditRow) {
      onEditRow(row);
    }
    menuActions.onClose();
  };

  const handleDelete = () => {
    confirmDialog.onTrue();
    menuActions.onClose();
  };

  const confirmDelete = () => {
    onDeleteRow();
    confirmDialog.onFalse();
  };

  return (
    <>
      <TableRow hover selected={selected} aria-checked={selected} tabIndex={-1}>
        <TableCell padding="checkbox">
          <Checkbox
            checked={selected}
            onClick={onSelectRow}
            inputProps={{
              id: `${row.id}-checkbox`,
              'aria-label': `${row.id} checkbox`,
            }}
          />
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {row.clarity?.name || '-'}
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {row.shape?.name || row.shape_name || '-'}
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {row.size_range?.range_value || '-'}
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {row.carat?.name || '-'}
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 600 }}>
          {row.todays_rate || '-'}
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {row.company_name || '-'}
        </TableCell>

        <TableCell>
          <Label
            variant="soft"
            color={row.is_active ? 'success' : 'error'}
          >
            {row.is_active ? 'Active' : 'Inactive'}
          </Label>
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap', fontSize: '0.875rem', color: 'text.secondary' }}>
          {row.created_at ? new Date(row.created_at).toLocaleDateString() : '-'}
        </TableCell>

        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color={menuActions.open ? 'inherit' : 'default'}
              onClick={menuActions.onOpen}
            >
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          </Box>
        </TableCell>
      </TableRow>

      <CustomPopover
        open={menuActions.open}
        anchorEl={menuActions.anchorEl}
        onClose={menuActions.onClose}
        slotProps={{ arrow: { placement: 'right-top' } }}
      >
        <MenuList>
          <MenuItem onClick={handleEdit}>
            <Iconify icon="solar:pen-bold" />
            Edit
          </MenuItem>

          <MenuItem
            onClick={handleDelete}
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
        title="Delete Diamond"
        content="Are you sure you want to delete this diamond?"
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton onClick={confirmDialog.onFalse}>
              <Iconify icon="mingcute:close-line" />
            </IconButton>
            <IconButton onClick={confirmDelete} color="error">
              <Iconify icon="solar:trash-bin-trash-bold" />
            </IconButton>
          </Box>
        }
      />
    </>
  );
}
