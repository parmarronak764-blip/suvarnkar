import { API_ROUTES } from 'src/utils/apiRoute';
import { toast } from 'src/components/snackbar';
import axiosInstance from 'src/lib/axios';
import { extractErrorMessage } from 'src/utils/error-handler';
import { getStoredValue } from 'src/utils/services';

// dealer specific services

const fetchDealerSupplyType = async (company_id) => {
  try {
    const companyIdValue = company_id?.id || company_id;

    const response = await axiosInstance.get(
      `${API_ROUTES.ACCOUNTS.DEALERS.SUPPLY_TYPE}?company_id=${companyIdValue}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching dealer supply type:', error);
    throw error;
  }
};

const createDealer = async (data, company_id) => {
  try {
    const companyIdValue = company_id?.id || company_id;

    const dealerData = {
      company_id: companyIdValue,
      name: data.dealerName || data.name,
      owner_name: data.ownerName || data.owner_name,
      address: data.address,
      city: data.city,
      pincode: data.pincode,
      dealer_code: data.dealerCode || data.dealer_code,
      dealer_supply_type_id: data.dealerSupplyType || data.dealer_supply_type_id,
      whatsapp_number: data.whatsappNumber || data.whatsapp_number,
      whatsapp_country_code: data.whatsappCountryCode || data.whatsapp_country_code,
      pan_no: data.panCardNumber || data.pan_no,
      contact_number: data.contactNumber || data.contact_number,
      contact_country_code: data.contactCountryCode || data.contact_country_code,
      gst_number: data.dealerGstNumber || data.gst_number,
    };

    // Remove undefined fields
    Object.keys(dealerData).forEach((key) => {
      if (dealerData[key] === undefined || dealerData[key] === null || dealerData[key] === '') {
        delete dealerData[key];
      }
    });

    console.log('dealerData in service: ', dealerData);
    console.log('API URL: ', `${API_ROUTES.ACCOUNTS.DEALERS.CREATE}`);
    const response = await axiosInstance.post(`${API_ROUTES.ACCOUNTS.DEALERS.CREATE}`, dealerData);
    console.log('Full response: ', response);
    console.log('Response data: ', response.data);

    return response.data;
  } catch (error) {
    console.error('Error creating dealer:', error);
    console.error('Error response: ', error.response);
    const errorMessage = extractErrorMessage(error.response?.data);
    toast.error(errorMessage || 'Failed to create dealer');
    throw error;
  }
};

const getDealers = async (company_id, page = 1, page_size = 25, search = '') => {
  try {
    const companyIdValue = company_id?.id || company_id;

    let url = `${API_ROUTES.ACCOUNTS.DEALERS.GET}?company_id=${companyIdValue}&page=${page}&page_size=${page_size}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    console.error('Error getting dealers:', error);
    throw error;
  }
};

const getDealerById = async (dealer_id, company_id) => {
  try {
    const companyIdValue = company_id?.id || company_id;

    const response = await axiosInstance.get(
      `${API_ROUTES.ACCOUNTS.DEALERS.GET_BY_ID(dealer_id)}?company_id=${companyIdValue}`
    );
    return response.data;
  } catch (error) {
    console.error('Error getting dealer by id:', error);
    throw error;
  }
};

const updateDealer = async (dealer_id, data, company_id) => {
  try {
    const dealerData = {
      name: data.dealerName || data.name,
      owner_name: data.ownerName || data.owner_name,
      address: data.address,
      city: data.city,
      pincode: data.pincode,
      dealer_code: data.dealerCode || data.dealer_code,
      dealer_supply_type_id: data.dealerSupplyType || data.dealer_supply_type_id,
      whatsapp_number: data.whatsappNumber || data.whatsapp_number,
      whatsapp_country_code: data.whatsappCountryCode || data.whatsapp_country_code,
      pan_no: data.panCardNumber || data.pan_no,
      contact_number: data.contactNumber || data.contact_number,
      contact_country_code: data.contactCountryCode || data.contact_country_code,
      gst_number: data.dealerGstNumber || data.gst_number,
    };

    // Remove undefined fields
    Object.keys(dealerData).forEach((key) => {
      if (dealerData[key] === undefined || dealerData[key] === null || dealerData[key] === '') {
        delete dealerData[key];
      }
    });

    const companyIdValue = company_id?.id || company_id;

    const response = await axiosInstance.put(
      `${API_ROUTES.ACCOUNTS.DEALERS.UPDATE(dealer_id)}?company_id=${companyIdValue}`,
      dealerData
    );
    return response.data;
  } catch (error) {
    console.error('Error updating dealer:', error);
    const errorMessage = extractErrorMessage(error.response?.data);
    toast.error(errorMessage || 'Failed to update dealer');
    throw error;
  }
};

const createAccountBankDetails = async (data, account_id) => {
  try {
    // account_id can come from parameter or from data object or from localStorage
    const accountId = account_id || data.account_id || getStoredValue('dealer_id');

    if (!accountId) {
      throw new Error('Account ID is required to create bank details');
    }

    const bankDetailsData = {
      account_id: accountId,
      bank_name: data.bankName || data.bank_name,
      account_type: data.accountType || data.account_type,
      ifsc_code: data.ifscCode || data.ifsc_code,
      account_number: data.accountNumber || data.account_number,
    };

    // Remove undefined fields
    Object.keys(bankDetailsData).forEach((key) => {
      if (
        bankDetailsData[key] === undefined ||
        bankDetailsData[key] === null ||
        bankDetailsData[key] === ''
      ) {
        delete bankDetailsData[key];
      }
    });

    console.log('bankDetailsData in service: ', bankDetailsData);
    console.log('API URL: ', `${API_ROUTES.ACCOUNTS.BANK_DETAILS.CREATE}`);
    const response = await axiosInstance.post(
      `${API_ROUTES.ACCOUNTS.BANK_DETAILS.CREATE}`,
      bankDetailsData
    );
    return response.data;
  } catch (error) {
    console.error('Error creating account bank details:', error);
    const errorMessage = extractErrorMessage(
      error?.response?.data,
      'Failed to create account bank details'
    );
    toast.error(errorMessage);
    throw error;
  }
};

const getAccountBankDetails = async (
  company_id,
  account_id = null,
  page = 1,
  page_size = 25,
  search = ''
) => {
  try {
    const companyIdValue = company_id?.id || company_id;

    if (!companyIdValue) {
      throw new Error('Company ID is required to get bank details');
    }

    // If account_id is provided, don't include pagination parameters (fetch specific account's bank details)
    // Otherwise, include pagination for listing all bank details
    let url = `${API_ROUTES.ACCOUNTS.BANK_DETAILS.GET}?company_id=${companyIdValue}`;

    if (account_id) {
      url += `&account_id=${account_id}`;
      // Don't add pagination when fetching for specific account
    } else {
      // Add pagination only when listing all bank details
      url += `&page=${page}&page_size=${page_size}`;
    }

    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }

    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    console.error('Error getting account bank details:', error);
    throw error;
  }
};

