import { useMemo, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Accordion from '@mui/material/Accordion';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import { useSettingsContext } from 'src/components/settings';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';
import { CustomerModal } from './customer-modal';
import SalesProductList from './sales-product-list';
import { label } from 'yet-another-react-lightbox';

//  Constants //
const defaultValues = {
  order_estimation_no: '',
  customer: null,
  product_category: '', // Added back
  salesman: null,
  bill_no: '1',
  bill_date: new Date(),
  tax_bill: true,
  outstanding: '',
  // Customer Info
  customer_bill_name: '',
  phone_no: '',
  city: '',
  address: '',
  state: '',
  gst_no: '',
  pan_no: '',
  place_of_supply: '',
  // Products
  products: [],
  global_dis_type: 'Percentage',
  global_dis_value: 0,
  // Totals
  total_advance: 0,
  purchase_total: 0,
  taxable_amt: 0,
  sgst_amt: 0,
  cgst_amt: 0,
  igst_checked: false,
  r_off_amt: 0,
  grand_total: 0,
  sales_note: '',
  payments: [
    {
      payment_dtls: '',
      amount: '',
      pen_amt: '',
      pen_fine_wt: '',
      notes: '',
    },
  ],
  return_payments: [],
  customer_purchases: [],
  pay_reminder_date: '',
};

// ----------------------------------------------------------------------

export function AddSalesView() {
  const settings = useSettingsContext();
  const [modalOpen, setModalOpen] = useState(false);
  const [accordionExpanded, setAccordionExpanded] = useState(true);

  const methods = useForm({
    defaultValues,
  });

  const { watch, setValue, handleSubmit } = methods;

  const customer = watch('customer');

  useEffect(() => {
    if (customer) {
      // Mock data population based on customer
      setValue('customer_bill_name', 'Cus1');
      setValue('phone_no', '7485784596');
      setValue('city', 'Varanasi');
      // Reset others or set real data
      setValue('place_of_supply', '');
      setAccordionExpanded(true);
    }
  }, [customer, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    console.info('DATA', data);
  });

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <CustomBreadcrumbs heading="Add Sales" sx={{ mb: 3 }} />

        <Form methods={methods} onSubmit={onSubmit}>
          <Card sx={{ p: 3 }}>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} size={3}>
                <Field.Select
                  name="order_estimation_no"
                  label="Order / Estimation No."
                  isWithMenuItem
                  options={[
                    { label: 'ORD001', value: '001' },
                    { label: 'ORD002', value: '002' },
                    { label: 'ORD003', value: '003' },
                  ]}
                />
              </Grid>

              <Grid item xs={12} size={3}>
                {/* <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                   <Typography variant="subtitle2">
                   
                    <Box component="span" sx={{ color: 'error.main' }}>
                      *
                    </Box>
                  </Typography> */}
                {/* <IconButton
                    size="small"
                    color="success"
                    onClick={() => setModalOpen(true)}
                    sx={{
                      bgcolor: 'success.lighter',
                      color: 'success.main',
                      '&:hover': { bgcolor: 'success.light', color: 'common.white' },
                      width: 24,
                      height: 24,
                    }}
                  >
                    <Iconify icon="mingcute:add-fill" width={16} />
                  </IconButton> 
                </Stack> */}
                <Field.Autocomplete
                  label="Search Customer"
                  slotProps={{ textField: { required: true } }}
                  fullWidth
                  required
                  name="customer"
                  placeholder="Search Customer"
                  options={[
                    { id: 1, name: 'Customer 1' },
                    { id: 2, name: 'Customer 2' },
                  ]}
                  getOptionLabel={(option) => option.name || ''}
                />
              </Grid>

              <Grid item xs={12} size={3}>
                {/* <Box sx={{ mb: 1 }}>
                  <Typography variant="subtitle2">
                    Product Category
                    <Box component="span" sx={{ color: 'error.main' }}>
                      *
                    </Box>
                  </Typography>
                </Box> */}
                <Field.Select
                  label="Product Category"
                  required
                  name="product_category"
                  isWithMenuItem
                  options={[
                    { label: 'Gol', value: '001' },
                    { label: 'ORD002', value: '002' },
                    { label: 'ORD003', value: '003' },
                  ]}
                />
              </Grid>

              <Grid item xs={12} size={3}>
                <Field.Autocomplete
                  slotProps={{ textField: { required: true } }}
                  label="Search Salesman"
                  name="salesman"
                  placeholder="Search Salesman"
                  options={[]}
                  getOptionLabel={(option) => option.name || ''}
                />
              </Grid>
            </Grid>

            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={3}>
                {/* <Box sx={{ mb: 1 }}>
                  <Typography variant="subtitle2">Bill No.</Typography>
                </Box> */}
                <Field.Text
                  name="bill_no"
                  label="Bill No."
                  required
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                {/* <Box sx={{ mb: 1 }}>
                  <Typography variant="subtitle2">Bill Date</Typography>
                </Box> */}
                <Field.DatePicker label="Bill Date" name="bill_date" />
              </Grid>

              <Grid item xs={12} md={3}>
                {/* <Box sx={{ mb: 1 }}>
                  <Typography variant="subtitle2">Outstanding ()</Typography>
                </Box> */}
                <Field.Text
                  name="outstanding"
                  label="Outstanding"
                  disabled
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                {/* <Box sx={{ mb: 1 }}>
                  <Typography variant="subtitle2">Tax Bill</Typography>
                </Box> */}
                <Field.Switch
                  label="Tax Bill"
                  name="tax_bill"
                  //   label={watch('tax_bill') ? 'Yes' : 'No'}
                  labelPlacement="start"
                  //   sx={{ m: 0 }}
                />
              </Grid>
            </Grid>

            {/* Customer Info Accordion */}
            {customer && (
              <Grid container sx={{ mb: 3 }}>
                <Accordion
                  expanded={accordionExpanded}
                  onChange={(e, expanded) => setAccordionExpanded(expanded)}
                  sx={{
                    width: '100%',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                  }}
                >
                  <AccordionSummary expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}>
                    <Typography variant="subtitle1">Customer info</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box
                      py={1}
                      rowGap={3}
                      columnGap={2}
                      display="grid"
                      gridTemplateColumns={{
                        xs: 'repeat(1, 1fr)',
                        sm: 'repeat(2, 1fr)',
                        md: 'repeat(4, 1fr)',
                      }}
                    >
                      <Stack spacing={1}>
                        {/* <Typography variant="caption">
                          Customer Bill Name
                          <Box component="span" sx={{ color: 'error.main' }}>
                            *
                          </Box>
                        </Typography> */}
                        <Field.Text label="Customer Bill Name" required name="customer_bill_name" />
                      </Stack>
                      <Stack spacing={1}>
                        {/* <Typography variant="caption">
                          Phone No.
                          <Box component="span" sx={{ color: 'error.main' }}>
                            *
                          </Box>
                        </Typography> */}
                        <Field.Text
                          label="Phone No."
                          required
                          name="phone_no"
                          InputProps={{ disabled: true }}
                        />
                      </Stack>
                      <Stack spacing={1}>
                        {/* <Typography variant="caption">City.</Typography> */}
                        <Field.Text label="City" name="city" InputProps={{ disabled: true }} />
                      </Stack>
                      <Stack spacing={1}>
                        {/* <Typography variant="caption">Address</Typography> */}
                        <Field.Text
                          label="Address"
                          name="address"
                          InputProps={{ disabled: true }}
                        />
                      </Stack>
                      <Stack spacing={1}>
                        {/* <Typography variant="caption">State.</Typography> */}
                        <Field.Text label="State" name="state" InputProps={{ disabled: true }} />
                      </Stack>
                      <Stack spacing={1}>
                        {/* <Typography variant="caption">GST No.</Typography> */}
                        <Field.Text label="GST No." name="gst_no" InputProps={{ disabled: true }} />
                      </Stack>
                      <Stack spacing={1}>
                        {/* <Typography variant="caption">PAN No.</Typography> */}
                        <Field.Text
                          label="PAN No."
                          name="pan_no"
                          disabled
                          InputProps={{ disabled: true }}
                        />
                      </Stack>
                      <Stack spacing={1}>
                        {/* <Typography variant="caption">Place Of Supply</Typography> */}
                        <Field.Text label="Place Of Supply" name="place_of_supply" />
                      </Stack>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Product List only shows if customer or order is selected */}
            {(customer || watch('order_estimation_no')) && <SalesProductList />}
          </Card>
        </Form>
        <CustomerModal open={modalOpen} onClose={() => setModalOpen(false)} />
      </Container>
    </LocalizationProvider>
  );
}
