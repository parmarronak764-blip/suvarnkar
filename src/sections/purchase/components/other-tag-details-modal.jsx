import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function OtherTagDetailsModal({ open, onClose, tagDetails, onSave }) {
  const [formData, setFormData] = React.useState({
    remarks: '',
    design_code: '',
    certificate_number: '',
    huid_1: '',
    huid_2: '',
    huid_3: '',
    gram_option_1: '',
    gram_option_2: '',
    ...tagDetails,
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Other Tag Details</Typography>
          <IconButton onClick={onClose} size="small">
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Remarks"
              value={formData.remarks}
              onChange={(e) => handleChange('remarks', e.target.value)}
              multiline
              rows={2}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Design Code"
              value={formData.design_code}
              onChange={(e) => handleChange('design_code', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Certificate Number"
              value={formData.certificate_number}
              onChange={(e) => handleChange('certificate_number', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="HUID 1"
              value={formData.huid_1}
              onChange={(e) => handleChange('huid_1', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="HUID 2"
              value={formData.huid_2}
              onChange={(e) => handleChange('huid_2', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="HUID 3"
              value={formData.huid_3}
              onChange={(e) => handleChange('huid_3', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="GRAM OPTION 1"
              type="number"
              value={formData.gram_option_1}
              onChange={(e) => handleChange('gram_option_1', e.target.value)}
              inputProps={{ step: '0.001' }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="GRAM OPTION 2"
              type="number"
              value={formData.gram_option_2}
              onChange={(e) => handleChange('gram_option_2', e.target.value)}
              inputProps={{ step: '0.001' }}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
