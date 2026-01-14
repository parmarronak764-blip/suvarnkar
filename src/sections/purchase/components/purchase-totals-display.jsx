import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';

import { fNumber } from 'src/utils/formate-number';

// ----------------------------------------------------------------------

export function PurchaseTotalsDisplay({ totals, category }) {
  const categoryName = category?.category_name || category?.name || '';
  const metalTypeName = category?.metal_type_name || category?.metalTypeName || '';

  // Determine bill type flags - matching product table logic
  const isOnlyGold = metalTypeName === 'GOLD';
  const isOnlyDiamond = metalTypeName === 'DIAMOND';
  const isOnlySilver = metalTypeName === 'SILVER';
  const isGoldDiamond =
    metalTypeName.includes('GOLD') &&
    metalTypeName.includes('DIAMOND') &&
    !metalTypeName.includes('PLATINUM');
  const isGoldPlatinum =
    metalTypeName.includes('GOLD') &&
    metalTypeName.includes('PLATINUM') &&
    !metalTypeName.includes('DIAMOND');
  const isGoldPlatinumDiamond =
    metalTypeName.includes('GOLD') &&
    metalTypeName.includes('PLATINUM') &&
    metalTypeName.includes('DIAMOND');

  const hasDiamond = isOnlyDiamond || isGoldDiamond || isGoldPlatinumDiamond;
  const hasPlatinum = isGoldPlatinum || isGoldPlatinumDiamond;
  const hasGold = isOnlyGold || isGoldDiamond || isGoldPlatinum || isGoldPlatinumDiamond;

  const formatWeight = (weight) => fNumber(weight);
  const formatAmount = (amount) => fNumber(amount);

  // Determine if gold/platinum rates have been added (pure weight = 0 if rate added)
  const goldRateAdded = totals.totalGoldAmount > 0 && totals.totalPureWeight === 0;
  const platinumRateAdded = totals.totalPlatAmount > 0 && totals.totalPlatNetWeight === 0;

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3 }}>
        Bill Total Summary
      </Typography>

      {/* Table format totals matching product table structure */}
      <Box sx={{ overflowX: 'auto', mb: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.100' }}>
              <TableCell sx={{ fontWeight: 700 }}>Sr. No</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
              {!isOnlySilver && <TableCell sx={{ fontWeight: 700 }}>Sub Type</TableCell>}
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                Quantity
              </TableCell>
              {!isOnlySilver && (
                <>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    Gross Weight
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    Less Weight
                  </TableCell>
                </>
              )}
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                Net Weight
              </TableCell>
              {!isOnlySilver && (
                <>
                  <TableCell sx={{ fontWeight: 700 }}>Purity /Touch</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Purchase Wastage</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    Pure Weight
                  </TableCell>
                </>
              )}
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                Other Charges
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                Purchase Making Charges
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                Purchase Rate
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                Purchase MRP
              </TableCell>
              {!isOnlySilver && (
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  Sale MRP
                </TableCell>
              )}
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                Purchase Total Amount
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Other Tag Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Total Gold/Metal Details Row */}
            {hasGold && !isOnlyDiamond && (
              <TableRow sx={{ bgcolor: 'warning.lighter' }}>
                <TableCell colSpan={2} sx={{ fontWeight: 700 }}>
                  Total Gold Details
                </TableCell>
                {!isOnlySilver && <TableCell />}
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  {totals.totalGoldPcs}
                </TableCell>
                {!isOnlySilver && (
                  <>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {formatWeight(totals.totalGrossWeight)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {formatWeight(totals.totalLessWeight)}
                    </TableCell>
                  </>
                )}
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  {formatWeight(totals.totalNetWeight)}
                </TableCell>
                {!isOnlySilver && (
                  <>
                    <TableCell />
                    <TableCell />
                    <TableCell align="right" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {formatWeight(totals.totalPureWeight)}
                    </TableCell>
                  </>
                )}
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  {formatAmount(totals.totalOtherCharges)}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  {formatAmount(totals.totalMakingCharges)}
                </TableCell>
                <TableCell />
                <TableCell />
                {!isOnlySilver && <TableCell />}
                <TableCell align="right" sx={{ fontWeight: 700, color: 'success.dark' }}>
                  {formatAmount(totals.totalGoldAmount)}
                </TableCell>
                <TableCell />
              </TableRow>
            )}

            {/* Total Platinum Details Row */}
            {hasPlatinum && totals.totalPlatNetWeight > 0 && (
              <TableRow sx={{ bgcolor: 'secondary.lighter' }}>
                <TableCell colSpan={2} sx={{ fontWeight: 700 }}>
                  Total Platinum Details
                </TableCell>
                {!isOnlySilver && <TableCell />}
                <TableCell />
                {!isOnlySilver && (
                  <>
                    <TableCell />
                    <TableCell />
                  </>
                )}
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  {formatWeight(totals.totalPlatNetWeight)}
                </TableCell>
                {!isOnlySilver && (
                  <>
                    <TableCell />
                    <TableCell />
                    <TableCell align="right" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                      {formatWeight(totals.totalPlatNetWeight)}
                    </TableCell>
                  </>
                )}
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  {formatAmount(totals.totalOtherCharges)}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  {formatAmount(totals.totalMakingCharges)}
                </TableCell>
                <TableCell />
                <TableCell />
                {!isOnlySilver && <TableCell />}
                <TableCell align="right" sx={{ fontWeight: 700, color: 'secondary.dark' }}>
                  {formatAmount(totals.totalPlatAmount)}
                </TableCell>
                <TableCell />
              </TableRow>
            )}

            {/* Total Diamond Details Row - Only for GOLD+DIAMOND, GOLD+PLATINUM+DIAMOND, or DIAMOND-only */}
            {hasDiamond && totals.totalDiamondPcs > 0 && !isOnlySilver && (
              <TableRow sx={{ bgcolor: 'info.lighter' }}>
                <TableCell colSpan={2} sx={{ fontWeight: 700 }}>
                  Total Diamond Details
                </TableCell>
                <TableCell />
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  {totals.totalDiamondPcs} (Dia Pcs)
                </TableCell>
                <TableCell />
                <TableCell />
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  {formatWeight(totals.totalDiamondWeight)}
                </TableCell>
                <TableCell />
                <TableCell />
                <TableCell />
                <TableCell />
                <TableCell />
                <TableCell />
                <TableCell />
                <TableCell />
                <TableCell align="right" sx={{ fontWeight: 700, color: 'info.dark' }}>
                  {formatAmount(totals.totalDiamondAmount)}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: 'info.dark' }}>
                  {formatAmount(totals.totalDiamondSaleAmount)}
                </TableCell>
                <TableCell />
              </TableRow>
            )}

            {/* Total Silver Details Row */}
            {isOnlySilver && (
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell colSpan={2} sx={{ fontWeight: 700 }}>
                  Total Silver Details
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  {totals.totalGoldPcs}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  {formatWeight(totals.totalNetWeight)}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  {formatAmount(totals.totalOtherCharges)}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  {formatAmount(totals.totalMakingCharges)}
                </TableCell>
                <TableCell />
                <TableCell />
                <TableCell align="right" sx={{ fontWeight: 700, color: 'success.dark' }}>
                  {formatAmount(totals.totalGoldAmount)}
                </TableCell>
                <TableCell />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>

      {/* Bill Total Balance Section */}
      <Paper
        sx={{
          p: 2,
          bgcolor: 'success.lighter',
          border: '2px solid',
          borderColor: 'success.main',
        }}
      >
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700 }}>
          Bill Total Balance
        </Typography>

        <Grid container spacing={2}>
          {/* Left side - Pure Weight Info */}
          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              {hasGold && (
                <Box>
                  <Typography variant="body2" fontWeight={600} color="primary.main">
                    Gold Pure Weight = {formatWeight(totals.totalPureWeight)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    {goldRateAdded
                      ? '(Because Purchase/Gold rate has been added)'
                      : '(Because Purchase/Gold rate not added)'}
                  </Typography>
                </Box>
              )}
              {hasPlatinum && (
                <Box>
                  <Typography variant="body2" fontWeight={600} color="secondary.main">
                    Platinum Pure Weight = {formatWeight(totals.totalPlatNetWeight)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    {platinumRateAdded
                      ? '(Because Purchase/Platinum rate has been added)'
                      : '(Because Purchase/Platinum rate not added)'}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Grid>

          {/* Right side - Amount Summary */}
          <Grid item xs={12} sm={6}>
            <Stack alignItems="flex-end" spacing={1}>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="caption" color="text.secondary">
                  Amount
                </Typography>
                <Typography variant="h6" fontWeight={700} color="success.dark">
                  {formatAmount(
                    totals.totalGoldAmount + totals.totalPlatAmount + totals.totalDiamondAmount
                  )}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                {hasGold && `${formatAmount(totals.totalGoldAmount)} (Gold Amount)`}
                {hasGold && hasPlatinum && ` + `}
                {hasPlatinum && `${formatAmount(totals.totalPlatAmount)} (Platinum Amount)`}
                {hasDiamond && totals.totalDiamondAmount > 0 && ` + `}
                {hasDiamond &&
                  totals.totalDiamondAmount > 0 &&
                  `${formatAmount(totals.totalDiamondAmount)} (Diamond Total Amount)`}
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
