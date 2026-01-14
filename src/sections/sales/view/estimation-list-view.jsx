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
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import MenuList from '@mui/material/MenuList';
import Autocomplete from '@mui/material/Autocomplete';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateField } from '@mui/x-date-pickers';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { useSettingsContext } from 'src/components/settings';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
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
import { CustomPopover } from 'src/components/custom-popover';
import axiosInstance from 'src/lib/axios';
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
      { name: 'customer_phone_no', label: 'Customer Phone No.', type: 'number' },
    ],
  },
];

const TABLE_HEAD = [
  { id: 's_no', label: 'S. No.' },
  { id: 'customer_name', label: 'Customer' },
  { id: 'customer_phone', label: 'Customer Phone' },
  { id: 'bill_number', label: 'Bill No.' },
  { id: 'bill_date', label: 'Bill Date' },
  { id: 'grand_total', label: 'Grand Total' },
  { id: 'action', label: 'Action' },
];

export function EstimationListView() {
  const router = useRouter();
  const settings = useSettingsContext();
  const table = useTable({ defaultOrderBy: 'created_at', defaultOrder: 'desc' });
  const confirmDialog = useBoolean();
  const showFilters = useBoolean(false);
  const popover = usePopover();

  const [tableData, setTableData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const { customers, getCustomers } = useAccounts();

  const [filters, setFilters] = useState({
    from: null,
    to: null,
    customer: null,
    customer_phone_no: '',
  });

  const [appliedFilters, setAppliedFilters] = useState({
    from: null,
    to: null,
    customer: null,
    customer_phone_no: '',
  });

  useEffect(() => {
    getCustomers(1, 1, 100);
  }, [getCustomers]);

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
      customer_phone_no: '',
    };
    setFilters(resetState);
    setAppliedFilters(resetState);
    table.onResetPage();
  };

  const fetchEstimations = useCallback(async () => {
    try {
      const params = {
        company_id: 1,
        is_estimation: true,
        page: table.page + 1,
        page_size: table.rowsPerPage,
        ordering: table.order === 'desc' ? `-${table.orderBy}` : table.orderBy,
      };

      const f = appliedFilters;
      if (f.from) params.from_date = dayjs(f.from).format('YYYY-MM-DD');
      if (f.to) params.to_date = dayjs(f.to).format('YYYY-MM-DD');

      if (f.customer) {
        params.customer_Id = f.customer.id;
        params.customer_phone = f.customer.whatsapp_no || f.customer.customer_phone || '';
      } else if (f.customer_phone_no) {
        params.customer_phone = f.customer_phone_no;
      }

      const response = await axiosInstance.get(API_ROUTES.SALES.ORDERS.LIST, { params });
      setTableData(response.data.results);
      setTotalCount(response.data.count);
    } catch (error) {
      console.error('Failed to fetch estimations:', error);
    }
  }, [table.page, table.rowsPerPage, table.order, table.orderBy, appliedFilters]);

  useEffect(() => {
    fetchEstimations();
  }, [fetchEstimations]);

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
        {FILTERS.map((filter) => {
          let minWidth = '200px';
          if (filter.ROW === 'Third') minWidth = '250px';
          return (
            <Box key={filter.ROW} sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              {filter.FIELDS.map((field) => (
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
                variant="contained"
                color="success"
                startIcon={<Iconify icon="eva:search-fill" />}
                sx={{ minWidth: 120 }}
                onClick={handleApplyFilters}
              >
                Filter
              </Button>
              <Button variant="outlined" sx={{ minWidth: 120 }} onClick={handleResetFilters}>
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
        heading="Estimations"
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
              onClick={() => router.push(paths.sales.addEstimation)}
            >
              Add
            </Button>
          </Box>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Collapse in={showFilters.value}>{renderFilters()}</Collapse>

      <Card>
        <Box sx={{ position: 'relative' }}>
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
            <Table size={table.dense ? 'small' : 'medium'}>
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headCells={TABLE_HEAD}
                rowCount={totalCount}
                numSelected={table.selected.length}
                onSort={table.onSort}
              />

              <TableBody>
                {tableData.map((row, index) => (
                  <TableRow key={row.id} hover selected={table.selected.includes(row.id)}>
                    <TableCell>{table.page * table.rowsPerPage + index + 1}</TableCell>
                    <TableCell>{row.customer_name}</TableCell>
                    <TableCell>{row.customer_phone}</TableCell>
                    <TableCell>{row.bill_number}</TableCell>
                    <TableCell>{row.bill_date}</TableCell>
                    <TableCell sx={{ color: 'error.main', fontWeight: 'bold' }}>
                      {row.grand_total}
                    </TableCell>
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
