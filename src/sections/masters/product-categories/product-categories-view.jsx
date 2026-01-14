import { useState, useCallback, useEffect } from 'react';
import { useBoolean } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';

import { useSettingsContext } from 'src/components/settings';

import { toast } from 'src/components/snackbar';
import { PermissionGate } from 'src/components/PermissionGate';
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

import { useProductCategories } from 'src/hooks/useProductCategories';

import { ProductCategoriesTableRow } from './product-categories-table-row';
import { ProductCategoriesFormModal } from './product-categories-form-modal';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Category Name', width: 200 },
  { id: 'stock_type_name', label: 'Stock Type', width: 140 },
  { id: 'metal_type_name', label: 'Metal Type', width: 140 },
  { id: 'is_active', label: 'Status', width: 100 },
  { id: 'company_name', label: 'Company', width: 200 },
  { id: 'created_at', label: 'Created', width: 150 },
  { id: 'action', label: 'Action', width: 88 },
];

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

// ----------------------------------------------------------------------

export function ProductCategoriesView() {
  const settings = useSettingsContext();
  const table = useTable();
  const confirmDialog = useBoolean();

  const [modalOpen, setModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  // Use API hook
  const {
    data: apiData,
    loading,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    deleteItems,
    refreshTrigger,
  } = useProductCategories();

  const tableData = apiData || [];

  const loadData = useCallback(async () => {
    try {
      const result = await fetchItems({
        page: table.page + 1,
        page_size: table.rowsPerPage,
      });

      if (result) {
        setTotalCount(result.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch product categories:', error);
      toast.error('Failed to load product categories');
    }
  }, [fetchItems, table.page, table.rowsPerPage]);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table.page, table.rowsPerPage, refreshTrigger]);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
  });

  const notFound = !dataFiltered.length;

  const handleDeleteRow = useCallback(
    async (id) => {
      try {
        const response = await deleteItem(id);
        if (response.success) {
          toast.success('Delete success!');
          await loadData();
        } else {
          toast.error(response.message || 'Delete failed!');
        }
      } catch {
        toast.error('Delete failed!');
      }
    },
    [deleteItem, loadData]
  );

  const handleDeleteRows = useCallback(async () => {
    try {
      const response = await deleteItems(table.selected);
      if (response.success) {
        toast.success(`Successfully deleted ${response.deletedCount} items!`);
        await loadData();
        table.onSelectAllRows(false, []);
      } else {
        toast.error(response.message || 'Delete failed!');
      }
    } catch {
      toast.error('Delete failed!');
    }
  }, [deleteItems, loadData, table]);

  // Modal handlers
  const handleAddClick = useCallback(() => {
    setCurrentItem(null);
    setModalOpen(true);
  }, []);

  const handleEditClick = useCallback((item) => {
    setCurrentItem(item);
    setModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    setCurrentItem(null);
  }, []);

  const handleModalSave = useCallback(
    async (formData) => {
      try {
        let response;
        if (currentItem) {
          // Update existing item
          response = await updateItem(currentItem.id, formData);
        } else {
          // Create new item
          response = await createItem(formData);
        }

        if (response.success) {
          // Reset to first page after create/update
          table.onChangePage(null, 0);
          
          if (currentItem) {
            toast.success('Product category updated successfully!');
          } else if (formData.isBulkEntry) {
            const count = formData.names ? formData.names.length : 1;
            toast.success(`${count} product categories created successfully!`);
          } else {
            toast.success('Product category created successfully!');
          }
          return response;
        } else {
          toast.error(response.message || 'Operation failed!');
          throw new Error(response.message || 'Operation failed');
        }
      } catch (error) {
        toast.error('Operation failed!');
        throw error;
      }
    },
    [currentItem, updateItem, createItem, table]
  );

  const renderConfirmDialog = () => (
    <ConfirmDialog
      open={confirmDialog.value}
      onClose={confirmDialog.onFalse}
      title="Delete"
      content={
        <>
          Are you sure want to delete <strong> {table.selected.length} </strong> items?
        </>
      }
      action={
        <Button
          variant="contained"
          color="error"
          onClick={() => {
            handleDeleteRows();
            confirmDialog.onFalse();
          }}
        >
          Delete
        </Button>
      }
    />
  );

  const renderModal = () => (
    <ProductCategoriesFormModal
      open={modalOpen}
      onClose={handleModalClose}
      currentItem={currentItem}
      onSave={handleModalSave}
      loading={loading}
    />
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <CustomBreadcrumbs
        heading="Product Categories"
        links={[
          { name: 'Dashboard', href: '/dashboard' },
          { name: 'Masters', href: '/masters' },
          { name: 'Product Categories' },
        ]}
        action={
          <PermissionGate permission="product_categories.create">
            <Button
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={handleAddClick}
            >
              Add
            </Button>
          </PermissionGate>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <Box sx={{ position: 'relative' }}>
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
              <PermissionGate permission="product_categories.delete">
                <Tooltip title="Delete">
                  <IconButton color="primary" onClick={confirmDialog.onTrue}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              </PermissionGate>
            }
          />

          <Scrollbar>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headCells={TABLE_HEAD}
                rowCount={dataFiltered.length}
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
                  // Loading state
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
                    {dataFiltered.map((row) => (
                      <ProductCategoriesTableRow
                        key={row.id}
                        row={row}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => table.onSelectRow(row.id)}
                        onDeleteRow={() => handleDeleteRow(row.id)}
                        onEditRow={() => handleEditClick(row)}
                      />
                    ))}

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
          count={totalCount}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onChangeDense={table.onChangeDense}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>

      {renderConfirmDialog()}

      {renderModal()}
    </Container>
  );
}
