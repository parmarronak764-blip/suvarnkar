import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { usePopover } from 'minimal-shared/hooks';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomPopover } from 'src/components/custom-popover';
import { PermissionGate } from 'src/components/PermissionGate';
import { usePermissions } from 'src/hooks/usePermissions';

// ----------------------------------------------------------------------

export function ProductTableRow({ row, selected, onEditRow, onSelectRow, onDeleteRow }) {
  const popover = usePopover();
  const { hasPermission } = usePermissions();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleConfirmDelete = useCallback(() => {
    setConfirmOpen(true);
    popover.onClose();
  }, [popover]);

  const handleDelete = useCallback(() => {
    onDeleteRow();
    setConfirmOpen(false);
  }, [onDeleteRow]);

  const handleEdit = useCallback(() => {
    onEditRow();
    popover.onClose();
  }, [onEditRow, popover]);

  const renderMenuActions = () => (
    <CustomPopover
      open={popover.open}
      anchorEl={popover.anchorEl}
      onClose={popover.onClose}
      slotProps={{ arrow: { placement: 'right-top' } }}
    >
      <PermissionGate permission="products.edit">
        <MenuItem onClick={handleEdit}>
          <Iconify icon="solar:pen-bold" />
          Edit
        </MenuItem>
      </PermissionGate>

      {/* <PermissionGate permission="products.delete">
        <MenuItem onClick={handleConfirmDelete} sx={{ color: 'error.main' }}>
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
        </MenuItem>
      </PermissionGate> */}
    </CustomPopover>
  );

  const renderConfirmDialog = () => (
    <ConfirmDialog
      open={confirmOpen}
      onClose={() => setConfirmOpen(false)}
      title="Delete Product"
      content="Are you sure you want to delete this product?"
      action={
        <Button variant="contained" color="error" onClick={handleDelete}>
          Delete
        </Button>
      }
    />
  );

  return (
    <>
      <TableRow hover selected={selected}>
        {onSelectRow && (
          <TableCell padding="checkbox">
            <Checkbox
              checked={selected}
              onClick={onSelectRow}
              inputProps={{ id: `row-checkbox-${row.id}`, 'aria-label': `Row checkbox` }}
            />
          </TableCell>
        )}

        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              alt={row.product_name}
              sx={{
                mr: 2,
                width: 32,
                height: 32,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
              }}
            >
              {row.product_name?.charAt(0)?.toUpperCase()}
            </Avatar>

            <Stack sx={{ typography: 'body2', flex: '1 1 auto', alignItems: 'flex-start' }}>
              <Typography variant="subtitle2" noWrap>
                {row.product_name}
              </Typography>
              <Box sx={{ color: 'text.disabled', mt: 0.5 }}>ID: {row.id}</Box>
            </Stack>
          </Box>
        </TableCell>

        <TableCell>
          <Stack sx={{ typography: 'body2', alignItems: 'flex-start' }}>
            <Typography variant="body2" noWrap>
              {row.product_category?.name || 'N/A'}
            </Typography>
            <Box sx={{ color: 'text.disabled', mt: 0.5 }}>
              ID: {row.product_category?.id || 'N/A'}
            </Box>
          </Stack>
        </TableCell>

        <TableCell>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {row.carat_names && row.carat_names.length > 0 ? (
              row.carat_names.map((caratName, index) => (
                <Chip
                  key={index}
                  label={caratName}
                  size="small"
                  variant="outlined"
                  color="primary"
                  sx={{
                    fontSize: '0.75rem',
                    height: 24,
                  }}
                />
              ))
            ) : (
              <Typography variant="body2" color="text.disabled">
                No carats
              </Typography>
            )}
          </Box>
        </TableCell>

        <TableCell>
          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
            {row.tag_prefix || 'N/A'}
          </Typography>
        </TableCell>

        <TableCell align="right">
          <Typography variant="body2">
            {parseFloat(row.opening_gross_weight || 0).toFixed(4)}
          </Typography>
        </TableCell>

        <TableCell align="right">
          <Typography variant="body2">
            {parseFloat(row.opening_less_weight || 0).toFixed(4)}
          </Typography>
        </TableCell>

        <TableCell align="right">
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {parseFloat(row.opening_net_weight || 0).toFixed(4)}
          </Typography>
        </TableCell>

        <TableCell align="right">
          <Typography variant="body2">{row.opening_quantity || 0}</Typography>
        </TableCell>

        <TableCell align="right">
          <Typography variant="body2">₹{parseFloat(row.average_rate || 0).toFixed(2)}</Typography>
        </TableCell>

        <TableCell align="right">
          <Typography variant="body2">{parseFloat(row.tag_weight || 0).toFixed(4)}</Typography>
        </TableCell>

        <TableCell align="right">
          <Typography variant="body2">{parseFloat(row.box_weight || 0).toFixed(4)}</Typography>
        </TableCell>

        <TableCell>
          <Label variant="soft" color={row.is_active ? 'success' : 'error'}>
            {row.is_active ? 'Active' : 'Inactive'}
          </Label>
        </TableCell>

        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          {(hasPermission('products.edit') || hasPermission('products.delete')) && (
            <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          )}
        </TableCell>
      </TableRow>

      {renderMenuActions()}
      {renderConfirmDialog()}
    </>
  );
}
