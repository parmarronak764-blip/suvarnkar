import { useBoolean, usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
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
import { PermissionGate } from 'src/components/PermissionGate';
import { usePermissions } from 'src/hooks/usePermissions';

// ----------------------------------------------------------------------

export function AccountTableRow({ 
  row, 
  selected, 
  onSelectRow, 
  onDeleteRow, 
  onEditRow, 
  onStatusChange 
}) {
  const menuActions = usePopover();
  const confirmDialog = useBoolean();
  const { hasPermission } = usePermissions();

  const handleEdit = () => {
    if (onEditRow) {
      onEditRow(row.id);
    }
    menuActions.onClose();
  };

  const handleStatusToggle = () => {
    const newStatus = row.status === 'active' ? 'inactive' : 'active';
    if (onStatusChange) {
      onStatusChange(newStatus);
    }
    menuActions.onClose();
  };

  const renderMenuActions = () => (
    <CustomPopover
      open={menuActions.open}
      anchorEl={menuActions.anchorEl}
      onClose={menuActions.onClose}
      slotProps={{ arrow: { placement: 'right-top' } }}
    >
      <MenuList>
        <PermissionGate permission="user.edit">
          <MenuItem onClick={handleEdit}>
            <Iconify icon="solar:pen-bold" />
            Edit
          </MenuItem>
        </PermissionGate>

        <PermissionGate permission="user.edit">
          <MenuItem onClick={handleStatusToggle}>
            <Iconify 
              icon={row.status === 'active' ? 'solar:eye-closed-bold' : 'solar:eye-bold'} 
            />
            {row.status === 'active' ? 'Deactivate' : 'Activate'}
          </MenuItem>
        </PermissionGate>

        <PermissionGate permission="user.delete">
          <MenuItem
            onClick={() => {
              confirmDialog.onTrue();
              menuActions.onClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
            Delete
          </MenuItem>
        </PermissionGate>
      </MenuList>
    </CustomPopover>
  );

  const renderConfirmDialog = () => (
    <ConfirmDialog
      open={confirmDialog.value}
      onClose={confirmDialog.onFalse}
      title="Delete"
      content="Are you sure want to delete this account?"
      action={
        <Button variant="contained" color="error" onClick={onDeleteRow}>
          Delete
        </Button>
      }
    />
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'inactive':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <>
      <TableRow hover selected={selected} aria-checked={selected} tabIndex={-1}>
        <TableCell padding="checkbox">
          <Checkbox
            checked={selected}
            onClick={onSelectRow}
            slotProps={{
              input: {
                id: `${row.id}-checkbox`,
                'aria-label': `${row.id} checkbox`,
              },
            }}
          />
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 600 }}>
          {row.companyName}
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {row.adminName}
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {row.email}
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {row.phone}
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {row.businessType}
        </TableCell>

        <TableCell>
          <Label
            variant="soft"
            color={getStatusColor(row.status)}
          >
            {row.status}
          </Label>
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap', fontSize: '0.875rem', color: 'text.secondary' }}>
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-'}
        </TableCell>

        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {(hasPermission('user.edit') || hasPermission('user.delete')) && (
              <IconButton
                color={menuActions.open ? 'inherit' : 'default'}
                onClick={menuActions.onOpen}
              >
                <Iconify icon="eva:more-vertical-fill" />
              </IconButton>
            )}
          </Box>
        </TableCell>
      </TableRow>

      {renderMenuActions()}
      {renderConfirmDialog()}
    </>
  );
}
