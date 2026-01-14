import { useState, useCallback, useEffect, useRef } from 'react';
import { useBoolean, usePopover } from 'minimal-shared/hooks';
import { useForm } from 'react-hook-form';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';
import Collapse from '@mui/material/Collapse';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import MenuList from '@mui/material/MenuList';

import { useSettingsContext } from 'src/components/settings';
import { paths } from 'src/routes/paths';
import { useProductCategories } from 'src/hooks/useProductCategories';
import { useDiamondDetails } from 'src/hooks/useDiamondDetails';
import { useProducts } from 'src/hooks/useProducts';
import { useDealers } from 'src/hooks/useDealers';
import { useBarcodeLocations } from 'src/hooks/useBarcodeLocations';

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
import { usePurchaseBarcodeTag } from 'src/hooks/usePurchaseBarcodeTag';
import { CustomPopover } from 'src/components/custom-popover';
import PermissionGate from 'src/components/PermissionGate';
import usePermissions from 'src/hooks/usePermissions';
import { BarcodeItemTableRow } from './components/barcode-item-table-row';
import { de } from 'zod/v4/locales';
import { useRouter } from 'src/routes/hooks';

const FILTERS = [
  {
    ROW: 'First',
    FIELDS: [
      {
        name: 'search',
        label: 'Search',
        type: 'text',
      },
      {
        name: 'tag_item_code_search',
        label: 'Item Code',
        type: 'select',
        options: [],
      },
      {
        name: 'from',
        label: 'From Date',
        type: 'date',
      },
      {
        name: 'to',
        label: 'To Date',
        type: 'date',
      },
    ],
  },
  {
    ROW: 'Second',
    FIELDS: [
      {
        name: 'sub_product_type_id',
        label: 'Product',
        type: 'select',
        options: [],
      },
      {
        name: 'type_id',
        label: 'Stock Type',
        type: 'select',
        options: [],
      },
      {
        name: 'category_id',
        label: 'Metal Category',
        type: 'select',
        options: [],
      },
      {
        name: 'carat_id',
        label: 'Carat',
        type: 'select',
        options: [],
      },
    ],
  },
  {
    ROW: 'Third',
    FIELDS: [
      {
        name: 'dealer_id',
        label: 'Dealer',
        type: 'select',
        options: [],
      },
      {
        name: 'box_counter_id',
        label: 'Box / Counter',
        type: 'select',
        options: [],
      },
      {
        name: 'have_huid',
        label: 'HUID Filter',
        type: 'select',
        options: [],
      },
      {
        name: 'huid_search',
        label: 'HUID Search',
        type: 'text',
        // options: [],
      },
    ],
  },
];
//  Default Values
const defaultValues = Object.fromEntries(
  FILTERS.flatMap((row) => row.FIELDS.map((field) => [field.name, '']))
);

const TABLE_HEAD = [
  { id: 'checkbox', label: 'checkbox', width: 80 },
  { id: 'added_by', label: 'Added By', width: 120 },
  { id: 'tag_item_code', label: 'Item Code', width: 150 },
  { id: 'sub_product_type', label: 'Product', width: 150 },
  { id: 'type', label: 'Stock Type', width: 120 },
  { id: 'tag_item_category', label: 'Category', width: 100 },
  { id: 'carat_details', label: 'Carat Details', width: 120 },
  { id: 'media_count', label: 'Media Count', width: 120 },
  { id: 'qty', label: 'Qty', width: 80 },
  { id: 'gross_weight_with_gemstone', label: 'Gr.Wt / Gemstone Wt', width: 150 },
  { id: 'less_weight_before_variation', label: 'Less.Wt / Weight Before Variation', width: 200 },
  { id: 'less_weight_after_variation', label: 'Less.Wt / Weight After Variation', width: 200 },
  { id: 'net_weight', label: 'Net Weight', width: 120 },
  { id: 'making_charges', label: 'Mkg.Chrg', width: 120 },
  { id: 'huid', label: 'HUID', width: 120 },
  { id: 'dealer_name', label: 'Dealer Name', width: 150 },
  { id: 'tag_item_name', label: 'Tag Item Name', width: 150 },
  { id: 'gemstone_code', label: 'Gemstone Code', width: 130 },
  { id: 'gemstone_dim', label: 'Gemstone Dim', width: 120 },
  { id: 'gemstone_rate', label: 'Gemstone Rate', width: 130 },
  { id: 'gemstone_amt', label: 'Gemstone Amt', width: 130 },
  { id: 'box_name', label: 'Box / Counter', width: 120 },
  { id: 'market_place', label: 'Market Place', width: 120 },
  { id: 'e_showroom', label: 'E-ShowRoom', width: 120 },
  { id: 'created_at', label: 'Created At', width: 200 },
  { id: 'action', label: 'Action', width: 88 },
];

