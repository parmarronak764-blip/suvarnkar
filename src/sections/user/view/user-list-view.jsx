import { useState, useCallback, useEffect } from 'react';
import { useBoolean, useSetState } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useSettingsContext } from 'src/components/settings';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import {
  useTable,
  emptyRows,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import { UserTableRow } from '../user-table-row';
import { useUser } from 'src/hooks/useUser';
import { PermissionGate } from 'src/components/PermissionGate';

const TABLE_HEAD = [
  { id: 'name', label: 'Name' },
  { id: 'phoneNumber', label: 'Phone number' },
  { id: 'company', label: 'Company' },
  { id: 'role', label: 'Role' },
  { id: 'action', label: 'Action', width: 88 },
];

export function UserListView() {
  const settings = useSettingsContext();
  const table = useTable();

  const confirmDialog = useBoolean();
  const { fetchUsers, deleteUser, loading } = useUser();
  const [tableData, setTableData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  const filters = useSetState({ name: '', role: [], status: 'all' });
  const { state: currentFilters } = filters;

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters: currentFilters,
  });

  const canReset =
    !!currentFilters.name || currentFilters.role.length > 0 || currentFilters.status !== 'all';

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const loadData = useCallback(async () => {
    try {
      const result = await fetchUsers({
        page: table.page + 1,
        page_size: table.rowsPerPage,
      });

      if (result && result.items) {
        const mappedData = result.items.map((user) => ({
          id: user.user_id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phone,
          role: user.role,
          company: user.company,
          status: user.is_active ? 'active' : 'inactive',
          isVerified: user.is_active,
          address: user.address || '',
          avatarUrl: user.profile_image,
          idCard: user.id_card,
          modules: user.modules || [],
          country: '',
          state: '',
          city: '',
          zipCode: '',
        }));

        setTableData(mappedData);
        setTotalCount(result.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    }
  }, [fetchUsers, table.page, table.rowsPerPage]);

  const handleDeleteRow = useCallback(
    async (id) => {
      try {
        await deleteUser(id);

        await loadData();

        toast.success('User deleted successfully!');
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
      }
    },
    [deleteUser, loadData]
  );

  const handleDeleteRows = useCallback(async () => {
    try {
      // Delete all selected users
      await Promise.all(table.selected.map((userId) => deleteUser(userId)));

      // Refresh the user list after successful deletions
      await loadData();

      toast.success('Users deleted successfully!');
      table.onSelectAllRows(false, []);
    } catch (error) {
      console.error('Error deleting users:', error);
      toast.error('Failed to delete users');
    }
  }, [deleteUser, loadData, table]);

  useEffect(() => {
    loadData();
  }, [table.page, table.rowsPerPage, loadData]);

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
    <>
      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <CustomBreadcrumbs
          heading="List"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Master' },
            { name: 'User Management', href: paths.masters.userManagement },
            { name: 'List' },
          ]}
          action={
            <PermissionGate permission="user.create">
              <Button
                component={RouterLink}
                href={paths.masters.addUser}
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
              >
                Add user
              </Button>
            </PermissionGate>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Card>
          <Box sx={{ position: 'relative', width: '100%' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={dataFiltered.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  dataFiltered?.map((row) => row.id)
                )
              }
              action={
                <PermissionGate permission="user.delete">
                  <Tooltip title="Delete">
                    <IconButton color="primary" onClick={confirmDialog.onTrue}>
                      <Iconify icon="solar:trash-bin-trash-bold" />
                    </IconButton>
                  </Tooltip>
                </PermissionGate>
              }
            />

            <Scrollbar sx={{ width: '100%' }}>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ width: '100%' }}>
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
                      dataFiltered?.map((row) => row.id)
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
                          Loading users...
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                      {dataFiltered?.map((row) => (
                        <UserTableRow
                          key={row.id}
                          row={row}
                          selected={table.selected.includes(row.id)}
                          onSelectRow={() => table.onSelectRow(row.id)}
                          onDeleteRow={() => handleDeleteRow(row.id)}
                          editHref={paths.masters.editUser(row.id)}
                        />
                      ))}

                      <TableEmptyRows
                        height={table.dense ? 56 : 56 + 20}
                        emptyRows={emptyRows(table.page, table.rowsPerPage, totalCount)}
                      />

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
      </Container>

      {renderConfirmDialog()}
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters }) {
  const { name, status, role } = filters;

  const stabilizedThis = inputData?.map((el, index) => [el, index]);

  stabilizedThis?.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis?.map((el) => el[0]);

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
