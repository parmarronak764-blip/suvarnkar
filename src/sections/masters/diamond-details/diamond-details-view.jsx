import { useState, useCallback, useEffect } from 'react';
import { varAlpha } from 'minimal-shared/utils';
import { useBoolean, useSetState } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
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
import { Label } from 'src/components/label';
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

import { useDiamondDetails } from 'src/hooks/useDiamondDetails';
import { usePermissions } from 'src/hooks/usePermissions';
import { PermissionGate } from 'src/components/PermissionGate';

import { DiamondTableRow } from './diamond-table-row';
import { DiamondTableFiltersResult } from './diamond-table-filters-result';
import { DiamondFormModal } from './diamond-form-modal';
import { ClarityModal } from './clarity-modal';
import { ShapeModal } from './shape-modal';
import { SizeRangeModal } from './size-range-modal';
import { ColorModal } from './color-modal';
import { CertificateTypeModal } from './certificate-type-modal';

const TABS = [
  { value: 'clarity', label: 'Diamond Clarity', icon: 'solar:eye-bold' },
  { value: 'shape', label: 'Shape', icon: 'mdi:shape-square-rounded-plus' },
  { value: 'sizeRange', label: 'Size Range', icon: 'mdi:arrow-expand' },
  { value: 'color', label: 'Color', icon: 'solar:palette-bold' },
  { value: 'certificateType', label: 'Certificate Type', icon: 'eva:file-text-outline' },
];

const getTableHead = (category) => {
  if (category === 'clarity') {
    return [
      { id: 'shape', label: 'Shape', width: 120 },
      { id: 'size_range', label: 'Size Range', width: 140 },
      { id: 'carat', label: 'Carat', width: 120 },
      { id: 'todays_rate', label: "Today's Rate", width: 140 },
      { id: 'company_name', label: 'Company', width: 200 },
      { id: 'created_at', label: 'Created', width: 150 },
      { id: 'action', label: 'Action', width: 88 },
    ];
  }

  const baseColumns = [
    {
      id: category === 'sizeRange' ? 'range_value' : 'name',
      label: category === 'sizeRange' ? 'Range' : 'Name',
    },
  ];

  // Add shape column for size ranges
  if (category === 'sizeRange') {
    baseColumns.push({ id: 'shape_name', label: 'Shape', width: 120 });
  }

  baseColumns.push(
    { id: 'company_name', label: 'Company', width: 200 },
    { id: 'created_at', label: 'Created', width: 150 },
    { id: 'Action', label: 'Action', width: 88 }
  );

  return baseColumns;
};

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters, category }) {
  const { name, status } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter((item) => {
      if (category === 'clarity') {
        // Search across all diamond fields for clarity tab
        return (
          (item.clarity?.name &&
            item.clarity.name.toLowerCase().indexOf(name.toLowerCase()) !== -1) ||
          (item.shape?.name && item.shape.name.toLowerCase().indexOf(name.toLowerCase()) !== -1) ||
          (item.size_range?.range_value &&
            item.size_range.range_value.toLowerCase().indexOf(name.toLowerCase()) !== -1) ||
          (item.carat?.name && item.carat.name.toLowerCase().indexOf(name.toLowerCase()) !== -1) ||
          (item.todays_rate && item.todays_rate.toLowerCase().indexOf(name.toLowerCase()) !== -1) ||
          (item.company_name && item.company_name.toLowerCase().indexOf(name.toLowerCase()) !== -1)
        );
      } else {
        // Standard search for other categories
        const searchField = category === 'sizeRange' ? item.range_value : item.name;
        return (
          (searchField && searchField.toLowerCase().indexOf(name.toLowerCase()) !== -1) ||
          (item.company_name &&
            item.company_name.toLowerCase().indexOf(name.toLowerCase()) !== -1) ||
          (category === 'sizeRange' &&
            item.shape_name &&
            item.shape_name.toLowerCase().indexOf(name.toLowerCase()) !== -1)
        );
      }
    });
  }

  if (status !== 'all') {
    if (status === 'active') {
      inputData = inputData.filter((item) => item.is_active === true);
    } else if (status === 'banned' || status === 'inactive') {
      inputData = inputData.filter((item) => item.is_active === false);
    }
  }

  return inputData;
}

// ----------------------------------------------------------------------

