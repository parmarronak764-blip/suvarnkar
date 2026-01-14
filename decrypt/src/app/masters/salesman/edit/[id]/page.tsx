"use client";
import Head from 'next/head';
import { Box, Container, CircularProgress, Alert, Button } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs/custom-breadcrumbs';
import { AddUserForm } from 'src/sections/masters/salesman/add/add-user-form';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'src/redux/store';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios, { endpoints } from 'src/lib/axios';
import { insertUserInfo } from 'src/redux/slices/userInfoSlice';
import { toast } from 'src/components/snackbar';
import { paths } from 'src/routes/paths';
import { getProfileImageUrl } from 'src/utils/image-url';

export default function EditSalesmanPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const currentUser = useSelector((state: RootState) => state.userInfo);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!params.id) {
        setError('User ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        const response = await axios.get(`/api/accounts/users/${params.id}/`);
        
        if (response.data) {
          const userData = response.data;
          dispatch(
            insertUserInfo({
              id: userData.user_id,
              name: userData.name,
              email: userData.email,
              phoneNumber: userData.phone,
              role: userData.role,
              status: userData.is_active ? 'active' : 'inactive',
              address: userData.address || '',
              idCard: userData.id_card || '',
              profileImage: getProfileImageUrl(userData.profile_image),
              modules: userData.modules || [],
              mode: 1, // Edit mode
              password: '', // Don't load password for security
              isVerified: true, // Default to true for existing users
            })
          );
        } else {
          setError('User not found');
        }
      } catch (error: any) {
        console.error('Error fetching user details:', error);
        setError('Failed to load user details. Please try again.');
        toast.error('Failed to load user details');
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [params.id, dispatch]);

  if (loading) {
    return (
      <Container sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Box sx={{ mt: 2 }}>
            <p>Loading user details...</p>
          </Box>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <CustomBreadcrumbs
          heading="Error"
          links={[
            { name: 'Masters', href: '/masters' },
            { name: 'Salesman', href: '/masters/salesman' },
            { name: 'Edit Salesman' },
          ]}
        />
        <Box mt={4}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button 
            variant="contained" 
            onClick={() => router.push(paths.masters.salesman)}
          >
            Back to Salesman List
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <>
      <Head>
        <title>Update Salesman</title>
      </Head>
      <Container sx={{ py: 4 }}>
        <CustomBreadcrumbs
          heading="Update Salesman"
          links={[
            { name: 'Masters', href: '/masters' },
            { name: 'Salesman', href: '/masters/salesman' },
            { name: 'Update Salesman' },
          ]}
        />
        <Box mt={4}>
          <AddUserForm />
        </Box>
      </Container>
    </>
  );
} 