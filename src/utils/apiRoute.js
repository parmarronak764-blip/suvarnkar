export const API_ROUTES = {
  BASE_URL: import.meta.env.VITE_API_URL,

  AUTH: {
    SIGNIN: 'accounts/sign-in/',
    SIGNUP: 'accounts/register-company/',
    SIGN_OUT: 'accounts/logout/',
  },

  ACCOUNTS: {
    ME: 'accounts/me/',
    GET_COMPANY_SETTINGS: 'accounts/company/settings/',
    UPDATE_COMPANY_SETTINGS: 'accounts/company/settings/',
    DEALERS: {
      SUPPLY_TYPE: `accounts/accounts/product-categories/`,
      CREATE: 'accounts/accounts/dealers/',
      GET: 'accounts/accounts/dealers/',
      GET_BY_ID: (dealer_id) => `accounts/accounts/dealers/${dealer_id}/`,
      UPDATE: (dealer_id) => `accounts/accounts/dealers/${dealer_id}/`,
    },
    BANK_DETAILS: {
      CREATE: 'accounts/accounts/bank-details/',
      GET: 'accounts/accounts/bank-details/',
      GET_BY_ID: (bank_detail_id) => `accounts/accounts/bank-details/${bank_detail_id}/`,
      UPDATE: (bank_detail_id) => `accounts/accounts/bank-details/${bank_detail_id}/`,
      DELETE: (bank_detail_id) => `accounts/accounts/bank-details/${bank_detail_id}/`,
    },
    WASTAGE_DETAILS: {
      CREATE: 'accounts/accounts/wastage-details/bulk/',
      CREATE_SINGLE: 'accounts/accounts/wastage-details/',
      GET: 'accounts/accounts/wastage-details/',
      GET_BY_ID: (wastage_detail_id) => `accounts/accounts/wastage-details/${wastage_detail_id}/`,
      UPDATE: (wastage_detail_id) => `accounts/accounts/wastage-details/${wastage_detail_id}/`,
      DELETE: (wastage_detail_id) => `accounts/accounts/wastage-details/${wastage_detail_id}/`,
    },
    MONEY_BALANCE_DETAILS: {
      CREATE: 'accounts/accounts/money-balance-details/',
      GET: 'accounts/accounts/money-balance-details/',
      GET_BY_ID: (money_balance_detail_id) =>
        `accounts/accounts/money-balance-details/${money_balance_detail_id}/`,
      UPDATE: (money_balance_detail_id) =>
        `accounts/accounts/money-balance-details/${money_balance_detail_id}/`,
      DELETE: (money_balance_detail_id) =>
        `accounts/accounts/money-balance-details/${money_balance_detail_id}/`,
    },
    METAL_BALANCE_DETAILS: {
      CREATE: 'accounts/accounts/metal-balance-details/bulk/',
      GET: 'accounts/accounts/metal-balance-details/',
      GET_BY_ID: (metal_balance_detail_id) =>
        `accounts/accounts/metal-balance-details/${metal_balance_detail_id}/`,
      UPDATE: (metal_balance_detail_id) =>
        `accounts/accounts/metal-balance-details/${metal_balance_detail_id}/`,
      DELETE: (metal_balance_detail_id) =>
        `accounts/accounts/metal-balance-details/${metal_balance_detail_id}/`,
    },
    CUSTOMER_DETAILS: {
      CREATE: 'accounts/accounts/customers/',
      GET: 'accounts/accounts/customers/',
      GET_BY_ID: (customer_id) => `accounts/accounts/customers/${customer_id}/`,
      UPDATE: (customer_id) => `accounts/accounts/customers/${customer_id}/`,
      DELETE: (customer_id) => `accounts/accounts/customers/${customer_id}/`,
    },
    KARIGAR_DETAILS: {
      CREATE: 'accounts/accounts/karigars/',
      GET: 'accounts/accounts/karigars/',
      GET_BY_ID: (karigar_id) => `accounts/accounts/karigars/${karigar_id}/`,
      UPDATE: (karigar_id) => `accounts/accounts/karigars/${karigar_id}/`,
      DELETE: (karigar_id) => `accounts/accounts/karigars/${karigar_id}/`,
    },
    LEDGER_ACCOUNT_DETAILS: {
      CREATE: 'accounts/accounts/ledgers/',
      GET: 'accounts/accounts/ledgers/',
      GET_BY_ID: (ledger_id) => `accounts/accounts/ledgers/${ledger_id}/`,
      UPDATE: (ledger_id) => `accounts/accounts/ledgers/${ledger_id}/`,
      DELETE: (ledger_id) => `accounts/accounts/ledgers/${ledger_id}/`,
      LEDGER_TYPES: 'accounts/accounts/ledger-types/',
    },
    CUSTOMER_GROUPS: {
      CREATE: 'accounts/accounts/customer-groups/',
      LIST: 'accounts/accounts/customer-groups/',
      GET_BY_ID: (group_id) => `accounts/accounts/customer-groups/${group_id}/`,
      UPDATE: (group_id) => `accounts/accounts/customer-groups/${group_id}/`,
      DELETE: (group_id) => `accounts/accounts/customer-groups/${group_id}/`,
    },
  },

  USER_MANAGEMENT: {
    LIST_USERS: 'accounts/users/',
    GET_USER_BY_ID: 'accounts/users/',
    CREATE_USER: 'accounts/add-user/',
    UPDATE_USER: 'accounts/edit-user/',
    DELETE_USER: 'accounts/delete-user/',
    GET_ROLES: 'accounts/roles/',
    GET_MODULES: 'membership/modules/',
  },

  DIAMOND_DETAILS: {
    // Diamond Clarity
    CLARITY: {
      LIST: 'products/diamond/clarity/',
      CREATE: 'products/diamond/clarity/',
      UPDATE: 'products/diamond/clarity/',
      DELETE: 'products/diamond/clarity/',
    },
    // Diamond Shape
    SHAPE: {
      LIST: 'products/diamond/shapes/',
      CREATE: 'products/diamond/shapes/',
      UPDATE: 'products/diamond/shapes/',
      DELETE: 'products/diamond/shapes/',
    },
    // Diamond Size Range
    SIZE_RANGE: {
      LIST: 'products/diamond/size-ranges/',
      CREATE: 'products/diamond/size-ranges/',
      UPDATE: 'products/diamond/size-ranges/',
      DELETE: 'products/diamond/size-ranges/',
    },
    // Diamond Color - Based on your API documentation
    COLOR: {
      LIST: 'products/diamond/colors/',
      CREATE: 'products/diamond/colors/',
      UPDATE: 'products/diamond/colors/',
      DELETE: 'products/diamond/colors/',
    },
    // Diamond Certificate Type
    CERTIFICATE_TYPE: {
      LIST: 'products/diamond/certificate-types/',
      CREATE: 'products/diamond/certificate-types/',
      UPDATE: 'products/diamond/certificate-types/',
      DELETE: 'products/diamond/certificate-types/',
    },
    CARAT: {
      LIST: 'products/masters/carats/',
    },
    METAL_TYPES: {
      LIST: 'products/masters/metal-types/',
    },
  },

  // Diamonds (actual diamond products)
  DIAMONDS: {
    LIST: 'products/diamond/diamonds/',
    CREATE: 'products/diamond/diamonds/',
    UPDATE: 'products/diamond/diamonds/',
    DELETE: 'products/diamond/diamonds/',
    BULK_CREATE: 'products/diamond/diamonds/bulk/',
    CARAT_LIST: 'products/diamond/carats/',
  },

  // Offer Master - for managing promotional offers and discounts
  OFFERS: {
    LIST: 'products/offers/',
    CREATE: 'products/offers/',
    UPDATE: 'products/offers/',
    DELETE: 'products/offers/',
  },

  PRODUCTS: {
    LIST: 'products/products/',
    CREATE: 'products/products/',
    UPDATE: 'products/products/',
    DELETE: 'products/products/',
    GET_BASE_METAL_TYPES_BY_PRODUCT_ID: (product_id) =>
      `products/products/${product_id}/base-metal-types/`,
    GET_BASE_METAL_TYPES: (product_id) => `products/products/${product_id}/base-metal-types/`,
  },

  // Product Categories - for managing product categories with metal types and stock types
  PRODUCT_CATEGORIES: {
    LIST: 'products/categories/',
    CREATE: 'products/categories/',
    UPDATE: 'products/categories/',
    DELETE: 'products/categories/',
  },

  // Stock Types - for dropdown in product categories
  STOCK_TYPES: {
    LIST: 'products/masters/stock-types/',
  },

  // EMI Customer Groups - for managing customer groups for EMI
  CUSTOMER_GROUPS: {
    LIST: 'products/customer-groups/',
    CREATE: 'products/customer-groups/',
    UPDATE: 'products/customer-groups/',
    DELETE: 'products/customer-groups/',
  },

  // Barcode Locations - for managing barcode locations
  BARCODE_LOCATIONS: {
    LIST: 'products/barcode-locations/',
    CREATE: 'products/barcode-locations/',
    UPDATE: 'products/barcode-locations/',
    DELETE: 'products/barcode-locations/',
    BULK_CREATE: 'products/barcode-locations/bulk/',
    NEXT_CODES: 'products/barcode-locations/next-codes/',
  },

  // Packing Master - for managing packing materials
  PACKING: {
    LIST: 'products/packing/',
    CREATE: 'products/packing/',
    UPDATE: 'products/packing/',
    DELETE: 'products/packing/',
    BULK_CREATE: 'products/packing/bulk/',
  },

  // Making Charges - for managing making charges
  MAKING_CHARGES: {
    LIST: 'products/making-charges/',
    CREATE: 'products/making-charges/',
    UPDATE: 'products/making-charges/',
    DELETE: 'products/making-charges/',
    BULK_CREATE: 'products/making-charges/bulk/',
  },

  // Wastages - for managing wastage percentages
  WASTAGES: {
    LIST: 'products/wastages/',
    CREATE: 'products/wastages/',
    UPDATE: 'products/wastages/',
    DELETE: 'products/wastages/',
    BULK_CREATE: 'products/wastages/bulk/',
  },

  // Less Types - for managing less types
  LESS_TYPES: {
    LIST: 'products/less-types/',
    CREATE: 'products/less-types/',
    UPDATE: 'products/less-types/',
    DELETE: 'products/less-types/',
    BULK_CREATE: 'products/less-types/bulk/',
  },

  // Bonus Masters - for managing bonus masters
  BONUS_MASTERS: {
    LIST: 'products/bonus-masters/',
    CREATE: 'products/bonus-masters/',
    UPDATE: 'products/bonus-masters/',
    DELETE: 'products/bonus-masters/',
    BULK_CREATE: 'products/bonus-masters/bulk/',
  },

  // Metal Colors - for managing metal colors
  METAL_COLORS: {
    LIST: 'products/metal-colors/',
    CREATE: 'products/metal-colors/',
    UPDATE: 'products/metal-colors/',
    DELETE: 'products/metal-colors/',
    BULK_CREATE: 'products/metal-colors/bulk/',
  },

  // Gemstones - for managing gemstone packets, rates, shapes, and sub types
  GEMSTONES: {
    // Gemstone Packets
    PACKETS: {
      LIST: 'products/gemstone/packets/',
      CREATE: 'products/gemstone/packets/',
      UPDATE: 'products/gemstone/packets/',
      DELETE: 'products/gemstone/packets/',
      BULK_CREATE: 'products/gemstone/packets/bulk/',
    },
    // Gemstone Rates
    RATES: {
      LIST: 'products/gemstone/rates/',
      CREATE: 'products/gemstone/rates/',
      UPDATE: 'products/gemstone/rates/',
      DELETE: 'products/gemstone/rates/',
      BULK_CREATE: 'products/gemstone/rates/bulk/',
    },
    // Gemstone Shapes
    SHAPES: {
      LIST: 'products/gemstone/shapes/',
      CREATE: 'products/gemstone/shapes/',
      UPDATE: 'products/gemstone/shapes/',
      DELETE: 'products/gemstone/shapes/',
      BULK_CREATE: 'products/gemstone/shapes/bulk/',
    },
    // Gemstone Carats - Based on your API documentation
    CARATS: {
      LIST: 'products/gemstone/carats/',
      CREATE: 'products/gemstone/carats/',
      UPDATE: 'products/gemstone/carats/',
      DELETE: 'products/gemstone/carats/',
    },
    // Gemstone Sub Types
    SUB_TYPES: {
      LIST: 'products/gemstone/sub-types/',
      CREATE: 'products/gemstone/sub-types/',
      UPDATE: 'products/gemstone/sub-types/',
      DELETE: 'products/gemstone/sub-types/',
      BULK_CREATE: 'products/gemstone/sub-types/bulk/',
    },
  },

  // Purchase Module APIs
  PURCHASE: {
    // Main purchase CRUD operations
    PURCHASES: {
      LIST: 'purchase/purchases/',
      CREATE: 'purchase/purchases/',
      UPDATE: (id) => `purchase/purchases/${id}/`,
      DELETE: (id) => `purchase/purchases/${id}/`,
      GET_BY_ID: (id) => `purchase/purchases/${id}/`,
      NEXT_NUMBER: 'purchase/purchases/next-number/',
    },
    // Diamond Details for purchase
    DIAMOND_DETAILS: {
      LIST: 'purchase/diamond-details/',
      CREATE: 'purchase/diamond-details/',
      UPDATE: 'purchase/diamond-details/',
      DELETE: 'purchase/diamond-details/',
    },
    // Less Weight Details for purchase
    LESS_WEIGHT_DETAILS: {
      LIST: 'purchase/less-weight-details/',
      CREATE: 'purchase/less-weight-details/',
      UPDATE: 'purchase/less-weight-details/',
      DELETE: 'purchase/less-weight-details/',
    },
    // Other Charges for purchase
    OTHER_CHARGES: {
      LIST: 'purchase/other-charges/',
      CREATE: 'purchase/other-charges/',
      UPDATE: 'purchase/other-charges/',
      DELETE: 'purchase/other-charges/',
    },
  },

  PRODUCTS_MASTERS: {
    GET_CARAT_BY_METAL_TYPE: (metal_type) => `products/masters/metal-types/${metal_type}/carats/`,
  },
  // Purchase Barcode Item Module APIs
  PURCHASE_BARCODE_ITEMS: {
    LIST: 'purchase/barcode-tag/items/',
    GET_ITEM: (id) => `purchase/barcode-tag/items/${id}/`,
    GET_MEDIA: (id) => `purchase/barcode-tag/items/${id}/media/`,
    DELETE_ITEM: (id) => `purchase/barcode-tag/items/${id}/`,
    UPDATE_ITEM: (id) => `purchase/barcode-tag/items/${id}/`,
    NEXT_CODE: 'purchase/barcode-tag/next-item-code/',
    UPLOADS: 'purchase/barcode-tag/media/upload/',
    CREATE: 'purchase/barcode-tag/items/',
    CREATE_WITH_VARIANTS: 'purchase/barcode-tag/items/with-variants/',
    GET_ALL_ITEM_CODES: 'purchase/barcode-tag/item-codes/',
  },
  // Sales Module APIs
  SALES: {
    ORDERS: {
      LIST: 'sales/orders/',
      CREATE: 'sales/orders/',
      GET_BY_ID: (id) => `sales/orders/${id}/`,
      UPDATE: (id) => `sales/orders/${id}/`,
      DELETE: (id) => `sales/orders/${id}/`,
    },
  },
};
