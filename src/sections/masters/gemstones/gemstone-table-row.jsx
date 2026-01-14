import { useBoolean, usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomPopover } from 'src/components/custom-popover';
import { PermissionGate } from 'src/components/PermissionGate';
import { usePermissions } from 'src/hooks/usePermissions';

// ----------------------------------------------------------------------

export function GemstoneTableRow({ row, selected, onSelectRow, onDeleteRow, onEditRow, category }) {
  const menuActions = usePopover();
  const confirmDialog = useBoolean();
  const { hasPermission } = usePermissions();

  const handleEdit = () => {
    if (onEditRow) {
      onEditRow(row);
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
        <PermissionGate permission="gem_stones.edit">
          <MenuItem onClick={handleEdit}>
            <Iconify icon="solar:pen-bold" />
            Edit
          </MenuItem>
        </PermissionGate>

        <PermissionGate permission="gem_stones.delete">
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
      content="Are you sure want to delete?"
      action={
        <Button variant="contained" color="error" onClick={onDeleteRow}>
          Delete
        </Button>
      }
    />
  );

  const renderCellContent = () => {
    switch (category) {
      case 'packets':
        return (
          <>
            <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 600 }}>
              {row.packet_name || '-'}
            </TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.packet_code || '-'}</TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap' }}>
              {row.gemstone_main_type_name || '-'}
            </TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.gemstone_sub_type_name || '-'}</TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.gemstone_shape_name || '-'}</TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.pieces || '-'}</TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.packet_weight || '-'}</TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.packet_rate || '-'}</TableCell>
          </>
        );

      case 'rates':
        return (
          <>
            <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 600 }}>
              {row.gemstone_sub_type_name || '-'}
            </TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.gemstone_shape_name || '-'}</TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.carat_name || '-'}</TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.carat_size || '-'}</TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.rate_per_carat || '-'}</TableCell>
          </>
        );

      case 'shapes':
        return (
            <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 600 }}>{row.name || '-'}</TableCell>
        );

      case 'sub-types':
        return (
          <>
            <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 600 }}>
              {row.carat_name || '-'}
            </TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.sub_type_name || '-'}</TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.metal_type_name || '-'}</TableCell>
          </>
        );

      default:
        return null;
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

        {renderCellContent()}

        <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 600 }}>
          {row.company_name || '-'}
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap', fontSize: '0.875rem', color: 'text.secondary' }}>
          {row.created_at ? new Date(row.created_at).toLocaleDateString() : '-'}
        </TableCell>

        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {(hasPermission('gem_stones.edit') || hasPermission('gem_stones.delete')) && (
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
