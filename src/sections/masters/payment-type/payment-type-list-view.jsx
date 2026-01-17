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

import { PaymentTypeTableRow } from './payment-type-table-row';

import { getPaymentTypes, deletePaymentType } from 'src/redux/slices/paymentType.slice';
import { toast } from 'sonner';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'company', label: 'Company ID' },
  { id: 'name', label: 'Name' },
  { id: 'description', label: 'Description' },
  {
    id: 'balance',
    label: 'Balance',
  },
  { id: 'status', label: 'Status' },
  { id: 'action', label: 'Action', width: 88 },
];

// ----------------------------------------------------------------------

export function PaymentTypeListView() {
  const settings = useSettingsContext();
  const table = useTable();
  const confirmDialog = useBoolean();
  const dispatch = useDispatch();

  const { paymentTypes, loading, count } = useSelector((state) => state.paymentType);

  // ---------------- LOAD DATA ----------------
  useEffect(() => {
    dispatch(
      getPaymentTypes({
        page: table.page + 1,
        page_size: table.rowsPerPage,
      })
    );
  }, [dispatch, table.page, table.rowsPerPage]);

  // ---------------- DELETE SINGLE ----------------
  const handleDeleteRow = async (id) => {
    try {
      await dispatch(deletePaymentType(id)).unwrap();

      toast.success('Payment type deleted successfully!');

      if (paymentTypes.length === 1 && table.page > 0) {
        table.onChangePage(null, table.page - 1);
      } else {
        dispatch(
          getPaymentTypes({
            page: table.page + 1,
            page_size: table.rowsPerPage,
          })
        );
      }
    } catch (error) {
      toast.error(error?.message || 'Failed to delete payment type');
    }
  };

  // ---------------- DELETE MULTIPLE ----------------
  const handleDeleteRows = async () => {
    await Promise.all(table.selected.map((id) => dispatch(deletePaymentType(id))));

    table.onSelectAllRows(false, []);
  };

  const notFound = !loading && paymentTypes.length === 0;

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <CustomBreadcrumbs
          heading="Payment Type List"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Expenses' },
            { name: 'Payment Types' },
            { name: 'List' },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.masters.addPaymentType}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              Add Payment Type
            </Button>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Card>
          <Box sx={{ position: 'relative' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={paymentTypes.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  paymentTypes.map((row) => row.id)
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
                  rowCount={paymentTypes.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
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
                          Loading payment types...
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                      {paymentTypes.map((row) => (
                        <PaymentTypeTableRow
                          key={row.id}
                          row={row}
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

      {/* -------- BULK DELETE -------- */}
      <ConfirmDialog
        open={confirmDialog.value}
        onClose={confirmDialog.onFalse}
        title="Delete"
        content="Are you sure you want to delete selected payment types?"
        action={
          <Button variant="contained" color="error" onClick={handleDeleteRows}>
            Delete
          </Button>
        }
      />
    </>
  );
}
