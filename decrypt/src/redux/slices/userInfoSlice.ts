// store/slices/userInfoSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  status: 'active' | 'inactive';
  address: string;
  idCard: string;
  profileImage: string;
  isVerified: boolean;
  modules: string[];
  mode: number;
  password:string;
}

const initialState: UserInfo = {
  id: '',
  name: '',
  email: '',
  phoneNumber: '',
  role: '',
  status: 'inactive',
  address: '',
  idCard: '',
  profileImage: '',
  isVerified: false,
  modules: [],
  mode: 0,
  password:''
};

const userInfoSlice = createSlice({
  name: 'userInfo',
  initialState,
  reducers: {
    insertUserInfo: (state, action: PayloadAction<UserInfo>) => {
      return { ...action.payload };
    },
    clearUserInfo: () => initialState,
    setMode: (state, action: PayloadAction<number>) => {
      state.mode = action.payload;
    },
  },
});

export const { insertUserInfo, clearUserInfo, setMode } = userInfoSlice.actions;
export default userInfoSlice.reducer;
