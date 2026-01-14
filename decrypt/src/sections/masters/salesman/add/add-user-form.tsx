"use client";
import type { IUserItem } from 'src/types/user';
import { useEffect, useState , useMemo } from 'react';
import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { isValidPhoneNumber } from 'react-phone-number-input/input';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import Chip from '@mui/material/Chip';
import FormHelperText from '@mui/material/FormHelperText';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { fData } from 'src/utils/format-number';
import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Form, Field, schemaHelper } from 'src/components/hook-form';
import axios, { endpoints } from 'src/lib/axios'; // Use axios and endpoints
import { useSelector } from 'react-redux';
import { RootState } from 'src/redux/store';

// ----------------------------------------------------------------------

export type UserCreateSchemaType = zod.infer<typeof UserCreateSchema>;

export const UserCreateSchema = zod.object({
  avatarUrl: zod.any().optional(),
  name: zod.string().min(1, { message: 'Name is required!' }),
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
  password: zod.string().optional(),
  phoneNumber: zod.string().optional(),
  address: zod.string().optional(),
  state: zod.string().optional(),
  city: zod.string().optional(),
  zipCode: zod.string().optional(),
  role: zod.string().min(1, { message: 'Role is required!' }),
  modules: zod.array(zod.string()).optional(),
  idCard: zod.any().optional(),
});

// ----------------------------------------------------------------------

type Props = {
  currentUser?: IUserItem;
  mode?: number; // 0 for create, 1 for edit
};

