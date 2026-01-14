'use client';

import type { TableHeadCellProps } from 'src/components/table';
import type { IUserItem, IUserTableFilters } from 'src/types/user';

import { useState, useCallback, useEffect } from 'react';
import { useBoolean, useSetState } from 'minimal-shared/hooks';
import { getProfileImageUrl } from 'src/utils/image-url';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import Alert from '@mui/material/Alert';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { useRouter } from 'next/navigation';

import { DashboardContent } from 'src/layouts/dashboard';
import { _roles, USER_STATUS_OPTIONS } from 'src/_mock';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  useTable,
  emptyRows,
  rowInPage,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import { UserTableRow } from './user-table-row';
import { UserTableFiltersResult } from './user-table-filters-result';

import axios,{ endpoints }from 'src/lib/axios'; // Use your existing axios instance
import { AddUserForm } from './add/add-user-form';
import { PermissionGuard } from 'src/auth/guard';

import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from 'src/redux/store';
import { insertUserInfo } from 'src/redux/slices/userInfoSlice';
import { clearUserInfo } from 'src/redux/slices/userInfoSlice';


// ----------------------------------------------------------------------

const STATUS_OPTIONS = [{ value: 'all', label: 'All' }, ...USER_STATUS_OPTIONS];

const TABLE_HEAD: TableHeadCellProps[] = [
  { id: 'name', label: 'Name' },
  { id: 'phoneNumber', label: 'Phone number', width: 180 },
  { id: 'role', label: 'Role', width: 180 },
  { id: 'status', label: 'Status', width: 100 },
  { id: '', width: 88 },
];

// ----------------------------------------------------------------------