const getAccountBankDetailsById = async (bank_detail_id) => {
  try {
    const response = await axiosInstance.get(
      `${API_ROUTES.ACCOUNTS.BANK_DETAILS.GET_BY_ID(bank_detail_id)}`
    );
    return response.data;
  } catch (error) {
    console.error('Error getting account bank details by id:', error);
    throw error;
  }
};

const updateAccountBankDetails = async (data, account_id, company_id, bank_detail_id) => {
  try {
    // account_id can come from parameter or from data object or from localStorage
    const accountId = account_id || data?.account_id || getStoredValue('dealer_id');

    if (!accountId) {
      throw new Error('Account ID is required to create bank details');
    }

    const bankDetailsData = {
      company_id: company_id,
      account_id: accountId,
      bank_name: data.bankName || data.bank_name,
      account_type: data.accountType || data.account_type,
      ifsc_code: data.ifscCode || data.ifsc_code,
      account_number: data.accountNumber || data.account_number,
    };

    // Remove undefined fields
    Object.keys(bankDetailsData).forEach((key) => {
      if (
        bankDetailsData[key] === undefined ||
        bankDetailsData[key] === null ||
        bankDetailsData[key] === ''
      ) {
        delete bankDetailsData[key];
      }
    });

    console.log('bankDetailsData in service: ', bankDetailsData);
    const response = await axiosInstance.put(
      `${API_ROUTES.ACCOUNTS.BANK_DETAILS.UPDATE(bank_detail_id)}`,
      bankDetailsData
    );
    return response.data;
  } catch (error) {
    console.error('Error updating account bank details:', error);
    throw error;
  }
};

