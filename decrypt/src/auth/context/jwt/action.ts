'use client';

import axios, { endpoints } from 'src/lib/axios';

import { setSession } from './utils';
import { JWT_STORAGE_KEY } from './constant';

// ----------------------------------------------------------------------

export type SignInParams = {
  email: string;
  password: string;
};

export type SignUpParams = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

export type CompanySignUpParams = {
  company_name: string;
  gst_number: string;
  city: string;
  logo?: File;
  terms_agreed: boolean;
  owner_name: string;
  owner_email: string;
  owner_contact: string;
  whatsapp_number: string;
  password: string;
};

/** **************************************
 * Sign in
 *************************************** */
export const signInWithPassword = async ({ email, password }: SignInParams): Promise<void> => {
  try {
    const params = { email, password };

    const res = await axios.post(endpoints.auth.signIn, params);


    if (!res?.data?.data?.access) {
      throw new Error('Access token not found in response');
    }

    setSession(res?.data?.data?.access, res?.data?.data?.refresh);

  } catch (error) {
    console.error('Error during sign in:', error);
    throw error;
  }
};

/** **************************************
 * Sign up
 *************************************** */
export const signUp = async ({
  email,
  password,
  firstName,
  lastName,
}: SignUpParams): Promise<void> => {
  const params = {
    email,
    password,
    firstName,
    lastName,
  };

  try {
    const res = await axios.post(endpoints.auth.signUp, params);

    const { accessToken } = res.data;

    if (!accessToken) {
      throw new Error('Access token not found in response');
    }

    sessionStorage.setItem(JWT_STORAGE_KEY, accessToken);
  } catch (error) {
    console.error('Error during sign up:', error);
    throw error;
  }
};

/** **************************************
 * Sign out
 *************************************** */
export const signOut = async (): Promise<void> => {
  try {
    await setSession(null, null);
  } catch (error) {
    console.error('Error during sign out:', error);
    throw error;
  }
};

/** **************************************
 * Company Registration
 *************************************** */
export const companySignUp = async (params: CompanySignUpParams | FormData): Promise<void> => {
  try {
    let requestData: FormData;

    // If params is already FormData, use it directly
    if (params instanceof FormData) {
      requestData = params;
    } else {
      // Convert object to FormData
      requestData = new FormData();
      requestData.append('company_name', params.company_name);
      requestData.append('gst_number', params.gst_number);
      requestData.append('city', params.city);
      requestData.append('terms_agreed', params.terms_agreed.toString());
      requestData.append('owner_name', params.owner_name);
      requestData.append('owner_email', params.owner_email);
      requestData.append('owner_contact', params.owner_contact);
      requestData.append('whatsapp_number', params.whatsapp_number);
      requestData.append('password', params.password);
      
      if (params.logo) {
        requestData.append('logo', params.logo);
      }
    }

    const res = await axios.post(endpoints.auth.companySignUp, requestData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    
  } catch (error) {
    console.error('Error during company registration:', error);
    throw error;
  }
};