export function AddUserForm() {
  const router = useRouter();
  const currentUser = useSelector((state: RootState) => state.userInfo);
  const { selectedCompanyId } = useSelector((state: RootState) => state.auth);

  // State for roles and modules
  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);
  const [modules, setModules] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  // Determine if we're in edit mode based on user data and mode
  const isEditMode = currentUser?.mode === 1 && currentUser?.id;

  const defaultValues = useMemo(() => ({
    avatarUrl: currentUser?.profileImage || null,
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    password: currentUser?.password || '',
    phoneNumber: currentUser?.phoneNumber || '',
    address: currentUser?.address || '',
    role: currentUser?.role || '',
    modules: currentUser?.modules || [],
    idCard: currentUser?.idCard || null,
    state: '',
    city: '',
    zipCode: '',
  }), [currentUser]);

  useEffect(() => {
    // Fetch roles using axios and endpoints.masters.roles
    axios.get(endpoints.masters.roles)
      .then((res) => setRoles(res.data.data || []))
      .catch((err) => console.error('Failed to fetch roles:', err));
    // Fetch modules using axios and endpoints.masters.modules
    axios.get(endpoints.masters.modules)
      .then((res) => setModules(res.data.data || []))
      .catch((err) => console.error('Failed to fetch modules:', err));
  }, []);

  const methods = useForm<any>({
    mode: 'onSubmit',
    resolver: zodResolver(UserCreateSchema),
    defaultValues,
  });

  const {
    reset,
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting, errors },
    watch,
  } = methods;

  // Reset form when mode changes to prevent controlled/uncontrolled issues
  useEffect(() => {
    reset(defaultValues);
  }, [isEditMode, reset, defaultValues]);

  // Set avatar URL when currentUser changes (for edit mode)
  useEffect(() => {
    if (currentUser?.profileImage && isEditMode) {
      setValue('avatarUrl', currentUser.profileImage);
    }
  }, [currentUser?.profileImage, isEditMode, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    setLoading(true);
    
    try {
      // Check if user has selected a company
      if (!selectedCompanyId) {
        toast.error('Please select a company workspace first.');
        return;
      }

      // Validate password for create mode
      if (!isEditMode && (!data.password || data.password.length < 6)) {
        toast.error('Password is required and must be at least 6 characters long for new users.');
        return;
      }

      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      if (data.password && data.password.length >= 6) {
        formData.append('password', data.password);
      }
      formData.append('salesmanName', data.name);
      formData.append('phone', data.phoneNumber || '');
      formData.append('address', data.address || '');
      formData.append('joinDate', new Date().toISOString().slice(0, 10));
      formData.append('role', data.role);
      
      // Handle files
      if (data.avatarUrl instanceof File) {
        formData.append('profileImage', data.avatarUrl);
      }
      if (data.idCard instanceof File) {
        formData.append('idCard', data.idCard);
      }
      
      // Handle modules
      if (data.modules && Array.isArray(data.modules)) {
        data.modules.forEach((m: string) => {
          if (m) formData.append('modules[]', m);
        });
      }

      if (!isEditMode) {
        // Create mode
        formData.append('company_id', selectedCompanyId?.toString() || '');
        
        const res = await axios.post(endpoints.masters.addUserWithModules, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        const result = res.data;
        if (res.status === 201 && result.success) {
          toast.success('User created successfully!');
          reset();
          setTimeout(() => {
            router.push(paths.masters.salesman);
          }, 1000);
        } else {
          const backendMsg = result?.errors || result?.message || result?.detail || 'Failed to create user';
          toast.error(backendMsg);
        }
      } else {
        // Edit mode
        formData.append('id', currentUser?.id || '');
        formData.append('company_id', selectedCompanyId?.toString() || '');
        formData.append('roleName', data.role);
        
        const res = await axios.post(endpoints.masters.editUser, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        const result = res.data;
        if (res.status === 200 && result.success) {
          toast.success('User updated successfully!');
          reset();
          setTimeout(() => {
            router.push(paths.masters.salesman);
          }, 1000);
        } else {
          const backendMsg = result?.errors || result?.message || result?.detail || 'Failed to update user';
          toast.error(backendMsg);
        }
      }
    } catch (error: any) {
      console.log('Full error:', error);
      let backendMsg = 'Error processing request';
      if (error.response && error.response.data) {
        backendMsg = error.response.data.errors || 
                    error.response.data.message || 
                    error.response.data.detail || 
                    error.message || 
                    'Error processing request';
      } else if (error.message) {
        backendMsg = error.message;
      }
      toast.error(backendMsg);
    } finally {
      setLoading(false);
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 3 }}>
        <Card sx={{ pt: 10, pb: 5, px: 3, minWidth: 320, flex: 1 }}>
          {/* Profile Image Upload */}
          <Box sx={{ mb: 5 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, textAlign: 'center' }}>
              Profile Image
            </Typography>
            <Field.UploadAvatar
              name="avatarUrl"
              maxSize={3145728}
              helperText={
                <Typography
                  variant="caption"
                  sx={{
                    mt: 3,
                    mx: 'auto',
                    display: 'block',
                    textAlign: 'center',
                    color: 'text.disabled',
                  }}
                >
                  Allowed *.jpeg, *.jpg, *.png, *.gif
                  <br /> max size of {fData(3145728)}
                </Typography>
              }
            />
          </Box>
        </Card>
        <Card sx={{ p: 3, minWidth: 400, flex: 2 }}>
          <Box
            sx={{
              rowGap: 3,
              columnGap: 2,
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
            }}
          >
            <Field.Text name="name" label="Full name" />
            <Field.Text name="email" label="Email address" />
            {!isEditMode && (
              <Field.Text 
                name="password" 
                label="Password" 
                type="password" 
                helperText="Password is required for new users (minimum 6 characters)"
              />
            )}
            <Field.Phone name="phoneNumber" label="Phone number" defaultCountry="US" />
            <Field.Text name="address" label="Address" />
            {/* Role as a full-width field in the second last row */}
            <Controller
              name="role"
              control={control}
              render={({ field }) => {
                const [isFocused, setIsFocused] = useState(false);
                const hasValue = !!field.value;
                const shouldShrink = hasValue || isFocused;
                
                return (
                  <FormControl fullWidth error={!!errors.role} sx={{ mb: 2 }} variant="outlined">
                    <InputLabel id="role-label" shrink={shouldShrink}>Role</InputLabel>
                    <Select
                      {...field}
                      labelId="role-label"
                      label="Role"
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value)}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                    >
                      {roles.map((role) => (
                        <MenuItem key={role.id} value={role.name}>
                          {role.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.role && <FormHelperText>{errors.role?.message as string}</FormHelperText>}
                  </FormControl>
                );
              }}
            />
            
          </Box>
          {/* Modules and ID Card in the last row, side by side, restored to previous size */}
          <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
              <Box sx={{ flex: 4 }}>
                <Controller
                  name="modules"
                  control={control}
                  render={({ field }) => {
                    const [isFocused, setIsFocused] = useState(false);
                    const hasValue = field.value && Array.isArray(field.value) && field.value.length > 0;
                    const shouldShrink = hasValue || isFocused;
                    
                    return (
                      <FormControl fullWidth error={!!errors.modules} sx={{ mb: 2 }} variant="outlined">
                        <InputLabel id="modules-label" shrink={shouldShrink}>Modules</InputLabel>
                        <Select
                          {...field}
                          labelId="modules-label"
                          label="Modules"
                          multiple
                          value={field.value || []}
                          onChange={(e) => field.onChange(e.target.value)}
                          onFocus={() => setIsFocused(true)}
                          onBlur={() => setIsFocused(false)}
                          input={<OutlinedInput label="Modules" />}
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {(selected as string[]).map((value) => (
                                <Chip key={value} label={value} />
                              ))}
                            </Box>
                          )}
                        >
                          {modules.map((module) => (
                            <MenuItem key={module.id} value={module.name}>
                              {module.name}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.modules && <FormHelperText>{errors.modules?.message as string}</FormHelperText>}
                      </FormControl>
                    );
                  }}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Controller
                  name="idCard"
                  control={control}
                  render={({ field }) => {
                    const hasFile = !!field.value;
                    return (
                      <Box sx={{ width: '100%' }}>
                        <Button
                          variant="outlined"
                          component="label"
                          fullWidth
                          sx={{
                            textTransform: 'none',
                            minHeight: 56,
                            height: 56,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                          }}
                        >
                          {hasFile ? 'Change File' : 'Upload ID Card'}
                          <input
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                field.onChange(e.target.files[0]);
                              }
                            }}
                          />
                          {hasFile && (
                            <Chip
                              label={field.value.name || 'Selected'}
                              sx={{ ml: 2, maxWidth: 200 }}
                            />
                          )}
                        </Button>
                        {errors.idCard && <FormHelperText error>{errors.idCard?.message as string}</FormHelperText>}
                      </Box>
                    );
                  }}
                />
              </Box>
          </Box>
          {!isEditMode && (
            <Stack sx={{ mt: 3, alignItems: 'flex-end' }}>
              <Button type="submit" variant="contained" loading={isSubmitting || loading}>
                Create user
              </Button>
            </Stack>
          )}
          {isEditMode && (
            <Stack sx={{ mt: 3, alignItems: 'flex-end' }}>
              <Button type="submit" variant="contained" loading={isSubmitting || loading}>
                Update user
              </Button>
            </Stack>
          )}
        </Card>
      </Box>
    </Form>
  );
} 