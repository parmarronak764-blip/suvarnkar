import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useEffect, useState } from 'react';
import { isValidPhoneNumber } from 'react-phone-number-input/input';
import { useSelector } from 'react-redux';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { toast } from 'src/components/snackbar';
import { Form, Field, schemaHelper } from 'src/components/hook-form';
import { useUser } from 'src/hooks/useUser';
import { usePermissions } from 'src/hooks/usePermissions';
import { PermissionGate } from 'src/components/PermissionGate';

// ----------------------------------------------------------------------

// Create dynamic schema based on whether it's create or edit mode
export const createUserCreateSchema = (isEdit = false) =>
  zod.object({
    // Required fields
    name: zod.string().min(1, { message: 'Name is required!' }), // maps to salesmanName
    role: zod.string().min(1, { message: 'Role is required!' }),
    modules: zod.array(zod.string()).min(1, { message: 'At least one module is required!' }),
    // Conditional password requirement
    password: isEdit
      ? zod.string().optional()
      : zod.string().min(1, { message: 'Password is required for new users!' }),
    // Optional fields
    phoneNumber: schemaHelper.phoneNumber({ isValid: isValidPhoneNumber }, true), // maps to phone
    email: zod
      .string()
      .email({ message: 'Email must be a valid email address!' })
      .or(zod.literal('')),
    joinDate: zod.string().optional(), //min(1, { message: 'Join date is required!' }),
    address: zod.string().optional(),
  });

// export const createUserCreateSchema = (isEdit = false) =>
// z.object({
//   name: z.string().min(1, { message: "Name is required!" }),
//   role: z.string().min(1, { message: "Role is required!" }),
//   modules: z.array(z.string()).min(1, { message: "At least one module is required!" }),
//   password: isEdit
//     ? z.string().optional()
//     : z.string().min(1, { message: "Password is required for new users!" }),
//   email: z.string().email({ message: "Email must be a valid email address!" }).optional(),
//   phoneNumber: z.string().optional(), // Use your helper for phone validation if needed
//   joinDate: z.string().optional(),
//   address: z.string().optional(),
// });

// For backward compatibility
export const UserCreateSchema = createUserCreateSchema(false);

// ----------------------------------------------------------------------

export function UserCreateEditForm({ currentUser }) {
  const router = useRouter();
  const { createUser, updateUser, fetchUsers, fetchRoles, fetchModules } = useUser();
  const { hasPermission } = usePermissions();
  const [roles, setRoles] = useState([]);
  const modules = useSelector((state) => state.user.modules);

  // Helper function to format date for date picker (ISO format)
  const formatDateForDatePicker = (dateString) => {
    if (!dateString) return new Date().toISOString().split('T')[0];
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return new Date().toISOString().split('T')[0];
      return date.toISOString().split('T')[0];
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  };

  const defaultValues = {
    // Required fields
    email: '',
    name: '', // maps to salesmanName
    phoneNumber: '', // maps to phone
    role: '',
    joinDate: new Date().toISOString().split('T')[0], // Default to today in ISO format for date picker
    password: '',
    // Optional fields
    address: '',
    modules: [],
  };

  const methods = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(createUserCreateSchema(!!currentUser)), // Use dynamic schema
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  // Fetch roles and modules on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [rolesData] = await Promise.all([fetchRoles(), fetchModules()]);
        setRoles(rolesData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    loadData();
  }, [fetchRoles, fetchModules]);

  // Populate form when currentUser data is available (for edit mode)
  useEffect(() => {
    if (currentUser) {
      // Ensure multiselect fields are arrays and format date
      const sanitizedUser = {
        ...currentUser,
        modules: Array.isArray(currentUser.modules) ? currentUser.modules : [],
        joinDate: currentUser.joinDate
          ? formatDateForDatePicker(currentUser.joinDate)
          : new Date().toISOString().split('T')[0],
      };
      reset(sanitizedUser);
    }
  }, [currentUser, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (currentUser) {
        // Check update permission
        if (!hasPermission('user.edit')) {
          toast.error('You do not have permission to update users');
          return;
        }

        // Update existing user
        await updateUser(currentUser.id, data);

        // Refresh the user list to show updated data
        await fetchUsers();

        toast.success('User updated successfully!');
        // Navigate to listing after updating user
        router.push(paths.masters.userManagement);
      } else {
        // Check create permission
        if (!hasPermission('user.create')) {
          toast.error('You do not have permission to create users');
          return;
        }

        // Create new user
        await createUser(data);

        // Refresh the user list to show the new user
        await fetchUsers();

        toast.success('User created successfully!');
        // Navigate to listing after creating new user
        router.push(paths.masters.userManagement);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              {currentUser ? 'Edit User' : 'Create New User'}
            </Typography>

            <Box
              sx={{
                rowGap: 2.5,
                columnGap: 2.5,
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                  lg: 'repeat(4, 1fr)',
                },
              }}
            >
              <Field.Text
                slotProps={{ inputLabel: { shrink: true }, required: true }}
                name="name"
                label="Salesman Name"
                placeholder="Enter full name"
              />

              <Field.Text
                slotProps={{ inputLabel: { shrink: true }, required: true }}
                name="email"
                label="Email Address"
                placeholder="Enter email address"
              />

              <Field.Phone
                name="phoneNumber"
                label="Phone Number"
                defaultCountry="IN"
                placeholder="Enter phone number"
                required
              />

              <Field.Select name="role" label="Role" placeholder="Select a role">
                {(roles || []).map((role) => (
                  <MenuItem key={role.id} value={role.name}>
                    {role.name}
                  </MenuItem>
                ))}
              </Field.Select>

              <Field.Text
                slotProps={{ inputLabel: { shrink: true }, required: true }}
                name="joinDate"
                label="Join Date"
                type="date"
                helperText="Select the joining date"
              />

              {!currentUser && (
                <Field.Text
                  slotProps={{ inputLabel: { shrink: true }, required: true }}
                  name="password"
                  label="Password"
                  type="password"
                  placeholder="Enter password for new user"
                />
              )}

              <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1', md: '1 / -1' } }}>
                <Field.Text
                  name="address"
                  label="Address"
                  placeholder="Enter complete address (optional)"
                  multiline
                  rows={2}
                  fullWidth
                />
              </Box>

              <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1', md: '1 / -1' } }}>
                <Field.MultiSelect
                  name="modules"
                  label="Modules *"
                  chipw
                  checkbox
                  fullWidth
                  // placeholder="Select at least one module"
                  options={modules.map((module) => ({
                    value: module.name,
                    label: module.name,
                  }))}
                />
              </Box>
            </Box>

            <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => router.push(paths.masters.userManagement)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="contained" loading={isSubmitting} size="large">
                {!currentUser ? 'Create User' : 'Save Changes'}
              </Button>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Form>
  );
}
