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

import { usePacking } from 'src/hooks/usePacking';

import { PackingTableRow } from './packing-table-row';
import { PackingFormModal } from './packing-form-modal';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'material_name', label: 'Material Name', width: 200 },
  { id: 'material_weight', label: 'Weight', width: 120 },
  { id: 'material_code', label: 'Material Code', width: 150 },
  { id: 'remarks', label: 'Remarks', width: 200 },
  { id: 'company_name', label: 'Company', width: 180 },
  { id: 'is_active', label: 'Status', width: 100 },
  { id: 'created_at', label: 'Created', width: 150 },
  { id: 'action', label: 'Action', width: 88 },
];

// ----------------------------------------------------------------------

export function PackingView() {
  const settings = useSettingsContext();

  const table = useTable();

  const confirm = useBoolean();

  const [tableData, setTableData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  const { loading, fetchItems, createItem, updateItem, deleteItem, deleteItems, refreshTrigger } =
    usePacking();

  const [currentItem, setCurrentItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const notFound = !tableData.length;

  const loadData = useCallback(async () => {
    try {
      const result = await fetchItems({
        page: table.page + 1,
        page_size: table.rowsPerPage,
      });
      setTableData(result.items || []);
      setTotalCount(result.total || 0);
    } catch (error) {
      console.error('Failed to fetch packing materials:', error);
      toast.error('Failed to load packing materials');
    }
  }, [fetchItems, table.page, table.rowsPerPage]);

  useEffect(() => {
    loadData();
  }, [table.page, table.rowsPerPage, refreshTrigger, loadData]);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
  });

  const handleDeleteRow = useCallback(
    async (id) => {
      try {
        const result = await deleteItem(id);
        if (result.success) {
          toast.success('Packing material deleted successfully!');
          await loadData();
        } else {
          toast.error(result.message || 'Failed to delete packing material');
        }
      } catch (error) {
        console.error('Error deleting packing material:', error);
        toast.error('Failed to delete packing material');
      }
    },
    [deleteItem, loadData]
  );

  const handleDeleteRows = useCallback(async () => {
    try {
      const result = await deleteItems(table.selected);
      if (result.success) {
        toast.success(`${result.deletedCount} packing materials deleted successfully!`);
        await loadData();
        table.onSelectAllRows(false, []);
      } else {
        toast.error(result.message || 'Failed to delete packing materials');
      }
    } catch (error) {
      console.error('Error deleting packing materials:', error);
      toast.error('Failed to delete packing materials');
    }
  }, [deleteItems, table, loadData]);

  const handleOpenModal = (item = null) => {
    setCurrentItem(item);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setCurrentItem(null);
    setModalOpen(false);
  };

  const handleSave = useCallback(
    async (formData) => {
      try {
        let result;
        if (currentItem) {
          result = await updateItem(currentItem.id, formData);
        } else {
          result = await createItem(formData);
        }

        if (result.success) {
          const message = currentItem
            ? 'Packing material updated successfully!'
            : result.created_packings
              ? `${result.total_created} packing materials created successfully!`
              : 'Packing material created successfully!';
          toast.success(message);
          handleCloseModal();
        } else {
          return { success: false, message: result.message || 'Operation failed' };
        }
        return result;
      } catch (error) {
        return {
          success: false,
          message:
            error.message || error.response.data.message || 'Failed to save packing material',
        };
      }
    },
    [currentItem, updateItem, createItem]
  );

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <CustomBreadcrumbs
          heading="Packing Materials"
          links={[
            { name: 'Dashboard', href: '/' },
            { name: 'Masters', href: '/masters' },
            { name: 'Packing Materials' },
          ]}
          action={
            <Button
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={() => handleOpenModal()}
            >
              Add
            </Button>
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
                        <PackingTableRow
                          key={row.id}
                          row={row}
                          selected={table.selected.includes(row.id)}
                          onSelectRow={() => table.onSelectRow(row.id)}
                          onDeleteRow={() => handleDeleteRow(row.id)}
                          onEditRow={() => handleOpenModal(row)}
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

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
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
              confirm.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />

      <PackingFormModal
        open={modalOpen}
        onClose={handleCloseModal}
        currentItem={currentItem}
        onSave={handleSave}
      />
    </>
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
