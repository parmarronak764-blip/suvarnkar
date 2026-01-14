import { createSlice, current } from '@reduxjs/toolkit';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { accountService } from '../services/account.service';
import { toast } from 'src/components/snackbar';
import { setStoredValue } from 'src/utils/services';

// Dealer Specific Actions

export const fetchDealerSupplyType = createAsyncThunk(
  'account/fetchDealerSupplyType',
  async (company_id) => {
    try {
      const response = await accountService.fetchDealerSupplyType(company_id);
      return response;
    } catch (error) {
      console.error('Error fetching dealer supply type:', error);
      throw error;
    }
  }
);

export const createDealer = createAsyncThunk(
  'account/createDealer',
  async ({ dealerData, company_id }) => {
    try {
      console.log('company_id in slice: ', company_id);
      const response = await accountService.createDealer(dealerData, company_id);
      return response;
    } catch (error) {
      console.error('Error creating dealer:', error);
      throw error;
    }
  }
);

export const getDealers = createAsyncThunk(
  'account/getDealers',
  async ({ company_id, page = 1, page_size = 25, search = '' }) => {
    try {
      const response = await accountService.getDealers(company_id, page, page_size, search);
      return response;
    } catch (error) {
      console.error('Error getting dealers:', error);
      throw error;
    }
  }
);

export const getDealerById = createAsyncThunk(
  'account/getDealerById',
  async ({ dealer_id, company_id }) => {
    try {
      const response = await accountService.getDealerById(dealer_id, company_id);
      return response;
    } catch (error) {
      console.error('Error getting dealer by id:', error);
      throw error;
    }
  }
);

export const updateDealer = createAsyncThunk(
  'account/updateDealer',
  async ({ dealer_id, dealerData, company_id }) => {
    try {
      const response = await accountService.updateDealer(dealer_id, dealerData, company_id);
      return response;
    } catch (error) {
      console.error('Error updating dealer:', error);
      throw error;
    }
  }
);

export const createAccountBankDetails = createAsyncThunk(
  'account/createAccountBankDetails',
  async ({ data, account_id }) => {
    try {
      const response = await accountService.createAccountBankDetails(data, account_id);
      return response;
    } catch (error) {
      console.error('Error creating account bank details:', error);
      throw error;
    }
  }
);

export const updateAccountBankDetails = createAsyncThunk(
  'account/updateAccountBankDetails',
  async ({ data, account_id, company_id, bank_id }) => {
    try {
      const response = await accountService.updateAccountBankDetails(
        data,
        account_id,
        company_id,
        bank_id
      );
      return response;
    } catch (error) {
      console.error('Error updating account bank details:', error);
      throw error;
    }
  }
);

export const deleteAccountBankDetails = createAsyncThunk(
  'account/deleteAccountBankDetails',
  async (bank_detail_id) => {
    try {
      const response = await accountService.deleteAccountBankDetails(bank_detail_id);
      return response;
    } catch (error) {
      console.error('Error deleting account bank details:', error);
      throw error;
    }
  }
);

export const getAccountBankDetails = createAsyncThunk(
  'account/getAccountBankDetails',
  async ({ company_id, account_id = null, page = 1, page_size = 25, search = '' }) => {
    try {
      const response = await accountService.getAccountBankDetails(
        company_id,
        account_id,
        page,
        page_size,
        search
      );
      return response;
    } catch (error) {
      console.error('Error getting account bank details:', error);
      throw error;
    }
  }
);

export const getAccountBankDetailsById = createAsyncThunk(
  'account/getAccountBankDetailsById',
  async (bank_detail_id) => {
    try {
      const response = await accountService.getAccountBankDetailsById(bank_detail_id);
      return response;
    } catch (error) {
      console.error('Error getting account bank details by id:', error);
      throw error;
    }
  }
);

export const createWastageDetails = createAsyncThunk(
  'account/createWastageDetails',
  async ({ data, company_id, account_id }) => {
    try {
      const response = await accountService.createWastageDetails(data, company_id, account_id);
      return response;
    } catch (error) {
      console.error('Error creating wastage details:', error);
      throw error;
    }
  }
);

export const updateWastageDetails = createAsyncThunk(
  'account/updateWastageDetails',
  async ({ data, company_id, account_id }) => {
    try {
      const response = await accountService.updateWastageDetails(data, company_id, account_id);
      // ✅ normalize payload
      return response.data;
    } catch (error) {
      // Extract error message from response if available
      console.error('Error updating wastage details:', error);
      throw error;
    }
  }
);

export const deleteWastageDetails = createAsyncThunk(
  'account/deleteWastageDetails',
  async ({ wastage_detail_id, company_id }) => {
    try {
      const response = await accountService.deleteWastageDetails(wastage_detail_id, company_id);
      return response;
    } catch (error) {
      console.error('Error deleting wastage details:', error);
      throw error;
    }
  }
);

export const getWastageDetails = createAsyncThunk('account/getWastageDetails', async () => {
  try {
    const response = await accountService.getWastageDetails();
    return response;
  } catch (error) {
    console.error('Error getting wastage details:', error);
    throw error;
  }
});

export const getWastageDetailsById = createAsyncThunk(
  'account/getWastageDetailsById',
  async (wastage_detail_id) => {
    try {
      const response = await accountService.getWastageDetailsById(wastage_detail_id);
      return response;
    } catch (error) {
      console.error('Error getting wastage details by id:', error);
      throw error;
    }
  }
);

