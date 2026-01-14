import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z as zod } from 'zod';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import LoadingButton from '@mui/lab/LoadingButton';

import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

const GemstoneFormSchema = zod.object({
  name: zod.string().min(1, 'Name is required!'),
});

// ----------------------------------------------------------------------

export function GemstoneFormModal({
  open,
  onClose,
  currentItem,
  onSave,
  loading,
  categoryLabel = 'Gemstone Item',
}) {
  const defaultValues = {
    name: '',
  };

  const methods = useForm({
    resolver: zodResolver(GemstoneFormSchema),
    defaultValues: currentItem || defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await onSave(data);
      reset();
    } catch (error) {
      console.error(error);
    }
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { overflow: 'visible' },
      }}
    >
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle>{currentItem ? `Edit ${categoryLabel}` : `Add ${categoryLabel}`}</DialogTitle>

        <DialogContent dividers sx={{ overflow: 'visible' }}>
          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
            }}
          >
            <Field.Text
              name="name"
              label="Name"
              placeholder={`Enter the ${categoryLabel.toLowerCase()} name`}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting || loading}>
            {currentItem ? 'Update' : 'Create'}
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
