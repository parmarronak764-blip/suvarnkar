import { useState, useCallback, useEffect } from 'react';
import { varAlpha } from 'minimal-shared/utils';
import { useBoolean } from 'minimal-shared/hooks';

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
import { usePermissions } from 'src/hooks/usePermissions';
import { PermissionGate } from 'src/components/PermissionGate';
import {
  useTable,
  TableNoData,
  getComparator,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import { useGemstone } from 'src/hooks/useGemstone';

import { GemstoneTableRow } from './gemstone-table-row';
import { GemstoneFormModal } from './gemstone-form-modal';
import { GemstonePacketModal } from './gemstone-packet-modal';
import { GemstoneRateModal } from './gemstone-rate-modal';
import { GemstoneShapeModal } from './gemstone-shape-modal';
import { GemstoneSubTypeModal } from './gemstone-sub-type-modal';

// ----------------------------------------------------------------------

const TABS = [
  { value: 'packets', label: 'Packets', icon: 'solar:box-bold' },
  { value: 'rates', label: 'Rates', icon: 'solar:dollar-bold' },
  { value: 'shapes', label: 'Shapes', icon: 'solar:chart-square-outline' },
  { value: 'sub-types', label: 'Sub Types', icon: 'solar:tag-bold' },
];

const TABLE_HEAD = {
  packets: [
    { id: 'packet_name', label: 'Packet Name', width: 200 },
    { id: 'packet_code', label: 'Packet Code', width: 150 },
    { id: 'gemstone_main_type', label: 'Main Type', width: 120 },
    { id: 'gemstone_sub_type', label: 'Sub Type', width: 120 },
    { id: 'gemstone_shape', label: 'Shape', width: 100 },
    { id: 'pieces', label: 'Pieces', width: 100 },
    { id: 'packet_weight', label: 'Weight', width: 120 },
    { id: 'packet_rate', label: 'Rate', width: 120 },
    { id: 'company_name', label: 'Company', width: 150 },
    { id: 'created_at', label: 'Created', width: 130 },
    { id: 'action', label: 'Action', width: 88 },
  ],
  rates: [
    { id: 'gemstone_sub_type', label: 'Sub Type', width: 150 },
    { id: 'gemstone_shape', label: 'Shape', width: 120 },
    { id: 'carat_name', label: 'Carat Name', width: 150 },
    { id: 'carat_size', label: 'Carat Size', width: 120 },
    { id: 'rate_per_carat', label: 'Rate per Carat', width: 150 },
    { id: 'company_name', label: 'Company', width: 150 },
    { id: 'created_at', label: 'Created', width: 130 },
    { id: 'action', label: 'Action', width: 88 },
  ],
  shapes: [
    { id: 'name', label: 'Shape Name', width: 200 },
    { id: 'company_name', label: 'Company', width: 200 },
    { id: 'created_at', label: 'Created', width: 150 },
    { id: 'action', label: 'Action', width: 88 },
  ],
  'sub-types': [
    { id: 'carat_name', label: 'Carat', width: 150 },
    { id: 'sub_type_name', label: 'Sub Type Name', width: 200 },
    { id: 'metal_type_name', label: 'Metal Type', width: 150 },
    { id: 'company_name', label: 'Company', width: 150 },
    { id: 'created_at', label: 'Created', width: 130 },
    { id: 'action', label: 'Action', width: 88 },
  ],
};

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, currentTab }) {
  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  return stabilizedThis.map((el) => el[0]);
}

// ----------------------------------------------------------------------

