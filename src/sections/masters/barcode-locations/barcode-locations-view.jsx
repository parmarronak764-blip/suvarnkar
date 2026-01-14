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

import { useBarcodeLocations } from 'src/hooks/useBarcodeLocations';
import { BarcodeLocationFormModal } from './barcode-location-form-modal';
import { BarcodeLocationTableRow } from './barcode-location-table-row';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'location_name', label: 'Location Name' },
  { id: 'box_code', label: 'Box Code' },
  { id: 'qr_code', label: 'QR Code' },
  { id: 'qr_code_url', label: 'QR Code URL' },
  { id: 'box_weight', label: 'Box Weight', align: 'right' },
  { id: 'company_name', label: 'Company' },
  { id: 'is_active', label: 'Status' },
  { id: 'created_at', label: 'Dates' },
  { id: '', width: 88 },
];

// ----------------------------------------------------------------------

export function BarcodeLocationsView() {
  const settings = useSettingsContext();

  const table = useTable();

  const {
    loading,
    fetchItems,
    createItem,
    createBulkItems,
    updateItem,
    deleteItem,
    refreshTrigger,
  } = useBarcodeLocations();

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
      console.error('Failed to fetch barcode locations:', error);
      toast.error('Failed to load barcode locations');
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
          toast.success('Barcode location deleted successfully!');
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
        toast.success(`${successCount} barcode location(s) deleted successfully!`);
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
    async (formData, isBulkOperation = false) => {
      try {
        let result;

        if (isBulkOperation) {
          result = await createBulkItems(formData);
        } else if (currentItem) {
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
    [currentItem, createItem, createBulkItems, updateItem]
  );

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <CustomBreadcrumbs
          heading="Barcode Locations"
          links={[
            { name: 'Dashboard', href: '/dashboard' },
            { name: 'Masters', href: '/masters' },
            { name: 'Barcode Locations' },
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
                <IconButton color="primary" onClick={handleDeleteRows}>
                  <Iconify icon="solar:trash-bin-trash-bold" />
                </IconButton>
              }
            />

            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 1400 }}>
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
                        <BarcodeLocationTableRow
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

      <BarcodeLocationFormModal
        open={modalOpen}
        onClose={handleCloseModal}
        currentItem={currentItem}
        onSave={handleSave}
        loading={loading}
      />
    </>
  );
}
