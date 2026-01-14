// store/index.ts
'use client'; // 🔴 Must be client component


import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userInfoReducer from './slices/userInfoSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    userInfo: userInfoReducer,
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
