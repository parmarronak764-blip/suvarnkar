import { useEffect, useState } from 'react';
import { useBoolean } from 'minimal-shared/hooks';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

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

import { Form, Field } from 'src/components/hook-form';
import { ExpenseTableRow } from './expense-table-row';

import { getExpenses, deleteExpense } from 'src/redux/slices/expense.slice';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import { ExpenseFilters } from './expense-filters';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'srno', label: 'Sr No', width: 80 },
  { id: 'date', label: 'Date' },
  { id: 'company', label: 'Company' },
  { id: 'paymentType', label: 'Payment Type' },
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

  // 🔍 Search state
  const [search, setSearch] = useState('');

  const [filters, setFilters] = useState({
    from_date: null,
    to_date: null,
  });

  // 📝 Date filter form
  const methods = useForm({
    defaultValues: {
      from_date: null,
      to_date: null,
    },
  });

  // ---------------- FETCH DATA ----------------
  useEffect(() => {
    dispatch(
      getExpenses({
        company_id: 1,
        page: table.page + 1,
        page_size: table.rowsPerPage,
        from_date: filters.from_date,
        to_date: filters.to_date,
        search,
        ordering: table.orderBy,
      })
    );
  }, [
    dispatch,
    table.page,
    table.rowsPerPage,
    table.order,
    table.orderBy,
    filters.from_date,
    filters.to_date,
    search,
  ]);

  const notFound = !loading && expenses.length === 0;

  // ---------------- DELETE ----------------
  const handleDeleteRow = (id) => {
    dispatch(deleteExpense({ id, company_id: 1 }));
    toast.success('Expense deleted successfully!');
  };

  const handleDeleteRows = () => {
    table.onSelectAllRows(false, []);
    confirmDialog.onFalse();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
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

        {/* FILTERS */}
        <ExpenseFilters
          onFilterChange={(data) => {
            setFilters(data);
            table.onChangePage(null, 0);
          }}
          onSearchChange={(value) => {
            setSearch(value);
            table.onChangePage(null, 0);
          }}
          onReset={() => {
            setFilters({ from_date: null, to_date: null });
            setSearch('');
            table.onChangePage(null, 0);
          }}
        />

        {/* TABLE */}
        <Card>
          <Box sx={{ position: 'relative' }}>
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
                />

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={TABLE_HEAD.length} sx={{ textAlign: 'center', py: 8 }}>
                        Loading expenses...
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
    </LocalizationProvider>
  );
}
