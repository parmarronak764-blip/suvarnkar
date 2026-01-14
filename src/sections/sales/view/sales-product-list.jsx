import PropTypes from 'prop-types';
import { useState, useCallback, useEffect } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import Grid from '@mui/material/Grid';

import { Iconify } from 'src/components/iconify';
import { Field } from 'src/components/hook-form';
import { CustomerPurchaseModal } from './customer-purchase-modal';

// ----------------------------------------------------------------------

export default function SalesProductList() {
  const { control, watch, setValue } = useFormContext();
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'products',
  });

  const {
    fields: paymentFields,
    append: appendPayment,
    remove: removePayment,
  } = useFieldArray({
    control,
    name: 'payments',
  });

  const {
    fields: returnPaymentFields,
    append: appendReturnPayment,
    remove: removeReturnPayment,
  } = useFieldArray({
    control,
    name: 'return_payments',
  });

  const products = watch('products');

  const handleAddKey = useCallback(() => {
    append({
      code: null,
      product_category: '',
      product_type: '',
      gold_carat: '',
      gr_wt: '',
      less_wt: '',
      gold_nt_wt: '',
      gold_rate: '',
      gold_amt: '',
      dis_type: '',
      dis_value: 0,
      dis_aft_mk_chrg: 0,
      amt: 0,
    });
  }, [append]);

  const handleRemove = useCallback(
    (index) => {
      remove(index);
    },
    [remove]
  );

  // Append one item initially if empty
  useEffect(() => {
    if (fields.length === 0) {
      handleAddKey();
    }
  }, [fields.length, handleAddKey]);

  // Calculate Totals
  const totalPCs = products?.length || 0;
  // Fallback to 0 if NaN?
  const totalGrWt = products?.reduce((sum, item) => sum + Number(item.gr_wt || 0), 0).toFixed(3);
  const totalNetWt = products
    ?.reduce((sum, item) => sum + Number(item.gold_nt_wt || 0), 0)
    .toFixed(3);
  const totalAmt = products?.reduce((sum, item) => sum + Number(item.amt || 0), 0).toFixed(2);

  return (
    <>
      <Stack spacing={3}>
        {fields.map((item, index) => (
          <SalesProductItem key={item.id} index={index} onRemove={() => handleRemove(index)} />
        ))}
      </Stack>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
        sx={{ mt: 3 }}
      >
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            color="primary"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={handleAddKey}
            variant="contained"
          >
            Product
          </Button>

          <Button
            size="medium"
            color="success"
            startIcon={<Iconify icon="mingcute:add-line" />}
            variant="contained"
            onClick={() => setPurchaseModalOpen(true)}
          >
            Customer Purchase
          </Button>
        </Stack>

        <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', pb: 1 }}>
          <Stack spacing={1} sx={{ minWidth: 80 }}>
            <Typography variant="subtitle2">Total PCs.</Typography>
            <Box
              sx={{
                p: 1,
                bgcolor: 'action.hover',
                borderRadius: 1,
                typography: 'subtitle2',
                textAlign: 'center',
              }}
            >
              {totalPCs}
            </Box>
          </Stack>
          <Stack spacing={1} sx={{ minWidth: 100 }}>
            <Typography variant="subtitle2">Total Gr Wt.</Typography>
            <Box
              sx={{
                p: 1,
                bgcolor: 'action.hover',
                borderRadius: 1,
                typography: 'subtitle2',
                textAlign: 'center',
              }}
            >
              {totalGrWt}
            </Box>
          </Stack>
          <Stack spacing={1} sx={{ minWidth: 100 }}>
            <Typography variant="subtitle2">Total Net Wt.</Typography>
            <Box
              sx={{
                p: 1,
                bgcolor: 'action.hover',
                borderRadius: 1,
                typography: 'subtitle2',
                textAlign: 'center',
              }}
            >
              {totalNetWt}
            </Box>
          </Stack>
          <Stack spacing={1} sx={{ minWidth: 100 }}>
            <Typography variant="subtitle2">Total Amt.</Typography>
            <Box
              sx={{
                p: 1,
                bgcolor: 'action.hover',
                borderRadius: 1,
                typography: 'subtitle2',
                textAlign: 'center',
              }}
            >
              {totalAmt}
            </Box>
          </Stack>
          <Stack spacing={1} sx={{ minWidth: 100 }}>
            <Typography variant="subtitle2">Dis. Type</Typography>
            <Field.Select name="global_dis_type" native={false} size="small">
              <MenuItem value="Percentage">Percentage - %</MenuItem>
              <MenuItem value="Fixed">Fixed Amount</MenuItem>
            </Field.Select>
          </Stack>
          <Stack spacing={1} sx={{ minWidth: 100 }}>
            <Typography variant="subtitle2">Dis. Value</Typography>
            <Field.Text name="global_dis_value" size="small" />
          </Stack>
        </Stack>
      </Stack>

      <Divider sx={{ my: 3 }} />

      {/* Financial Totals Section */}
      <Grid container spacing={3} sx={{ mb: 2 }}>
        <Grid item xs={12} size={3}>
          <Typography variant="subtitle2">Total Advance (₹)</Typography>
        </Grid>
        <Grid item xs={12} size={3}>
          <Field.Text name="total_advance" disabled InputProps={{ disabled: true }} />
        </Grid>
        <Grid item xs={12} size={3}>
          <Typography variant="subtitle2">Taxable Amt.</Typography>
        </Grid>
        <Grid item xs={12} size={3}>
          <Field.Text name="taxable_amt" disabled InputProps={{ disabled: true }} />
        </Grid>
      </Grid>
      <Grid container spacing={3} sx={{ mb: 2 }} justifyContent="flex-end">
        {/* SGST */}
        <Grid item xs={12} size={3}>
          <Typography variant="subtitle2">SGST 1.5%</Typography>
        </Grid>
        <Grid item xs={12} size={3}>
          <Field.Text name="sgst_amt" disabled InputProps={{ disabled: true }} />
        </Grid>
      </Grid>
      <Grid container spacing={3} sx={{ mb: 2 }} justifyContent="flex-end">
        <Grid item xs={12} size={3}>
          <Typography variant="subtitle2">CGST 1.5%</Typography>
        </Grid>
        <Grid item xs={12} size={3}>
          <Field.Text name="cgst_amt" disabled InputProps={{ disabled: true }} />
        </Grid>
      </Grid>
      <Grid container spacing={3} sx={{ mb: 2 }}>
        <Grid item xs={12} size={3}>
          <Typography variant="subtitle2">Purchase Total (₹)</Typography>
        </Grid>
        <Grid item xs={12} size={3}>
          <Field.Text name="purchase_total" disabled InputProps={{ disabled: true }} />
        </Grid>
        <Grid item xs={12} size={3}>
          <Typography variant="subtitle2">IGST</Typography>
        </Grid>
        <Grid item xs={12} size={3}>
          <Field.Checkbox name="igst_checked" sx={{ p: 0, m: 0 }} />
        </Grid>
      </Grid>

      <Grid container spacing={2} alignItems="start" justifyContent="flex-end" sx={{ mb: 2 }}>
        <Grid item xs={12} size={3}>
          <Typography variant="subtitle2">R.Off Amt.</Typography>
        </Grid>
        <Grid item xs={12} size={3}>
          <Field.Text name="r_off_amt" />
        </Grid>
      </Grid>
      <Grid container spacing={2} alignItems="start" justifyContent="flex-end">
        {/* Grand Total */}
        <Grid item xs={12} size={3}>
          <Typography variant="subtitle2">Grand Total</Typography>
        </Grid>
        <Grid item xs={12} size={3}>
          <Field.Text name="grand_total" disabled InputProps={{ disabled: true }} />
        </Grid>
      </Grid>
      <Divider sx={{ my: 3 }} />

      {/* Sales Note */}
      <Stack spacing={1} sx={{ mt: 3 }}>
        <Typography variant="subtitle2">Sales Note</Typography>
        <Field.Text name="sales_note" multiline rows={2} />
      </Stack>
      <Divider sx={{ my: 3 }} />

      {/* Payment Details Section */}
      <Grid container spacing={2} alignItems="center" sx={{ mt: 3, mb: 2 }}>
        <Grid item size={9}>
          <Typography variant="h4" color="text.secondary" align="left">
            Payment Details
          </Typography>
        </Grid>
        <Grid item size={3}>
          <Stack spacing={1} alignItems="center">
            <Typography variant="subtitle2">Pay. Reminder</Typography>
            <Field.DatePicker
              name="pay_reminder_date"
              sx={{ width: '100%', maxWidth: 200 }}
              slotProps={{ textField: { size: 'small' } }}
            />
          </Stack>
        </Grid>
      </Grid>

      {paymentFields.map((item, index) => (
        <Grid container spacing={2} key={item.id} sx={{ mb: 2, mt: 3 }}>
          <Grid item xs={12} size={2}>
            <Stack spacing={1}>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Typography variant="subtitle2">
                  Payment Details
                  {index > 0 && (
                    <Box component="span" sx={{ color: 'error.main' }}>
                      *
                    </Box>
                  )}
                </Typography>
                {index > 0 && (
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => removePayment(index)}
                    sx={{
                      width: 20,
                      height: 20,
                      p: 0,
                      bgcolor: 'error.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'error.dark' },
                    }}
                  >
                    <Iconify icon="solar:trash-bin-trash-bold" width={14} />
                  </IconButton>
                )}
              </Stack>
              <Field.Select name={`payments[${index}].payment_dtls`} native={false} size="small">
                <MenuItem value="">Select payment</MenuItem>
                <MenuItem value="Cash">Cash</MenuItem>
                <MenuItem value="Card">Card</MenuItem>
                <MenuItem value="UPI">Online</MenuItem>
                <MenuItem value="Cheque">Cheque</MenuItem>
              </Field.Select>
            </Stack>
          </Grid>
          <Grid item xs={12} size={2}>
            <Stack spacing={1}>
              <Typography variant="subtitle2">Amount</Typography>
              <Field.Text name={`payments[${index}].amount`} size="small" />
            </Stack>
          </Grid>
          <Grid item xs={12} size={2}>
            <Stack spacing={1}>
              <Typography variant="subtitle2">Pending Amount</Typography>
              <Field.Text
                name={`payments[${index}].pen_amt`}
                disabled
                InputProps={{ disabled: true }}
                size="small"
              />
            </Stack>
          </Grid>
          <Grid item xs={12} size={2}>
            <Stack spacing={1}>
              <Typography variant="subtitle2">Pending Metal Wt</Typography>
              <Field.Text
                name={`payments[${index}].pen_fine_wt`}
                disabled
                InputProps={{ disabled: true }}
                size="small"
              />
            </Stack>
          </Grid>
          <Grid item xs={12} size={4}>
            <Stack spacing={1}>
              <Typography variant="subtitle2">Notes</Typography>
              <Field.Text
                name={`payments[${index}].notes`}
                placeholder="Enter Notes"
                size="small"
              />
            </Stack>
          </Grid>
        </Grid>
      ))}

      {/* Return Payment Details Section */}
      {returnPaymentFields.length > 0 && (
        <>
          <Grid
            container
            spacing={2}
            alignItems="center"
            justifyContent="center"
            sx={{ mt: 3, mb: 2 }}
          >
            <Grid item>
              <Typography variant="h5" color="text.secondary">
                Return Payment Details
              </Typography>
            </Grid>
          </Grid>

          {returnPaymentFields.map((item, index) => (
            <Grid container spacing={2} key={item.id} sx={{ mb: 2 }}>
              <Grid item xs={12} size={2}>
                <Stack spacing={1}>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Typography variant="subtitle2">
                      Payment Details
                      <Box component="span" sx={{ color: 'error.main' }}>
                        *
                      </Box>
                    </Typography>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => removeReturnPayment(index)}
                      sx={{
                        width: 20,
                        height: 20,
                        p: 0,
                        bgcolor: 'error.main',
                        color: 'white',
                        '&:hover': { bgcolor: 'error.dark' },
                      }}
                    >
                      <Iconify icon="solar:trash-bin-trash-bold" width={14} />
                    </IconButton>
                  </Stack>
                  <Field.Select
                    name={`return_payments[${index}].payment_dtls`}
                    native={false}
                    size="small"
                  >
                    <MenuItem value="">Select payment</MenuItem>
                    <MenuItem value="Cash">Cash</MenuItem>
                    <MenuItem value="Card">Card</MenuItem>
                    <MenuItem value="UPI">Online</MenuItem>
                    <MenuItem value="Cheque">Cheque</MenuItem>
                  </Field.Select>
                </Stack>
              </Grid>
              <Grid item xs={12} size={2}>
                <Stack spacing={1}>
                  <Typography variant="subtitle2">Amount</Typography>
                  <Field.Text name={`return_payments[${index}].amount`} size="small" />
                </Stack>
              </Grid>
              <Grid item xs={12} size={2}>
                <Stack spacing={1}>
                  <Typography variant="subtitle2">Pending Amount</Typography>
                  <Field.Text
                    name={`return_payments[${index}].pen_amt`}
                    disabled
                    InputProps={{ disabled: true }}
                    size="small"
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} size={2}>
                <Stack spacing={1}>
                  <Typography variant="subtitle2">Pending Metal Wt</Typography>
                  <Field.Text
                    name={`return_payments[${index}].pen_fine_wt`}
                    disabled
                    InputProps={{ disabled: true }}
                    size="small"
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} size={4}>
                <Stack spacing={1}>
                  <Typography variant="subtitle2">Notes</Typography>
                  <Field.Text
                    name={`return_payments[${index}].notes`}
                    placeholder="Enter Notes"
                    size="small"
                  />
                </Stack>
              </Grid>
            </Grid>
          ))}
        </>
      )}

      {/* Action Buttons */}
      <Stack direction="row" spacing={2} sx={{ mt: 3, mb: 10 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() =>
            appendPayment({
              payment_dtls: '',
              amount: '',
              pen_amt: '00',
              pen_fine_wt: '00',
              notes: '',
            })
          }
        >
          Add New Payment
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={() =>
            appendReturnPayment({
              payment_dtls: '',
              amount: '',
              pen_amt: '00',
              pen_fine_wt: '00',
              notes: '',
            })
          }
        >
          Return Payment
        </Button>
        <Button
          variant="outlined"
          color="info"
          sx={{ color: 'info.main', borderColor: 'info.main' }}
        >
          Save & Print
        </Button>
      </Stack>

      <CustomerPurchaseModal open={purchaseModalOpen} onClose={() => setPurchaseModalOpen(false)} />
    </>
  );
}

