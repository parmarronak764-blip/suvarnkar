import { usePopover } from 'minimal-shared/hooks';

import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import { Iconify } from 'src/components/iconify';
import { CustomPopover } from 'src/components/custom-popover';
import { useNavigate } from 'react-router';

// ----------------------------------------------------------------------

export function ExpenseTableRow({ row, index, selected, onSelectRow, onDeleteRow }) {
  const menuActions = usePopover();
  const navigate = useNavigate();

  return (
    <>
      <TableRow hover selected={selected}>
        {/* <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell> */}
        <TableCell width={80}>{index + 1}</TableCell>
        <TableCell>{row.expense_date}</TableCell>
        <TableCell>{row.company_name}</TableCell>
        <TableCell>{row.payment_type_name}</TableCell>
        <TableCell>{row.category_name}</TableCell>
        <TableCell>{row.amount}</TableCell>
        <TableCell>{row.description || '-'}</TableCell>
        <TableCell>
          <IconButton onClick={menuActions.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      {/* ACTION MENU */}
      <CustomPopover
        open={menuActions.open}
        anchorEl={menuActions.anchorEl}
        onClose={menuActions.onClose}
      >
        <MenuList>
          <MenuItem onClick={() => navigate(`/masters/expense/edit/${row.id}`)}>
            <Iconify icon="solar:pen-bold" />
            Edit
          </MenuItem>

          <MenuItem
            sx={{ color: 'error.main' }}
            onClick={() => {
              onDeleteRow();
              menuActions.onClose();
            }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
            Delete
          </MenuItem>
        </MenuList>
      </CustomPopover>
    </>
  );
}
