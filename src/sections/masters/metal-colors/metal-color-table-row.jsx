import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { useBoolean, usePopover } from 'minimal-shared/hooks';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomPopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export function MetalColorTableRow({ row, selected, onEditRow, onSelectRow, onDeleteRow }) {
  const confirmDialog = useBoolean();
  const popover = usePopover();

  const renderCheckbox = (
    <TableCell padding="checkbox">
      <Checkbox
        checked={selected}
        onClick={onSelectRow}
        inputProps={{
          name: `row-checkbox-${row.id}`,
          'aria-label': `Row checkbox`,
        }}
      />
    </TableCell>
  );

  const renderPrimary = (
    <TableCell>
      <Stack sx={{ typography: 'body2', flex: '1 1 auto', alignItems: 'flex-start' }}>
        <Typography variant="subtitle2" noWrap>
          {row.metal_color}
        </Typography>
        <Box component="span" sx={{ color: 'text.disabled', fontSize: '0.875rem' }}>
          ID: {row.id}
        </Box>
      </Stack>
    </TableCell>
  );

  const renderCompany = (
    <TableCell>
      <Typography variant="body2">{row.company_name}</Typography>
    </TableCell>
  );

  const renderStatus = (
    <TableCell>
      <Label variant="soft" color={row.is_active ? 'success' : 'error'}>
        {row.is_active ? 'Active' : 'Inactive'}
      </Label>
    </TableCell>
  );

  const renderCreatedAt = (
    <TableCell>
      <Typography variant="body2" color="text.secondary">
        {new Date(row.created_at).toLocaleDateString()}
      </Typography>
    </TableCell>
  );

  const renderUpdatedAt = (
    <TableCell>
      <Typography variant="body2" color="text.secondary">
        {new Date(row.updated_at).toLocaleDateString()}
      </Typography>
    </TableCell>
  );

  const renderActions = (
    <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
      <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
        <Iconify icon="eva:more-vertical-fill" />
      </IconButton>
    </TableCell>
  );

  return (
    <>
      <TableRow hover selected={selected}>
        {renderCheckbox}
        {renderPrimary}
        {renderCompany}
        {renderStatus}
        {renderCreatedAt}
        {renderUpdatedAt}
        {renderActions}
      </TableRow>

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
        title="Delete Metal Color"
        content="Are you sure you want to delete this metal color?"
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton onClick={confirmDialog.onFalse}>Cancel</IconButton>
            <IconButton
              onClick={() => {
                onDeleteRow();
                confirmDialog.onFalse();
              }}
              color="error"
            >
              Delete
            </IconButton>
          </Box>
        }
      />
    </>
  );
}
