import { useState, useCallback } from 'react';
import { toast } from 'src/components/snackbar';
import { useApi } from './useApi';
import { useDispatch, useSelector } from 'react-redux';
import { accountActions } from 'src/redux/slices/account.slice';
import { API_ROUTES } from 'src/utils/apiRoute';

// ----------------------------------------------------------------------

export function useAccounts() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [accountCustomerGroups, setAccountCustomerGroups] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const dispatch = useDispatch();
  const { callApi } = useApi();

  const {
    supplyType,
    fetchDealerSupplyTypeLoading,
    createDealerLoading,
    getDealersLoading,
    getDealerByIdLoading,
    updateDealerLoading,
    createAccountBankDetailsLoading,
    getAccountBankDetailsLoading,
    createWastageDetailsLoading,
    createMoneyBalanceDetailsLoading,
    createMetalBalanceDetailsLoading,
    currentDealer,
    dealerPagination,
    dealer_id,
    dealers,
    getCustomerDetailsLoading,
    customers,
    customerPagination,
    getKarigarDetailsLoading,
    karigars,
    karigarPagination,
    getLedgerDetailsLoading,
    getLedgerDetailsByIdLoading,
    updateLedgerDetailsLoading,
    ledgers,
    ledgerPagination,
  } = useSelector((state) => state.account);
  const selectedCompany = useSelector((state) => state.user.selectedCompany);
  const getCompanyId = useCallback(() => selectedCompany?.company?.id, [selectedCompany]);

  // Mock API functions - replace with actual API calls later
  const fetchAccounts = useCallback(async (page = 1, limit = 25, filters = {}) => {
    try {
      setLoading(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Mock response
      const mockData = [];
      setData(mockData);
      setTotalCount(0);

      return { success: true, data: mockData, totalCount: 0 };
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast.error('Failed to fetch accounts');
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const createAccount = useCallback(async (accountData) => {
    try {
      setLoading(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log('Creating account:', accountData);

      // Mock successful response
      toast.success('Account created successfully!');
      return { success: true, data: { id: Date.now(), ...accountData } };
    } catch (error) {
      console.error('Error creating account:', error);
      toast.error('Failed to create account');
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAccount = useCallback(async (id, accountData) => {
    try {
      setLoading(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock successful response
      toast.success('Account updated successfully!');
      return { success: true, data: { id, ...accountData } };
    } catch (error) {
      console.error('Error updating account:', error);
      toast.error('Failed to update account');
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAccount = useCallback(async (id) => {
    try {
      setLoading(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log('Deleting account:', id);

      // Mock successful response
      toast.success('Account deleted successfully!');
      return { success: true };
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAccounts = useCallback(async (ids) => {
    try {
      setLoading(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log('Deleting accounts:', ids);

      // Mock successful response
      toast.success(`Successfully deleted ${ids.length} account(s)!`);
      return { success: true, deletedCount: ids.length };
    } catch (error) {
      console.error('Error deleting accounts:', error);
      toast.error('Failed to delete accounts');
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Customer specific API calls
  const createCustomer = useCallback(async (customerData) => {
    try {
      setLoading(true);

      // Simulate separate API calls for each section
      const { generalDetails, balanceDetails, membershipDetails } = customerData;

      // General Details API
      console.log('Creating customer general details:', generalDetails);
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Balance Details API
      if (balanceDetails?.balanceEntries?.length > 0) {
        console.log('Creating customer balance details:', balanceDetails);
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      // Membership Details API
      if (membershipDetails) {
        console.log('Creating customer membership details:', membershipDetails);
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      toast.success('Customer account created successfully!');
      return { success: true, data: { id: Date.now(), ...customerData } };
    } catch (error) {
      console.error('Error creating customer:', error);
      toast.error('Failed to create customer account');
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const createUpdateCustomerDetails = useCallback(async (customerData, company_id, customer_id) => {
    try {
      setLoading(true);
      // Simulate separate API calls for each section
      const { generalDetails, balanceDetails, membershipDetails } = customerData;

      // General Details API
      if (generalDetails) {
        if (customer_id) {
          await updateCustomer(generalDetails, company_id, customer_id);
        } else {
          await createNewCustomer(generalDetails, company_id);
        }
      }

      // Membership Details API
      if (membershipDetails) {
        if (customer_id) {
          await updateMemberShip(membershipDetails, company_id, customer_id);
        }
      }

      toast.success(`Customer account ${customer_id ? 'updated' : 'created'} successfully!`);
      return { success: true, data: { id: Date.now(), ...customerData } };
    } catch (error) {
      console.error('Error creating customer:', error);
      toast.error('Failed to create customer account');
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const createNewCustomer = useCallback(
    async (customerData, company_id) => {
      try {
        const response = await dispatch(
          accountActions.createCustomerDetails({ data: customerData, company_id })
        ).unwrap();
        return response;
      } catch (error) {
        console.error('Error creating dealer:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const getCustomerById = useCallback(
    async (id, company_id) => {
      try {
        const response = await dispatch(
          accountActions.getCustomerDetailsById({ customer_id: id, company_id })
        ).unwrap();
        return response;
      } catch (error) {
        console.error('Error getting customer by id:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const updateCustomer = useCallback(
    async (customerData, company_id, id) => {
      try {
        const response = await dispatch(
          accountActions.updateCustomerDetails({ customer_id: id, data: customerData, company_id })
        ).unwrap();
        return response;
      } catch (error) {
        console.error('Error updating customer:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // Membership specific API calls
  const updateMemberShip = useCallback(
    async (customerData, company_id, customer_id) => {
      try {
        const response = await dispatch(
          accountActions.updateCustomerDetails({
            customer_id,
            data: customerData,
            company_id,
          })
        ).unwrap();
        return response;
      } catch (error) {
        console.error('Error creating dealer:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const createNewKarigar = useCallback(
    async (karigarData, company_id) => {
      try {
        const response = await dispatch(
          accountActions.createKarigarDetails({ data: karigarData, company_id })
        ).unwrap();
        return response;
      } catch (error) {
        console.error('Error creating dealer:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const updateKarigar = useCallback(
    async (karigarData, company_id, id) => {
      try {
        const response = await dispatch(
          accountActions.updateKarigarDetails({ data: karigarData, company_id, id })
        ).unwrap();
        return response;
      } catch (error) {
        console.error('Error creating dealer:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const getKarigarById = useCallback(
    async (id, company_id) => {
      try {
        const response = await dispatch(
          accountActions.getKarigarDetailsById({ karigar_id: id, company_id })
        ).unwrap();
        return response;
      } catch (error) {
        console.error('Error getting dealer by id:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const createUpdateKarigar = useCallback(async (karigarData, company_id, karigar_id) => {
    try {
      setLoading(true);

      if (karigar_id) {
        await updateKarigar(karigarData, company_id, karigar_id);
      } else {
        await createNewKarigar(karigarData, company_id);
      }
      toast.success(`Karigar account ${karigar_id ? 'updated' : 'created'} successfully!`);
      return { success: true, data: { id: Date.now(), ...karigarData } };
    } catch (error) {
      console.error('Error creating customer:', error);
      toast.error('Failed to create customer account');
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Others specific API calls
  const createOthers = useCallback(
    async (othersData) => {
      try {
        setLoading(true);

        const companyId = selectedCompany?.company?.id;
        if (!companyId) {
          throw new Error('Company ID not found');
        }

        // Transform form data to API payload structure
        const payload = {
          company_id: companyId,
          ledger_type_id: othersData.ledgerType,
          ledger_name: othersData.accountName,
          current_balance: othersData.currentBalance?.toString() || '0',
        };

        const response = await callApi({
          url: API_ROUTES.ACCOUNTS.LEDGER_ACCOUNT_DETAILS.CREATE,
          method: 'POST',
          body: payload,
        });

        if (response.success) {
          return { success: true, data: response.data || response };
        }

        return { success: false, message: response.message || 'Failed to create account' };
      } catch (error) {
        console.error('Error creating others account:', error);
        return { success: false, message: error.message || 'Failed to create account' };
      } finally {
        setLoading(false);
      }
    },
    [callApi, selectedCompany]
  );

  // Dealer Specific API calls

  const getDealerSupplyType = useCallback(
    async (company_id) => {
      try {
        const response = await dispatch(accountActions.fetchDealerSupplyType(company_id)).unwrap();
        return response;
      } catch (error) {
        console.error('Error getting dealer supply type:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const createDealer = useCallback(
    async (dealerData, company_id) => {
      try {
        console.log('company_id in hook: ', company_id);
        const response = await dispatch(
          accountActions.createDealer({ dealerData, company_id })
        ).unwrap();
        return response;
      } catch (error) {
        console.error('Error creating dealer:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const getDealers = useCallback(
    async (company_id, page = 1, page_size = 25, search = '') => {
      try {
        const response = await dispatch(
          accountActions.getDealers({ company_id, page, page_size, search })
        ).unwrap();
        return response;
      } catch (error) {
        console.error('Error getting dealers:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const getDealerById = useCallback(
    async (id, company_id) => {
      try {
        const response = await dispatch(
          accountActions.getDealerById({ dealer_id: id, company_id })
        ).unwrap();
        return response;
      } catch (error) {
        console.error('Error getting dealer by id:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const updateDealer = useCallback(
    async (id, dealerData, company_id) => {
      try {
        const response = await dispatch(
          accountActions.updateDealer({ dealer_id: id, dealerData, company_id })
        ).unwrap();
        return response;
      } catch (error) {
        console.error('Error updating dealer:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const createUpdateAccountBankDetails = useCallback(
    async (bankDetailsData, account_id, company_id, bank_id) => {
      try {
        if (bank_id) {
          return await updateAccountBankDetails(bankDetailsData, account_id, company_id, bank_id);
        } else {
          return await createAccountBankDetails(bankDetailsData, account_id);
        }
      } catch (error) {
        console.error('Error creating account bank details:', error);
        throw error;
      }
    },
    []
  );

  const createAccountBankDetails = useCallback(
    async (bankDetailsData, account_id) => {
      try {
        const response = await dispatch(
          accountActions.createAccountBankDetails({ data: bankDetailsData, account_id })
        ).unwrap();
        return response;
      } catch (error) {
        console.error('Error creating account bank details:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const updateAccountBankDetails = useCallback(
    async (bankDetailsData, account_id, company_id, bank_id) => {
      try {
        const response = await dispatch(
          accountActions.updateAccountBankDetails({
            data: bankDetailsData,
            account_id,
            company_id,
            bank_id,
          })
        ).unwrap();
        return response;
      } catch (error) {
        console.error('Error creating account bank details:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const getAccountBankDetails = useCallback(
    async (company_id, account_id = null, page = 1, page_size = 25, search = '') => {
      try {
        const response = await dispatch(
          accountActions.getAccountBankDetails({ company_id, account_id, page, page_size, search })
        ).unwrap();
        return response;
      } catch (error) {
        console.error('Error getting account bank details:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const getLedgerTypes = useCallback(async () => {
    try {
      const response = await callApi({
        url: API_ROUTES.ACCOUNTS.LEDGER_ACCOUNT_DETAILS.LEDGER_TYPES,
        method: 'GET',
      });

      if (response.success) {
        return {
          success: true,
          data: response.data || response.results || [],
        };
      }

      return {
        success: false,
        data: [],
        message: 'Failed to fetch ledger types',
      };
    } catch (error) {
      console.error('Error fetching ledger types:', error);
      return {
        success: false,
        data: [],
        message: error.message,
      };
    }
  }, [callApi]);

  const getCustomers = useCallback(
    async (company_id, page = 1, page_size = 25, search = '') => {
      try {
        const response = await dispatch(
          accountActions.getCustomerDetails({ company_id, page, page_size, search })
        ).unwrap();
        return response;
      } catch (error) {
        console.error('Error getting customers:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const getKarigars = useCallback(
    async (company_id, page = 1, page_size = 25, search = '') => {
      try {
        const response = await dispatch(
          accountActions.getKarigarDetails({ company_id, page, page_size, search })
        ).unwrap();
        return response;
      } catch (error) {
        console.error('Error getting karigars:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const getLedgers = useCallback(
    async (company_id, page = 1, page_size = 25, search = '') => {
      try {
        const response = await dispatch(
          accountActions.getLedgerDetails({ company_id, page, page_size, search })
        ).unwrap();
        return response;
      } catch (error) {
        console.error('Error getting ledgers:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const getLedgerById = useCallback(
    async (id, company_id) => {
      try {
        const response = await dispatch(
          accountActions.getLedgerDetailsById({ ledger_id: id, company_id })
        ).unwrap();
        return response;
      } catch (error) {
        console.error('Error getting ledger by id:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const updateLedger = useCallback(
    async (id, ledgerData, company_id) => {
      try {
        const response = await dispatch(
          accountActions.updateLedgerDetails({ ledger_id: id, ledgerData, company_id })
        ).unwrap();
        return response;
      } catch (error) {
        console.error('Error updating ledger:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // Fetch list of customer groups with pagination and search
  const fetchAccountCustomerGroups = useCallback(
    async (search, filter = { pagination: true, page: 1, pageSize: 10 }) => {
      try {
        const { pagination, page, pageSize } = filter;
        const companyId = getCompanyId();

        const query = {
          company_id: companyId,
        };
        if (pagination) {
          query.page = page;
          query.page_size = pageSize;
        }

        if (search) {
          query.search = search;
        }

        const response = await callApi({
          url: API_ROUTES.ACCOUNTS.CUSTOMER_GROUPS.LIST,
          method: 'GET',
          query,
        });

        if (response.success) {
          // Handle the useApi hook's array spreading behavior
          let items = [];
          items = response.data || response.results || [];
          setAccountCustomerGroups(items);
          return items;
        }
        return [];
      } catch {
        return [];
      }
    },
    [callApi, getCompanyId]
  );

  // Wastage and Balance Details functions
  const createUpdateWastageDetails = useCallback(
    async (wastageData, company_id, account_id, isEditMode) => {
      try {
        if (isEditMode) return await updateWastageDetails(wastageData, company_id, account_id);
        else return await createWastageDetails(wastageData, company_id, account_id);
      } catch (error) {
        console.error('Error creating wastage details:', error);
        throw error;
      }
    },
    []
  );

  const createWastageDetails = useCallback(
    async (wastageData, company_id, account_id) => {
      try {
        const response = await dispatch(
          accountActions.createWastageDetails({ data: wastageData, company_id, account_id })
        ).unwrap();
        return response;
      } catch (error) {
        console.error('Error creating wastage details:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const updateWastageDetails = useCallback(
    async (wastageData, company_id, account_id) => {
      try {
        const response = await dispatch(
          accountActions.updateWastageDetails({ data: wastageData, company_id, account_id })
        ).unwrap();
        return response;
      } catch (error) {
        console.error('Error creating wastage details:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const deleteWastageDetails = useCallback(
    async (id, company_id) => {
      try {
        const response = await dispatch(
          accountActions.deleteWastageDetails({ wastage_detail_id: id, company_id })
        ).unwrap();

        return response;
      } catch (error) {
        console.error('Error deleting wastage details:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // Money Balance Details functions
  const createUpdateMoneyBalanceDetails = useCallback(
    async (balanceData, company_id, account_id, isEditMode) => {
      try {
        if (isEditMode) return await updateMoneyBalanceDetails(balanceData, company_id, account_id);
        else return await createMoneyBalanceDetails(balanceData, company_id, account_id);
      } catch (error) {
        console.error('Error creating money balance details:', error);
        throw error;
      }
    },
    []
  );

  const createMoneyBalanceDetails = useCallback(
    async (balanceData, company_id, account_id) => {
      try {
        const response = await dispatch(
          accountActions.createMoneyBalanceDetails({ data: balanceData, company_id, account_id })
        ).unwrap();
        return response;
      } catch (error) {
        console.error('Error creating money balance details:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const updateMoneyBalanceDetails = useCallback(
    async (balanceData, company_id, account_id) => {
      try {
        const response = await dispatch(
          accountActions.updateMoneyBalanceDetails({ data: balanceData, company_id, account_id })
        ).unwrap();
        return response;
      } catch (error) {
        console.error('Error creating money balance details:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const deleteMoneyBalanceDetails = useCallback(
    async (id, company_id) => {
      try {
        const response = await dispatch(
          accountActions.deleteMoneyBalanceDetails({ money_balance_detail_id: id, company_id })
        ).unwrap();
        return response;
      } catch (error) {
        console.error('Error creating money balance details:', error);
        throw error;
      }
    },
    [dispatch]
  );

  return {
    // State
    loading,
    data,
    accountCustomerGroups,
    totalCount,

    // General functions
    fetchAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
    deleteAccounts,
    getLedgerTypes,

    // Specific account type functions
    createCustomer,
    createUpdateCustomerDetails,
    getCustomerById,

    // createKarigar,
    createUpdateKarigar,
    getKarigarById,

    createOthers,

    // Dealer specific functions
    supplyType,
    fetchDealerSupplyTypeLoading,
    getDealerSupplyType,
    createDealer,
    getDealers,
    getDealerById,
    updateDealer,
    createDealerLoading,
    getDealersLoading,
    getDealerByIdLoading,
    updateDealerLoading,
    currentDealer,
    dealerPagination,
    dealer_id,
    dealers,
    createUpdateAccountBankDetails,
    createAccountBankDetailsLoading,
    getAccountBankDetails,
    getAccountBankDetailsLoading,

    // Customer functions
    getCustomers,
    getCustomerDetailsLoading,
    customers,
    customerPagination,

    // Karigar functions
    getKarigars,
    getKarigarDetailsLoading,
    karigars,
    karigarPagination,

    // Ledger functions
    getLedgers,
    getLedgerById,
    updateLedger,
    getLedgerDetailsLoading,
    getLedgerDetailsByIdLoading,
    updateLedgerDetailsLoading,
    ledgers,
    ledgerPagination,

    createUpdateWastageDetails,
    deleteWastageDetails,
    createWastageDetailsLoading,

    createUpdateMoneyBalanceDetails,
    deleteMoneyBalanceDetails,
    createMoneyBalanceDetailsLoading,

    createMetalBalanceDetailsLoading,
    fetchAccountCustomerGroups,
  };
}
