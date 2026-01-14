import { createSlice } from '@reduxjs/toolkit';
import { getItem } from 'src/utils/services';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    user: null,
    accessToken: null,
    refreshToken: null,
    accountInfo: null,
    selectedCompany: null,
    usersList: [],
    usersListPagination: {},
    currentUser: null,
    modules: [],
  },
  reducers: {
    setUserInfo: (state, action) => {
      state.user = action.payload;
    },
    setAccessToken: (state, action) => {
      state.accessToken = action.payload;
    },
    setRefreshToken: (state, action) => {
      state.refreshToken = action.payload;
    },
    setAccountInfo: (state, action) => {
      state.accountInfo = action.payload;
    },
    setSelectedCompany: (state, action) => {
      state.selectedCompany = action.payload;
    },
    setUsersList: (state, action) => {
      state.usersList = action.payload;
    },
    setUsersListPagination: (state, action) => {
      state.usersListPagination = action.payload;
    },
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
    setModules: (state, action) => {
      state.modules = action.payload;
    },
  },
});

export const { setUserInfo, setAccessToken, setRefreshToken, setAccountInfo, setSelectedCompany, setUsersList, setUsersListPagination, setCurrentUser, setModules } =
  userSlice.actions;

export default userSlice.reducer;