export const createMoneyBalanceDetails = createAsyncThunk(
  'account/createMoneyBalanceDetails',
  async ({ data, company_id, account_id }) => {
    try {
      const response = await accountService.createMoneyBalanceDetails(data, company_id, account_id);
      return response;
    } catch (error) {
      console.error('Error creating money balance details:', error);
      throw error;
    }
  }
);

export const updateMoneyBalanceDetails = createAsyncThunk(
  'account/updateMoneyBalanceDetails',
  async ({ data, company_id, account_id }) => {
    try {
      const response = await accountService.updateMoneyBalanceDetails(data, company_id, account_id);
      return response;
    } catch (error) {
      console.error('Error updating money balance details:', error);
      throw error;
    }
  }
);

export const getMoneyBalanceDetails = createAsyncThunk(
  'account/getMoneyBalanceDetails',
  async () => {
    try {
      const response = await accountService.getMoneyBalanceDetails();
      return response;
    } catch (error) {
      console.error('Error getting money balance details:', error);
      throw error;
    }
  }
);

export const getMoneyBalanceDetailsById = createAsyncThunk(
  'account/getMoneyBalanceDetailsById',
  async (money_balance_detail_id) => {
    try {
      const response = await accountService.getMoneyBalanceDetailsById(money_balance_detail_id);
      return response;
    } catch (error) {
      console.error('Error getting money balance details by id:', error);
      throw error;
    }
  }
);

export const deleteMoneyBalanceDetails = createAsyncThunk(
  'account/deleteMoneyBalanceDetails',
  async ({ money_balance_detail_id, company_id }) => {
    try {
      const response = await accountService.deleteMoneyBalanceDetails(
        money_balance_detail_id,
        company_id
      );
      return response;
    } catch (error) {
      console.error('Error deleting money balance details:', error);
      throw error;
    }
  }
);

export const createMetalBalanceDetails = createAsyncThunk(
  'account/createMetalBalanceDetails',
  async ({ data }) => {
    try {
      const response = await accountService.createMetalBalanceDetails(data);
      return response;
    } catch (error) {
      console.error('Error creating metal balance details:', error);
      throw error;
    }
  }
);

export const updateMetalBalanceDetails = createAsyncThunk(
  'account/updateMetalBalanceDetails',
  async ({ data }) => {
    try {
      const response = await accountService.updateMetalBalanceDetails(data);
      return response;
    } catch (error) {
      console.error('Error updating metal balance details:', error);
      throw error;
    }
  }
);

export const deleteMetalBalanceDetails = createAsyncThunk(
  'account/deleteMetalBalanceDetails',
  async (metal_balance_detail_id) => {
    try {
      const response = await accountService.deleteMetalBalanceDetails(metal_balance_detail_id);
      return response;
    } catch (error) {
      console.error('Error deleting metal balance details:', error);
      throw error;
    }
  }
);

export const getMetalBalanceDetails = createAsyncThunk(
  'account/getMetalBalanceDetails',
  async () => {
    try {
      const response = await accountService.getMetalBalanceDetails();
      return response;
    } catch (error) {
      console.error('Error getting metal balance details:', error);
      throw error;
    }
  }
);

export const getMetalBalanceDetailsById = createAsyncThunk(
  'account/getMetalBalanceDetailsById',
  async (metal_balance_detail_id) => {
    try {
      const response = await accountService.getMetalBalanceDetailsById(metal_balance_detail_id);
      return response;
    } catch (error) {
      console.error('Error getting metal balance details by id:', error);
      throw error;
    }
  }
);

export const createCustomerDetails = createAsyncThunk(
  'account/createCustomerDetails',
  async ({ data, company_id }) => {
    try {
      const response = await accountService.createCustomerDetails(data, company_id);
      return response;
    } catch (error) {
      console.error('Error creating customer details:', error);
      throw error;
    }
  }
);

export const updateCustomerDetails = createAsyncThunk(
  'account/updateCustomerDetails',
  async ({ customer_id, data, company_id }) => {
    try {
      const response = await accountService.updateCustomerDetails(customer_id, data, company_id);
      return response;
    } catch (error) {
      console.error('Error updating customer details:', error);
      throw error;
    }
  }
);

export const deleteCustomerDetails = createAsyncThunk(
  'account/deleteCustomerDetails',
  async (customer_id) => {
    try {
      const response = await accountService.deleteCustomerDetails(customer_id);
      return response;
    } catch (error) {
      console.error('Error deleting customer details:', error);
      throw error;
    }
  }
);

export const getCustomerDetails = createAsyncThunk(
  'account/getCustomerDetails',
  async ({ company_id, page = 1, page_size = 25, search = '' }) => {
    try {
      const response = await accountService.getCustomerDetails(company_id, page, page_size, search);
      return response;
    } catch (error) {
      console.error('Error getting customer details:', error);
      throw error;
    }
  }
);

export const getCustomerDetailsById = createAsyncThunk(
  'account/getCustomerDetailsById',
  async ({ customer_id, company_id }) => {
    try {
      const response = await accountService.getCustomerDetailsById(customer_id, company_id);
      return response;
    } catch (error) {
      console.error('Error getting customer details by id:', error);
      throw error;
    }
  }
);

