// ----------------------------------------------------------------------

const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
  COMPANY: '/company',
  MASTERS: '/masters',
  ACCOUNT: '/account',
  PURCHASE: '/purchase',
  BARCODE_ITEM: '/barcode-item',
  SALES: '/sales',
  EXPENCE: '/expence',
};

// ----------------------------------------------------------------------

export const paths = {
  faqs: '/faqs',
  minimalStore: 'https://mui.com/store/items/minimal-dashboard/',
  // AUTH
  auth: {
    amplify: {
      signIn: `${ROOTS.AUTH}/amplify/sign-in`,
      verify: `${ROOTS.AUTH}/amplify/verify`,
      signUp: `${ROOTS.AUTH}/amplify/sign-up`,
      updatePassword: `${ROOTS.AUTH}/amplify/update-password`,
      resetPassword: `${ROOTS.AUTH}/amplify/reset-password`,
    },
    jwt: {
      signIn: `/sign-in`,
      signUp: `/sign-up`,
    },
    firebase: {
      signIn: `${ROOTS.AUTH}/firebase/sign-in`,
      verify: `${ROOTS.AUTH}/firebase/verify`,
      signUp: `${ROOTS.AUTH}/firebase/sign-up`,
      resetPassword: `${ROOTS.AUTH}/firebase/reset-password`,
    },
    auth0: {
      signIn: `${ROOTS.AUTH}/auth0/sign-in`,
    },
    supabase: {
      signIn: `${ROOTS.AUTH}/supabase/sign-in`,
      verify: `${ROOTS.AUTH}/supabase/verify`,
      signUp: `${ROOTS.AUTH}/supabase/sign-up`,
      updatePassword: `${ROOTS.AUTH}/supabase/update-password`,
      resetPassword: `${ROOTS.AUTH}/supabase/reset-password`,
    },
  },
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    two: `${ROOTS.DASHBOARD}/two`,
    three: `${ROOTS.DASHBOARD}/three`,
    group: {
      root: `${ROOTS.DASHBOARD}/group`,
      five: `${ROOTS.DASHBOARD}/group/five`,
      six: `${ROOTS.DASHBOARD}/group/six`,
    },
  },
  company: {
    settings: `${ROOTS.COMPANY}/settings`,
  },
  account: {
    list: `${ROOTS.ACCOUNT}/list`,
    creation: `${ROOTS.ACCOUNT}/creation`,
    edit: (id) => `${ROOTS.ACCOUNT}/edit/${id}`,
  },
  purchase: {
    list: `${ROOTS.PURCHASE}/list`,
    creation: `${ROOTS.PURCHASE}/creation`,
    edit: (id) => `${ROOTS.PURCHASE}/edit/${id}`,
    details: (id) => `${ROOTS.PURCHASE}/details/${id}`,
  },
  masters: {
    userManagement: `${ROOTS.MASTERS}/user-management`,
    addUser: `${ROOTS.MASTERS}/user-management/add`,
    editUser: (id) => `${ROOTS.MASTERS}/user-management/edit/${id}`,
    diamondDetails: `${ROOTS.MASTERS}/diamond-details`,
    offerMaster: `${ROOTS.MASTERS}/offer-master`,
    productCategories: `${ROOTS.MASTERS}/product-categories`,
    customerGroups: `${ROOTS.MASTERS}/customer-groups`,
    products: `${ROOTS.MASTERS}/products`,
    barcodeLocations: `${ROOTS.MASTERS}/barcode-locations`,
    packing: `${ROOTS.MASTERS}/packing`,
    makingCharges: `${ROOTS.MASTERS}/making-charges`,
    wastages: `${ROOTS.MASTERS}/wastages`,
    lessTypes: `${ROOTS.MASTERS}/less-types`,
    bonusMasters: `${ROOTS.MASTERS}/bonus-masters`,
    metalColors: `${ROOTS.MASTERS}/metal-colors`,
    gemStones: `${ROOTS.MASTERS}/gem-stones`,
  },
  expence: {
    addExpence: `${ROOTS.EXPENCE}/add-expence`,
    allExpence: `${ROOTS.EXPENCE}/all-expence`,
  },
  barcodeItem: {
    list: `${ROOTS.BARCODE_ITEM}/list`,
    add: `${ROOTS.BARCODE_ITEM}/add`,
    update: (id) => `${ROOTS.BARCODE_ITEM}/update/${id}`,
  },
  sales: {
    root: ROOTS.SALES,
    allSales: `${ROOTS.SALES}/list`,
    addSales: `${ROOTS.SALES}/add`,
    allEstimation: `${ROOTS.SALES}/estimation/list`,
    addEstimation: `${ROOTS.SALES}/estimation/add`,
  },
};
