import { useCallback } from 'react';
import { useBoolean, usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { fNumber } from 'src/utils/formate-number';
import { fDate, fDateTime } from 'src/utils/format-time';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomPopover } from 'src/components/custom-popover';
import { PermissionGate } from 'src/components/PermissionGate';

// ----------------------------------------------------------------------

export function PurchaseTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  onViewRow,
}) {
  const confirm = useBoolean();
  const popover = usePopover();

  const handleEdit = useCallback(() => {
    onEditRow();
    popover.onClose();
  }, [onEditRow, popover]);

  // const handleView = useCallback(() => {
  //   onViewRow();
  //   popover.onClose();
  // }, [onViewRow, popover]);

  const handleDelete = useCallback(() => {
    confirm.onTrue();
    popover.onClose();
  }, [confirm, popover]);

  const getTagColor = (tagType) => (tagType === 'TAG' ? 'success' : 'warning');

  const getCategoryColor = (categoryName) => {
    const lower = categoryName?.toLowerCase() || '';
    if (lower.includes('gold')) return 'warning';
    if (lower.includes('silver')) return 'info';
    if (lower.includes('platinum')) return 'secondary';
    if (lower.includes('diamond')) return 'primary';
    return 'default';
  };

  return (
    <>
      <TableRow hover selected={selected} aria-checked={selected} tabIndex={-1}>
        <TableCell padding="checkbox">
          <Checkbox
            checked={selected}
            onClick={onSelectRow}
            inputProps={{ id: `row-checkbox-${row.id}`, 'aria-label': `Row checkbox` }}
          />
        </TableCell>

        <TableCell>
          <Typography variant="body2" noWrap fontWeight={600}>
            {row.purchase_number}
          </Typography>
        </TableCell>

        <TableCell>
          <Typography variant="body2" noWrap>
            {row.bill_number}
          </Typography>
        </TableCell>

        <TableCell>
          <Typography variant="body2" noWrap>
            {fDate(row.bill_date)}
          </Typography>
        </TableCell>

        <TableCell>
          <Typography variant="body2" noWrap>
            {row.dealer_name}
          </Typography>
        </TableCell>

        <TableCell>
          <Typography variant="body2" noWrap>
            {row.company_name}
          </Typography>
        </TableCell>

        <TableCell>
          <Label variant="soft" color={getCategoryColor(row.bill_metal_type_name)}>
            {row.bill_metal_type_name}
          </Label>
        </TableCell>

        <TableCell>
          <Label variant="soft" color={getTagColor(row.tag_selected)}>
            {row.tag_selected}
          </Label>
        </TableCell>

        <TableCell align="right">
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {fNumber(row.total_purchase_amount || 0)}
          </Typography>
        </TableCell>

        <TableCell>
          <Typography variant="body2" noWrap>
            {fDateTime(row.created_at)}
          </Typography>
        </TableCell>

        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <Tooltip title="Actions" placement="top" arrow>
            <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>

      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{ arrow: { placement: 'right-top' } }}
      >
        {/* <MenuItem onClick={handleView}>
          <Iconify icon="solar:eye-bold" />
          View
        </MenuItem> */}

        <PermissionGate permission="purchase.edit">
          <MenuItem onClick={handleEdit}>
            <Iconify icon="solar:pen-bold" />
            Edit
          </MenuItem>
        </PermissionGate>

        <PermissionGate permission="purchase.delete">
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            <Iconify icon="solar:trash-bin-trash-bold" />
            Delete
          </MenuItem>
        </PermissionGate>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete Purchase"
        content="Are you sure you want to delete this purchase?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Delete
          </Button>
        }
      />
    </>
  );
}