export const createKarigarDetails = createAsyncThunk(
  'account/createKarigarDetails',
  async ({ data, company_id }) => {
    try {
      const response = await accountService.createKarigarDetails(data, company_id);
      return response;
    } catch (error) {
      console.error('Error creating karigar details:', error);
      throw error;
    }
  }
);

export const updateKarigarDetails = createAsyncThunk(
  'account/updateKarigarDetails',
  async ({ data, company_id, id }) => {
    try {
      const response = await accountService.updateKarigarDetails(data, company_id, id);
      return response;
    } catch (error) {
      console.error('Error updating karigar details:', error);
      throw error;
    }
  }
);

export const deleteKarigarDetails = createAsyncThunk(
  'account/deleteKarigarDetails',
  async (karigar_id) => {
    try {
      const response = await accountService.deleteKarigarDetails(karigar_id);
      return response;
    } catch (error) {
      console.error('Error deleting karigar details:', error);
      throw error;
    }
  }
);

export const getKarigarDetails = createAsyncThunk(
  'account/getKarigarDetails',
  async ({ company_id, page = 1, page_size = 25, search = '' }) => {
    try {
      const response = await accountService.getKarigarDetails(company_id, page, page_size, search);
      return response;
    } catch (error) {
      console.error('Error getting karigar details:', error);
      throw error;
    }
  }
);

export const getKarigarDetailsById = createAsyncThunk(
  'account/getKarigarDetailsById',
  async ({ karigar_id, company_id }) => {
    try {
      const response = await accountService.getKarigarDetailsById(karigar_id, company_id);
      return response;
    } catch (error) {
      console.error('Error getting karigar details by id:', error);
      throw error;
    }
  }
);

export const createLedgerDetails = createAsyncThunk(
  'account/createLedgerDetails',
  async ({ data }) => {
    try {
      const response = await accountService.createLedgerDetails(data);
      return response;
    } catch (error) {
      console.error('Error creating ledger details:', error);
      throw error;
    }
  }
);

export const updateLedgerDetails = createAsyncThunk(
  'account/updateLedgerDetails',
  async ({ ledger_id, ledgerData, company_id }) => {
    try {
      const response = await accountService.updateLedgerDetails(ledger_id, ledgerData, company_id);
      return response;
    } catch (error) {
      console.error('Error updating ledger details:', error);
      throw error;
    }
  }
);

export const deleteLedgerDetails = createAsyncThunk(
  'account/deleteLedgerDetails',
  async (ledger_id) => {
    try {
      const response = await accountService.deleteLedgerDetails(ledger_id);
      return response;
    } catch (error) {
      console.error('Error deleting ledger details:', error);
      throw error;
    }
  }
);

export const getLedgerDetails = createAsyncThunk(
  'account/getLedgerDetails',
  async ({ company_id, page = 1, page_size = 25, search = '' }) => {
    try {
      const response = await accountService.getLedgerDetails(company_id, page, page_size, search);
      return response;
    } catch (error) {
      console.error('Error getting ledger details:', error);
      throw error;
    }
  }
);

export const getLedgerDetailsById = createAsyncThunk(
  'account/getLedgerDetailsById',
  async ({ ledger_id, company_id }) => {
    try {
      const response = await accountService.getLedgerDetailsById(ledger_id, company_id);
      return response;
    } catch (error) {
      console.error('Error getting ledger details by id:', error);
      throw error;
    }
  }
);

export const getLedgerTypes = createAsyncThunk('account/getLedgerTypes', async () => {
  try {
    const response = await accountService.getLedgerTypes();
    return response;
  } catch (error) {
    console.error('Error getting ledger types:', error);
    throw error;
  }
});

