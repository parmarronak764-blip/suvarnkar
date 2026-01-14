import { useState, useCallback, useEffect, useMemo } from 'react';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';
import { useRouter, useSearchParams, usePathname } from 'src/routes/hooks';
import { useSettingsContext } from 'src/components/settings';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { PermissionGate } from 'src/components/PermissionGate';
import { useSelector } from 'react-redux';
import {
  useTable,
  TableNoData,
  getComparator,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import { useAccounts } from 'src/hooks/useAccounts';
import { AccountDealerTableRow } from './account-dealer-table-row';
import { AccountCustomerTableRow } from './account-customer-table-row';
import { AccountKarigarTableRow } from './account-karigar-table-row';
import { AccountOthersTableRow } from './account-others-table-row';

// ----------------------------------------------------------------------

const TAB_PARAM = 'tab';

const TABS = [
  { value: 'dealers', label: 'Dealers', icon: 'solar:user-id-bold' },
  { value: 'customers', label: 'Customers', icon: 'solar:users-group-rounded-bold' },
  { value: 'karigars', label: 'Karigars', icon: 'solar:user-rounded-bold' },
  { value: 'others', label: 'Others', icon: 'solar:list-bold' },
];

const TABLE_HEAD = {
  dealers: [
    { id: 'name', label: 'Dealer Name', width: 200 },
    { id: 'dealer_code', label: 'Dealer Code', width: 150 },
    { id: 'owner_name', label: 'Owner Name', width: 180 },
    { id: 'contact_number', label: 'Contact', width: 140 },
    { id: 'dealer_supply_type_name', label: 'Supply Type', width: 150 },
    { id: 'city', label: 'City', width: 120 },
    { id: 'gst_number', label: 'GST Number', width: 150 },
    { id: 'account', label: 'Account Status', width: 130 },
    { id: 'created_at', label: 'Created', width: 130 },
    { id: 'action', label: 'Action', width: 88 },
  ],
  customers: [
    { id: 'name', label: 'Customer Name', width: 200 },
    { id: 'customer_group_name', label: 'Contact Group', width: 140 },
    { id: 'email', label: 'Email', width: 120 },
    { id: 'whatsapp_number', label: 'Contact', width: 120 },
    { id: 'city', label: 'City', width: 120 },
    { id: 'account', label: 'Account Status', width: 130 },
    { id: 'created_at', label: 'Created', width: 130 },
    { id: 'action', label: 'Action', width: 88 },
  ],
  karigars: [
    { id: 'name', label: 'Karigar Name', width: 200 },
    { id: 'firm_name', label: 'Firm Name', width: 180 },
    { id: 'karigar_code', label: 'Karigar Code', width: 150 },
    { id: 'contact_number', label: 'Contact', width: 140 },
    { id: 'city', label: 'City', width: 120 },
    { id: 'account', label: 'Account Status', width: 130 },
    { id: 'created_at', label: 'Created', width: 130 },
    { id: 'action', label: 'Action', width: 88 },
  ],
  others: [
    { id: 'ledger_name', label: 'Ledger Name', width: 200 },
    { id: 'ledger_type_name', label: 'Ledger Type', width: 150 },
    { id: 'current_balance', label: 'Balance', width: 120 },
    { id: 'account', label: 'Account Status', width: 130 },
    { id: 'created_at', label: 'Created', width: 130 },
    { id: 'action', label: 'Action', width: 88 },
  ],
};

console.log('TABLE_HEAD', TABLE_HEAD);

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

export function AccountListView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const settings = useSettingsContext();
  const table = useTable();
  const selectedCompany = useSelector((state) => state.user.selectedCompany);

  // Get tab from URL query params, default to 'dealers'
  const tabFromUrl = searchParams.get(TAB_PARAM);
  const validTab = TABS.find((tab) => tab.value === tabFromUrl)?.value || 'dealers';
  const [currentTab, setCurrentTab] = useState(validTab);
  const [tableData, setTableData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [dataTab, setDataTab] = useState(null); // Track which tab the current data belongs to

  const {
    getDealers,
    getDealersLoading,
    getCustomers,
    getCustomerDetailsLoading,
    getKarigars,
    getKarigarDetailsLoading,
    getLedgers,
    getLedgerDetailsLoading,
  } = useAccounts();

  // Memoize filtered data and only show data if it matches the current tab
  const dataFiltered = useMemo(() => {
    // Only show data if it belongs to the current tab
    if (dataTab !== currentTab || !tableData || tableData.length === 0) {
      return [];
    }
    return applyFilter({
      inputData: tableData,
      comparator: getComparator(table.order, table.orderBy),
      currentTab,
    });
  }, [tableData, table.order, table.orderBy, currentTab, dataTab]);

  const isLoading =
    getDealersLoading ||
    getCustomerDetailsLoading ||
    getKarigarDetailsLoading ||
    getLedgerDetailsLoading;

  const notFound = !dataFiltered.length && !isLoading;

  // Fetch data based on current tab with pagination
  useEffect(() => {
    let isCancelled = false; // Flag to prevent state updates if component unmounts or tab changes
    const tabBeingFetched = currentTab; // Capture the tab we're fetching for

    const fetchData = async () => {
      const companyId = selectedCompany?.company?.id;
      if (!companyId) {
        if (!isCancelled && tabBeingFetched === currentTab) {
          setTableData([]);
          setTotalCount(0);
          setDataTab(null);
        }
        return;
      }

      const page = table.page + 1;
      const pageSize = table.rowsPerPage;

      try {
        switch (currentTab) {
          case 'dealers':
            try {
              const dealerResult = await getDealers(companyId, page, pageSize);
              // Handle different response structures
              let dealers = [];
              let total = 0;

              if (Array.isArray(dealerResult)) {
                dealers = dealerResult;
                total = dealerResult.length;
              } else if (dealerResult?.data) {
                if (Array.isArray(dealerResult.data)) {
                  dealers = dealerResult.data;
                } else if (Array.isArray(dealerResult.data.results)) {
                  dealers = dealerResult.data.results;
                }
                total =
                  dealerResult.pagination?.total ||
                  dealerResult.count ||
                  dealerResult.data.count ||
                  dealers.length;
              } else if (dealerResult?.results) {
                dealers = Array.isArray(dealerResult.results) ? dealerResult.results : [];
                total = dealerResult.count || dealers.length;
              }

              // Only update if this is still the current tab and not cancelled
              if (!isCancelled && tabBeingFetched === currentTab) {
                setTableData(dealers);
                setTotalCount(total);
                setDataTab('dealers');
              }
            } catch (error) {
              console.error('Error fetching dealers:', error);
              if (!isCancelled && tabBeingFetched === currentTab) {
                toast.error('Failed to fetch dealers');
                setTableData([]);
                setTotalCount(0);
                setDataTab(null);
              }
            }
            break;
          case 'customers':
            try {
              const customerResult = await getCustomers(companyId, page, pageSize);
              // Handle different response structures
              let customers = [];
              let total = 0;

              if (Array.isArray(customerResult)) {
                customers = customerResult;
                total = customerResult.length;
              } else if (customerResult?.data) {
                if (Array.isArray(customerResult.data)) {
                  customers = customerResult.data;
                } else if (Array.isArray(customerResult.data.results)) {
                  customers = customerResult.data.results;
                }
                total =
                  customerResult.pagination?.total ||
                  customerResult.count ||
                  customerResult.data.count ||
                  customers.length;
              } else if (customerResult?.results) {
                customers = Array.isArray(customerResult.results) ? customerResult.results : [];
                total = customerResult.count || customers.length;
              }

              if (!isCancelled && tabBeingFetched === currentTab) {
                setTableData(customers);
                setTotalCount(total);
                setDataTab('customers');
              }
            } catch (error) {
              console.error('Error fetching customers:', error);
              if (!isCancelled && tabBeingFetched === currentTab) {
                toast.error('Failed to fetch customers');
                setTableData([]);
                setTotalCount(0);
                setDataTab(null);
              }
            }
            break;
          case 'karigars':
            try {
              const karigarResult = await getKarigars(companyId, page, pageSize);
              // Handle different response structures
              let karigars = [];
              let total = 0;

              if (Array.isArray(karigarResult)) {
                karigars = karigarResult;
                total = karigarResult.length;
              } else if (karigarResult?.data) {
                if (Array.isArray(karigarResult.data)) {
                  karigars = karigarResult.data;
                } else if (Array.isArray(karigarResult.data.results)) {
                  karigars = karigarResult.data.results;
                }
                total =
                  karigarResult.pagination?.total ||
                  karigarResult.count ||
                  karigarResult.data.count ||
                  karigars.length;
              } else if (karigarResult?.results) {
                karigars = Array.isArray(karigarResult.results) ? karigarResult.results : [];
                total = karigarResult.count || karigars.length;
              }

              if (!isCancelled && tabBeingFetched === currentTab) {
                setTableData(karigars);
                setTotalCount(total);
                setDataTab('karigars');
              }
            } catch (error) {
              console.error('Error fetching karigars:', error);
              if (!isCancelled && tabBeingFetched === currentTab) {
                toast.error('Failed to fetch karigars');
                setTableData([]);
                setTotalCount(0);
                setDataTab(null);
              }
            }
            break;
          case 'others':
            try {
              const ledgerResult = await getLedgers(companyId, page, pageSize);
              // Handle different response structures
              let ledgers = [];
              let total = 0;

              if (Array.isArray(ledgerResult)) {
                ledgers = ledgerResult;
                total = ledgerResult.length;
              } else if (ledgerResult?.data) {
                if (Array.isArray(ledgerResult.data)) {
                  ledgers = ledgerResult.data;
                } else if (Array.isArray(ledgerResult.data.results)) {
                  ledgers = ledgerResult.data.results;
                }
                total =
                  ledgerResult.pagination?.total ||
                  ledgerResult.count ||
                  ledgerResult.data.count ||
                  ledgers.length;
              } else if (ledgerResult?.results) {
                ledgers = Array.isArray(ledgerResult.results) ? ledgerResult.results : [];
                total = ledgerResult.count || ledgers.length;
              }

              if (!isCancelled && tabBeingFetched === currentTab) {
                setTableData(ledgers);
                setTotalCount(total);
                setDataTab('others');
              }
            } catch (error) {
              console.error('Error fetching ledgers:', error);
              if (!isCancelled && tabBeingFetched === currentTab) {
                toast.error('Failed to fetch ledgers');
                setTableData([]);
                setTotalCount(0);
                setDataTab(null);
              }
            }
            break;
          default:
            break;
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        if (!isCancelled && tabBeingFetched === currentTab) {
          toast.error('Failed to fetch data');
          setTableData([]);
          setTotalCount(0);
          setDataTab(null);
        }
      }
    };

    fetchData();

    // Cleanup function to cancel any pending state updates if tab changes
    return () => {
      isCancelled = true;
    };
  }, [
    currentTab,
    table.page,
    table.rowsPerPage,
    getDealers,
    getCustomers,
    getKarigars,
    getLedgers,
    selectedCompany,
  ]);

  const handleChangeTab = useCallback(
    (event, newValue) => {
      // Clear selection when changing tabs
      table.onSelectAllRows(false, []);
      setCurrentTab(newValue);
      table.onChangePage(null, 0); // Reset to first page when changing tabs

      // Update URL query parameter
      const queryString = new URLSearchParams({ [TAB_PARAM]: newValue }).toString();
      router.replace(`${pathname}?${queryString}`, { replace: true });
    },
    [table, router, pathname]
  );

  // Initialize URL with default tab if no tab parameter exists
  useEffect(() => {
    const urlTab = searchParams.get(TAB_PARAM);
    if (!urlTab) {
      const queryString = new URLSearchParams({ [TAB_PARAM]: 'dealers' }).toString();
      router.replace(`${pathname}?${queryString}`, { replace: true });
    }
  }, [pathname, router, searchParams]);

  // Sync tab from URL when it changes externally (e.g., browser back/forward)
  useEffect(() => {
    const urlTab = searchParams.get(TAB_PARAM);
    const newValidTab = TABS.find((tab) => tab.value === urlTab)?.value || 'dealers';
    if (newValidTab !== currentTab) {
      setCurrentTab(newValidTab);
      table.onChangePage(null, 0);
    }
  }, [searchParams, currentTab, table]);

  const handleAddClick = useCallback(() => {
    // Map tab names to account type names
    const accountTypeMap = {
      dealers: 'dealer',
      customers: 'customer',
      karigars: 'karigar',
      others: 'others',
    };

    const accountType = accountTypeMap[currentTab] || '';
    const url = accountType
      ? `${paths.account.creation}?type=${accountType}`
      : paths.account.creation;

    router.push(url);
  }, [router, currentTab]);

  const handleEditRow = useCallback(
    (row) => {
      // Map tab names to account type names
      const accountTypeMap = {
        dealers: 'dealer',
        customers: 'customer',
        karigars: 'karigar',
        others: 'others',
      };

      const accountType = accountTypeMap[currentTab] || '';
      const accountId = row.id || row.account?.id;

      if (!accountId) {
        toast.error('Account ID is required for editing');
        return;
      }

      // Use proper edit route with account type: /account/edit/:id?type=dealer
      const url = accountType
        ? `${paths.account.edit(accountId)}?type=${accountType}`
        : paths.account.edit(accountId);

      router.push(url);
    },
    [router, currentTab]
  );

  const renderTableRow = (row) => {
    const commonProps = {
      key: row.id,
      row,
      selected: table.selected.includes(row.id),
      onSelectRow: () => table.onSelectRow(row.id),
      onEditRow: () => handleEditRow(row),
    };

    switch (currentTab) {
      case 'dealers':
        return <AccountDealerTableRow {...commonProps} />;
      case 'customers':
        return <AccountCustomerTableRow {...commonProps} />;
      case 'karigars':
        return <AccountKarigarTableRow {...commonProps} />;
      case 'others':
        return <AccountOthersTableRow {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <CustomBreadcrumbs
        heading="Account Management"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Account', href: paths.account.list },
          { name: 'List' },
        ]}
        action={
          <PermissionGate permission="user.create">
            <Button
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={handleAddClick}
            >
              Add Account
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
          />

          <Scrollbar>
            <Table
              key={`table-${currentTab}`}
              size={table.dense ? 'small' : 'medium'}
              sx={{ minWidth: 960 }}
            >
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
                {isLoading ? (
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
                    {dataFiltered.map((row) => renderTableRow(row))}
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
          onRowsPerPageChange={table.onRowsPerPageChange}
        />
      </Card>
    </Container>
  );
}
