import { useBoolean, usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomPopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export function WastageTableRow({ row, selected, onEditRow, onSelectRow, onDeleteRow }) {
  const confirm = useBoolean();
  const popover = usePopover();

  // Format the wastage percentage
  const formatPercentage = (value) => {
    if (!value) return '-';

    const numValue = parseFloat(value);
    if (isNaN(numValue)) return '-';

    return `${numValue.toFixed(2)}%`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderPrimary = (
    <TableRow hover selected={selected}>
      <TableCell padding="checkbox">
        <Checkbox
          checked={selected}
          onClick={onSelectRow}
          inputProps={{ id: `row-checkbox-${row.id}`, 'aria-label': `Row checkbox` }}
        />
      </TableCell>

      <TableCell>
        <Box component="span" sx={{ typography: 'body2', color: 'text.primary', fontWeight: 600 }}>
          {row.wastage_code || '-'}
        </Box>
      </TableCell>

      <TableCell>
        <Label
          variant="soft"
          color={
            (row.charge_type === 'ADD' && 'success') ||
            (row.charge_type === 'LESS' && 'error') ||
            'default'
          }
        >
          {row.charge_type_display || row.charge_type || '-'}
        </Label>
      </TableCell>

      <TableCell>
        <Box component="span" sx={{ typography: 'body2', color: 'text.primary', fontWeight: 600 }}>
          {formatPercentage(row.wastage_percentage)}
        </Box>
      </TableCell>

      <TableCell>
        <Box component="span" sx={{ typography: 'body2', color: 'text.secondary' }}>
          {row.company_name || '-'}
        </Box>
      </TableCell>

      <TableCell>
        <Label variant="soft" color={row.is_active ? 'success' : 'error'}>
          {row.is_active ? 'Active' : 'Inactive'}
        </Label>
      </TableCell>

      <TableCell>
        <Box component="span" sx={{ typography: 'body2', color: 'text.secondary' }}>
          {formatDate(row.created_at)}
        </Box>
      </TableCell>

      <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
        <Tooltip title="Quick actions">
          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </Tooltip>
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
        slotProps={{ arrow: { placement: 'right-top' } }}
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
              confirm.onTrue();
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
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete Wastage"
        content="Are you sure want to delete this wastage?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Delete
          </Button>
        }
      />
    </>
  );
}
