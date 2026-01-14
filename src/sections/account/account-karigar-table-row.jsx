import { usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { CustomPopover } from 'src/components/custom-popover';
import { PermissionGate } from 'src/components/PermissionGate';
import { usePermissions } from 'src/hooks/usePermissions';

// ----------------------------------------------------------------------

export function AccountKarigarTableRow({ row, selected, onSelectRow, onEditRow }) {
  const menuActions = usePopover();
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
        <PermissionGate permission="user.edit">
          <MenuItem onClick={handleEdit}>
            <Iconify icon="solar:pen-bold" />
            Edit
          </MenuItem>
        </PermissionGate>
      </MenuList>
    </CustomPopover>
  );

  const getStatusColor = (isActive) => (isActive ? 'success' : 'error');

  const accountStatus = row?.account?.is_active !== false ? 'active' : 'inactive';
  const contactNumber =
    row.contact_country_code && row.contact_number
      ? `${row.contact_country_code} ${row.contact_number}`
      : row.whatsapp_country_code && row.whatsapp_number
        ? `${row.whatsapp_country_code} ${row.whatsapp_number}`
        : '-';

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

        <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 600 }}>{row.name || '-'}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.firm_name || '-'}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.karigar_code || '-'}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{contactNumber}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.city || '-'}</TableCell>

        <TableCell>
          <Label variant="soft" color={getStatusColor(row?.account?.is_active)}>
            {accountStatus}
          </Label>
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap', fontSize: '0.875rem', color: 'text.secondary' }}>
          {row.created_at ? new Date(row.created_at).toLocaleDateString() : '-'}
        </TableCell>

        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {hasPermission('user.edit') && (
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
    </>
  );
}
