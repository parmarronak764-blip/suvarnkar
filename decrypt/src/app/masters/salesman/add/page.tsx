"use client";
import Head from 'next/head';
import { Box, Container } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs/custom-breadcrumbs';
import { AddUserForm } from 'src/sections/masters/salesman/add/add-user-form';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'src/redux/store';
import { clearUserInfo, setMode } from 'src/redux/slices/userInfoSlice';
import { useEffect } from 'react';

export default function Page() {
  const dispatch = useDispatch();
  
  // Clear any existing user data and set to create mode
  useEffect(() => {
    dispatch(clearUserInfo());
    dispatch(setMode(0));
  }, [dispatch]);

  return (
    <>
      <Head>
        <title>Add Salesman</title>
      </Head>
      <Container sx={{ py: 4 }}>
        <CustomBreadcrumbs
          heading="Add Salesman"
          links={[
            { name: 'Masters', href: '/masters' },
            { name: 'Salesman', href: '/masters/salesman' },
            { name: 'Add Salesman' },
          ]}
        />
        <Box mt={4}>
          <AddUserForm />
        </Box>
      </Container>
    </>
  );
}
