import PropTypes from 'prop-types';
import { useCallback, useEffect } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Grid from '@mui/material/Grid';

import { Iconify } from 'src/components/iconify';
import { Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export function CustomerPurchaseModal({ open, onClose }) {
    const { control, watch } = useFormContext();

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'customer_purchases',
    });

    const handleAdd = useCallback(() => {
        append({
            description: '',
            gr_wt: '',
            ls_wst_wt: '',
            net_wt: '',
            purity: '',
            pure_wt_total: '',
            wst_percent: '',
            rate: '',
            amt: '',
        });
    }, [append]);

    // Add one item initially if empty
    useEffect(() => {
        if (open && fields.length === 0) {
            handleAdd();
        }
    }, [open, fields.length, handleAdd]);

    return (
        <Dialog
            fullWidth
            maxWidth="lg"
            open={open}
            onClose={onClose}
        >
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6">Add Customer Purchase</Typography>
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <Iconify icon="eva:close-fill" />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                {/* Accordion */}
                <Accordion sx={{ mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <AccordionSummary expandIcon={<Iconify icon="eva:plus-fill" />}>
                        <Typography variant="subtitle1">Customer info</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
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
                        <Stack spacing={1}>
                            <Typography variant="subtitle2">Customer Bill Name<Box component="span" sx={{ color: 'error.main' }}>*</Box></Typography>
                            <Field.Text name="customer_bill_name" />
                        </Stack>
                        <Stack spacing={1}>
                            <Typography variant="subtitle2">Phone No.<Box component="span" sx={{ color: 'error.main' }}>*</Box></Typography>
                            <Field.Text name="phone_no" sx={{ bgcolor: 'action.hover' }} />
                        </Stack>
                        <Stack spacing={1}>
                            <Typography variant="subtitle2">City.</Typography>
                            <Field.Text name="city" sx={{ bgcolor: 'action.hover' }} />
                        </Stack>
                        <Stack spacing={1}>
                            <Typography variant="subtitle2">Address</Typography>
                            <Field.Text name="address" sx={{ bgcolor: 'action.hover' }} />
                        </Stack>
                        <Stack spacing={1}>
                            <Typography variant="subtitle2">State.</Typography>
                            <Field.Text name="state" sx={{ bgcolor: 'action.hover' }} />
                        </Stack>
                        <Stack spacing={1}>
                            <Typography variant="subtitle2">GST No.</Typography>
                            <Field.Text name="gst_no" sx={{ bgcolor: 'action.hover' }} />
                        </Stack>
                        <Stack spacing={1}>
                            <Typography variant="subtitle2">PAN No.</Typography>
                            <Field.Text name="pan_no" disabled sx={{ bgcolor: 'action.hover' }} />
                        </Stack>
                        <Stack spacing={1}>
                            <Typography variant="subtitle2">Place Of Supply</Typography>
                            <Field.Text name="place_of_supply" />
                        </Stack>
                    </Box>
                    </AccordionDetails>
                </Accordion>

                    <Box sx={{ maxWidth: 200, mb:3 }}>
                         <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Sub Product Type</Typography>
                         <Field.Select name="sub_product_type" native={false} size="small">
                            <MenuItem value="">--Select--</MenuItem>
                            <MenuItem value="Type1">Type 1</MenuItem>
                            <MenuItem value="Type2">Type 2</MenuItem>
                         </Field.Select>
                    </Box>
                <Stack spacing={1}>

                     {/* Table Header */}
                    <Box
                         display="grid"
                         gridTemplateColumns={{
                             xs: 'repeat(1, 1fr)',
                             md: '1.5fr 0.8fr 1.5fr 0.8fr 0.8fr 1.5fr 0.8fr 0.8fr 1fr 0.4fr'
                         }}
                         gap={1}
                         sx={{ mb: 0.5, display: { xs: 'none', md: 'grid' } }}
                    >
                        <Typography variant="subtitle2">Description</Typography>
                        <Typography variant="subtitle2">Gr.Wt.<Box component="span" sx={{ color: 'error.main' }}>*</Box></Typography>
                        <Typography variant="subtitle2">LS./Wst.Wt.</Typography>
                        <Typography variant="subtitle2">NetWt.</Typography>
                        <Typography variant="subtitle2">Purity</Typography>
                        <Typography variant="subtitle2">Pure Wt./Total</Typography>
                        <Typography variant="subtitle2">Wst.%</Typography>
                        <Typography variant="subtitle2">Rate</Typography>
                        <Typography variant="subtitle2">Amt.</Typography>
                        <Box />
                    </Box>

                    {fields.map((item, index) => (
                        <Box
                            key={item.id}
                            display="grid"
                            gridTemplateColumns={{
                                xs: 'repeat(1, 1fr)',
                                md: '1.5fr 0.8fr 1.5fr 0.8fr 0.8fr 1.5fr 0.8fr 0.8fr 1fr 0.4fr'
                            }}
                            gap={1}
                            alignItems="center"
                        >
                             <Box sx={{ display: { xs: 'block', md: 'none' } }}><Typography variant="subtitle2">Description</Typography></Box>
                             <Field.Text name={`customer_purchases[${index}].description`} size="small" />

                             <Box sx={{ display: { xs: 'block', md: 'none' } }}><Typography variant="subtitle2">Gr.Wt.*</Typography></Box>
                             <Field.Text name={`customer_purchases[${index}].gr_wt`} size="small" />

                             <Box sx={{ display: { xs: 'block', md: 'none' } }}><Typography variant="subtitle2">LS./Wst.Wt.</Typography></Box>
                             <Field.Text name={`customer_purchases[${index}].ls_wst_wt`} size="small" />

                             <Box sx={{ display: { xs: 'block', md: 'none' } }}><Typography variant="subtitle2">NetWt.</Typography></Box>
                             <Field.Text name={`customer_purchases[${index}].net_wt`} disabled sx={{ bgcolor: 'action.hover' }} size="small" />

                             <Box sx={{ display: { xs: 'block', md: 'none' } }}><Typography variant="subtitle2">Purity</Typography></Box>
                             <Field.Text name={`customer_purchases[${index}].purity`} size="small" />

                             <Box sx={{ display: { xs: 'block', md: 'none' } }}><Typography variant="subtitle2">Pure Wt./Total</Typography></Box>
                             <Field.Text name={`customer_purchases[${index}].pure_wt_total`} disabled sx={{ bgcolor: 'action.hover' }} size="small" />

                             <Box sx={{ display: { xs: 'block', md: 'none' } }}><Typography variant="subtitle2">Wst.%</Typography></Box>
                             <Field.Text name={`customer_purchases[${index}].wst_percent`} size="small" />

                             <Box sx={{ display: { xs: 'block', md: 'none' } }}><Typography variant="subtitle2">Rate</Typography></Box>
                             <Field.Text name={`customer_purchases[${index}].rate`} size="small" />

                             <Box sx={{ display: { xs: 'block', md: 'none' } }}><Typography variant="subtitle2">Amt.</Typography></Box>
                             <Field.Text name={`customer_purchases[${index}].amt`} size="small" />
                             
                             <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                 {index > 0 && (
                                    <IconButton 
                                        color="error" 
                                        onClick={() => remove(index)}
                                        sx={{ bgcolor: 'error.lighter', color: 'error.main', '&:hover': { bgcolor: 'error.light', color: 'common.white' } }}
                                    >
                                        <Iconify icon="solar:trash-bin-trash-bold" />
                                    </IconButton>
                                )}
                             </Box>
                        </Box>
                    ))}

                    <Box>
                         <Button
                            variant="contained"
                            color="primary"
                            onClick={handleAdd}
                         >
                            Add Item
                         </Button>
                    </Box>

                    {/* Totals Section */}
                    <Box
                         display="grid"
                         gridTemplateColumns={{
                             xs: 'repeat(1, 1fr)',
                             md: '0.5fr 0.5fr 0.5fr 0.5fr 0.5fr'
                         }}
                         gap={2}
                         alignItems="center"
                         sx={{ mt: 2 }}
                    >
                         <Stack spacing={1}>
                             <Typography variant="subtitle2">T.Amt.</Typography>
                             <Field.Text name="customer_purchase_t_amt" disabled sx={{ bgcolor: 'action.hover' }} size="small" />
                         </Stack>
                         <Stack spacing={1}>
                             <Typography variant="subtitle2">Total/Pure Wt</Typography>
                             <Field.Text name="customer_purchase_total_pure_wt" disabled sx={{ bgcolor: 'action.hover' }} size="small" />
                         </Stack>
                         <Stack spacing={1}>
                             <Typography variant="subtitle2">Tax</Typography>
                             <Field.Switch 
                                name="customer_purchase_tax_enabled" 
                                label={watch('customer_purchase_tax_enabled') ? 'Yes' : 'No'} 
                                labelPlacement="start" 
                                sx={{ 
                                    m: 0,
                                    '& .MuiSwitch-switchBase.Mui-checked': {
                                        color: 'success.main',
                                    },
                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                        backgroundColor: 'success.main',
                                    },
                                    '& .MuiSwitch-switchBase:not(.Mui-checked)': {
                                        color: 'error.main',
                                    },
                                    '& .MuiSwitch-switchBase:not(.Mui-checked) + .MuiSwitch-track': {
                                        backgroundColor: 'error.main',
                                    },
                                }} 
                             />
                         </Stack>
                         <Stack spacing={1}>
                             <Typography variant="subtitle2">R.Off Amt.</Typography>
                             <Field.Text name="customer_purchase_r_off_amt" size="small" />
                         </Stack>
                         <Stack spacing={1}>
                             <Typography variant="subtitle2">Grand Total</Typography>
                             <Field.Text name="customer_purchase_grand_total" disabled sx={{ bgcolor: 'action.hover' }} size="small" />
                         </Stack>
                    </Box>

                </Stack>
            </DialogContent>
            
            <DialogActions>
                <Button onClick={onClose} variant="contained" color="inherit" sx={{ bgcolor: 'grey.600', color: 'common.white', '&:hover': { bgcolor: 'grey.700' } }}>
                    Close
                </Button>
                <Button onClick={onClose} variant="contained" color="primary">
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
}

CustomerPurchaseModal.propTypes = {
    onClose: PropTypes.func,
    open: PropTypes.bool,
};
