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

export function MakingChargeTableRow({ row, selected, onEditRow, onSelectRow, onDeleteRow }) {
  const confirm = useBoolean();
  const popover = usePopover();

  // Format the charge value with currency symbol
  const formatChargeValue = (value, labourCharge) => {
    if (!value) return '-';

    const numValue = parseFloat(value);
    if (isNaN(numValue)) return '-';

    switch (labourCharge) {
      case 'PER_GRAM':
        return `₹${numValue.toFixed(2)}/g`;
      case 'PERCENTAGE':
        return `${numValue.toFixed(2)}%`;
      case 'TOTAL_VALUE':
        return `₹${numValue.toFixed(2)}`;
      default:
        return `₹${numValue.toFixed(2)}`;
    }
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
        <Box sx={{ maxWidth: 200 }}>
          <Box component="span" sx={{ typography: 'body2', color: 'text.primary' }}>
            {row.charge_name || '-'}
          </Box>
        </Box>
      </TableCell>

      <TableCell>
        <Box component="span" sx={{ typography: 'body2', color: 'text.secondary' }}>
          {row.charge_code || '-'}
        </Box>
      </TableCell>

      <TableCell>
        <Label
          variant="soft"
          color={
            (row.labour_charge === 'PER_GRAM' && 'info') ||
            (row.labour_charge === 'PERCENTAGE' && 'warning') ||
            (row.labour_charge === 'TOTAL_VALUE' && 'success') ||
            'default'
          }
        >
          {row.labour_charge_display || row.labour_charge || '-'}
        </Label>
      </TableCell>

      <TableCell>
        <Box component="span" sx={{ typography: 'body2', color: 'text.primary', fontWeight: 600 }}>
          {formatChargeValue(row.charge_value, row.labour_charge)}
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
        title="Delete Making Charge"
        content="Are you sure want to delete this making charge?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Delete
          </Button>
        }
      />
    </>
  );
}
