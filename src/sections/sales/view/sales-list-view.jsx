import { useState, useCallback, useEffect } from 'react';
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
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateField } from '@mui/x-date-pickers';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { useSettingsContext } from 'src/components/settings';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  useTable,
  TableNoData,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';
import { CustomPopover } from 'src/components/custom-popover';
import axiosInstance from 'src/lib/axios';
import { useProductCategories } from 'src/hooks/useProductCategories';
import { useAccounts } from 'src/hooks/useAccounts';
import { API_ROUTES } from 'src/utils/apiRoute';
import dayjs from 'dayjs';

const FILTERS = [
  {
    ROW: 'First',
    FIELDS: [
      { name: 'from', label: 'From Date', type: 'date' },
      { name: 'to', label: 'To Date', type: 'date' },
      { name: 'customer', label: 'Search Customer', type: 'autocomplete' },
      { name: 'category', label: 'Category', type: 'select', options: [] },
    ],
  },
  {
    ROW: 'Second',
    FIELDS: [
      {
        name: 'payment_status',
        label: 'Payment Status',
        type: 'select',
        options: ['All', 'PENDING', 'PARTIAL', 'SUCCESS'],
      },
      {
        name: 'gst_status',
        label: 'GST Status',
        type: 'select',
        options: ['All', 'GST', 'Non-GST'],
      },
      { name: 'search_bills', label: 'Search Bills', type: 'text' },
      { name: 'sales_return_bills', label: 'Sales Return Bills', type: 'toggle' },
    ],
  },
];

const TABLE_HEAD = [
  { id: 's_no', label: 'S.No.' },
  { id: 'payment_status', label: 'Payment Status' },
  { id: 'added_by', label: 'Added By' },
  { id: 'bill_date', label: 'Bill Date' },
  { id: 'bill_no', label: 'Bill No.' },
  { id: 'customer_name', label: 'Customer Name' },
  { id: 'customer_phone', label: 'Customer Phone' },
  { id: 'total_amount', label: 'Total Amount' },
  { id: 'other_charges', label: 'Other 0.25%' },
  { id: 'cgst', label: 'CGST 1.5%' },
  { id: 'sgst', label: 'SGST 1.5%' },
  { id: 'grand_total', label: 'Grand Total' },
  { id: 'pending_amount', label: 'Pending Amount' },
  { id: 'action', label: 'Action' },
];

