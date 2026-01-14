import { useState, useCallback, useEffect } from 'react';
import { useBoolean } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Stack from '@mui/material/Stack';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';

import { paths } from 'src/routes/paths';
import { useSettingsContext } from 'src/components/settings';

import { useMetalColors } from 'src/hooks/useMetalColors';

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

import { MetalColorFormModal } from './metal-color-form-modal';
import { MetalColorTableRow } from './metal-color-table-row';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'metal_color', label: 'Metal Color', width: 200 },
  { id: 'company_name', label: 'Company', width: 150 },
  { id: 'is_active', label: 'Status', width: 100 },
  { id: 'created_at', label: 'Created', width: 130 },
  { id: 'updated_at', label: 'Updated', width: 130 },
  { id: 'action', label: 'Action', width: 88 },
];

// ----------------------------------------------------------------------

export function MetalColorsView() {
  const settings = useSettingsContext();
  const table = useTable();
  const confirmDialog = useBoolean();
  const formModal = useBoolean();

  const [tableData, setTableData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentItem, setCurrentItem] = useState(null);

  const { loading, fetchItems, createItem, updateItem, deleteItem, deleteItems, refreshTrigger } =
    useMetalColors();

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
  });

  const notFound = !loading && !dataFiltered.length;

  const loadData = useCallback(async () => {
    try {
      const result = await fetchItems(table.page + 1, table.rowsPerPage);
      setTableData(result.items || []);
      setTotalCount(result.total || 0);
    } catch (error) {
      console.error('Failed to fetch metal colors:', error);
      toast.error('Failed to load metal colors');
    }
  }, [fetchItems, table.page, table.rowsPerPage]);

  useEffect(() => {
    loadData();
  }, [table.page, table.rowsPerPage, refreshTrigger, loadData]);

  const handleDeleteRow = useCallback(
    async (id) => {
      const result = await deleteItem(id);
      if (result.success) {
        toast.success('Metal color deleted successfully!');
        await loadData();
      } else {
        toast.error(result.message || 'Failed to delete metal color');
      }
    },
    [deleteItem, loadData]
  );

  const handleDeleteRows = useCallback(
    async (ids) => {
      const result = await deleteItems(ids);
      if (result.success) {
        toast.success(`Successfully deleted ${result.deletedCount} metal color(s)!`);
        table.onSelectAllRows(false, []);
        await loadData();
      } else {
        toast.error(result.message || 'Failed to delete metal colors');
      }
    },
    [deleteItems, table, loadData]
  );

  const handleEditRow = useCallback(
    (row) => {
      setCurrentItem(row);
      formModal.onTrue();
    },
    [formModal]
  );

  const handleSave = useCallback(
    async (id, itemData) => {
      if (id) {
        const result = await updateItem(id, itemData);
        return result;
      }
      const result = await createItem(itemData);
      return result;
    },
    [createItem, updateItem]
  );

  const handleCloseModal = useCallback(() => {
    formModal.onFalse();
    setCurrentItem(null);
  }, [formModal]);

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <CustomBreadcrumbs
          heading="Metal Colors"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Masters', href: paths.dashboard.group.root },
            { name: 'Metal Colors' },
          ]}
          action={
            <Button
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={formModal.onTrue}
            >
              Add
            </Button>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Stack spacing={3}>
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
                          <MetalColorTableRow
                            key={row.id}
                            row={row}
                            selected={table.selected.includes(row.id)}
                            onSelectRow={() => table.onSelectRow(row.id)}
                            onDeleteRow={() => handleDeleteRow(row.id)}
                            onEditRow={() => handleEditRow(row)}
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
        </Stack>

        <MetalColorFormModal
          open={formModal.value}
          onClose={handleCloseModal}
          currentItem={currentItem}
          onSave={handleSave}
          loading={loading}
        />
      </Container>
      <ConfirmDialog
        open={confirmDialog.value}
        onClose={confirmDialog.onFalse}
        title="Delete Metal Colors"
        content={
          <>
            Are you sure you want to delete <strong>{table.selected.length}</strong> metal color(s)?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows(table.selected);
              confirmDialog.onFalse();
            }}
          >
            Delete
          </Button>
        }
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

  inputData = stabilizedThis.map((el) => el[0]);

  return inputData;
}
