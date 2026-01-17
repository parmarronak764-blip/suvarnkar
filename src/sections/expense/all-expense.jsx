import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

import Container from '@mui/material/Container';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import React from 'react';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Iconify } from 'src/components/iconify';
import PermissionGate from 'src/components/PermissionGate';
import { Scrollbar } from 'src/components/scrollbar';
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';
import { table } from 'src/theme/core/components/table';
import { TableHeadCustom } from 'src/components/table';
import TableBody from '@mui/material/TableBody';

const TABLE_HEAD = [
  { id: 'date-time', label: 'Date Time' },
  { id: 'address', label: 'Address' },
  { id: 'no', label: 'Sr. No.' },
  { id: 'expense-type', label: 'Expense Type' },
  { id: 'amount', label: 'Amount' },
  { id: 'description', label: 'Description' },
  { id: 'action', label: 'Action', width: 88 },
];

function AllExpense() {
  return (
    <Container maxWidth="xl">
      <CustomBreadcrumbs
        heading="List"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Expense' },
          { name: 'List' },
        ]}
        action={
          <PermissionGate permission="user.create">
            <Button
              component={RouterLink}
              href={paths.expense.addExpense}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              Add Expense
            </Button>
          </PermissionGate>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />
      <Scrollbar sx={{ width: '100%' }}>
        <Table size={table.dense ? 'small' : 'medium'} sx={{ width: '100%' }}>
          <TableHeadCustom
            order={table.order}
            orderBy={table.orderBy}
            headCells={TABLE_HEAD}
            // rowCount={dataFiltered.length}
            // numSelected={table.selected.length}
            onSort={table.onSort}
            // onSelectAllRows={(checked) =>
            //   table.onSelectAllRows(
            //     checked,
            //     dataFiltered?.map((row) => row.id)
            //   )
            // }
          />

          <TableBody>
            {false ? (
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
                    Loading users...
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              <>
                <TableRow>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>Expense</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>Expense</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>Expense</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>Expense</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>Expense</TableCell>
                </TableRow>
              </>
            )}
          </TableBody>
        </Table>
      </Scrollbar>
    </Container>
  );
}

export default AllExpense;
