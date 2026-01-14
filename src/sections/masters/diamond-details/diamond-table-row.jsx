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

export function DiamondTableRow({ row, selected, onSelectRow, onDeleteRow, onEditRow, category }) {
  const menuActions = usePopover();
  const confirmDialog = useBoolean();
  const { hasPermission } = usePermissions();

  const handleEdit = () => {
    if (onEditRow) {
      onEditRow(row);
    } else {
      // TODO: Open edit dialog
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
        <PermissionGate permission="diamond_details.edit">
          <MenuItem onClick={handleEdit}>
            <Iconify icon="solar:pen-bold" />
            Edit
          </MenuItem>
        </PermissionGate>
        {/* <PermissionGate permission="diamond_details.delete">
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
        </PermissionGate> */}
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

  return (
    <>
      <TableRow hover selected={selected} aria-checked={selected} tabIndex={-1}>
        {category !== 'color' && (
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
        )}

        {/* Different display based on category */}
        {category === 'clarity' ? (
          // Diamond fields for clarity tab
          <>
            <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.shape_name || '-'}</TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.size_range_value || '-'}</TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.carat_name || '-'}</TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.todays_rate || '-'}</TableCell>
          </>
        ) : (
          // Standard display for other categories
          <>
            <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 600 }}>
              {category === 'sizeRange' ? row.range_value : row.name}
            </TableCell>

            {/* Shape column - only for size ranges */}
            {category === 'sizeRange' && (
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.shape_name || '-'}</TableCell>
            )}
          </>
        )}

        <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 600 }}>
          {row.company_name || '-'}
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap', fontSize: '0.875rem', color: 'text.secondary' }}>
          {row.created_at ? new Date(row.created_at).toLocaleDateString() : '-'}
        </TableCell>

        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {(hasPermission('diamond_details.edit') || hasPermission('diamond_details.delete')) && (
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