export function UserListView() {
  const table = useTable();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { selectedCompanyId } = useSelector((state: RootState) => state.auth);

  const [formError, setFormError] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'warning' | 'info'>('success');

  useEffect(() => {
    if (formError) {
      const timer = setTimeout(() => {
        setFormError('');
      }, 3000); 

      return () => clearTimeout(timer);
    }
  }, [formError]);

  const resetUserInfo = useCallback(() => {
    dispatch(clearUserInfo());
  }, [dispatch]);

  const confirmDialog = useBoolean();

  // Set initial tableData to empty, will fill with backend data
  const [tableData, setTableData] = useState<IUserItem[]>([]);
  const [loading, setLoading] = useState(false);

  const filters = useSetState<IUserTableFilters>({ name: '', role: [], status: 'all' });
  const { state: currentFilters, setState: updateFilters } = filters;

  const [userDetailOpen, setUserDetailOpen] = useState(false);
  const [loadingUser, setLoadingUser] = useState(false);

  // Fetch users from backend on mount and when company changes
  useEffect(() => {
    const fetchUsers = async () => {
      if (!selectedCompanyId) {
        setTableData([]);
        return;
      }

      setLoading(true);
      try {
        const response = await axios.get(endpoints.masters.users, {
          params: {
            company_id: selectedCompanyId
          }
        });
        
        if (response.data.success) {
          setTableData(
            response.data.data.map((item: any) => ({
              id: item.user_id,
              name: item.name,
              email: item.email,
              phoneNumber: item.phone,
              role: item.role,
              status: item.is_active ? 'active' : 'inactive',
              address: item.address || '',
              profileImage: getProfileImageUrl(item.profile_image),
              idCard: item.id_card || '',
              modules: item.modules || [],
            }))
          );
        } else {
          setTableData([]);
          setFormError(response.data.message || 'Failed to fetch users');
          setMessageType('error');
        }
      } catch (error: any) {
        console.error('Error fetching users:', error);
        setTableData([]);
        setFormError('Failed to fetch users. Please try again.');
        setMessageType('error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [selectedCompanyId]);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters: currentFilters,
  });

  const dataInPage = rowInPage(dataFiltered, table.page, table.rowsPerPage);

  const canReset =
    !!currentFilters.name || currentFilters.role.length > 0 || currentFilters.status !== 'all';

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleDeleteRow = useCallback(
    async (id: string) => {
      try {
        const formData = new FormData();
        formData.append('id', id);
        formData.append('company_id', selectedCompanyId?.toString() || '');

        const res = await axios.post(endpoints.masters.deleteuser, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        const result = res.data;

        if (res.status === 200 && result.success) {
          setFormError('User deleted successfully!');
          setMessageType('success');
          toast.success('User deleted successfully!');
          const deleteRow = tableData.filter((row) => row.id !== id);
          setTableData(deleteRow);
          table.onUpdatePageDeleteRow(dataInPage.length);
        } else {
          const backendErrorMsg =
            result?.errors ||
            result?.message ||
            result?.detail ||
            result?.error ||
            'Failed to delete user due to an unknown error.';
          setFormError(backendErrorMsg);
          setMessageType('error');
          toast.error(backendErrorMsg);
          console.error('Backend deletion failed:', result);
        }
      } catch (error) {
        setFormError('Failed to delete user due to an unknown error.');
        setMessageType('error');
        console.error('Error during user deletion API call:', error);
      }
    },
    [dataInPage.length, table, tableData, selectedCompanyId]
  );

  const handleBulkDelete = useCallback(async () => {
    try {
      const selectedIds = table.selected;
      let successCount = 0;
      let errorCount = 0;

      for (const id of selectedIds) {
        try {
          const formData = new FormData();
          formData.append('id', id);
          formData.append('company_id', selectedCompanyId?.toString() || '');

          const res = await axios.post(endpoints.masters.deleteuser, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          if (res.status === 200 && res.data.success) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          errorCount++;
        }
      }

      if (successCount > 0) {
        setFormError(`${successCount} user(s) deleted successfully!`);
        setMessageType('success');
        toast.success(`${successCount} user(s) deleted successfully!`);
        
        // Refresh the user list
        const updatedTableData = tableData.filter((row) => !selectedIds.includes(row.id));
        setTableData(updatedTableData);
        table.onUpdatePageDeleteRow(selectedIds.length);
      }

      if (errorCount > 0) {
        setFormError(`${errorCount} user(s) failed to delete.`);
        setMessageType('error');
        toast.error(`${errorCount} user(s) failed to delete.`);
      }
    } catch (error) {
      setFormError('Failed to delete selected users.');
      setMessageType('error');
      console.error('Error during bulk deletion:', error);
    }
  }, [table.selected, tableData, table, selectedCompanyId]);

  const handleUserNameClick = async (userId: string) => {
    setLoadingUser(true);
    setUserDetailOpen(true);
    try {
      const response = await axios.get(`/api/accounts/users/${userId}/`);
      dispatch(
      insertUserInfo({
        id: response.data.user_id,
        name: response.data.name,
        email: response.data.email,
        phoneNumber: response.data.phone,
        role: response.data.role,
        status: response.data.is_active ? 'active' : 'inactive',
        address: response.data.address || '',
        idCard: response.data.id_card || '',
        profileImage: getProfileImageUrl(response.data.profile_image),
        isVerified: true,
        modules: response.data.modules || [],
        mode:1,
        password:response.data.password || ''
      })
    );
    router.push(paths.masters.addSalesman);
    } catch (error) {
      setFormError('Failed to fetch user details.');
      setMessageType('error');
      console.error('Error fetching user details:', error);
      toast.error('Failed to fetch user details.');
    } finally {
      setLoadingUser(false);
    }
  };

  const handleeditClick = async (userId: string) => {
    setLoadingUser(true);
    try {
      const response = await axios.get(`/api/accounts/users/${userId}/`);
      dispatch(
        insertUserInfo({
          id: response.data.user_id,
          name: response.data.name,
          email: response.data.email,
          phoneNumber: response.data.phone,
          role: response.data.role,
          status: response.data.is_active ? 'active' : 'inactive',
          address: response.data.address || '',
          idCard: response.data.id_card || '',
          profileImage: getProfileImageUrl(response.data.profile_image),
          isVerified: true,
          modules: response.data.modules || [],
          mode: 1,
          password: response.data.password || ''
        })
      );
      // Navigate to the edit page instead of add page
      router.push(paths.masters.editSalesman(userId));
    } catch (error) {
      setFormError('Failed to fetch user details.');
      setMessageType('error');
      console.error('Error fetching user details:', error);
      toast.error('Failed to fetch user details.');
    } finally {
      setLoadingUser(false);
    }
  };


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
            handleBulkDelete();
            confirmDialog.onFalse();
          }}
        >
          Delete
        </Button>
      }
    />
  );

  return (
    <>
      {formError && <Alert severity={messageType}>{formError}</Alert>}
      <DashboardContent>
        <CustomBreadcrumbs
          heading="Salesman"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Salesman', href: paths.dashboard.root },
            { name: 'List' },
          ]}
          action={
            <PermissionGuard hasPermission="add_salesman">
              <Button
                component={RouterLink}
                href={paths.masters.addSalesman}
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
                onClick={resetUserInfo} 
              >
                Add user
              </Button>
            </PermissionGuard>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Card>
          {canReset && (
            <UserTableFiltersResult
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
                <PermissionGuard hasPermission="delete_salesman">
                  <Tooltip title="Delete">
                    <IconButton color="primary" onClick={confirmDialog.onTrue}>
                      <Iconify icon="solar:trash-bin-trash-bold" />
                    </IconButton>
                  </Tooltip>
                </PermissionGuard>
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
                  {dataFiltered
                    .slice(
                      table.page * table.rowsPerPage,
                      table.page * table.rowsPerPage + table.rowsPerPage
                    )
                    .map((row) => (
                      <UserTableRow
                            key={row.id}
                            row={row}
                            selected={table.selected.includes(row.id)}
                            onSelectRow={() => table.onSelectRow(row.id)}
                            onDeleteRow={() => handleDeleteRow(row.id)}
                            editHref={''}
                            onUserNameClick={handleUserNameClick}
                            onEditRow={handleeditClick}
                      />
                    ))}

                  <TableEmptyRows
                    height={table.dense ? 56 : 56 + 20}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                  />

                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </Scrollbar>
          </Box>

          <TablePaginationCustom
            page={table.page}
            dense={table.dense}
            count={dataFiltered.length}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onChangeDense={table.onChangeDense}
            onRowsPerPageChange={table.onChangeRowsPerPage}
          />
        </Card>
      </DashboardContent>

      {renderConfirmDialog()}

    </>
  );
}

// ----------------------------------------------------------------------

type ApplyFilterProps = {
  inputData: IUserItem[];
  filters: IUserTableFilters;
  comparator: (a: any, b: any) => number;
};

function applyFilter({ inputData, comparator, filters }: ApplyFilterProps) {
  const { name, status, role } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter((user) => user.name.toLowerCase().includes(name.toLowerCase()));
  }

  if (status !== 'all') {
    inputData = inputData.filter((user) => user.status === status);
  }

  if (role.length) {
    inputData = inputData.filter((user) => role.includes(user.role));
  }

  return inputData;
}