export function GemstonesView() {
  const settings = useSettingsContext();
  const table = useTable();
  const { hasPermission } = usePermissions();
  const confirmDialog = useBoolean();

  const [currentTab, setCurrentTab] = useState('packets');
  const [modalOpen, setModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const {
    data,
    loading,
    fetchPackets,
    fetchRates,
    fetchShapes,
    fetchSubTypes,
    createPacket,
    createRate,
    createShape,
    createSubType,
    updatePacket,
    updateRate,
    updateShape,
    updateSubType,
    deletePacket,
    deleteRate,
    deleteShape,
    deleteSubType,
  } = useGemstone();

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    currentTab,
  });

  const notFound = !loading && !dataFiltered.length;

  const canReset = false; // No filters implemented

  // Fetch data based on current tab with pagination
  useEffect(() => {
    const fetchData = async () => {
      let result;
      const page = table.page + 1;
      const pageSize = table.rowsPerPage;

      switch (currentTab) {
        case 'packets':
          result = await fetchPackets(page, pageSize);
          break;
        case 'rates':
          result = await fetchRates(page, pageSize);
          break;
        case 'shapes':
          result = await fetchShapes(page, pageSize);
          break;
        case 'sub-types':
          result = await fetchSubTypes(page, pageSize);
          break;
        default:
          return;
      }

      if (result.success) {
        setTableData(result.data || []);
        setTotalCount(result.pagination?.total || result.pagination?.count || 0);
      } else {
        toast.error(result.message || 'Failed to fetch data');
      }
    };

    fetchData();
  }, [
    currentTab,
    table.page,
    table.rowsPerPage,
    fetchPackets,
    fetchRates,
    fetchShapes,
    fetchSubTypes,
    refreshTrigger,
  ]);

  const handleChangeTab = useCallback((event, newValue) => {
    setCurrentTab(newValue);
  }, []);

  const handleAddClick = useCallback(() => {
    setCurrentItem(null);
    setModalOpen(true);
  }, []);

  const handleEditRow = useCallback((row) => {
    setCurrentItem(row);
    setModalOpen(true);
  }, []);

  const handleDeleteRow = useCallback(
    async (id) => {
      let result;
      switch (currentTab) {
        case 'packets':
          result = await deletePacket(id);
          break;
        case 'rates':
          result = await deleteRate(id);
          break;
        case 'shapes':
          result = await deleteShape(id);
          break;
        case 'sub-types':
          result = await deleteSubType(id);
          break;
        default:
          return;
      }

      if (result.success) {
        toast.success('Item deleted successfully!');
        setRefreshTrigger((prev) => prev + 1);
      } else {
        toast.error(result.message || 'Failed to delete item');
      }
    },
    [currentTab, deletePacket, deleteRate, deleteShape, deleteSubType]
  );

  const handleDeleteRows = useCallback(async () => {
    const deletePromises = table.selected.map((id) => {
      switch (currentTab) {
        case 'packets':
          return deletePacket(id);
        case 'rates':
          return deleteRate(id);
        case 'shapes':
          return deleteShape(id);
        case 'sub-types':
          return deleteSubType(id);
        default:
          return Promise.resolve({ success: false });
      }
    });

    try {
      const results = await Promise.all(deletePromises);
      const successful = results.filter((r) => r.success).length;

      if (successful > 0) {
        toast.success(`Successfully deleted ${successful} item(s)!`);
        table.onSelectAllRows(false, []);
        setRefreshTrigger((prev) => prev + 1);
      } else {
        toast.error('Failed to delete items');
      }
    } catch {
      toast.error('Failed to delete items');
    }

    confirmDialog.onFalse();
  }, [currentTab, deletePacket, deleteRate, deleteShape, deleteSubType, table, confirmDialog]);

  const handleModalSave = useCallback(
    async (formData) => {
      let result;

      if (currentItem) {
        // Update existing item
        switch (currentTab) {
          case 'packets':
            result = await updatePacket(currentItem.id, formData);
            break;
          case 'rates':
            result = await updateRate(currentItem.id, formData);
            break;
          case 'shapes':
            result = await updateShape(currentItem.id, formData);
            break;
          case 'sub-types':
            result = await updateSubType(currentItem.id, formData);
            break;
          default:
            return;
        }

        if (result.success) {
          toast.success('Item updated successfully!');
        } else {
          toast.error(result.message || 'Failed to update item');
        }
      } else {
        // Create new item
        switch (currentTab) {
          case 'packets':
            result = await createPacket(formData);
            break;
          case 'rates':
            result = await createRate(formData);
            break;
          case 'shapes':
            result = await createShape(formData);
            break;
          case 'sub-types':
            result = await createSubType(formData);
            break;
          default:
            return;
        }

        if (result.success) {
          toast.success('Item created successfully!');
        } else {
          toast.error(result.message || 'Failed to create item');
        }
      }

      if (result.success) {
        setModalOpen(false);
        setCurrentItem(null);
        setRefreshTrigger((prev) => prev + 1);
      }
    },
    [
      currentItem,
      currentTab,
      updatePacket,
      updateRate,
      updateShape,
      updateSubType,
      createPacket,
      createRate,
      createShape,
      createSubType,
    ]
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

  const renderModal = () => {
    const modalProps = {
      open: modalOpen,
      onClose: () => {
        setModalOpen(false);
        setCurrentItem(null);
      },
      currentItem,
      onSave: handleModalSave,
      loading,
      onSaved: () => setRefreshTrigger((prev) => prev + 1),
    };

    switch (currentTab) {
      case 'packets':
        return <GemstonePacketModal {...modalProps} />;
      case 'rates':
        return <GemstoneRateModal {...modalProps} />;
      case 'shapes':
        return <GemstoneShapeModal {...modalProps} />;
      case 'sub-types':
        return <GemstoneSubTypeModal {...modalProps} />;
      default:
        return <GemstoneFormModal {...modalProps} categoryLabel="Gemstone Item" />;
    }
  };

  const getPermissionPrefix = () => {
    switch (currentTab) {
      case 'packets':
        return 'gem_stones';
      case 'rates':
        return 'gem_stones';
      case 'shapes':
        return 'gem_stones';
      case 'sub-types':
        return 'gem_stones';
      default:
        return 'gem_stones';
    }
  };

  const permissionPrefix = getPermissionPrefix();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <CustomBreadcrumbs
        heading="Gemstones"
        links={[
          { name: 'Dashboard', href: '/dashboard' },
          { name: 'Masters', href: '/masters' },
          { name: 'Gemstones' },
        ]}
        action={
          <PermissionGate permission={`${permissionPrefix}.create`}>
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
            />
          ))}
        </Tabs>

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
              <PermissionGate permission={`${permissionPrefix}.delete`}>
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
                headCells={TABLE_HEAD[currentTab]}
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
                      colSpan={TABLE_HEAD[currentTab].length + 1}
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
                      <GemstoneTableRow
                        key={row.id}
                        row={row}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => table.onSelectRow(row.id)}
                        onDeleteRow={() => handleDeleteRow(row.id)}
                        onEditRow={() => handleEditRow(row)}
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
          count={totalCount}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onChangeDense={table.onChangeDense}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>

      {renderModal()}
      {renderConfirmDialog()}
    </Container>
  );
}