function applyFilter({ inputData, comparator }) {
  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  return stabilizedThis.map((el) => el[0]);
}

export function BarcodeItemListView() {
  const router = useRouter();
  const settings = useSettingsContext();
  const table = useTable();
  const confirmDialog = useBoolean();
  const menuActions = usePopover();
  const showFilters = useBoolean(false);
  const { hasPermission } = usePermissions();

  // Purchase Barcode Tag API hook
  const {
    data: barcodeTagItems,
    summary: barcodeTagSummary,
    fetchItems: fetchBarcodeTagItems,
    loading,
    deleteItem: deleteBarcodeTagItem,
    deleteItems: deleteBarcodeTagItems,
    fetchAllItemCodes,
    itemCodes: barcodeItemCodes,
    fetchStockTypes,
    stockTypes,
  } = usePurchaseBarcodeTag();

  const tableData = barcodeTagItems || [];
  const totalCount = tableData.length;

  // const [loading, setLoading] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState(defaultValues);
  const hasFetchedData = useRef(false);

  // Product categories API hook
  const {
    data: productCategories,
    loading: categoriesLoading,
    fetchItems: fetchCategories,
  } = useProductCategories();

  // Carats API hook
  const {
    data: carats,
    loading: caratsLoading,
    fetchItems: fetchCarats,
  } = useDiamondDetails('carat');

  // Products API hook
  const { data: products, loading: productsLoading, fetchItems: fetchProducts } = useProducts();

  // Dealers API hook
  const { data: dealers, loading: dealersLoading, fetchItems: fetchDealers } = useDealers();

  // Barcode Locations API hook
  const {
    data: barcodeLocations,
    loading: locationsLoading,
    fetchItems: fetchLocations,
  } = useBarcodeLocations();

  //  Filter Form
  const methods = useForm({
    defaultValues,
  });

  const { handleSubmit, reset, watch, setValue, getValues, register } = methods;

  // Fetch data on component mount (only once)
  useEffect(() => {
    if (!hasFetchedData.current) {
      fetchCategories();
      // Fetch carats without pagination
      fetchCarats(1, 10, '', 'all', { pagination: false });
      // Fetch products without pagination
      fetchProducts({ pagination: false });
      // Fetch dealers without pagination
      fetchDealers({ pagination: false });
      // Fetch barcode locations without pagination
      fetchLocations({ pagination: false });
      // Fetch stock types
      fetchStockTypes();
      // Fetch barcode item codes
      fetchAllItemCodes();
      hasFetchedData.current = true;
    }
  }, [fetchCategories, fetchCarats, fetchProducts, fetchDealers, fetchLocations]);

  // Fetch data when filters change
  const loadData = useCallback(async () => {
    try {
      // setLoading(true);
      const response = await fetchBarcodeTagItems({
        page: table.page + 1,
        page_size: table.rowsPerPage,
        ...appliedFilters,
      });
      if (response) {
        console.log(response);
      }
    } catch (error) {
      console.error('Failed to fetch barcode tag items:', error);
    } finally {
      // setLoading(false);
    }
  }, [fetchBarcodeTagItems, table.page, table.rowsPerPage, appliedFilters, setAppliedFilters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
  });

  const notFound = !dataFiltered.length;
  const dataInPage = dataFiltered;

  const handleDeleteRow = useCallback(
    async (id) => {
      try {
        const response = await deleteBarcodeTagItem(id);
        if (response?.success) {
          table.onUpdatePageDeleteRow(dataInPage.length);
          toast.success('Record deleted successfully!');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    },
    [deleteBarcodeTagItem, loadData]
  );

  const handleDeleteRows = useCallback(async () => {
    try {
      const response = await deleteBarcodeTagItems(table.selected);
      if (response.success) {
        toast.success(`Successfully deleted ${response.deletedCount} items!`);
        table.onUpdatePageDeleteRows(dataInPage.length, dataFiltered.length);
        table.onSelectAllRows(false, []);
      } else {
        toast.error(response.message || 'Delete failed!');
      }
      table.onUpdatePageDeleteRows();
    } catch {
      toast.error('Delete failed!');
    }
  }, [deleteBarcodeTagItems, dataFiltered.length, dataInPage.length, table]);

  const onFilterApply = handleSubmit(
    async (data) => {
      try {
        if (JSON.stringify(appliedFilters) === JSON.stringify(data)) return;
        setAppliedFilters(data);
        table.onResetPage();
        table.onSelectAllRows(false, []);
        toast.success('Filters applied successfully!');
      } catch (error) {
        console.error('Filter error:', error);
      }
    },
    [appliedFilters]
  );

  const onResetFilter = useCallback(() => {
    reset();
    setAppliedFilters(defaultValues);
  }, [reset, setAppliedFilters]);

  const OPTIONS_MAP = {
    sub_product_type_id: products,
    type_id: stockTypes,
    category_id: productCategories,
    carat_id: carats,
    dealer_id: dealers,
    box_counter_id: barcodeLocations,
    have_huid: [
      { id: true, name: 'With HUID' },
      { id: false, name: 'Without HUID' },
    ],
    tag_item_code_search: barcodeItemCodes,
  };

  const renderDynamicFields = (field) => (
    <>
      {field.type === 'select' ? (
        <FormControl fullWidth size="medium">
          <InputLabel>{field.label}</InputLabel>
          <Select
            label={field.label}
            value={watch(field.name) || ''}
            onChange={(e) => setValue(field.name, e.target.value)}
          >
            <MenuItem value="">--Select--</MenuItem>
            {(OPTIONS_MAP[field.name] || []).map((opt) => (
              <MenuItem key={opt.id ?? opt.value} value={opt.id ?? opt.value}>
                {opt.name ??
                  opt.label ??
                  opt.product_name ??
                  opt.location_name ??
                  opt.carat_value ??
                  opt.value ??
                  opt.item_code ??
                  `#${opt.id}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ) : (
        <TextField
          fullWidth
          type={field.type}
          label={field.label}
          InputLabelProps={field.type === 'date' ? { shrink: true } : {}}
          {...register(field.name)}
        />
      )}
    </>
  );

  const renderFilters = () => (
    <Card sx={{ p: 3, mb: 3 }}>
      <Box component="form" onSubmit={onFilterApply}>
        {FILTERS.map((filters) => {
          let minWidth = '200px';
          if (filters.ROW === 'Third') minWidth = '250px';
          return (
            <Box key={filters.ROW} sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              {filters.FIELDS.map((field) => (
                <Box key={field.name} sx={{ flex: '1 1 200px', minWidth }}>
                  {renderDynamicFields(field)}
                </Box>
              ))}
            </Box>
          );
        })}

        {/* Action Buttons */}
        <Grid container sx={{ mt: 4 }} spacing={2} alignItems="center" justifyContent="flex-end">
          <Grid item xs={12} sm={6} md={6}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                color="success"
                startIcon={<Iconify icon="eva:search-fill" />}
                sx={{ minWidth: 120 }}
              >
                Filter
              </Button>
              <Button variant="outlined" onClick={onResetFilter} sx={{ minWidth: 120 }}>
                Reset
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Card>
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

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <CustomBreadcrumbs
        heading="Current Barcode List"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Barcode Item' },
          { name: 'Current Barcode List' },
        ]}
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              color="black"
              startIcon={
                <Iconify icon={showFilters.value ? 'eva:arrow-up-fill' : 'eva:arrow-down-fill'} />
              }
              onClick={showFilters.onToggle}
            >
              {showFilters.value ? 'Hide Filters' : 'Show Filters'}
            </Button>
            <Button
              variant="contained"
              color="black"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={() => router.push(paths.barcodeItem.add)}
            >
              Add
            </Button>
            <Button
              variant="contained"
              color="info"
              startIcon={<Iconify icon="eva:edit-fill" />}
              onClick={() => toast.info('Bulk Update functionality coming soon!')}
            >
              Bulk Update
            </Button>

            <Button
              variant="contained"
              color="primary"
              startIcon={<Iconify icon="eva:file-text-fill" />}
              onClick={() => toast.info('Import functionality coming soon!')}
            >
              Import
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Iconify icon="eva:download-fill" />}
              onClick={() => toast.info('Export functionality coming soon!')}
            >
              Export
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<Iconify icon="eva:grid-fill" />}
              onClick={() => toast.info('Print Barcode functionality coming soon!')}
            >
              Print Barcode
            </Button>
          </Box>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Collapse in={showFilters.value}>{renderFilters()}</Collapse>

      {/* Compact Summary Bar */}
      <Paper
        elevation={1}
        sx={{
          p: 1.5,
          mb: 3,
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        {/* Summary Cards - Compact Inline */}
        <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'nowrap' }}>
          {/* Total GR Wt */}
          <Box
            sx={{
              px: 2,
              py: 1,
              borderRadius: 1,
              borderLeft: '3px solid',
              borderLeftColor: 'info.main',
              bgcolor: 'background.paper',
              minWidth: 120,
              textAlign: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            <Typography variant="caption" color="text.secondary" component="span">
              Total GR Wt:
            </Typography>
            <Typography
              variant="subtitle2"
              fontWeight="bold"
              color="text.primary"
              component="span"
              sx={{ ml: 0.5 }}
            >
              {barcodeTagSummary?.total_gr_wt || 0} gm
            </Typography>
          </Box>

          {/* Total NT Wt */}
          <Box
            sx={{
              px: 2,
              py: 1,
              borderRadius: 1,
              borderLeft: '3px solid',
              borderLeftColor: 'success.main',
              bgcolor: 'background.paper',
              minWidth: 120,
              textAlign: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            <Typography variant="caption" color="text.secondary" component="span">
              Total NT Wt:
            </Typography>
            <Typography
              variant="subtitle2"
              fontWeight="bold"
              color="text.primary"
              component="span"
              sx={{ ml: 0.5 }}
            >
              {/* total_gr_wt : 245 total_nt_wt : 223 total_qty : 13 total_tag : 12 162.000 gm */}
              {barcodeTagSummary?.total_nt_wt || 0} gm
            </Typography>
          </Box>

          {/* Total Qty */}
          <Box
            sx={{
              px: 2,
              py: 1,
              borderRadius: 1,
              borderLeft: '3px solid',
              borderLeftColor: 'success.main',
              bgcolor: 'background.paper',
              minWidth: 90,
              textAlign: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            <Typography variant="caption" color="text.secondary" component="span">
              Total Qty:
            </Typography>
            <Typography
              variant="subtitle2"
              fontWeight="bold"
              color="text.primary"
              component="span"
              sx={{ ml: 0.5 }}
            >
              {barcodeTagSummary?.total_qty || 0}
            </Typography>
          </Box>

          {/* Total Tag */}
          <Box
            sx={{
              px: 2,
              py: 1,
              borderRadius: 1,
              borderLeft: '3px solid',
              borderLeftColor: 'warning.main',
              bgcolor: 'background.paper',
              minWidth: 90,
              textAlign: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            <Typography variant="caption" color="text.secondary" component="span">
              Total Tag:
            </Typography>
            <Typography
              variant="subtitle2"
              fontWeight="bold"
              color="text.primary"
              component="span"
              sx={{ ml: 0.5 }}
            >
              {barcodeTagSummary?.total_tag || 0}
            </Typography>
          </Box>
        </Stack>
      </Paper>

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
                <IconButton color="primary" onClick={confirmDialog.onTrue}>
                  <Iconify icon="solar:trash-bin-trash-bold" />
                </IconButton>
              </Tooltip>
            }
          />

          <Scrollbar tabIndex="-1">
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 3000 }}>
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
                        Loading Barcode tag Items...
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {dataFiltered.map((row) => (
                      <BarcodeItemTableRow
                        columns={TABLE_HEAD}
                        key={row.id}
                        row={row}
                        selected={table.selected.includes(row.id)}
                        editHref={`/barcode-item/update/${row.id}`}
                        onSelectRow={() => table.onSelectRow(row.id)}
                        onDeleteRow={() => handleDeleteRow(row.id)}
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
    </Container>
  );
}
