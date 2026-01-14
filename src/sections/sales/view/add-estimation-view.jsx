import { useForm, useFieldArray } from 'react-hook-form';
import { useCallback, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import { useSettingsContext } from 'src/components/settings';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';
import { CustomerModal } from './customer-modal';


export function AddEstimationView() {
    const settings = useSettingsContext();
    const [modalOpen, setModalOpen] = useState(false);

    const defaultValues = useMemo(
        () => ({
            customer: null,
            product_category: 'Gold',
            salesman: null,
            bill_no: '#001',
            tax_bill: false,
            tag: [],
            items: [],
            discount_type: '',
            discount_value: 0,
            taxable_amount: 0,
            round_off_amount: 0,
            grand_total: 0,
        }),
        []
    );

    const methods = useForm({
        defaultValues,
    });

    const {
        watch,
        control,
        handleSubmit,
    } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

    const currentCustomer = watch('customer');

    const onSubmit = handleSubmit(async (data) => {
        console.info('DATA', data);
        // Logic to save data would go here
    });

    const handleAddCustomerClick = () => {
        setModalOpen(true);

    }

    const handleAddRow = () => {
        append({
            code: '',
            sub_type: null,
            gr_wt: '',
            less_wt: '',
            nt_wt: '',
            carat: '',
            rate: '',
            mk_chrg: '',
            oth_chrg: '',
            amount: '',
        });
    };

    const handleModalSave = useCallback(
        async (formData) => {
        },
        []
    );

    const handleModalClose = useCallback(() => {
        setModalOpen(false);
    }, []);

    const renderModal = () => {
        const modalProps = {
            open: modalOpen,
            onClose: handleModalClose,
            onSave: handleModalSave,
        };
        return <CustomerModal {...modalProps} />
    }
    return (
        <Container maxWidth={settings.themeStretch ? false : 'xl'}>
            <CustomBreadcrumbs
                heading="Add Estimation"
                sx={{ mb: 1 }}
            />

            <Form methods={methods} onSubmit={onSubmit}>
                <Card sx={{ p: 3 }}>
                    {/* Row 1: Search Customer, Category, Salesman, Bill No, Tax Bill */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid size={3}>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                                <Typography variant="subtitle2">Search Customer</Typography>
                                <IconButton onClick={handleAddCustomerClick} size="small" color="success" sx={{ bgcolor: 'success.lighter', color: 'success.main', '&:hover': { bgcolor: 'success.light', color: 'common.white' }, width: 24, height: 24 }}>
                                    <Iconify icon="mingcute:add-fill" width={16} />
                                </IconButton>
                            </Stack>
                            <Field.Autocomplete
                                name="customer"
                                placeholder="Search Customer"
                                options={[
                                    {
                                        name: 'Cus1',
                                        customer_name: 'Cus1',
                                        whatsapp_no: '7485784596',
                                        city: 'Varanasi',
                                        address: 'Sigra',
                                        state: 'UP',
                                        gst_no: '22AAAAA0000A1Z5',
                                        pan_no: 'ABCDE1234F'
                                    }
                                ]}
                                getOptionLabel={(option) => option.name || ''}
                            />
                        </Grid>

                        <Grid size={2}>
                            <Box sx={{ mb: 1 }}>
                                <Typography variant="subtitle2">Product Category*</Typography>
                            </Box>
                            <Field.Select name="product_category" native={false}>
                                <option value="Gold">Gold</option>
                                <option value="Silver">Silver</option>
                            </Field.Select>
                        </Grid>

                        <Grid size={3}>
                            <Box sx={{ mb: 1 }}>
                                <Typography variant="subtitle2">Search Salesman</Typography>
                            </Box>
                            <Field.Autocomplete
                                name="salesman"
                                placeholder="Search Salesman"
                                options={[]}
                                getOptionLabel={(option) => option.name || ''}
                            />
                        </Grid>

                        <Grid size={2}>
                            <Box sx={{ mb: 1 }}>
                                <Typography variant="subtitle2">Bill No.*</Typography>
                            </Box>
                            <Field.Text name="bill_no" disabled sx={{ bgcolor: 'action.hover' }} />
                        </Grid>

                        <Grid size={2}>
                            <Box sx={{ mb: 1 }}>
                                <Typography variant="subtitle2">Tax Bill</Typography>
                            </Box>
                            <Field.Switch name="tax_bill" label={watch('tax_bill') ? 'Yes' : 'No'} labelPlacement="end" />
                        </Grid>
                    </Grid>

                    {currentCustomer && (
                        <Grid container sx={{ mb: 3 }}>
                            <Accordion sx={{ width: '100%', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                                <AccordionSummary expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}>
                                    <Typography variant="subtitle1">Customer info</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Grid container spacing={2}>
                                        <Grid size={3}>
                                            <Typography variant="subtitle2" sx={{ mb: 1 }}>Customer Bill Name*</Typography>
                                            <Field.Text name="customer_bill_name" value={currentCustomer.customer_name || ''} InputProps={{ readOnly: true }} />
                                        </Grid>
                                        <Grid size={3}>
                                            <Typography variant="subtitle2" sx={{ mb: 1 }}>Phone No.*</Typography>
                                            <Field.Text name="phone_no" value={currentCustomer.whatsapp_no || ''} InputProps={{ readOnly: true }} />
                                        </Grid>
                                        <Grid size={3}>
                                            <Typography variant="subtitle2" sx={{ mb: 1 }}>City.</Typography>
                                            <Field.Text name="city" value={currentCustomer.city || ''} InputProps={{ readOnly: true }} />
                                        </Grid>
                                        <Grid size={3}>
                                            <Typography variant="subtitle2" sx={{ mb: 1 }}>Address</Typography>
                                            <Field.Text name="address" value={currentCustomer.address || ''} InputProps={{ readOnly: true }} />
                                        </Grid>
                                        <Grid size={3}>
                                            <Typography variant="subtitle2" sx={{ mb: 1 }}>State.</Typography>
                                            <Field.Text name="state" value={currentCustomer.state || ''} InputProps={{ readOnly: true }} />
                                        </Grid>
                                        <Grid size={3}>
                                            <Typography variant="subtitle2" sx={{ mb: 1 }}>GST No.</Typography>
                                            <Field.Text name="gst_no" value={currentCustomer.gst_no || ''} InputProps={{ readOnly: true }} />
                                        </Grid>
                                        <Grid size={3}>
                                            <Typography variant="subtitle2" sx={{ mb: 1 }}>PAN No.</Typography>
                                            <Field.Text name="pan_no" value={currentCustomer.pan_no || ''} disabled sx={{ bgcolor: 'action.hover' }} />
                                        </Grid>
                                    </Grid>
                                </AccordionDetails>
                            </Accordion>
                        </Grid>
                    )}

                    {/* Row 2: Select Tag */}
                    <Grid container>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                            <Typography variant="subtitle2">Select Tag</Typography>
                            <IconButton onClick={handleAddRow} size="small" color="success" sx={{ bgcolor: 'success.lighter', color: 'success.main', '&:hover': { bgcolor: 'success.light', color: 'common.white' }, width: 24, height: 24 }}>
                                <Iconify icon="mingcute:add-fill" width={16} />
                            </IconButton>
                        </Stack>
                    </Grid>
                    <Grid container sx={{ mb: 3 }}>
                        <Field.Autocomplete
                            name="tag"
                            multiple
                            freeSolo
                            fullWidth
                            options={['O/NTAG_4', 'O/NTAG_3', 'O/NTAG_1', 'ETEST_211', 'ETEST_210']}
                            getOptionLabel={(option) => option}
                            ChipProps={{ size: 'small' }}
                        />
                    </Grid>

                    {/* Row 3: Table */}
                    <Grid container sx={{ mb: 3 }}>
                        <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ width: 40 }}>-</TableCell>
                                        <TableCell>No</TableCell>
                                        <TableCell>Code</TableCell>
                                        <TableCell width={160}>Sub Type</TableCell>
                                        <TableCell>Gr.Wt</TableCell>
                                        <TableCell>Less.Wt</TableCell>
                                        <TableCell>Nt.Wt</TableCell>
                                        <TableCell>Carat</TableCell>
                                        <TableCell>Rate *</TableCell>
                                        <TableCell>Mk.Chrg</TableCell>
                                        <TableCell>Oth.Chrg</TableCell>
                                        <TableCell>Amount</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {fields.map((item, index) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <IconButton onClick={() => remove(index)} size="small" color="error" sx={{ bgcolor: 'error.main', color: 'common.white', '&:hover': { bgcolor: 'error.dark' }, width: 24, height: 24, borderRadius: 0.5 }}>
                                                    <Iconify icon="mingcute:close-fill" width={16} />
                                                </IconButton>
                                            </TableCell>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>
                                                <Field.Text name={`items[${index}].code`} size="small" sx={{ bgcolor: 'background.neutral' }} />
                                            </TableCell>
                                            <TableCell>
                                              <Field.Autocomplete
                                                name={`items[${index}].sub_type`}
                                                placeholder="Search"
                                                options={[]}
                                                getOptionLabel={(option) => option.name || ''}
                                                size="small"
                                              />
                                            </TableCell>
                                            <TableCell>
                                                <Field.Text name={`items[${index}].gr_wt`} size="small" />
                                            </TableCell>
                                            <TableCell>
                                                <Field.Text name={`items[${index}].less_wt`} size="small" />
                                            </TableCell>
                                            <TableCell>
                                                <Field.Text name={`items[${index}].nt_wt`} size="small" sx={{ bgcolor: 'background.neutral' }} />
                                            </TableCell>
                                            <TableCell>
                                                <Field.Text name={`items[${index}].carat`} size="small" sx={{ bgcolor: 'background.neutral' }} />
                                            </TableCell>
                                            <TableCell>
                                                <Field.Text name={`items[${index}].rate`} size="small" />
                                            </TableCell>
                                            <TableCell>
                                                <Field.Text name={`items[${index}].mk_chrg`} size="small" />
                                            </TableCell>
                                            <TableCell>
                                                <Field.Text name={`items[${index}].oth_chrg`} size="small" />
                                            </TableCell>
                                            <TableCell>
                                                <Field.Text name={`items[${index}].amount`} size="small" />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {fields.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={12} align="center" sx={{ height: 100 }}>
                                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>No items added</Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    <TableRow sx={{ bgcolor: 'background.neutral', '& td': { fontWeight: 'bold' } }}>
                                        <TableCell colSpan={4} align="right">Total</TableCell>
                                        <TableCell>0.000</TableCell>
                                        <TableCell>0.000</TableCell>
                                        <TableCell />
                                        <TableCell />
                                        <TableCell />
                                        <TableCell>0.00</TableCell>
                                        <TableCell>0.00</TableCell>
                                        <TableCell>0.00</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>

                    {/* Row 4: Calculations */}
                    <Grid container spacing={2}>
                        <Grid size={2}>
                            <Box sx={{ mb: 1 }}>
                                <Typography variant="subtitle2">Dis. Type</Typography>
                            </Box>
                            <Field.Select name="discount_type" native={false}>
                                <option value="">-- SELECT --</option>
                                <option value="amount">Amount</option>
                                <option value="percent">Percentage</option>
                            </Field.Select>
                        </Grid>
                        <Grid size={2}>
                            <Box sx={{ mb: 1 }}>
                                <Typography variant="subtitle2">Dis. Value</Typography>
                            </Box>
                            <Field.Text name="discount_value" />
                        </Grid>
                        <Grid size={3}>
                            <Box sx={{ mb: 1 }}>
                                <Typography variant="subtitle2">Taxable Amount</Typography>
                            </Box>
                            <Field.Text name="taxable_amount" disabled placeholder="0.00" sx={{ bgcolor: 'action.hover' }} />
                        </Grid>
                        <Grid size={2}>
                            <Box sx={{ mb: 1 }}>
                                <Typography variant="subtitle2">Round Off Amt.</Typography>
                            </Box>
                            <Field.Text name="round_off_amount" disabled placeholder="00" sx={{ bgcolor: 'action.hover' }} />
                        </Grid>
                        <Grid size={3}>
                            <Box sx={{ mb: 1 }}>
                                <Typography variant="subtitle2">Grand Total</Typography>
                            </Box>
                            <Field.Text name="grand_total" disabled placeholder="0.00" sx={{ bgcolor: 'action.hover' }} />
                        </Grid>

                        {/* Bottom Buttons */}
                        <Grid xs={12}>
                            <Button variant="outlined" color="primary" onClick={onSubmit} sx={{ mr: 2 }}>
                                Save & Print
                            </Button>
                        </Grid>

                    </Grid>
                </Card>
            </Form>
            {renderModal()}
        </Container>
    );
}
