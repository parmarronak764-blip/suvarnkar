import { useEffect } from 'react';
import { useBoolean } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { useSettingsContext } from 'src/components/settings';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import {
  useTable,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import { ExpenseTypeTableRow } from './expense-type-table-row';

import { useDispatch, useSelector } from 'react-redux';
import { deleteExpenseType, getExpenseTypes } from 'src/redux/slices/expenseType.slice';
import { toast } from 'sonner';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'srno', label: 'Sr No', width: 80 },
  { id: 'expenseType', label: 'Expense Type' },
  { id: 'action', label: 'Action', width: 120 },
];

// ----------------------------------------------------------------------

export function ExpenseTypeListView() {
  const settings = useSettingsContext();
  const table = useTable();
  const confirmDialog = useBoolean();
  const dispatch = useDispatch();

  const { loading, expenseTypes, count } = useSelector((state) => state.expenseType);

  useEffect(() => {
    dispatch(getExpenseTypes());
  }, [dispatch]);

  const notFound = !loading && expenseTypes.length === 0;
  const handleDeleteRow = async (id) => {
    try {
      await dispatch(deleteExpenseType(id)).unwrap();

      toast.success('Expense type deleted successfully!');
    } catch (error) {
      toast.error(error?.message || 'Failed to delete expense type');
    }
  };
  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <CustomBreadcrumbs
          heading="Expense Type List"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Master' },
            { name: 'Expense Type' },
            { name: 'List' },
          ]}
          action={
            <Button
              component={RouterLink}
              href="/masters/expense-type/add"
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              Add Expense Type
            </Button>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Card>
          <Box sx={{ position: 'relative' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={expenseTypes.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  expenseTypes.map((row) => row.id)
                )
              }
              action={
                <Tooltip title="Delete">
                  <IconButton color="primary" onClick={confirmDialog.onTrue}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              }
            />

            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headCells={TABLE_HEAD}
                  rowCount={expenseTypes.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  // onSelectAllRows={(checked) =>
                  //   table.onSelectAllRows(
                  //     checked,
                  //     expenseTypes.map((row) => row.id)
                  //   )
                  // }
                />

                <TableBody>
                  {/* ✅ LOADING ROW */}
                  {loading ? (
                    <TableRow>
                      <TableCell
                        colSpan={TABLE_HEAD.length + 1}
                        sx={{ textAlign: 'center', py: 8 }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1,
                          }}
                        >
                          <Iconify icon="svg-spinners:8-dots-rotate" width={24} />
                          Loading expense types...
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                      {expenseTypes.map((row, index) => (
                        <ExpenseTypeTableRow
                          key={row.id}
                          row={row}
                          index={index}
                          selected={table.selected.includes(row.id)}
                          onSelectRow={() => table.onSelectRow(row.id)}
                          onDeleteRow={() => handleDeleteRow(row.id)}
                        />
                      ))}

                      <TableEmptyRows
                        height={56}
                        emptyRows={emptyRows(table.page, table.rowsPerPage, count)}
                      />

                      <TableNoData notFound={notFound} />
                    </>
                  )}
                </TableBody>
              </Table>
            </Scrollbar>
          </Box>

          <TablePaginationCustom
            page={table.page}
            dense={table.dense}
            count={count}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onChangeDense={table.onChangeDense}
            onRowsPerPageChange={table.onChangeRowsPerPage}
          />
        </Card>
      </Container>

      <ConfirmDialog
        open={confirmDialog.value}
        onClose={confirmDialog.onFalse}
        title="Delete"
        content="Are you sure you want to delete selected expense types?"
        action={
          <Button variant="contained" color="error">
            Delete
          </Button>
        }
      />
    </>
  );
}
