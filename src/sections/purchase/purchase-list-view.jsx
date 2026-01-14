import { useState, useCallback, useEffect } from 'react';
import { useBoolean } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { toast } from 'src/components/snackbar';
import { useSettingsContext } from 'src/components/settings';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  useTable,
  TableNoData,
  getComparator,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import { usePurchases } from 'src/hooks/usePurchases';

import { PurchaseTableRow } from './purchase-table-row';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'purchase_number', label: 'Purchase No.', width: 140 },
  { id: 'bill_number', label: 'Bill No.', width: 120 },
  { id: 'bill_date', label: 'Bill Date', width: 120 },
  { id: 'dealer_name', label: 'Dealer Name', width: 200 },
  { id: 'company_name', label: 'Company Name', width: 180 },
  { id: 'bill_metal_type_name', label: 'Bill Type', width: 150 },
  { id: 'tag_selected', label: 'Tag Type', width: 100 },
  { id: 'total_purchase_amount', label: 'Total Amount', width: 140, align: 'right' },
  { id: 'created_at', label: 'Created At', width: 160 },
  { id: 'actions', label: 'Action', width: 88 },
];

// ----------------------------------------------------------------------

export function PurchaseListView() {
  const router = useRouter();
  const settings = useSettingsContext();
  const table = useTable();
  const confirm = useBoolean();

  const { getPurchases, deletePurchase, loading } = usePurchases();

  const [tableData, setTableData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const loadPurchases = async () => {
      const result = await getPurchases({
        page: table.page + 1,
        page_size: table.rowsPerPage,
      });

      if (result.success) {
        const items = result.items || result.data || [];
        setTableData(items);
        setTotalCount(result.total || items.length);
      } else {
        toast.error('Failed to load purchases');
      }
    };

    loadPurchases();
  }, [getPurchases, table.page, table.rowsPerPage]);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
  });

  const notFound = !loading && !dataFiltered.length;

  const handleDeleteRow = useCallback(
    async (id) => {
      try {
        const result = await deletePurchase(id);
        if (result.success) {
          toast.success('Purchase deleted successfully');
          // Refresh the purchases list to get updated data from server
          const refreshResult = await getPurchases({
            page: table.page + 1,
            page_size: table.rowsPerPage,
          });
          if (refreshResult.success) {
            const items = refreshResult.items || refreshResult.data || [];
            setTableData(items);
            setTotalCount(refreshResult.total || items.length);
          }
          table.onUpdatePageDeleteRow(dataFiltered.length);
        } else {
          toast.error(result.message || 'Failed to delete purchase');
        }
      } catch (error) {
        console.error('Error deleting purchase:', error);
        toast.error('Failed to delete purchase');
      }
    },
    [deletePurchase, getPurchases, dataFiltered.length, table]
  );

  const handleDeleteRows = useCallback(async () => {
    try {
      // Delete each selected purchase via API
      const deletePromises = table.selected.map((id) => deletePurchase(id));
      const results = await Promise.allSettled(deletePromises);

      // Process results
      const successfulDeletes = results.filter(
        (result) => result.status === 'fulfilled' && result.value.success
      );

      const successCount = successfulDeletes.length;
      const selectedCount = table.selected.length;

      if (successCount > 0) {
        // Refresh the purchases list to get updated data from server
        const refreshResult = await getPurchases({
          page: table.page + 1,
          page_size: table.rowsPerPage,
        });
        if (refreshResult.success) {
          const items = refreshResult.items || refreshResult.data || [];
          setTableData(items);
          setTotalCount(refreshResult.total || items.length);
        }

        if (successCount === selectedCount) {
          toast.success(`${successCount} purchase(s) deleted successfully`);
        } else {
          toast.warning(`${successCount} of ${selectedCount} purchase(s) deleted successfully`);
        }

        // Clear selection after deletion
        table.onSelectAllRows(false, []);
        table.onUpdatePageDeleteRows({
          // totalRowsInPage: dataFiltered.length,
          totalRowsFiltered: dataFiltered.length,
        });
      } else {
        toast.error('Failed to delete purchases');
      }
    } catch (error) {
      console.error('Error deleting purchases:', error);
      toast.error('Failed to delete purchases');
    }
  }, [deletePurchase, getPurchases, dataFiltered.length, dataFiltered.length, table]);

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.purchase.edit(id));
    },
    [router]
  );

  const handleViewRow = useCallback(
    (id) => {
      router.push(paths.purchase.details(id));
    },
    [router]
  );

  const handleAddClick = useCallback(() => {
    router.push(paths.purchase.creation);
  }, [router]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <CustomBreadcrumbs
        heading="Purchase List"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Purchase', href: paths.purchase.list },
          { name: 'List' },
        ]}
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={handleAddClick}
          >
            Add Purchase
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <Box sx={{ position: 'relative' }}>
          <TableSelectedAction
            dense={table.dense}
            numSelected={table.selected.length}
            rowCount={totalCount}
            onSelectAllRows={(checked) =>
              table.onSelectAllRows(
                checked,
                dataFiltered.map((row) => row.id)
              )
            }
            action={
              <Tooltip title="Delete">
                <IconButton color="primary" onClick={confirm.onTrue}>
                  <Iconify icon="solar:trash-bin-trash-bold" />
                </IconButton>
              </Tooltip>
            }
          />

          <Scrollbar>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headCells={TABLE_HEAD}
                rowCount={totalCount}
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    dataFiltered.map((row) => row.id)
                  )
                }
              />

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={TABLE_HEAD.length + 1} sx={{ textAlign: 'center', py: 8 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 1,
                        }}
                      >
                        <Iconify icon="svg-spinners:8-dots-rotate" width={24} />
                        Loading...
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {dataFiltered?.map((row) => (
                      <PurchaseTableRow
                        key={row.id}
                        row={row}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => table.onSelectRow(row.id)}
                        onDeleteRow={() => handleDeleteRow(row.id)}
                        onEditRow={() => handleEditRow(row.id)}
                        onViewRow={() => handleViewRow(row.id)}
                      />
                    ))}

                    <TableNoData notFound={notFound} />
                  </>
                )}
              </TableBody>
            </Table>
          </Scrollbar>
        </Box>

        <Box sx={{ position: 'relative' }}>
          <TablePaginationCustom
            count={totalCount}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            dense={table.dense}
            onChangeDense={table.onChangeDense}
          />
        </Box>
      </Card>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete Purchases"
        content={
          <>
            Are you sure you want to delete <strong> {table.selected.length} </strong> purchases?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows();
              confirm.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />
    </Container>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator }) {
  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  return stabilizedThis.map((el) => el[0]);
}