export function SalesListView() {
  const router = useRouter();
  const settings = useSettingsContext();
  const table = useTable({ defaultOrderBy: 'created_at', defaultOrder: 'desc' });
  const confirmDialog = useBoolean();
  const showFilters = useBoolean(true);
  const popover = usePopover();

  const [tableData, setTableData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const { data: categories, fetchItems: fetchCategories } = useProductCategories();
  const { customers, getCustomers } = useAccounts();

  const [filters, setFilters] = useState({
    from: null,
    to: null,
    customer: null,
    category: '',
    payment_status: 'All',
    gst_status: 'All',
    sales_return_bills: false,
    search_bills: '',
  });

  const [appliedFilters, setAppliedFilters] = useState({
    from: null,
    to: null,
    customer: null,
    category: '',
    payment_status: 'All',
    gst_status: 'All',
    sales_return_bills: false,
    search_bills: '',
  });

  useEffect(() => {
    fetchCategories();
    getCustomers(1, 1, 100);
  }, [fetchCategories, getCustomers]);

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    table.onResetPage();
    setAppliedFilters(filters);
  };

  const handleResetFilters = () => {
    const resetState = {
      from: null,
      to: null,
      customer: null,
      category: '',
      payment_status: 'All',
      gst_status: 'All',
      sales_return_bills: false,
      search_bills: '',
    };
    setFilters(resetState);
    setAppliedFilters(resetState);
    table.onResetPage();
  };

  const fetchSalesOrders = useCallback(async () => {
    try {
      const params = {
        company_id: 1, // Hardcoded as per request
        is_estimation: false,
        page: table.page + 1,
        page_size: table.rowsPerPage,
        ordering: table.order === 'desc' ? `-${table.orderBy}` : table.orderBy,
      };

      const f = appliedFilters;
      if (f.from) params.from_date = dayjs(f.from).format('YYYY-MM-DD');
      if (f.to) params.to_date = dayjs(f.to).format('YYYY-MM-DD');
      if (f.customer) params.customer_Id = f.customer.id;
      if (f.category) params.product_category_id = f.category;
      if (f.payment_status && f.payment_status !== 'All') params.payment_status = f.payment_status;
      if (f.gst_status !== 'All') params.is_tax_bill = f.gst_status === 'GST';
      if (f.sales_return_bills) params.is_return = true;
      if (f.search_bills) params.bill_number_search = f.search_bills;

      const response = await axiosInstance.get(API_ROUTES.SALES.ORDERS.LIST, { params });

      setTableData(response.data.results);
      setTotalCount(response.data.count);
    } catch (error) {
      console.error('Failed to fetch sales orders:', error);
    }
  }, [table.page, table.rowsPerPage, table.order, table.orderBy, appliedFilters]);

  useEffect(() => {
    fetchSalesOrders();
  }, [fetchSalesOrders]);

  const renderDynamicFields = (field) => (
    <>
      {field.type === 'date' ? (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label={field.label}
            value={filters[field.name]}
            onChange={(newValue) => handleFilterChange(field.name, newValue)}
            slotProps={{ textField: { fullWidth: true } }}
          />
        </LocalizationProvider>
      ) : field.type === 'select' ? (
        <TextField
          select
          fullWidth
          label={field.label}
          value={
            filters[field.name] ||
            (field.name === 'payment_status' || field.name === 'gst_status' ? 'All' : '')
          }
          onChange={(e) => handleFilterChange(field.name, e.target.value)}
        >
          {(field.name === 'category' ? categories : field.options)?.map((option) => (
            <MenuItem
              key={field.name === 'category' ? option.id : option}
              value={field.name === 'category' ? option.id : option}
            >
              {field.name === 'category' ? option.name : option}
            </MenuItem>
          ))}
        </TextField>
      ) : field.type === 'autocomplete' ? (
        <Autocomplete
          fullWidth
          options={customers || []}
          getOptionLabel={(option) => option.customer_name || option.name || ''}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          value={filters[field.name]}
          onChange={(event, newValue) => handleFilterChange(field.name, newValue)}
          renderInput={(params) => <TextField {...params} label={field.label} />}
        />
      ) : field.type === 'toggle' ? (
        <>
          <Typography variant="body2">{field.label}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              component="label"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                cursor: 'pointer',
                position: 'relative',
                width: 44,
                height: 24,
              }}
            >
              <input
                type="checkbox"
                checked={filters[field.name]}
                onChange={(e) => handleFilterChange(field.name, e.target.checked)}
                style={{
                  opacity: 0,
                  width: 0,
                  height: 0,
                  position: 'absolute',
                }}
              />
              <Box
                sx={{
                  width: 44,
                  height: 24,
                  borderRadius: 12,
                  bgcolor: filters[field.name] ? 'primary.main' : 'action.disabled',
                  transition: 'background-color 0.2s',
                  position: 'relative',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 2,
                    left: filters[field.name] ? 22 : 2,
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    bgcolor: 'common.white',
                    transition: 'left 0.2s',
                    boxShadow: 1,
                  }}
                />
              </Box>
            </Box>
          </Box>
        </>
      ) : (
        <TextField
          fullWidth
          type={field.type}
          label={field.label}
          value={filters[field.name]}
          onChange={(e) => handleFilterChange(field.name, e.target.value)}
        />
      )}
    </>
  );

  const renderFilters = () => (
    <Card sx={{ p: 3, mb: 3 }}>
      <Box component="form">
        {FILTERS.map((row) => (
          <Box key={row.ROW} sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            {row.FIELDS.map((field) => (
              <Box key={field.name} sx={{ flex: '1 1 200px' }}>
                {renderDynamicFields(field)}
              </Box>
            ))}
          </Box>
        ))}

        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
          <Button variant="contained" color="success" sx={{ mr: 1 }} onClick={handleApplyFilters}>
            Apply
          </Button>
          <Button variant="outlined" onClick={handleResetFilters}>
            Reset
          </Button>
        </Box>
      </Box>
    </Card>
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <CustomBreadcrumbs
        heading="All Sales"
        sx={{ mb: { xs: 1, md: 2 } }}
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={
                <Iconify icon={showFilters.value ? 'eva:arrow-up-fill' : 'eva:arrow-down-fill'} />
              }
              onClick={showFilters.onToggle}
              color="success"
            >
              Filter
            </Button>

            <Button
              variant="contained"
              color="error"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={() => router.push(paths.sales.addSales)}
            >
              Add
            </Button>
            <Button
              variant="contained"
              color="info"
              startIcon={<Iconify icon="solar:export-bold" />}
            >
              Export
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Iconify icon="solar:eye-bold" />}
            >
              Preview
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<Iconify icon="solar:file-text-bold" />}
            >
              DownloadPDF
            </Button>
          </Box>
        }
      />

      <Collapse in={showFilters.value}>{renderFilters()}</Collapse>

      <Card>
        <TableSelectedAction
          dense={table.dense}
          numSelected={table.selected.length}
          rowCount={totalCount}
          action={
            <Tooltip title="Delete">
              <IconButton color="primary" onClick={confirmDialog.onTrue}>
                <Iconify icon="solar:trash-bin-trash-bold" />
              </IconButton>
            </Tooltip>
          }
        />

        <Scrollbar>
          <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 1600 }}>
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
                  tableData.map((row) => row.id)
                )
              }
            />

            <TableBody>
              {tableData.map((row, index) => (
                <TableRow key={row.id} hover selected={table.selected.includes(row.id)}>
                  <TableCell padding="checkbox">
                    {/* Checkbox logic managed by useTable usually */}
                  </TableCell>
                  <TableCell>{table.page * table.rowsPerPage + index + 1}</TableCell>
                  <TableCell sx={{ color: 'error.main', fontWeight: 'bold' }}>
                    {row.payment_status}
                  </TableCell>
                  <TableCell>{row.salesman_name}</TableCell>
                  <TableCell>{row.bill_date}</TableCell>
                  <TableCell>{row.bill_number}</TableCell>
                  <TableCell>{row.customer_name}</TableCell>
                  <TableCell>{row.customer_phone}</TableCell>
                  <TableCell>{row.subtotal_amount}</TableCell>
                  <TableCell>0.00</TableCell>
                  <TableCell>{row.cgst_amount}</TableCell>
                  <TableCell>{row.sgst_amount}</TableCell>
                  <TableCell sx={{ color: 'error.main', fontWeight: 'bold' }}>
                    {row.grand_total}
                  </TableCell>
                  <TableCell>{row.pending_amount}</TableCell>
                  <TableCell>
                    <IconButton
                      color={popover.open ? 'inherit' : 'default'}
                      onClick={popover.onOpen}
                    >
                      <Iconify icon="eva:more-vertical-fill" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              <TableNoData notFound={tableData.length === 0} />
            </TableBody>
          </Table>
        </Scrollbar>

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

      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{ arrow: { placement: 'right-top' } }}
        sx={{ width: 220 }}
      >
        <MenuItem
          onClick={() => {
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            popover.onClose();
          }}
        >
          <Iconify icon="solar:printer-bold" />
          Duplicate Print
        </MenuItem>
        <MenuItem
          onClick={() => {
            popover.onClose();
          }}
        >
          <Iconify icon="solar:printer-bold" />
          Original Print
        </MenuItem>
        <MenuItem
          onClick={() => {
            popover.onClose();
          }}
        >
          <Iconify icon="solar:wallet-money-bold" />
          Payment
        </MenuItem>
        <MenuItem
          onClick={() => {
            popover.onClose();
            confirmDialog.onTrue();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
        </MenuItem>
      </CustomPopover>

      <ConfirmDialog
        open={confirmDialog.value}
        onClose={confirmDialog.onFalse}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <Button variant="contained" color="error" onClick={confirmDialog.onFalse}>
            Delete
          </Button>
        }
      />
    </Container>
  );
}
