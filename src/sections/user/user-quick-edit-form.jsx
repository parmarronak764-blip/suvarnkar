import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { isValidPhoneNumber } from 'react-phone-number-input/input';
import { useSelector } from 'react-redux';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { toast } from 'src/components/snackbar';
import { Form, Field, schemaHelper } from 'src/components/hook-form';
import { useUser } from 'src/hooks/useUser';

// ----------------------------------------------------------------------

export const UserQuickEditSchema = zod.object({
  // Required fields
  name: zod.string().min(1, { message: 'Name is required!' }), // maps to salesmanName
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
  phoneNumber: schemaHelper.phoneNumber({ isValid: isValidPhoneNumber }), // maps to phone
  role: zod.string().min(1, { message: 'Role is required!' }),
  joinDate: zod.string()
    .min(1, { message: 'Join date is required!' }),
  // Optional fields
  address: zod.string().optional(),
  modules: zod.array(zod.string()).min(1, { message: 'At least one module is required!' }),
});

// ----------------------------------------------------------------------

export function UserQuickEditForm({ currentUser, open, onClose }) {
  const { updateUser, fetchUsers, fetchRoles, fetchModules } = useUser();
  const [roles, setRoles] = useState([]);
  const modules = useSelector((state) => state.user.modules);

  // Helper function to format date for date picker (ISO format)
  const formatDateForDatePicker = (dateString) => {
    if (!dateString) return new Date().toISOString().split('T')[0];
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return new Date().toISOString().split('T')[0];
      return date.toISOString().split('T')[0];
    } catch (error) {
      return new Date().toISOString().split('T')[0];
    }
  };
  
  const defaultValues = {
    // Required fields
    name: '', // maps to salesmanName
    email: '',
    phoneNumber: '', // maps to phone
    role: '',
    joinDate: new Date().toISOString().split('T')[0], // Default to today in ISO format for date picker
    // Optional fields
    address: '',
    modules: [],
  };

  // Ensure multiselect fields are arrays and format date for date picker
  const sanitizedCurrentUser = currentUser
    ? {
        ...currentUser,
        modules: Array.isArray(currentUser.modules) ? currentUser.modules : [],
        joinDate: currentUser.joinDate
          ? formatDateForDatePicker(currentUser.joinDate)
          : new Date().toISOString().split('T')[0],
      }
    : null;

  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(UserQuickEditSchema),
    defaultValues,
    values: sanitizedCurrentUser,
  });

  // Fetch roles and modules on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [rolesData] = await Promise.all([
          fetchRoles(),
          fetchModules()
        ]);
        setRoles(rolesData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    
    if (open) {
      loadData();
    }
  }, [fetchRoles, fetchModules, open]);

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (!currentUser?.id) {
        toast.error('User ID not found');
        return;
      }

      await updateUser(currentUser.id, data);
      
      // Refresh the user list to show updated data
      await fetchUsers();
      
      reset();
      onClose();
      toast.success('User updated successfully!');
    } catch (error) {
      console.error('Quick Edit - Update error:', error);
      toast.error('Failed to update user');
    }
  });

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: { maxWidth: 720 },
        },
      }}
    >
      <DialogTitle>Quick update</DialogTitle>

      <Form methods={methods} onSubmit={onSubmit}>
        <DialogContent>
          <Alert variant="outlined" severity="info" sx={{ mb: 3 }}>
            Account is waiting for confirmation
          </Alert>

          <Box
            sx={{
              rowGap: 3,
              columnGap: 2,
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
            }}
          >
            <Field.Text name="name" label="Salesman Name" />
            <Field.Text name="email" label="Email Address" />
            <Field.Phone name="phoneNumber" label="Phone number" defaultCountry="IN" />
            <Field.Select name="role" label="Role" placeholder="Select a role">
              {(roles || []).map((role) => (
                <MenuItem key={role.id} value={role.name}>
                  {role.name}
                </MenuItem>
              ))}
            </Field.Select>
            <Field.Text 
              name="joinDate" 
              label="Join Date" 
              type="date"
              helperText="Select the joining date"
            />
            <Field.Text name="address" label="Address" placeholder="Enter address (optional)" />
            <Field.MultiSelect 
              name="modules" 
              label="Modules *" 
              chip
              checkbox
              fullWidth
              options={(modules || []).map((module) => ({
                value: module.name,
                label: module.name
              }))}
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" loading={isSubmitting}>
            Update
          </Button>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
