import { useState, useCallback, useEffect } from 'react';

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
import Stack from '@mui/material/Stack';

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

import { useCustomerGroups } from 'src/hooks/useCustomerGroups';
import { CustomerGroupFormModal } from './customer-group-form-modal';
import { CustomerGroupTableRow } from './customer-group-table-row';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'group_name', label: 'Group Name', width: 200 },
  { id: 'company_name', label: 'Company', width: 150 },
  { id: 'is_active', label: 'Status', width: 100 },
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

export default function CustomerGroupsView() {
  const settings = useSettingsContext();
  const table = useTable();
  const confirmDialog = useBoolean();

  const [modalOpen, setModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  // Use API hook
  const {
    data: apiData,
    pagination,
    loading,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    deleteItems,
    refreshTrigger,
  } = useCustomerGroups();

  const tableData = apiData || [];

  const loadData = useCallback(async () => {
    await fetchItems(table.page + 1, table.rowsPerPage);
  }, [fetchItems, table.page, table.rowsPerPage]);

  useEffect(() => {
    loadData();
  }, [table.page, table.rowsPerPage, refreshTrigger, loadData]);

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
  }, [deleteItems, table, loadData]);

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
          response = await updateItem(currentItem.id, formData);
        } else {
          response = await createItem(formData);
        }

        if (response.success) {
          if (currentItem) {
            toast.success('Customer group updated successfully!');
          } else {
            toast.success('Customer group created successfully!');
          }
          return response;
        } else {
          return response;
        }
      } catch (error) {
        return { success: false, message: error.message || 'Operation failed!' };
      }
    },
    [currentItem, updateItem, createItem]
  );

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

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
    <CustomerGroupFormModal
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
        heading="EMI Customer Groups"
        links={[
          { name: 'Dashboard', href: '/dashboard' },
          { name: 'Masters', href: '/masters' },
          { name: 'EMI Customer Groups' },
        ]}
        action={
          <PermissionGate permission="customer_groups.create">
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

      <Stack spacing={3}>
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
                <PermissionGate permission="customer_groups.delete">
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
                        <CustomerGroupTableRow
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

            <TablePaginationCustom
              count={pagination?.count || 0}
              page={table.page}
              rowsPerPage={table.rowsPerPage}
              onPageChange={table.onChangePage}
              onRowsPerPageChange={table.onChangeRowsPerPage}
              dense={table.dense}
              onChangeDense={table.onChangeDense}
            />
          </Box>
        </Card>
      </Stack>

      {renderModal()}
      {renderConfirmDialog()}
    </Container>
  );
}

// Simple useBoolean hook
const useBoolean = (defaultValue = false) => {
  const [value, setValue] = useState(defaultValue);
  return {
    value,
    onTrue: () => setValue(true),
    onFalse: () => setValue(false),
    onToggle: () => setValue(!value),
  };
};