const accountSlice = createSlice({
  name: 'account',
  initialState: {
    supplyType: [],
    fetchDealerSupplyTypeLoading: false,
    dealers: [],
    getDealersLoading: false,
    getDealerByIdLoading: false,
    updateDealerLoading: false,
    createDealerLoading: false,
    createAccountBankDetailsLoading: false,
    updateAccountBankDetailsLoading: false,
    deleteAccountBankDetailsLoading: false,
    getAccountBankDetailsLoading: false,
    getAccountBankDetailsByIdLoading: false,
    currentDealer: null,
    bankDetails: null,
    dealer_id: null,
    dealerPagination: {},
    customers: [],
    customerPagination: {},
    karigars: [],
    karigarPagination: {},
    ledgers: [],
    ledgerPagination: {},
    createWastageDetailsLoading: false,
    updateWastageDetailsLoading: false,
    deleteWastageDetailsLoading: false,
    getWastageDetailsLoading: false,
    getWastageDetailsByIdLoading: false,
    createMoneyBalanceDetailsLoading: false,
    updateMoneyBalanceDetailsLoading: false,
    deleteMoneyBalanceDetailsLoading: false,
    getMoneyBalanceDetailsLoading: false,
    getMoneyBalanceDetailsByIdLoading: false,
    createMetalBalanceDetailsLoading: false,
    updateMetalBalanceDetailsLoading: false,
    deleteMetalBalanceDetailsLoading: false,
    getMetalBalanceDetailsLoading: false,
    getMetalBalanceDetailsByIdLoading: false,
    createCustomerDetailsLoading: false,
    updateCustomerDetailsLoading: false,
    deleteCustomerDetailsLoading: false,
    getCustomerDetailsLoading: false,
    getCustomerDetailsByIdLoading: false,
    createKarigarDetailsLoading: false,
    updateKarigarDetailsLoading: false,
    deleteKarigarDetailsLoading: false,
    getKarigarDetailsLoading: false,
    getKarigarDetailsByIdLoading: false,
    createLedgerDetailsLoading: false,
    updateLedgerDetailsLoading: false,
    deleteLedgerDetailsLoading: false,
    getLedgerDetailsLoading: false,
    getLedgerDetailsByIdLoading: false,
    getLedgerTypesLoading: false,
    wastageDetails: null,
    moneyBalanceDetails: null,
    metalBalanceDetails: null,
    customerDetails: null,
    currentCustomer: null,
    customer_id: null,
    karigarDetails: null,
    currentKarigar: null,
    karigar_id: null,
    ledgerDetails: null,
    ledgerTypes: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchDealerSupplyType.pending, (state) => {
      state.fetchDealerSupplyTypeLoading = true;
    });
    builder.addCase(fetchDealerSupplyType.fulfilled, (state, action) => {
      state.supplyType = action.payload.data;
      state.fetchDealerSupplyTypeLoading = false;
    });
    builder.addCase(fetchDealerSupplyType.rejected, (state, action) => {
      state.fetchDealerSupplyTypeLoading = false;
      toast.error(action.error.message || 'Failed to fetch dealer supply type');
    });
    builder.addCase(createDealer.pending, (state) => {
      state.createDealerLoading = true;
    });
    builder.addCase(createDealer.fulfilled, (state, action) => {
      state.currentDealer = action.payload.data;
      state.dealer_id = action.payload.data.account.id;
      setStoredValue('current_dealer', state.currentDealer);
      setStoredValue('dealer_id', state.dealer_id);
      state.createDealerLoading = false;
    });
    builder.addCase(createDealer.rejected, (state, action) => {
      state.createDealerLoading = false;
    });
    builder.addCase(getDealers.pending, (state) => {
      state.getDealersLoading = true;
    });
    builder.addCase(getDealers.fulfilled, (state, action) => {
      // Handle different response structures
      const payload = action.payload;
      if (Array.isArray(payload)) {
        state.dealers = payload;
        state.dealerPagination = {};
      } else if (payload?.data) {
        state.dealers = Array.isArray(payload.data) ? payload.data : payload.data.results || [];
        state.dealerPagination = payload.pagination || {
          total: payload.count || payload.data.count || state.dealers.length,
          page: payload.page || 1,
          page_size: payload.page_size || payload.pageSize || 25,
        };
      } else if (payload?.results) {
        state.dealers = Array.isArray(payload.results) ? payload.results : [];
        state.dealerPagination = {
          total: payload.count || state.dealers.length,
          page: payload.page || 1,
          page_size: payload.page_size || payload.pageSize || 25,
        };
      } else {
        state.dealers = [];
        state.dealerPagination = {};
      }
      state.getDealersLoading = false;
    });
    builder.addCase(getDealers.rejected, (state, action) => {
      state.getDealersLoading = false;
      toast.error(action.error.message || 'Failed to get dealers');
    });
    builder.addCase(getDealerById.pending, (state) => {
      state.getDealerByIdLoading = true;
    });
    builder.addCase(getDealerById.fulfilled, (state, action) => {
      state.currentDealer = action.payload.data;
      state.getDealerByIdLoading = false;
    });
    builder.addCase(getDealerById.rejected, (state, action) => {
      state.getDealerByIdLoading = false;
      toast.error(action.error.message || 'Failed to get dealer by id');
    });
    builder.addCase(updateDealer.pending, (state) => {
      state.updateDealerLoading = true;
    });
    builder.addCase(updateDealer.fulfilled, (state, action) => {
      state.currentDealer = action.payload.data;
      state.updateDealerLoading = false;
    });
    builder.addCase(updateDealer.rejected, (state, action) => {
      state.updateDealerLoading = false;
      toast.error(action.error.message || 'Failed to update dealer');
    });
    builder.addCase(createAccountBankDetails.pending, (state) => {
      state.createAccountBankDetailsLoading = true;
    });
    builder.addCase(createAccountBankDetails.fulfilled, (state, action) => {
      state.createAccountBankDetailsLoading = false;
      state.bankDetails = action.payload.data;
    });
    builder.addCase(createAccountBankDetails.rejected, (state, action) => {
      state.createAccountBankDetailsLoading = false;
      toast.error(action.error.message || 'Failed to create account bank details');
    });
    builder.addCase(updateAccountBankDetails.pending, (state) => {
      state.updateAccountBankDetailsLoading = true;
    });
    builder.addCase(updateAccountBankDetails.fulfilled, (state, action) => {
      state.updateAccountBankDetailsLoading = false;
      state.bankDetails = action.payload.data;
    });
    builder.addCase(updateAccountBankDetails.rejected, (state, action) => {
      state.updateAccountBankDetailsLoading = false;
      toast.error(action.error.message || 'Failed to update account bank details');
    });
    builder.addCase(deleteAccountBankDetails.pending, (state) => {
      state.deleteAccountBankDetailsLoading = true;
    });
    builder.addCase(deleteAccountBankDetails.fulfilled, (state, action) => {
      state.deleteAccountBankDetailsLoading = false;
      state.bankDetails = null;
    });
    builder.addCase(deleteAccountBankDetails.rejected, (state, action) => {
      state.deleteAccountBankDetailsLoading = false;
      toast.error(action.error.message || 'Failed to delete account bank details');
    });
    builder.addCase(getAccountBankDetails.pending, (state) => {
      state.getAccountBankDetailsLoading = true;
    });
    builder.addCase(getAccountBankDetails.fulfilled, (state, action) => {
      // Handle both array response and paginated response
      state.bankDetails = Array.isArray(action.payload)
        ? action.payload
        : action.payload?.results || action.payload?.data || [];
      state.getAccountBankDetailsLoading = false;
    });
    builder.addCase(getAccountBankDetails.rejected, (state, action) => {
      state.getAccountBankDetailsLoading = false;
      toast.error(action.error.message || 'Failed to get account bank details');
    });
    builder.addCase(getAccountBankDetailsById.pending, (state) => {
      state.getAccountBankDetailsByIdLoading = true;
    });
    builder.addCase(getAccountBankDetailsById.fulfilled, (state, action) => {
      state.bankDetails = action.payload.data;
      state.getAccountBankDetailsByIdLoading = false;
    });
    builder.addCase(getAccountBankDetailsById.rejected, (state, action) => {
      state.getAccountBankDetailsByIdLoading = false;
      toast.error(action.error.message || 'Failed to get account bank details by id');
    });
    builder.addCase(createWastageDetails.pending, (state) => {
      state.createWastageDetailsLoading = true;
    });
    builder.addCase(createWastageDetails.fulfilled, (state, action) => {
      state.createWastageDetailsLoading = false;
      state.wastageDetails = action.payload.data;
    });
    builder.addCase(createWastageDetails.rejected, (state, action) => {
      state.createWastageDetailsLoading = false;
      const errorMessage =
        action.payload || action.error?.message || 'Failed to create wastage details';
      toast.error(errorMessage);
    });
    builder.addCase(updateWastageDetails.pending, (state) => {
      state.updateWastageDetailsLoading = true;
    });
    builder.addCase(updateWastageDetails.fulfilled, (state, action) => {
      state.updateWastageDetailsLoading = false;
      state.wastageDetails = action.payload.data;
    });
    builder.addCase(updateWastageDetails.rejected, (state, action) => {
      state.updateWastageDetailsLoading = false;
      toast.error(action.error.message || 'Failed to update wastage details');
    });
    builder.addCase(deleteWastageDetails.pending, (state) => {
      state.deleteWastageDetailsLoading = true;
    });
    builder.addCase(deleteWastageDetails.fulfilled, (state, action) => {
      state.deleteWastageDetailsLoading = false;
      state.wastageDetails = null;
    });
    builder.addCase(deleteWastageDetails.rejected, (state, action) => {
      state.deleteWastageDetailsLoading = false;
      toast.error(action.error.message || 'Failed to delete wastage details');
    });
    builder.addCase(getWastageDetails.pending, (state) => {
      state.getWastageDetailsLoading = true;
    });
    builder.addCase(getWastageDetails.fulfilled, (state, action) => {
      state.wastageDetails = action.payload.data;
      state.getWastageDetailsLoading = false;
    });
    builder.addCase(getWastageDetails.rejected, (state, action) => {
      state.getWastageDetailsLoading = false;
      toast.error(action.error.message || 'Failed to get wastage details');
    });
    builder.addCase(getWastageDetailsById.pending, (state) => {
      state.getWastageDetailsByIdLoading = true;
    });
    builder.addCase(getWastageDetailsById.fulfilled, (state, action) => {
      state.wastageDetails = action.payload.data;
      state.getWastageDetailsByIdLoading = false;
    });
    builder.addCase(getWastageDetailsById.rejected, (state, action) => {
      state.getWastageDetailsByIdLoading = false;
      toast.error(action.error.message || 'Failed to get wastage details by id');
    });
    builder.addCase(createMoneyBalanceDetails.pending, (state) => {
      state.createMoneyBalanceDetailsLoading = true;
    });
    builder.addCase(createMoneyBalanceDetails.fulfilled, (state, action) => {
      state.createMoneyBalanceDetailsLoading = false;
      state.moneyBalanceDetails = action.payload.data;
    });
    builder.addCase(createMoneyBalanceDetails.rejected, (state, action) => {
      state.createMoneyBalanceDetailsLoading = false;
      toast.error(action.error.message || 'Failed to create money balance details');
    });
    builder.addCase(updateMoneyBalanceDetails.pending, (state) => {
      state.updateMoneyBalanceDetailsLoading = true;
    });
    builder.addCase(updateMoneyBalanceDetails.fulfilled, (state, action) => {
      state.updateMoneyBalanceDetailsLoading = false;
      state.moneyBalanceDetails = action.payload.data;
    });
    builder.addCase(updateMoneyBalanceDetails.rejected, (state, action) => {
      state.updateMoneyBalanceDetailsLoading = false;
      toast.error(action.error.message || 'Failed to update money balance details');
    });
    builder.addCase(deleteMoneyBalanceDetails.pending, (state) => {
      state.deleteMoneyBalanceDetailsLoading = true;
    });
    builder.addCase(deleteMoneyBalanceDetails.fulfilled, (state, action) => {
      state.deleteMoneyBalanceDetailsLoading = false;
      state.moneyBalanceDetails = null;
    });
    builder.addCase(deleteMoneyBalanceDetails.rejected, (state, action) => {
      state.deleteMoneyBalanceDetailsLoading = false;
      toast.error(action.error.message || 'Failed to delete money balance details');
    });
    builder.addCase(getMoneyBalanceDetails.pending, (state) => {
      state.getMoneyBalanceDetailsLoading = true;
    });
    builder.addCase(getMoneyBalanceDetails.fulfilled, (state, action) => {
      state.moneyBalanceDetails = action.payload.data;
      state.getMoneyBalanceDetailsLoading = false;
    });
    builder.addCase(getMoneyBalanceDetails.rejected, (state, action) => {
      state.getMoneyBalanceDetailsLoading = false;
      toast.error(action.error.message || 'Failed to get money balance details');
    });
    builder.addCase(getMoneyBalanceDetailsById.pending, (state) => {
      state.getMoneyBalanceDetailsByIdLoading = true;
    });
    builder.addCase(getMoneyBalanceDetailsById.fulfilled, (state, action) => {
      state.moneyBalanceDetails = action.payload.data;
      state.getMoneyBalanceDetailsByIdLoading = false;
    });
    builder.addCase(getMoneyBalanceDetailsById.rejected, (state, action) => {
      state.getMoneyBalanceDetailsByIdLoading = false;
      toast.error(action.error.message || 'Failed to get money balance details by id');
    });
    builder.addCase(createMetalBalanceDetails.pending, (state) => {
      state.createMetalBalanceDetailsLoading = true;
    });
    builder.addCase(createMetalBalanceDetails.fulfilled, (state, action) => {
      state.createMetalBalanceDetailsLoading = false;
      state.metalBalanceDetails = action.payload.data;
    });
    builder.addCase(createMetalBalanceDetails.rejected, (state, action) => {
      state.createMetalBalanceDetailsLoading = false;
      toast.error(action.error.message || 'Failed to create metal balance details');
    });
    builder.addCase(updateMetalBalanceDetails.pending, (state) => {
      state.updateMetalBalanceDetailsLoading = true;
    });
    builder.addCase(updateMetalBalanceDetails.fulfilled, (state, action) => {
      state.updateMetalBalanceDetailsLoading = false;
      state.metalBalanceDetails = action.payload.data;
    });
    builder.addCase(updateMetalBalanceDetails.rejected, (state, action) => {
      state.updateMetalBalanceDetailsLoading = false;
      toast.error(action.error.message || 'Failed to update metal balance details');
    });
    builder.addCase(deleteMetalBalanceDetails.pending, (state) => {
      state.deleteMetalBalanceDetailsLoading = true;
    });
    builder.addCase(deleteMetalBalanceDetails.fulfilled, (state, action) => {
      state.deleteMetalBalanceDetailsLoading = false;
      state.metalBalanceDetails = null;
    });
    builder.addCase(deleteMetalBalanceDetails.rejected, (state, action) => {
      state.deleteMetalBalanceDetailsLoading = false;
      toast.error(action.error.message || 'Failed to delete metal balance details');
    });
    builder.addCase(getMetalBalanceDetails.pending, (state) => {
      state.getMetalBalanceDetailsLoading = true;
    });
    builder.addCase(getMetalBalanceDetails.fulfilled, (state, action) => {
      state.metalBalanceDetails = action.payload.data;
      state.getMetalBalanceDetailsLoading = false;
    });
    builder.addCase(getMetalBalanceDetails.rejected, (state, action) => {
      state.getMetalBalanceDetailsLoading = false;
      toast.error(action.error.message || 'Failed to get metal balance details');
    });
    builder.addCase(getMetalBalanceDetailsById.pending, (state) => {
      state.getMetalBalanceDetailsByIdLoading = true;
    });
    builder.addCase(getMetalBalanceDetailsById.fulfilled, (state, action) => {
      state.metalBalanceDetails = action.payload.data;
      state.getMetalBalanceDetailsByIdLoading = false;
    });
    builder.addCase(getMetalBalanceDetailsById.rejected, (state, action) => {
      state.getMetalBalanceDetailsByIdLoading = false;
      toast.error(action.error.message || 'Failed to get metal balance details by id');
    });
    builder.addCase(createCustomerDetails.pending, (state) => {
      state.createCustomerDetailsLoading = true;
    });
    builder.addCase(createCustomerDetails.fulfilled, (state, action) => {
      state.customerDetails = action.payload.data;
      state.currentCustomer = action.payload.data;
      state.customer_id = action.payload.data.account.id;
      setStoredValue('current_customer', state.currentCustomer);
      setStoredValue('customer_id', state.customer_id);
      state.createCustomerDetailsLoading = false;
    });
    builder.addCase(createCustomerDetails.rejected, (state, action) => {
      state.createCustomerDetailsLoading = false;
      toast.error(action.error.message || 'Failed to create customer details');
    });
    builder.addCase(updateCustomerDetails.pending, (state) => {
      state.updateCustomerDetailsLoading = true;
    });
    builder.addCase(updateCustomerDetails.fulfilled, (state, action) => {
      state.updateCustomerDetailsLoading = false;
      state.customerDetails = action.payload.data;
    });
    builder.addCase(updateCustomerDetails.rejected, (state, action) => {
      state.updateCustomerDetailsLoading = false;
      toast.error(action.error.message || 'Failed to update customer details');
    });
    builder.addCase(deleteCustomerDetails.pending, (state) => {
      state.deleteCustomerDetailsLoading = true;
    });
    builder.addCase(deleteCustomerDetails.fulfilled, (state, action) => {
      state.deleteCustomerDetailsLoading = false;
      state.customerDetails = null;
    });
    builder.addCase(deleteCustomerDetails.rejected, (state, action) => {
      state.deleteCustomerDetailsLoading = false;
      toast.error(action.error.message || 'Failed to delete customer details');
    });
    builder.addCase(getCustomerDetails.pending, (state) => {
      state.getCustomerDetailsLoading = true;
    });
    builder.addCase(getCustomerDetails.fulfilled, (state, action) => {
      // Handle different response structures
      const payload = action.payload;
      if (Array.isArray(payload)) {
        state.customers = payload;
        state.customerPagination = {};
      } else if (payload?.data) {
        state.customers = Array.isArray(payload.data) ? payload.data : payload.data.results || [];
        state.customerPagination = payload.pagination || {
          total: payload.count || payload.data.count || state.customers.length,
          page: payload.page || 1,
          page_size: payload.page_size || payload.pageSize || 25,
        };
      } else if (payload?.results) {
        state.customers = Array.isArray(payload.results) ? payload.results : [];
        state.customerPagination = {
          total: payload.count || state.customers.length,
          page: payload.page || 1,
          page_size: payload.page_size || payload.pageSize || 25,
        };
      } else {
        state.customers = [];
        state.customerPagination = {};
      }
      state.getCustomerDetailsLoading = false;
    });
    builder.addCase(getCustomerDetails.rejected, (state, action) => {
      state.getCustomerDetailsLoading = false;
      toast.error(action.error.message || 'Failed to get customer details');
    });
    builder.addCase(getCustomerDetailsById.pending, (state) => {
      state.getCustomerDetailsByIdLoading = true;
    });
    builder.addCase(getCustomerDetailsById.fulfilled, (state, action) => {
      state.customerDetails = action.payload.data;
      state.getCustomerDetailsByIdLoading = false;
    });
    builder.addCase(getCustomerDetailsById.rejected, (state, action) => {
      state.getCustomerDetailsByIdLoading = false;
      toast.error(action.error.message || 'Failed to get customer details by id');
    });
    builder.addCase(createKarigarDetails.pending, (state) => {
      state.createKarigarDetailsLoading = true;
    });
    builder.addCase(createKarigarDetails.fulfilled, (state, action) => {
      state.karigarDetails = action.payload.data;
      state.currentKarigar = action.payload.data;
      state.karigar_id = action.payload.data.account.id;
      state.createKarigarDetailsLoading = false;
      setStoredValue('karigar_id', state.karigar_id);
      setStoredValue('current_karigar', state.currentKarigar);
    });
    builder.addCase(createKarigarDetails.rejected, (state, action) => {
      state.createKarigarDetailsLoading = false;
      toast.error(action.error.message || 'Failed to create karigar details');
    });
    builder.addCase(updateKarigarDetails.pending, (state) => {
      state.updateKarigarDetailsLoading = true;
    });
    builder.addCase(updateKarigarDetails.fulfilled, (state, action) => {
      state.updateKarigarDetailsLoading = false;
      state.karigarDetails = action.payload.data;
    });
    builder.addCase(updateKarigarDetails.rejected, (state, action) => {
      state.updateKarigarDetailsLoading = false;
      toast.error(action.error.message || 'Failed to update karigar details');
    });
    builder.addCase(deleteKarigarDetails.pending, (state) => {
      state.deleteKarigarDetailsLoading = true;
    });
    builder.addCase(deleteKarigarDetails.fulfilled, (state, action) => {
      state.deleteKarigarDetailsLoading = false;
      state.karigarDetails = null;
    });
    builder.addCase(deleteKarigarDetails.rejected, (state, action) => {
      state.deleteKarigarDetailsLoading = false;
      toast.error(action.error.message || 'Failed to delete karigar details');
    });
    builder.addCase(getKarigarDetails.pending, (state) => {
      state.getKarigarDetailsLoading = true;
    });
    builder.addCase(getKarigarDetails.fulfilled, (state, action) => {
      // Handle different response structures
      const payload = action.payload;
      if (Array.isArray(payload)) {
        state.karigars = payload;
        state.karigarPagination = {};
      } else if (payload?.data) {
        state.karigars = Array.isArray(payload.data) ? payload.data : payload.data.results || [];
        state.karigarPagination = payload.pagination || {
          total: payload.count || payload.data.count || state.karigars.length,
          page: payload.page || 1,
          page_size: payload.page_size || payload.pageSize || 25,
        };
      } else if (payload?.results) {
        state.karigars = Array.isArray(payload.results) ? payload.results : [];
        state.karigarPagination = {
          total: payload.count || state.karigars.length,
          page: payload.page || 1,
          page_size: payload.page_size || payload.pageSize || 25,
        };
      } else {
        state.karigars = [];
        state.karigarPagination = {};
      }
      state.getKarigarDetailsLoading = false;
    });
    builder.addCase(getKarigarDetails.rejected, (state, action) => {
      state.getKarigarDetailsLoading = false;
      toast.error(action.error.message || 'Failed to get karigar details');
    });
    builder.addCase(getKarigarDetailsById.pending, (state) => {
      state.getKarigarDetailsByIdLoading = true;
    });
    builder.addCase(getKarigarDetailsById.fulfilled, (state, action) => {
      state.karigarDetails = action.payload.data;
      state.getKarigarDetailsByIdLoading = false;
    });
    builder.addCase(getKarigarDetailsById.rejected, (state, action) => {
      state.getKarigarDetailsByIdLoading = false;
      toast.error(action.error.message || 'Failed to get karigar details by id');
    });
    builder.addCase(createLedgerDetails.pending, (state) => {
      state.createLedgerDetailsLoading = true;
    });
    builder.addCase(createLedgerDetails.fulfilled, (state, action) => {
      state.createLedgerDetailsLoading = false;
      state.ledgerDetails = action.payload.data;
    });
    builder.addCase(createLedgerDetails.rejected, (state, action) => {
      state.createLedgerDetailsLoading = false;
      toast.error(action.error.message || 'Failed to create ledger details');
    });
    builder.addCase(updateLedgerDetails.pending, (state) => {
      state.updateLedgerDetailsLoading = true;
    });
    builder.addCase(updateLedgerDetails.fulfilled, (state, action) => {
      state.updateLedgerDetailsLoading = false;
      state.ledgerDetails = action.payload.data;
    });
    builder.addCase(updateLedgerDetails.rejected, (state, action) => {
      state.updateLedgerDetailsLoading = false;
      toast.error(action.error.message || 'Failed to update ledger details');
    });
    builder.addCase(deleteLedgerDetails.pending, (state) => {
      state.deleteLedgerDetailsLoading = true;
    });
    builder.addCase(deleteLedgerDetails.fulfilled, (state, action) => {
      state.deleteLedgerDetailsLoading = false;
      state.ledgerDetails = null;
    });
    builder.addCase(deleteLedgerDetails.rejected, (state, action) => {
      state.deleteLedgerDetailsLoading = false;
      toast.error(action.error.message || 'Failed to delete ledger details');
    });
    builder.addCase(getLedgerDetails.pending, (state) => {
      state.getLedgerDetailsLoading = true;
    });
    builder.addCase(getLedgerDetails.fulfilled, (state, action) => {
      // Handle different response structures
      const payload = action.payload;
      if (Array.isArray(payload)) {
        state.ledgers = payload;
        state.ledgerPagination = {};
      } else if (payload?.data) {
        state.ledgers = Array.isArray(payload.data) ? payload.data : payload.data.results || [];
        state.ledgerPagination = payload.pagination || {
          total: payload.count || payload.data.count || state.ledgers.length,
          page: payload.page || 1,
          page_size: payload.page_size || payload.pageSize || 25,
        };
      } else if (payload?.results) {
        state.ledgers = Array.isArray(payload.results) ? payload.results : [];
        state.ledgerPagination = {
          total: payload.count || state.ledgers.length,
          page: payload.page || 1,
          page_size: payload.page_size || payload.pageSize || 25,
        };
      } else {
        state.ledgers = [];
        state.ledgerPagination = {};
      }
      state.getLedgerDetailsLoading = false;
    });
    builder.addCase(getLedgerDetails.rejected, (state, action) => {
      state.getLedgerDetailsLoading = false;
      toast.error(action.error.message || 'Failed to get ledger details');
    });
    builder.addCase(getLedgerDetailsById.pending, (state) => {
      state.getLedgerDetailsByIdLoading = true;
    });
    builder.addCase(getLedgerDetailsById.fulfilled, (state, action) => {
      state.ledgerDetails = action.payload.data;
      state.getLedgerDetailsByIdLoading = false;
    });
    builder.addCase(getLedgerDetailsById.rejected, (state, action) => {
      state.getLedgerDetailsByIdLoading = false;
      toast.error(action.error.message || 'Failed to get ledger details by id');
    });
    builder.addCase(getLedgerTypes.pending, (state) => {
      state.getLedgerTypesLoading = true;
    });
    builder.addCase(getLedgerTypes.fulfilled, (state, action) => {
      state.ledgerTypes = action.payload.data;
      state.getLedgerTypesLoading = false;
    });
    builder.addCase(getLedgerTypes.rejected, (state, action) => {
      state.getLedgerTypesLoading = false;
      toast.error(action.error.message || 'Failed to get ledger types');
    });
  },
});

