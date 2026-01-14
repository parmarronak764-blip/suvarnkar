import { useState, useCallback, useEffect } from 'react';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Box from '@mui/material/Box';

import { useSettingsContext } from 'src/components/settings';
import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useBoolean, useSetState } from 'minimal-shared/hooks';
import { useTable, getComparator, rowInPage } from 'src/components/table';

import {
  TableNoData,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import { useDiamonds } from 'src/hooks/useDiamonds';
import { DiamondModal } from './diamond-modal';
import { DiamondsTableToolbar } from './diamonds-table-toolbar';
import { DiamondsTableRow } from './diamonds-table-row';
import { DiamondsTableFiltersResult } from './diamonds-table-filters-result';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'clarity', label: 'Clarity', width: 120 },
  { id: 'shape', label: 'Shape', width: 120 },
  { id: 'size_range', label: 'Size Range', width: 140 },
  { id: 'carat', label: 'Carat', width: 120 },
  { id: 'todays_rate', label: "Today's Rate", width: 140 },
  { id: 'company_name', label: 'Company', width: 200 },
  { id: 'is_active', label: 'Status', width: 100 },
  { id: 'created_at', label: 'Created', width: 150 },
  { id: '', width: 88 },
];

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters }) {
  const { name, status } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (item) =>
        (item.clarity?.name &&
          item.clarity.name.toLowerCase().indexOf(name.toLowerCase()) !== -1) ||
        (item.shape?.name && item.shape.name.toLowerCase().indexOf(name.toLowerCase()) !== -1) ||
        (item.size_range?.range_value &&
          item.size_range.range_value.toLowerCase().indexOf(name.toLowerCase()) !== -1) ||
        (item.carat?.name && item.carat.name.toLowerCase().indexOf(name.toLowerCase()) !== -1) ||
        (item.todays_rate && item.todays_rate.toLowerCase().indexOf(name.toLowerCase()) !== -1) ||
        (item.company_name && item.company_name.toLowerCase().indexOf(name.toLowerCase()) !== -1)
    );
  }

  if (status !== 'all') {
    if (status === 'active') {
      inputData = inputData.filter((item) => item.is_active === true);
    } else if (status === 'inactive') {
      inputData = inputData.filter((item) => item.is_active === false);
    }
  }

  return inputData;
}

// ----------------------------------------------------------------------

export function DiamondsView() {
  const settings = useSettingsContext();

  const table = useTable();
  const confirmDialog = useBoolean();

  const [modalOpen, setModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const filters = useSetState({ name: '', status: 'all' });
  const { state: currentFilters, setState: updateFilters } = filters;

  // Use diamonds API hook
  const {
    data: apiData,
    loading,
    pagination,
    fetchDiamonds,
    createDiamond,
    updateDiamond,
    deleteDiamond,
    deleteDiamonds,
    refreshTrigger,
  } = useDiamonds();

  // Use only API data
  const tableData = apiData || [];

  // Load data when component mounts or refresh is triggered
  useEffect(() => {
    fetchDiamonds(table.page + 1, table.rowsPerPage, currentFilters.name, currentFilters.status);
  }, [
    fetchDiamonds,
    refreshTrigger,
    table.page,
    table.rowsPerPage,
    currentFilters.name,
    currentFilters.status,
  ]);

  // Use server-side pagination data directly
  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters: currentFilters,
  });

  // Use server-side pagination instead of client-side slicing
  const dataInPage = dataFiltered;

  const canReset = !!currentFilters.name || currentFilters.status !== 'all';

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleDeleteRow = useCallback(
    async (id) => {
      try {
        const response = await deleteDiamond(id);
        if (response.success) {
          toast.success('Diamond deleted successfully!');
          table.onUpdatePageDeleteRow(dataInPage.length);
        } else {
          toast.error(response.message || 'Delete failed!');
        }
      } catch {
        toast.error('Delete failed!');
      }
    },
    [deleteDiamond, table, dataInPage.length]
  );

  const handleDeleteRows = useCallback(async () => {
    try {
      const response = await deleteDiamonds(table.selected);
      if (response.success) {
        toast.success(`${response.count} diamonds deleted successfully!`);
        table.onUpdatePageDeleteRows({
          totalRowsInPage: dataInPage.length,
          totalRowsFiltered: dataFiltered.length,
        });
      } else {
        toast.error(response.message || 'Delete failed!');
      }
    } catch {
      toast.error('Delete failed!');
    }
  }, [deleteDiamonds, table, dataInPage.length, dataFiltered.length]);

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
          // Update existing diamond
          response = await updateDiamond(currentItem.id, formData);
        } else {
          // Create new diamond
          response = await createDiamond(formData);
        }

        if (response.success) {
          toast.success(
            currentItem ? 'Diamond updated successfully!' : 'Diamond created successfully!'
          );
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
    [currentItem, updateDiamond, createDiamond]
  );

  const renderConfirmDialog = () => (
    <ConfirmDialog
      open={confirmDialog.value}
      onClose={confirmDialog.onFalse}
      title="Delete"
      content={
        <>
          Are you sure want to delete <strong> {table.selected.length} </strong> diamonds?
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

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <CustomBreadcrumbs
        heading="Diamonds"
        links={[
          { name: 'Dashboard', href: '/dashboard' },
          { name: 'Masters', href: '/masters' },
          { name: 'Diamonds' },
        ]}
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={handleAddClick}
          >
            Add Diamond
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <DiamondsTableToolbar filters={filters} onResetPage={table.onResetPage} />

        {canReset && (
          <DiamondsTableFiltersResult
            filters={filters}
            totalResults={dataFiltered.length}
            onResetPage={table.onResetPage}
            sx={{ p: 2.5, pt: 0 }}
          />
        )}

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
              <Tooltip title="Delete">
                <IconButton color="primary" onClick={confirmDialog.onTrue}>
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
                        Loading diamonds...
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  dataFiltered.map((row) => (
                    <DiamondsTableRow
                      key={row.id}
                      row={row}
                      selected={table.selected.includes(row.id)}
                      onSelectRow={() => table.onSelectRow(row.id)}
                      onDeleteRow={() => handleDeleteRow(row.id)}
                      onEditRow={() => handleEditClick(row)}
                    />
                  ))
                )}

                <TableNoData notFound={notFound} />
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>

        <TablePaginationCustom
          count={pagination.count}
          page={table.page}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onRowsPerPageChange={table.onChangeRowsPerPage}
          dense={table.dense}
          onChangeDense={table.onChangeDense}
        />
      </Card>

      {renderConfirmDialog()}

      <DiamondModal
        open={modalOpen}
        onClose={handleModalClose}
        currentItem={currentItem}
        onSave={handleModalSave}
        loading={loading}
      />
    </Container>
  );
}
