import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
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

// ----------------------------------------------------------------------

export function BarcodeLocationTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
}) {
  const popover = usePopover();
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
      <MenuItem onClick={handleEdit}>
        <Iconify icon="solar:pen-bold" />
        Edit
      </MenuItem>

      <MenuItem onClick={handleConfirmDelete} sx={{ color: 'error.main' }}>
        <Iconify icon="solar:trash-bin-trash-bold" />
        Delete
      </MenuItem>
    </CustomPopover>
  );

  const renderConfirmDialog = () => (
    <ConfirmDialog
      open={confirmOpen}
      onClose={() => setConfirmOpen(false)}
      title="Delete Barcode Location"
      content="Are you sure you want to delete this barcode location?"
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
        <TableCell padding="checkbox">
          <Checkbox
            checked={selected}
            onClick={onSelectRow}
            inputProps={{ id: `row-checkbox-${row.id}`, 'aria-label': `Row checkbox` }}
          />
        </TableCell>

        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              alt={row.location_name}
              sx={{
                mr: 2,
                width: 32,
                height: 32,
                bgcolor: 'secondary.main',
                color: 'secondary.contrastText',
              }}
            >
              {row.location_name?.charAt(0)?.toUpperCase()}
            </Avatar>

            <Stack sx={{ typography: 'body2', flex: '1 1 auto', alignItems: 'flex-start' }}>
              <Typography variant="subtitle2" noWrap>
                {row.location_name}
              </Typography>
              <Box sx={{ color: 'text.disabled', mt: 0.5 }}>
                ID: {row.id}
              </Box>
            </Stack>
          </Box>
        </TableCell>

        <TableCell>
          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
            {row.box_code || 'N/A'}
          </Typography>
        </TableCell>

        <TableCell>
          {row.qr_code ? (
            <Box
              component="img"
              src={row.qr_code}
              alt="QR Code"
              sx={{
                width: 60,
                height: 60,
                objectFit: 'contain',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                backgroundColor: 'background.paper',
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
          ) : (
            <Typography variant="body2" color="text.disabled">
              No QR Code
            </Typography>
          )}
          <Typography 
            variant="body2" 
            color="error" 
            sx={{ display: 'none', fontSize: '0.75rem' }}
          >
            Image failed to load
          </Typography>
        </TableCell>

        <TableCell>
          {row.qr_code_url ? (
            <Box
              component="img"
              src={row.qr_code_url}
              alt="QR Code URL"
              sx={{
                width: 60,
                height: 60,
                objectFit: 'contain',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                backgroundColor: 'background.paper',
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
          ) : (
            <Typography variant="body2" color="text.disabled">
              No QR Code URL
            </Typography>
          )}
          <Typography 
            variant="body2" 
            color="error" 
            sx={{ display: 'none', fontSize: '0.75rem' }}
          >
            Image failed to load
          </Typography>
        </TableCell>

        <TableCell align="right">
          <Typography variant="body2">
            {parseFloat(row.box_weight || 0).toFixed(3)} g
          </Typography>
        </TableCell>

        <TableCell>
          <Stack sx={{ typography: 'body2', alignItems: 'flex-start' }}>
            <Typography variant="body2" noWrap>
              {row.company_name || 'N/A'}
            </Typography>
            <Box sx={{ color: 'text.disabled', mt: 0.5 }}>
              ID: {row.company_id || 'N/A'}
            </Box>
          </Stack>
        </TableCell>

        <TableCell>
          <Label
            variant="soft"
            color={row.is_active ? 'success' : 'error'}
          >
            {row.is_active ? 'Active' : 'Inactive'}
          </Label>
        </TableCell>

        <TableCell>
          <Stack spacing={0.5}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Created: {row.created_at ? new Date(row.created_at).toLocaleDateString() : 'N/A'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Updated: {row.updated_at ? new Date(row.updated_at).toLocaleDateString() : 'N/A'}
            </Typography>
          </Stack>
        </TableCell>

        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <IconButton
            color={popover.open ? 'inherit' : 'default'}
            onClick={popover.onOpen}
          >
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      {renderMenuActions()}
      {renderConfirmDialog()}
    </>
  );
}