function SalesProductItem({ index, onRemove }) {
  const { watch, setValue } = useFormContext();

  const codeValue = watch(`products[${index}].code`);

  const handleCodeChange = (event, newValue) => {
    setValue(`products[${index}].code`, newValue);
    if (newValue) {
      setValue(`products[${index}].product_category`, 'Gold');
      setValue(`products[${index}].product_type`, 'PANDLE');
      setValue(`products[${index}].gold_carat`, '916 (22K)');
      setValue(`products[${index}].gr_wt`, '10.000');
      setValue(`products[${index}].less_wt`, '2.000');
      setValue(`products[${index}].gold_nt_wt`, '8');
      setValue(`products[${index}].gold_rate`, '0');
      setValue(`products[${index}].gold_amt`, '0.00');
      setValue(`products[${index}].dis_value`, '0');
      setValue(`products[${index}].dis_aft_mk_chrg`, '0');
      setValue(`products[${index}].amt`, '1800.00'); // Mock amt
    }
  };

  return (
    <Stack spacing={2} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography variant="subtitle2">
          {index + 1}. Code
          <Box component="span" sx={{ color: 'error.main' }}>
            *
          </Box>
        </Typography>
        {index > 0 && (
          <IconButton
            size="small"
            color="error"
            onClick={onRemove}
            sx={{
              bgcolor: 'error.main',
              color: 'common.white',
              '&:hover': { bgcolor: 'error.dark' },
            }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
          </IconButton>
        )}
        <IconButton
          size="small"
          color="success"
          sx={{
            bgcolor: 'success.main',
            color: 'common.white',
            '&:hover': { bgcolor: 'success.dark' },
          }}
        >
          <Iconify icon="solar:pen-bold" />
        </IconButton>
      </Stack>

      <Field.Autocomplete
        name={`products[${index}].code`}
        options={['ETEST 211', 'ETEST 212', 'GOLD 001']}
        label=""
        placeholder="--Select--"
        onChange={handleCodeChange}
        value={codeValue}
        sx={{ maxWidth: 300 }}
      />

      {codeValue && (
        <>
          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(4, 1fr)',
            }}
          >
            {/* Row 1 */}
            <Box sx={{ gridColumn: 'span 2' }}>
              <Stack spacing={1}>
                {/* <Typography variant="subtitle2">Product Category</Typography> */}
                <Field.Text
                  label="Product Category"
                  InputProps={{ disabled: true }}
                  name={`products[${index}].product_category`}
                  disabled
                />
              </Stack>
            </Box>
            <Box sx={{ gridColumn: 'span 2' }}>
              <Stack spacing={1}>
                {/* <Typography variant="subtitle2">Product Type</Typography> */}
                <Field.Text
                  label="Product Type"
                  name={`products[${index}].product_type`}
                  disabled
                  InputProps={{ disabled: true }}
                />
              </Stack>
            </Box>

            {/* Row 2 */}
            <Stack spacing={1}>
              {/* <Typography variant="subtitle2">
                Gold Carat
                <Box component="span" sx={{ color: 'error.main' }}>
                  *
                </Box>
              </Typography> */}
              <Field.Text
                label="Gold Carat"
                required
                name={`products[${index}].gold_carat`}
                disabled
                InputProps={{ disabled: true }}
              />
            </Stack>
            <Stack spacing={1}>
              {/* <Typography variant="subtitle2">
                Gr.Wt
                <Box component="span" sx={{ color: 'error.main' }}>
                  *
                </Box>
              </Typography> */}
              <Field.Text
                label="Gr.Wt"
                required
                name={`products[${index}].gr_wt`}
                disabled
                InputProps={{ disabled: true }}
              />
            </Stack>
            <Stack spacing={1}>
              {/* <Typography variant="subtitle2">
                Less.Wt
                <Box component="span" sx={{ color: 'error.main' }}>
                  *
                </Box>
              </Typography> */}
              <Field.Text
                label="Less.Wt"
                required
                name={`products[${index}].less_wt`}
                disabled
                InputProps={{ disabled: true }}
              />
            </Stack>
            <Stack spacing={1}>
              {/* <Typography variant="subtitle2">
                Gold Nt.Wt
                <Box component="span" sx={{ color: 'error.main' }}>
                  *
                </Box>
              </Typography> */}
              <Field.Text
                label="Gold Nt.Wt"
                required
                name={`products[${index}].gold_nt_wt`}
                disabled
                InputProps={{ disabled: true }}
              />
            </Stack>
            <Stack spacing={1}>
              {/* <Typography variant="subtitle2">
                Gold Rate
                <Box component="span" sx={{ color: 'error.main' }}>
                  *
                </Box>
              </Typography> */}
              <Field.Text label="Gold Rate" required name={`products[${index}].gold_rate`} />
            </Stack>
            <Stack spacing={1}>
              {/* <Typography variant="subtitle2">
                Gold Amt.
                <Box component="span" sx={{ color: 'error.main' }}>
                  *
                </Box>
              </Typography> */}
              <Field.Text
                label="Gold Amt."
                required
                name={`products[${index}].gold_amt`}
                disabled
                InputProps={{ disabled: true }}
              />
            </Stack>

            {/* Row 3 - Dis Type, Value, Aft Mk Chrg */}
            <Stack spacing={1}>
              {/* <Typography variant="subtitle2">Dis. Type</Typography> */}
              <Field.Select
                label="Dis. Type"
                name={`products[${index}].dis_type`}
                isWithMenuItem
                options={[{ vale: '', label: '' }]}
              >
                {/* <option value="">-- SELECT --</option>
                <option value="Percentage">Percentage - %</option>
                <option value="Fixed">Fixed Amount</option> */}
              </Field.Select>
            </Stack>
            <Stack spacing={1}>
              {/* <Typography variant="subtitle2">Dis. Value</Typography> */}
              <Field.Text label="Dis. Value" name={`products[${index}].dis_value`} />
            </Stack>
            <Stack spacing={1}>
              {/* <Typography variant="subtitle2">Dis. Aft. Mk. Chrg.</Typography> */}
              <Field.Text
                label="Dis. Aft. Mk. Chrg."
                name={`products[${index}].dis_aft_mk_chrg`}
                disabled
                InputProps={{ disabled: true }}
              />
            </Stack>
          </Box>
          <Stack alignItems="flex-end" sx={{ mt: 3 }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              {/* <Typography variant="h6">Amt</Typography> */}
              <Field.Text
                label="Amt"
                name={`products[${index}].amt`}
                disabled
                InputProps={{ disabled: true }}
                // sx={{ width: 120, bgcolor: 'action.hover' }}
              />
            </Stack>
          </Stack>
        </>
      )}
    </Stack>
  );
}

SalesProductItem.propTypes = {
  index: PropTypes.number,
  onRemove: PropTypes.func,
};