export function DiamondDetailsView() {
  const settings = useSettingsContext();
  const table = useTable();
  const { hasPermission } = usePermissions();
  const confirmDialog = useBoolean();

  const [currentTab, setCurrentTab] = useState('clarity');
  const [modalOpen, setModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const filters = useSetState({ name: '', status: 'all' });
  const { state: currentFilters, setState: updateFilters } = filters;

  // Use API hook for current tab
  const {
    data: apiData,
    loading,
    pagination,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    deleteItems,
    refreshTrigger,
  } = useDiamondDetails(currentTab);

  // Use only API data - no mock data fallback
  const tableData = apiData || [];

  // Load data when tab changes or refresh is triggered
  useEffect(() => {
    fetchItems(table.page + 1, table.rowsPerPage, currentFilters.name, currentFilters.status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentTab,
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
    category: currentTab,
  });

  // Use server-side pagination instead of client-side slicing
  const dataInPage = dataFiltered;

  const canReset = !!currentFilters.name || currentFilters.status !== 'all';

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleDeleteRow = useCallback(
    async (id) => {
      try {
        const response = await deleteItem(id);
        if (response.success) {
          toast.success('Delete success!');
          table.onUpdatePageDeleteRow(dataInPage.length);
        } else {
          toast.error(response.message || 'Delete failed!');
        }
      } catch {
        toast.error('Delete failed!');
      }
    },
    [deleteItem, table, dataInPage.length]
  );

  const handleDeleteRows = useCallback(async () => {
    try {
      const response = await deleteItems(table.selected);
      if (response.success) {
        toast.success(`Successfully deleted ${response.deletedCount} items!`);
        table.onUpdatePageDeleteRows(dataInPage.length, dataFiltered.length);
        table.onSelectAllRows(false, []);
      } else {
        toast.error(response.message || 'Delete failed!');
      }
    } catch {
      toast.error('Delete failed!');
    }
  }, [deleteItems, table, dataInPage.length, dataFiltered.length]);

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      table.onResetPage();
      updateFilters({ status: newValue });
    },
    [updateFilters, table]
  );

  const handleChangeTab = useCallback(
    (event, newValue) => {
      setCurrentTab(newValue);
      table.onResetPage();
      updateFilters({ name: '', status: 'all' });
      table.onSelectAllRows(false, []);
      // Close modal when switching tabs
      setModalOpen(false);
      setCurrentItem(null);
    },
    [table, updateFilters]
  );

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
          if (currentItem) {
            toast.success('Item updated successfully!');
          } else if (formData.isBulkEntry) {
            const count = formData.names
              ? formData.names.length
              : formData.range_values
                ? formData.range_values.length
                : 1;
            toast.success(`${count} items created successfully!`);
          } else {
            toast.success('Item created successfully!');
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
    [currentItem, updateItem, createItem]
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

  const renderCategoryModal = () => {
    const modalProps = {
      open: modalOpen,
      onClose: handleModalClose,
      currentItem,
      onSave: handleModalSave,
      loading,
    };

    switch (currentTab) {
      case 'clarity':
        return <ClarityModal {...modalProps} />;
      case 'shape':
        return <ShapeModal {...modalProps} />;
      case 'sizeRange':
        return <SizeRangeModal {...modalProps} />;
      case 'color':
        return <ColorModal {...modalProps} />;
      case 'certificateType':
        return <CertificateTypeModal {...modalProps} />;
      default:
        return <DiamondFormModal {...modalProps} categoryLabel="Diamond Item" />;
    }
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <CustomBreadcrumbs
        heading="Diamond Details"
        links={[
          { name: 'Dashboard', href: '/dashboard' },
          { name: 'Masters', href: '/masters' },
          { name: 'Diamond Details' },
        ]}
        action={
          <PermissionGate permission="diamond_details.create">
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
        <Tabs
          value={currentTab}
          onChange={handleChangeTab}
          sx={[
            (theme) => ({
              px: { md: 2.5 },
              boxShadow: `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
            }),
          ]}
        >
          {TABS.map((tab) => (
            <Tab
              key={tab.value}
              iconPosition="start"
              value={tab.value}
              label={tab.label}
              icon={
                <Iconify
                  icon={tab.icon}
                  sx={[
                    (theme) => ({
                      color: theme.vars.palette.text.disabled,
                      ...(tab.value === currentTab && {
                        color: theme.vars.palette.primary.main,
                      }),
                    }),
                  ]}
                />
              }
              // icon={
              //   <Label
              //     variant={
              //       ((tab.value === currentTab) && 'filled') || 'soft'
              //     }
              //     color="default"
              //   >
              //     {tab.value === currentTab ? tableData.length : 0}
              //   </Label>
              // }
            />
          ))}
        </Tabs>

        {canReset && (
          <DiamondTableFiltersResult
            filters={filters}
            totalResults={dataFiltered.length}
            onResetPage={table.onResetPage}
            sx={{ p: 2.5, pt: 0 }}
          />
        )}

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
              <PermissionGate permission="diamond_details.delete">
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
                headCells={getTableHead(currentTab)}
                rowCount={dataFiltered.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={
                  currentTab === 'color'
                    ? null
                    : (checked) =>
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
                      colSpan={getTableHead(currentTab).length + 1}
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
                      <DiamondTableRow
                        key={row.id}
                        row={row}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => table.onSelectRow(row.id)}
                        onDeleteRow={() => handleDeleteRow(row.id)}
                        onEditRow={() => handleEditClick(row)}
                        category={currentTab}
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
          count={pagination.count}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onChangeDense={table.onChangeDense}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>

      {renderConfirmDialog()}

      {renderCategoryModal()}
    </Container>
  );
}