export default accountSlice.reducer;
export const accountActions = {
  fetchDealerSupplyType,
  createDealer,
  getDealers,
  getDealerById,
  updateDealer,
  createAccountBankDetails,
  updateAccountBankDetails,
  deleteAccountBankDetails,
  getAccountBankDetails,
  getAccountBankDetailsById,
  createWastageDetails,
  updateWastageDetails,
  deleteWastageDetails,
  getWastageDetails,
  getWastageDetailsById,
  createMoneyBalanceDetails,
  updateMoneyBalanceDetails,
  deleteMoneyBalanceDetails,
  getMoneyBalanceDetails,
  getMoneyBalanceDetailsById,
  createMetalBalanceDetails,
  updateMetalBalanceDetails,
  deleteMetalBalanceDetails,
  getMetalBalanceDetails,
  getMetalBalanceDetailsById,
  createCustomerDetails,
  updateCustomerDetails,
  deleteCustomerDetails,
  getCustomerDetails,
  getCustomerDetailsById,
  createKarigarDetails,
  updateKarigarDetails,
  deleteKarigarDetails,
  getKarigarDetails,
  getKarigarDetailsById,
  createLedgerDetails,
  updateLedgerDetails,
  deleteLedgerDetails,
  getLedgerDetails,
  getLedgerDetailsById,
  getLedgerTypes,
};
