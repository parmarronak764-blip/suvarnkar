import { useBoolean, usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import { RouterLink } from 'src/routes/components';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomPopover } from 'src/components/custom-popover';
import { PermissionGate } from 'src/components/PermissionGate';
import { usePermissions } from 'src/hooks/usePermissions';
import { color } from 'framer-motion';
import { FormControlLabel, Switch } from '@mui/material';
import { fDateTime } from 'src/utils/format-time';
import { MediaModal } from './barcode-media-modal';
import { usePurchaseBarcodeTag } from 'src/hooks/usePurchaseBarcodeTag';
import { Fragment, useCallback, useState } from 'react';

// ----------------------------------------------------------------------

export function BarcodeItemTableRow({
  row,
  selected,
  editHref,
  onSelectRow,
  onDeleteRow,
  columns,
  level = 0, // 👈 depth level
}) {
  const [expandedRows, setExpandedRows] = useState(new Set()); //  set initial expanded false
  const isExpanded = expandedRows.has(row.id);

  console.log('expandedRows', expandedRows);

  const menuActions = usePopover();
  const confirmDialog = useBoolean();
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const { hasPermission } = usePermissions();

  const { fetchMedia, mediaFiles } = usePurchaseBarcodeTag();

  const toggleRow = useCallback((rowId) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      next.has(rowId) ? next.delete(rowId) : next.add(rowId);
      return next;
    });
  }, []);

  const renderMenuActions = () => (
    <CustomPopover
      open={menuActions.open}
      anchorEl={menuActions.anchorEl}
      onClose={menuActions.onClose}
      slotProps={{ arrow: { placement: 'right-top' } }}
    >
      <MenuList>
        <PermissionGate permission="barcode_tag_item.edit">
          <MenuItem
            sx={{ color: 'info.main' }}
            component={RouterLink}
            href={editHref}
            onClick={() => menuActions.onClose()}
          >
            <Iconify icon="solar:pen-bold" />
            Edit
          </MenuItem>
        </PermissionGate>

        <PermissionGate permission="barcode_tag_item.delete">
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

  const handleCloseModel = useCallback(() => {
    setMediaModalOpen(false);
  }, [setMediaModalOpen]);

  const renderMediaModal = () => (
    <MediaModal
      open={mediaModalOpen}
      onClose={handleCloseModel}
      mediaData={mediaFiles || []}
      mediaType="image"
    />
  );

  const renderConfirmDialog = () => (
    <ConfirmDialog
      open={confirmDialog.value}
      onClose={confirmDialog.onFalse}
      title="Delete"
      content="Are you sure want to delete?"
      action={
        <Button
          variant="contained"
          color="error"
          onClick={async () => {
            await onDeleteRow();
            confirmDialog.onFalse();
          }}
        >
          Delete
        </Button>
      }
    />
  );

  const renderCellData = (headCell, rowCell) => {
    if (headCell?.id === 'checkbox') {
      if (level > 0) return null;
      return (
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
      );
    }

    if (headCell.id === 'tag_item_code') {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', pl: level * 3 }}>
          {row?.variant_count && (
            <IconButton size="small" onClick={() => toggleRow(row.id)}>
              <Iconify icon={isExpanded ? 'eva:arrow-up-fill' : 'eva:arrow-down-fill'} />
            </IconButton>
          )}
          {row[headCell.id]}
        </Box>
      );
    }

    if (headCell?.id === 'e_showroom') {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FormControlLabel
            control={
              <Switch
                disabled
                checked={rowCell[headCell.id] === 'No' ? false : true}
                color="primary"
              />
            }
          />
        </Box>
      );
    }
    if (headCell?.id === 'action') {
      if (level > 0) return null;
      return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {(hasPermission('barcode_tag_item.edit') || hasPermission('barcode_tag_item.delete')) && (
            <IconButton
              color={menuActions.open ? 'inherit' : 'default'}
              onClick={menuActions.onOpen}
            >
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          )}
        </Box>
      );
    }
    if (headCell?.id === 'media_count') {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {row[headCell.id] ? (
            <>
              {row[headCell.id] || 0}
              <Tooltip title="View Media files">
                <IconButton onClick={() => handleFetchMedia(row.id)}>
                  <Iconify icon="eva:image-fill" sx={{ color: 'primary.light' }} />
                </IconButton>
              </Tooltip>
            </>
          ) : (
            '-'
          )}
        </Box>
      );
    }
    if (headCell.id === 'created_at') {
      return <Box>{row[headCell.id] ? fDateTime(row[headCell.id]) : '-'}</Box>;
    }
    return row[headCell.id] ? row[headCell.id] : '-';
  };

  const handleFetchMedia = useCallback(
    async (rowId) => {
      await fetchMedia(rowId);
      setMediaModalOpen(true);
    },
    [fetchMedia]
  );

  return (
    <Fragment>
      <TableRow
        hover
        sx={{
          bgcolor: level > 0 ? 'background.neutral' : 'inherit',
        }}
        key={row.id}
        selected={selected}
        aria-checked={selected}
        tabIndex={-1}
      >
        {(columns || []).map((headCell) => (
          <TableCell
            padding={headCell?.id === 'checkbox' ? 'checkbox' : 'normal'}
            key={headCell.id}
          >
            {renderCellData(headCell, row)}
          </TableCell>
        ))}
      </TableRow>

      {/* CHILD VARIANTS */}
      {row?.variants?.length > 0 &&
        isExpanded &&
        row.variants.map((childRow) => (
          <TableRow key={`${childRow.id}_child_wrapper`} sx={{ display: 'contents' }}>
            <BarcodeItemTableRow
              key={`${childRow.id}_child`}
              row={childRow}
              columns={columns}
              level={level + 1}
            />
          </TableRow>
        ))}

      {renderMenuActions()}
      {renderConfirmDialog()}
      {renderMediaModal()}
    </Fragment>
  );
}