const deleteAccountBankDetails = async (bank_detail_id) => {
  try {
    const response = await axiosInstance.delete(
      `${API_ROUTES.ACCOUNTS.BANK_DETAILS.DELETE(bank_detail_id)}`
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting account bank details:', error);
    throw error;
  }
};

const createWastageDetails = async (data, company_id, account_id) => {
  try {
    const wastageEntries = data.wastageEntries || data.data?.wastageEntries || [];

    const companyIdValue = company_id?.id || company_id;

    if (!companyIdValue || !account_id) {
      throw new Error('Company ID and Account ID are required to create wastage details');
    }

    if (!wastageEntries || wastageEntries.length === 0) {
      return { success: true, data: [] };
    }

    // Transform form data to API structure
    const wastageDetails = wastageEntries
      .filter((entry) => entry.product_id && entry.wastagePercentage !== undefined)
      .map((entry) => ({
        company_id: companyIdValue,
        account_id,
        product_id: entry.product_id,
        wastage_percent: entry.wastagePercentage?.toString() || entry.wastage_percent,
      }));

    if (wastageDetails.length === 0) {
      return { success: true, data: [] };
    }

    // API expects: { company_id: integer, wastage_details: [...] }
    const payload = {
      company_id: companyIdValue,
      wastage_details: wastageDetails,
    };

    const response = await axiosInstance.post(
      `${API_ROUTES.ACCOUNTS.WASTAGE_DETAILS.CREATE}`,
      payload
    );

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error creating wastage details:', error);
    // Don't show toast here - let Redux slice handle error display
    throw error;
  }
};

const getWastageDetails = async () => {
  try {
    const response = await axiosInstance.get(`${API_ROUTES.ACCOUNTS.WASTAGE_DETAILS.GET}`);
    return response.data;
  } catch (error) {
    console.error('Error getting wastage details:', error);
    throw error;
  }
};

const getWastageDetailsById = async (wastage_detail_id) => {
  try {
    const response = await axiosInstance.get(
      `${API_ROUTES.ACCOUNTS.WASTAGE_DETAILS.GET_BY_ID(wastage_detail_id)}`
    );
    return response.data;
  } catch (error) {
    console.error('Error getting wastage details by id:', error);
    throw error;
  }
};

const updateWastageDetails = async (data, company_id, account_id) => {
  try {
    const wastageEntries = data.wastageEntries || data.data?.wastageEntries || [];

    const companyIdValue = company_id?.id || company_id;

    if (!companyIdValue || !account_id) {
      throw new Error('Company ID and Account ID are required to create wastage details');
    }

    if (!wastageEntries || wastageEntries.length === 0) {
      return { success: true, data: [] };
    }

    // Transform form data to API structure
    const wastageDetails = wastageEntries
      .filter((entry) => entry.product_id && entry.wastagePercentage !== undefined)
      .map((entry) => ({
        id: entry.id,
        company_id: companyIdValue,
        account_id,
        product_id: entry.product_id,
        wastage_percent: entry.wastagePercentage?.toString() || entry.wastage_percent,
      }));

    if (wastageDetails.length === 0) {
      return { success: true, data: [] };
    }

    const responses = [];
    for (const balanceData of wastageDetails) {
      if (!balanceData.id) {
        delete balanceData.id;
        const response = await axiosInstance.post(
          `${API_ROUTES.ACCOUNTS.WASTAGE_DETAILS.CREATE_SINGLE}`,
          balanceData
        );
        responses.push(response.data);
        continue;
      }
      const response = await axiosInstance.put(
        `${API_ROUTES.ACCOUNTS.WASTAGE_DETAILS.UPDATE(balanceData.id)}`,
        balanceData
      );
      responses.push(response.data);
    }

    if (responses.length) {
      toast.success('Wastage details updated successfully');
    }

    return { success: true, data: responses };
  } catch (error) {
    console.error('Error updating wastage details:', error);
    throw error;
  }
};

const deleteWastageDetails = async (wastage_detail_id, company_id) => {
  try {
    const response = await axiosInstance.delete(
      `${API_ROUTES.ACCOUNTS.WASTAGE_DETAILS.DELETE(wastage_detail_id)}?company_id=${company_id}`
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting wastage details:', error);
    throw error;
  }
};

const createMoneyBalanceDetails = async (data, company_id, account_id) => {
  try {
    // API expects: company_id, account_id, opening_amount, amount_type
    // Form data structure: { balanceEntries: [{ openingAmount, payableReceivable }] }
    const balanceEntries = data.balanceEntries || data.data?.balanceEntries || [];

    const companyIdValue = company_id?.id || company_id;

    if (!companyIdValue || !account_id) {
      throw new Error('Company ID and Account ID are required to create money balance details');
    }

    // Transform form data to API structure
    // payableReceivable maps to amount_type ('payable' or 'receivable')
    const moneyBalanceData = balanceEntries
      .filter((entry) => entry.openingAmount !== undefined && entry.openingAmount !== null)
      .map((entry) => ({
        company_id: companyIdValue,
        account_id,
        opening_amount: entry.openingAmount?.toString() || entry.opening_amount,
        amount_type: entry.payableReceivable || entry.amount_type, // 'payable' or 'receivable'
      }));

    // Create money balance details (assuming one per account, but API allows multiple)
    const responses = [];
    for (const balanceData of moneyBalanceData) {
      const response = await axiosInstance.post(
        `${API_ROUTES.ACCOUNTS.MONEY_BALANCE_DETAILS.CREATE}`,
        balanceData
      );
      responses.push(response.data);
    }

    if (responses.length) {
      toast.success('Money balance details created successfully');
    }

    return { success: true, data: responses };
  } catch (error) {
    console.error('Error creating money balance details:', error);
    const errorMessage = extractErrorMessage(error.response?.data);
    toast.error(errorMessage || 'Failed to create money balance details');
    throw error;
  }
};

const getMoneyBalanceDetails = async () => {
  try {
    const response = await axiosInstance.get(`${API_ROUTES.ACCOUNTS.MONEY_BALANCE_DETAILS.GET}`);
    return response.data;
  } catch (error) {
    console.error('Error getting money balance details:', error);
    throw error;
  }
};

const getMoneyBalanceDetailsById = async (money_balance_detail_id) => {
  try {
    const response = await axiosInstance.get(
      `${API_ROUTES.ACCOUNTS.MONEY_BALANCE_DETAILS.GET_BY_ID(money_balance_detail_id)}`
    );
    return response.data;
  } catch (error) {
    console.error('Error getting money balance details by id:', error);
    throw error;
  }
};

const deleteMoneyBalanceDetails = async (money_balance_detail_id, company_id) => {
  try {
    const response = await axiosInstance.delete(
      `${API_ROUTES.ACCOUNTS.MONEY_BALANCE_DETAILS.DELETE(money_balance_detail_id)}?company_id=${company_id}`
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting money balance details:', error);
    throw error;
  }
};

const updateMoneyBalanceDetails = async (data, company_id, account_id) => {
  try {
    const balanceEntries = data.balanceEntries || data.data?.balanceEntries || [];
    const companyIdValue = company_id?.id || company_id;

    if (!companyIdValue || !account_id) {
      throw new Error('Company ID and Account ID are required to create money balance details');
    }

    const moneyBalanceData = balanceEntries
      .filter((entry) => entry.openingAmount !== undefined && entry.openingAmount !== null)
      .map((entry) => ({
        id: entry.id,
        company_id: companyIdValue,
        account_id,
        opening_amount: entry.openingAmount?.toString() || entry.opening_amount,
        amount_type: entry.payableReceivable || entry.amount_type, // 'payable' or 'receivable'
      }));
    // Update money balance details (assuming one per account, but API allows multiple)
    const responses = [];
    for (const balanceData of moneyBalanceData) {
      if (!balanceData?.id) {
        delete balanceData.id;
        const response = await axiosInstance.post(
          `${API_ROUTES.ACCOUNTS.MONEY_BALANCE_DETAILS.CREATE}`,
          balanceData
        );
        responses.push(response.data);
        continue;
      } else {
        const response = await axiosInstance.put(
          `${API_ROUTES.ACCOUNTS.MONEY_BALANCE_DETAILS.UPDATE(balanceData.id)}`,
          balanceData
        );
        responses.push(response.data);
      }
    }
    if (responses.length) {
      toast.success('Money balance details updated successfully');
    }

    return { success: true, data: responses };
    // return response.data;
  } catch (error) {
    console.error('Error updating money balance details:', error);
    throw error;
  }
};

const createMetalBalanceDetails = async (data) => {
  try {
    const response = await axiosInstance.post(
      `${API_ROUTES.ACCOUNTS.METAL_BALANCE_DETAILS.CREATE}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error('Error creating metal balance details:', error);
    throw error;
  }
};

const getMetalBalanceDetails = async () => {
  try {
    const response = await axiosInstance.get(`${API_ROUTES.ACCOUNTS.METAL_BALANCE_DETAILS.GET}`);
    return response.data;
  } catch (error) {
    console.error('Error getting metal balance details:', error);
    throw error;
  }
};

const getMetalBalanceDetailsById = async (metal_balance_detail_id) => {
  try {
    const response = await axiosInstance.get(
      `${API_ROUTES.ACCOUNTS.METAL_BALANCE_DETAILS.GET_BY_ID(metal_balance_detail_id)}`
    );
    return response.data;
  } catch (error) {
    console.error('Error getting metal balance details by id:', error);
    throw error;
  }
};

const updateMetalBalanceDetails = async (metal_balance_detail_id, data) => {
  try {
    const response = await axiosInstance.put(
      `${API_ROUTES.ACCOUNTS.METAL_BALANCE_DETAILS.UPDATE(metal_balance_detail_id)}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error('Error updating metal balance details:', error);
    throw error;
  }
};

const deleteMetalBalanceDetails = async (metal_balance_detail_id) => {
  try {
    const response = await axiosInstance.delete(
      `${API_ROUTES.ACCOUNTS.METAL_BALANCE_DETAILS.DELETE(metal_balance_detail_id)}`
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting metal balance details:', error);
    throw error;
  }
};

const createCustomerDetails = async (data, company_id) => {
  try {
    const companyIdValue = company_id?.id || company_id;

    const customerData = {
      company_id: companyIdValue,
      // Required
      name: data.customerName,
      city: data.city,

      // WhatsApp
      whatsapp_number: data.whatsapp_number || null,
      whatsapp_country_code: data.whatsapp_country_code || null,

      // Other Phone
      other_phone_number: data.other_phone_number || null,
      other_phone_country_code: data.other_phone_country_code || null,

      // Address
      address: data.address || null,
      state: data.state || null,
      pincode: data.pincode || null,

      // Documents
      gst_number: data.gstNumber || null,
      adhar_card_number: data.aadharCardNumber || null,
      driving_license_number: data.drivingLicenceNumber || null,

      pan_number: data.panNumber || null,
      pan_no: data.panNumber || null, // backend duplication support (if required)

      // Group
      customer_group_id: data.customerGroup ? Number(data.customerGroup) : data.null,

      // Contact
      email: data.email || null,

      // Dates
      birthday_date: data.birthDate || null,
      anniversary_date: data.anniversaryDate || null,

      // Extra
      spouse_name: data.spouseName || null,
      customer_note: data.customerNote || null,

      // Membership Details
      membership_number: data?.membershipNumber || null,
      membership_name: data?.membershipName || null,
    };

    // Remove undefined fields
    Object.keys(customerData).forEach((key) => {
      if (
        customerData[key] === undefined ||
        customerData[key] === null ||
        customerData[key] === ''
      ) {
        delete customerData[key];
      }
    });

    const response = await axiosInstance.post(
      `${API_ROUTES.ACCOUNTS.CUSTOMER_DETAILS.CREATE}`,
      customerData
    );
    return response.data;
  } catch (error) {
    const errorMessage = extractErrorMessage(error.response?.data);
    console.error('Error creating customer details:', error);
    toast.error(errorMessage || 'Failed to create dealer');
    throw error;
  }
};

const getCustomerDetails = async (company_id, page = 1, page_size = 25, search = '') => {
  try {
    const companyIdValue = company_id?.id || company_id;

    let url = `${API_ROUTES.ACCOUNTS.CUSTOMER_DETAILS.GET}?company_id=${companyIdValue}&page=${page}&page_size=${page_size}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    console.error('Error getting customer details:', error);
    throw error;
  }
};

const getCustomerDetailsById = async (customer_id, company_id) => {
  try {
    const response = await axiosInstance.get(
      `${API_ROUTES.ACCOUNTS.CUSTOMER_DETAILS.GET_BY_ID(customer_id)}?company_id=${company_id}`
    );
    return response.data;
  } catch (error) {
    console.error('Error getting customer details by id:', error);
    throw error;
  }
};

const updateCustomerDetails = async (customer_id, data, company_id) => {
  try {
    const companyIdValue = company_id?.id || company_id;

    const customerData = {
      company_id: companyIdValue,
      // Required
      name: data.customerName,
      city: data.city,

      // WhatsApp
      whatsapp_number: data.whatsapp_number || null,
      whatsapp_country_code: data.whatsapp_country_code || null,

      // Other Phone
      other_phone_number: data.other_phone_number || null,
      other_phone_country_code: data.other_phone_country_code || null,

      // Address
      address: data.address || null,
      state: data.state || null,
      pincode: data.pincode || null,

      // Documents
      gst_number: data.gstNumber || null,
      adhar_card_number: data.aadharCardNumber || null,
      driving_license_number: data.drivingLicenceNumber || null,

      pan_number: data.panNumber || null,
      pan_no: data.panNumber || null, // backend duplication support (if required)

      // Group
      customer_group_id: data.customerGroup ? Number(data.customerGroup) : data.null,

      // Contact
      email: data.email || null,

      // Dates
      birthday_date: data.birthDate || null,
      anniversary_date: data.anniversaryDate || null,

      // Extra
      spouse_name: data.spouseName || null,
      customer_note: data.customerNote || null,

      // Membership Details
      membership_number: data?.membershipNumber || null,
      membership_name: data?.membershipName || null,
    };

    // Remove undefined fields
    Object.keys(customerData).forEach((key) => {
      if (
        customerData[key] === undefined ||
        customerData[key] === null ||
        customerData[key] === ''
      ) {
        delete customerData[key];
      }
    });

    const response = await axiosInstance.put(
      `${API_ROUTES.ACCOUNTS.CUSTOMER_DETAILS.UPDATE(customer_id)}`,
      customerData
    );
    return response.data;
  } catch (error) {
    console.error('Error updating customer details:', error);
    throw error;
  }
};

const deleteCustomerDetails = async (customer_id) => {
  try {
    const response = await axiosInstance.delete(
      `${API_ROUTES.ACCOUNTS.CUSTOMER_DETAILS.DELETE(customer_id)}`
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting customer details:', error);
    throw error;
  }
};

const createKarigarPayload = (formData, companyId) => {
  const {
    ownerName,
    firmName,
    address,
    permanentAddress,
    city,
    pincode,
    karigarCode,
    whatsappNumber,
    whatsappCountryCode,
    panNumber,
    contactNumber,
    contactCountryCode,
    gstNumber,
    passportPhoto,
    kycDocuments,
  } = formData;

  const payloadData = {
    // required
    company_id: companyId,
    name: ownerName,

    firm_name: firmName || '',

    address: address || '',
    permanent_address: permanentAddress || '',

    city: city || '',
    pincode: pincode || '',

    karigar_code: karigarCode || '',

    whatsapp_number: whatsappNumber || '',
    whatsapp_country_code: whatsappCountryCode || '',

    contact_number: contactNumber || '',
    contact_country_code: contactCountryCode || '',

    pan_no: panNumber || '',
    gst_number: gstNumber || '',
    // Documents
    passport_image: passportPhoto || null,
    kyc_documents: kycDocuments || null,
  };

  // Remove undefined fields
  Object.keys(payloadData).forEach((key) => {
    if (payloadData[key] === undefined || payloadData[key] === null || payloadData[key] === '') {
      delete payloadData[key];
    }
  });

  return payloadData;
};

const createKarigarDetails = async (data, company_id) => {
  try {
    const payload = createKarigarPayload(data, company_id);
    const response = await axiosInstance.post(
      `${API_ROUTES.ACCOUNTS.KARIGAR_DETAILS.CREATE}`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error('Error creating karigar details:', error);
    throw error;
  }
};

const getKarigarDetails = async (company_id, page = 1, page_size = 25, search = '') => {
  try {
    const companyIdValue = company_id?.id || company_id;

    let url = `${API_ROUTES.ACCOUNTS.KARIGAR_DETAILS.GET}?company_id=${companyIdValue}&page=${page}&page_size=${page_size}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    console.error('Error getting karigar details:', error);
    throw error;
  }
};

const getKarigarDetailsById = async (karigar_id, company_id) => {
  try {
    const response = await axiosInstance.get(
      `${API_ROUTES.ACCOUNTS.KARIGAR_DETAILS.GET_BY_ID(karigar_id)}?company_id=${company_id}`
    );
    return response.data;
  } catch (error) {
    console.error('Error getting karigar details by id:', error);
    throw error;
  }
};

const updateKarigarDetails = async (data, company_id, karigar_id) => {
  try {
    const payload = createKarigarPayload(data, company_id);
    const response = await axiosInstance.put(
      `${API_ROUTES.ACCOUNTS.KARIGAR_DETAILS.UPDATE(karigar_id)}`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error('Error updating karigar details:', error);
    throw error;
  }
};

const deleteKarigarDetails = async (karigar_id) => {
  try {
    const response = await axiosInstance.delete(
      `${API_ROUTES.ACCOUNTS.KARIGAR_DETAILS.DELETE(karigar_id)}`
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting karigar details:', error);
    throw error;
  }
};

const createLedgerDetails = async (data) => {
  try {
    const response = await axiosInstance.post(
      `${API_ROUTES.ACCOUNTS.LEDGER_ACCOUNT_DETAILS.CREATE}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error('Error creating ledger details:', error);
    throw error;
  }
};

const getLedgerDetails = async (company_id, page = 1, page_size = 25, search = '') => {
  try {
    const companyIdValue = company_id?.id || company_id;

    let url = `${API_ROUTES.ACCOUNTS.LEDGER_ACCOUNT_DETAILS.GET}?company_id=${companyIdValue}&page=${page}&page_size=${page_size}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    console.error('Error getting ledger details:', error);
    throw error;
  }
};

const getLedgerDetailsById = async (ledger_id, company_id) => {
  try {
    const companyIdValue = company_id?.id || company_id;

    const url = `${API_ROUTES.ACCOUNTS.LEDGER_ACCOUNT_DETAILS.GET_BY_ID(ledger_id)}${companyIdValue ? `?company_id=${companyIdValue}` : ''}`;
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    console.error('Error getting ledger details by id:', error);
    throw error;
  }
};

const updateLedgerDetails = async (ledger_id, data, company_id) => {
  try {
    const ledgerData = {
      ledger_type_id: data.ledgerType || data.ledger_type_id,
      ledger_name: data.accountName || data.ledger_name,
      current_balance:
        data.currentBalance !== undefined ? data.currentBalance.toString() : data.current_balance,
    };

    // Remove undefined fields
    Object.keys(ledgerData).forEach((key) => {
      if (ledgerData[key] === undefined || ledgerData[key] === null || ledgerData[key] === '') {
        delete ledgerData[key];
      }
    });

    const companyIdValue = company_id?.id || company_id;

    const url = `${API_ROUTES.ACCOUNTS.LEDGER_ACCOUNT_DETAILS.UPDATE(ledger_id)}?company_id=${companyIdValue}`;
    const response = await axiosInstance.put(url, ledgerData);
    return response.data;
  } catch (error) {
    console.error('Error updating ledger details:', error);
    const errorMessage = extractErrorMessage(error.response?.data);
    toast.error(errorMessage || 'Failed to update ledger');
    throw error;
  }
};

const deleteLedgerDetails = async (ledger_id) => {
  try {
    const response = await axiosInstance.delete(
      `${API_ROUTES.ACCOUNTS.LEDGER_ACCOUNT_DETAILS.DELETE(ledger_id)}`
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting ledger details:', error);
    throw error;
  }
};

const getLedgerTypes = async () => {
  try {
    const response = await axiosInstance.get(
      `${API_ROUTES.ACCOUNTS.LEDGER_ACCOUNT_DETAILS.LEDGER_TYPES}`
    );
    return response.data;
  } catch (error) {
    console.error('Error getting ledger types:', error);
    throw error;
  }
};

export const accountService = {
  fetchDealerSupplyType,
  createDealer,
  getDealers,
  getDealerById,
  updateDealer,
  createAccountBankDetails,
  getAccountBankDetails,
  getAccountBankDetailsById,
  updateAccountBankDetails,
  deleteAccountBankDetails,
  createWastageDetails,
  getWastageDetails,
  getWastageDetailsById,
  updateWastageDetails,
  deleteWastageDetails,
  createMoneyBalanceDetails,
  getMoneyBalanceDetails,
  getMoneyBalanceDetailsById,
  deleteMoneyBalanceDetails,
  updateMoneyBalanceDetails,
  createMetalBalanceDetails,
  getMetalBalanceDetails,
  getMetalBalanceDetailsById,
  updateMetalBalanceDetails,
  deleteMetalBalanceDetails,
  createCustomerDetails,
  getCustomerDetails,
  getCustomerDetailsById,
  updateCustomerDetails,
  deleteCustomerDetails,
  createKarigarDetails,
  getKarigarDetails,
  getKarigarDetailsById,
  updateKarigarDetails,
  deleteKarigarDetails,
  createLedgerDetails,
  getLedgerDetails,
  getLedgerDetailsById,
  updateLedgerDetails,
  deleteLedgerDetails,
  getLedgerTypes,
};
