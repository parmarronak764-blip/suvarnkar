import { useState, useCallback, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import IconButton from '@mui/material/IconButton';

import { useSettingsContext } from 'src/components/settings';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { getApiErrorMessage } from 'src/utils/error-handler';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  useTable,
  TableNoData,
  getComparator,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import { useProducts } from 'src/hooks/useProducts';
import { PermissionGate } from 'src/components/PermissionGate';
import { ProductFormModal } from './product-form-modal';
import { ProductTableRow } from './product-table-row';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'product_name', label: 'Product Name' },
  { id: 'product_category', label: 'Category' },
  { id: 'carats', label: 'Carats' },
  { id: 'tag_prefix', label: 'Tag Prefix' },
  { id: 'opening_gross_weight', label: 'Gross Weight', align: 'right' },
  { id: 'opening_less_weight', label: 'Less Weight', align: 'right' },
  { id: 'opening_net_weight', label: 'Net Weight', align: 'right' },
  { id: 'opening_quantity', label: 'Quantity', align: 'right' },
  { id: 'average_rate', label: 'Avg Rate', align: 'right' },
  { id: 'tag_weight', label: 'Tag Weight', align: 'right' },
  { id: 'box_weight', label: 'Box Weight', align: 'right' },
  { id: 'is_active', label: 'Status' },
  { id: '', width: 88 },
];

// ----------------------------------------------------------------------

export function ProductsView() {
  const settings = useSettingsContext();

  const table = useTable();

  const { loading, fetchItems, createItem, updateItem, deleteItem, refreshTrigger } = useProducts();

  const [tableData, setTableData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentItem, setCurrentItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const dataFiltered = tableData.sort(getComparator(table.order, table.orderBy));

  const notFound = !dataFiltered.length;

  const loadData = useCallback(async () => {
    try {
      const result = await fetchItems({
        page: table.page + 1,
        page_size: table.rowsPerPage,
      });
      setTableData(result.items || []);
      setTotalCount(result.total || 0);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to load products');
    }
  }, [fetchItems, table.page, table.rowsPerPage]);

  useEffect(() => {
    loadData();
  }, [table.page, table.rowsPerPage, refreshTrigger, loadData]);

  const handleDeleteRow = useCallback(
    async (id) => {
      try {
        const result = await deleteItem(id);
        if (result.success) {
          toast.success('Product deleted successfully!');
          await loadData();
        } else {
          toast.error(result.message || 'Delete failed!');
        }
      } catch (error) {
        console.error('Delete failed:', error);
        const errorMessage = getApiErrorMessage(null, error, 'Delete failed!');
        toast.error(errorMessage);
      }
    },
    [deleteItem, loadData]
  );

  const handleDeleteRows = useCallback(async () => {
    try {
      const deletePromises = table.selected.map((id) => deleteItem(id));
      const results = await Promise.all(deletePromises);

      const successCount = results.filter((result) => result.success).length;

      if (successCount > 0) {
        toast.success(`${successCount} product(s) deleted successfully!`);
        await loadData();
        table.onSelectAllRows(false, []);
      }
    } catch (error) {
      console.error('Delete failed:', error);
      const errorMessage = getApiErrorMessage(null, error, 'Delete failed!');
      toast.error(errorMessage);
    }
  }, [deleteItem, table, loadData]);

  const handleOpenModal = useCallback((item = null) => {
    setCurrentItem(item);
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setCurrentItem(null);
    setModalOpen(false);
  }, []);

  const handleSave = useCallback(
    async (formData) => {
      try {
        let result;
        if (currentItem) {
          result = await updateItem(currentItem.id, formData);
        } else {
          result = await createItem(formData);
        }

        if (result.success || result.id) {
          return result;
        } else {
          throw new Error(result.message || 'Operation failed!');
        }
      } catch (error) {
        console.error('Operation failed:', error);
        const errorMessage = getApiErrorMessage(null, error, 'Operation failed!');
        toast.error(errorMessage);
        throw error;
      }
    },
    [currentItem, updateItem, createItem]
  );

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <CustomBreadcrumbs
          heading="Products"
          links={[
            { name: 'Dashboard', href: '/dashboard' },
            { name: 'Masters', href: '/masters' },
            { name: 'Products' },
          ]}
          action={
            <PermissionGate permission="products.create">
              <Button
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
                onClick={() => handleOpenModal()}
              >
                Add
              </Button>
            </PermissionGate>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Card>
          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={dataFiltered.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  dataFiltered.map((row) => row.id)
                )
              }
              action={
                <PermissionGate permission="products.delete">
                  <IconButton color="primary" onClick={handleDeleteRows}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </PermissionGate>
              }
            />

            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 1200 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headCells={TABLE_HEAD}
                  rowCount={dataFiltered.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  // onSelectAllRows={(checked) =>
                  //   table.onSelectAllRows(
                  //     checked,
                  //     dataFiltered.map((row) => row.id)
                  //   )
                  // }
                />

                <TableBody>
                  {loading ? (
                    // Loading state
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
                          Loading...
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                      {dataFiltered.map((row) => (
                        <ProductTableRow
                          key={row.id}
                          row={row}
                          selected={table.selected.includes(row.id)}
                          // onSelectRow={() => table.onSelectRow(row.id)}
                          // onDeleteRow={() => handleDeleteRow(row.id)}
                          onEditRow={() => handleOpenModal(row)}
                        />
                      ))}

                      <TableNoData notFound={notFound} />
                    </>
                  )}
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={totalCount}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            dense={table.dense}
            onChangeDense={table.onChangeDense}
          />
        </Card>
      </Container>

      <ProductFormModal
        open={modalOpen}
        onClose={handleCloseModal}
        currentItem={currentItem}
        onSave={handleSave}
        loading={loading}
      />
    </>
  );
}
