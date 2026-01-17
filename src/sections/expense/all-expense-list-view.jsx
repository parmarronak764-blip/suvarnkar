import { useEffect } from 'react';
import { useBoolean } from 'minimal-shared/hooks';
import { useDispatch, useSelector } from 'react-redux';

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

import { ExpenseTableRow } from './expense-table-row';
import { deleteExpense, getExpenses } from 'src/redux/slices/expense.slice';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'srno', label: 'Sr No', width: 80 },
  { id: 'date', label: 'Date' },
  { id: 'comapny', label: 'Company' },
  { id: 'category', label: 'Expense Type' },
  { id: 'amount', label: 'Amount' },
  { id: 'description', label: 'Description' },
  { id: 'action', label: 'Action', width: 120 },
];

// ----------------------------------------------------------------------

export function ExpenseListView() {
  const settings = useSettingsContext();
  const table = useTable();
  const confirmDialog = useBoolean();
  const dispatch = useDispatch();

  const { loading, expenses, pagination } = useSelector((state) => state.expense);

  // ---------------- FETCH DATA ----------------
  useEffect(() => {
    dispatch(
      getExpenses({
        company_id: 1,
        page: table.page + 1,
        page_size: table.rowsPerPage,
      })
    );
  }, [dispatch, table.page, table.rowsPerPage]);

  const notFound = !loading && expenses.length === 0;

  // ---------------- DELETE HANDLERS ----------------
  const handleDeleteRow = (id) => {
    dispatch(
      deleteExpense({
        id,
        company_id: 1,
      })
    );
  };

  const handleDeleteRows = () => {
    console.log('Delete selected expenses:', table.selected);

    table.onSelectAllRows(false, []);
    confirmDialog.onFalse();
  };

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <CustomBreadcrumbs
          heading="Expense List"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Expense' },
            { name: 'List' },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.expense.addExpense}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              Add Expense
            </Button>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Card>
          <Box sx={{ position: 'relative' }}>
            {/* -------- SELECTED ACTION BAR -------- */}
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={expenses.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  expenses.map((row) => row.id)
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
                  rowCount={expenses.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(
                      checked,
                      expenses.map((row) => row.id)
                    )
                  }
                />

                <TableBody>
                  {/* -------- LOADING -------- */}
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
                          Loading expenses...
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                      {expenses.map((row, index) => (
                        <ExpenseTableRow
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
                        emptyRows={emptyRows(table.page, table.rowsPerPage, pagination.count)}
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
            count={pagination.count}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onChangeDense={table.onChangeDense}
            onRowsPerPageChange={table.onChangeRowsPerPage}
          />
        </Card>
      </Container>

      {/* -------- BULK DELETE CONFIRM -------- */}
      <ConfirmDialog
        open={confirmDialog.value}
        onClose={confirmDialog.onFalse}
        title="Delete"
        content="Are you sure you want to delete selected expenses?"
        action={
          <Button variant="contained" color="error" onClick={handleDeleteRows}>
            Delete
          </Button>
        }
      />
    </>
  );
}
