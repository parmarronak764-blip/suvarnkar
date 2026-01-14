import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { fCurrency, fNumber } from 'src/utils/formate-number';
import { fDate, fDateTime } from 'src/utils/format-time';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { LoadingScreen } from 'src/components/loading-screen';

import { usePurchases } from 'src/hooks/usePurchases';

// ----------------------------------------------------------------------

export function PurchaseDetailsView({ id }) {
  const router = useRouter();
  const { getPurchaseById, loading } = usePurchases();

  const [purchase, setPurchase] = useState(null);

  useEffect(() => {
    const fetchPurchase = async () => {
      try {
        const result = await getPurchaseById(id);
        if (result.success) {
          setPurchase(result.data);
        } else {
          toast.error(result.message || 'Failed to fetch purchase details');
          router.push(paths.purchase.list);
        }
      } catch (error) {
        console.error('Error fetching purchase:', error);
        toast.error('Failed to fetch purchase details');
        router.push(paths.purchase.list);
      }
    };

    if (id) {
      fetchPurchase();
    }
  }, [id, getPurchaseById, router]);

  const handleEdit = () => {
    router.push(paths.purchase.creation);
  };

  const handleBack = () => {
    router.push(paths.purchase.list);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'gold':
        return 'warning';
      case 'silver':
        return 'info';
      case 'platinum':
        return 'secondary';
      case 'gemstone':
        return 'primary';
      default:
        return 'default';
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!purchase) {
    return (
      <DashboardContent>
        <Alert severity="error">Purchase not found</Alert>
      </DashboardContent>
    );
  }

  const hasPlatinum = purchase.category.includes('platinum');

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading={`Purchase Details - ${purchase.billNo}`}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Purchase', href: paths.purchase.list },
          { name: purchase.billNo },
        ]}
        action={
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<Iconify icon="solar:pen-bold" />}
              onClick={handleEdit}
            >
              Edit Purchase
            </Button>
            <Button
              variant="contained"
              startIcon={<Iconify icon="solar:arrow-left-bold" />}
              onClick={handleBack}
            >
              Back to List
            </Button>
          </Stack>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Grid container spacing={3}>
        {/* General Information */}
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
              <Iconify icon="solar:document-text-bold" sx={{ mr: 1 }} />
              General Information
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Bill Number
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {purchase.billNo}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Bill Date
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {fDate(purchase.billDate)}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Category
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip
                        label={purchase.categoryLabel}
                        color={getCategoryColor(purchase.category)}
                        variant="soft"
                        size="small"
                      />
                    </Box>
                  </Box>
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Receipt Number
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {purchase.receiptNo}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Status
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip
                        label={purchase.status}
                        color={getStatusColor(purchase.status)}
                        variant="soft"
                        size="small"
                      />
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Created At
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {fDateTime(purchase.createdAt)}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Dealer Information */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
              <Iconify icon="solar:user-bold" sx={{ mr: 1 }} />
              Dealer Information
            </Typography>

            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Dealer Name
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {purchase.dealer.dealerName}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Owner Name
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {purchase.dealer.ownerName}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Phone Number
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {purchase.dealer.phone}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Dealer Code
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {purchase.dealer.dealerCode}
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>

        {/* Product Details */}
        <Grid item xs={12}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
              <Iconify icon="solar:box-bold" sx={{ mr: 1 }} />
              Product Details
            </Typography>

            <TableContainer>
              <Scrollbar>
                <Table size="small" sx={{ minWidth: 1200 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Sr.No</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Sub Type</TableCell>
                      <TableCell>Pcs</TableCell>
                      <TableCell>Gross Wt</TableCell>
                      <TableCell>Less Wt</TableCell>
                      <TableCell>Net Wt</TableCell>
                      <TableCell>Touch</TableCell>
                      <TableCell>Wastage %</TableCell>
                      <TableCell>Total/Pure WT</TableCell>
                      <TableCell>MRP Rate</TableCell>
                      <TableCell>Labour Rate</TableCell>
                      <TableCell>Other Charges</TableCell>
                      <TableCell>Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {purchase.products.map((product, index) => (
                      <TableRow key={index}>
                        <TableCell>{product.srNo}</TableCell>
                        <TableCell>{product.description}</TableCell>
                        <TableCell>{product.subType}</TableCell>
                        <TableCell>{product.pcs}</TableCell>
                        <TableCell>{fNumber(product.grossWeight)} gm</TableCell>
                        <TableCell>{fNumber(product.lessWeight)} gm</TableCell>
                        <TableCell>{fNumber(product.netWeight)} gm</TableCell>
                        <TableCell>{product.touch}</TableCell>
                        <TableCell>{fNumber(product.wastagePercent)}%</TableCell>
                        <TableCell>{fNumber(product.totalPureWeight)} gm</TableCell>
                        <TableCell>{fCurrency(product.mrpRate)}</TableCell>
                        <TableCell>{fCurrency(product.labourRate)}</TableCell>
                        <TableCell>{fCurrency(product.otherCharges)}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{fCurrency(product.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Scrollbar>
            </TableContainer>
          </Card>
        </Grid>

        {/* Totals Summary */}
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
              <Iconify icon="solar:calculator-bold" sx={{ mr: 1 }} />
              Purchase Summary
            </Typography>

            <Grid container spacing={3}>
              {/* Gold Summary */}
              <Grid item xs={12}>
                <Paper
                  sx={{
                    p: 2,
                    bgcolor: 'warning.lighter',
                    border: '1px solid',
                    borderColor: 'warning.main',
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 2, color: 'warning.dark', fontWeight: 600 }}
                  >
                    Gold Summary
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Total Gold Pcs
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {purchase.totals.totalGoldPcs}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={6} sm={3}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Total Gross Weight
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {fNumber(purchase.totals.totalGrossWeight)} gm
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={6} sm={3}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Total Net Weight
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {fNumber(purchase.totals.totalNetWeight)} gm
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={6} sm={3}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Total Gold Amount
                        </Typography>
                        <Typography variant="body2" fontWeight={600} color="warning.dark">
                          {fCurrency(purchase.totals.totalGoldAmount)}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Platinum Summary (if applicable) */}
              {hasPlatinum && (
                <Grid item xs={12}>
                  <Paper
                    sx={{
                      p: 2,
                      bgcolor: 'secondary.lighter',
                      border: '1px solid',
                      borderColor: 'secondary.main',
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{ mb: 2, color: 'secondary.dark', fontWeight: 600 }}
                    >
                      Platinum Summary
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Total Platinum Net Weight
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {fNumber(purchase.totals.totalPlatNetWeight)} gm
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid item xs={6}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Total Platinum Amount
                          </Typography>
                          <Typography variant="body2" fontWeight={600} color="secondary.dark">
                            {fCurrency(purchase.totals.totalPlatAmount)}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Card>
        </Grid>

        {/* Payment Information */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
              <Iconify icon="solar:card-bold" sx={{ mr: 1 }} />
              Payment Information
            </Typography>

            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Payment Mode
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {purchase.payment.paymentModeLabel}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Total Amount
                </Typography>
                <Typography variant="body1" fontWeight={600} color="primary.main">
                  {fCurrency(purchase.payment.totalAmount)}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Pending Amount
                </Typography>
                <Typography variant="body1" fontWeight={600} color="warning.main">
                  {fCurrency(purchase.payment.pendingAmount)}
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Grand Total
                </Typography>
                <Typography variant="h6" fontWeight={700} color="primary.main">
                  {fCurrency(purchase.grandTotal)}
                </Typography>
              </Box>

              {purchase.payment.notes && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Notes
                  </Typography>
                  <Typography variant="body2">{purchase.payment.notes}</Typography>
                </Box>
              )}
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
