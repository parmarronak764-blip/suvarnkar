import { Outlet } from 'react-router';
import { lazy, Suspense } from 'react';

import { CONFIG } from 'src/global-config';
import { DashboardLayout } from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';

import { AuthGuard } from 'src/auth/guard';

import { usePathname } from '../hooks';
import AddExpensePage from 'src/pages/expense/add-expense';
import AllExpensePage from 'src/pages/expense/all-expense';

// ----------------------------------------------------------------------

const Analytics = lazy(() => import('src/pages/dashboard/Analytics'));
const CompanySetting = lazy(() => import('src/pages/company/CompanySetting'));
const PageTwo = lazy(() => import('src/pages/dashboard/two'));
const PageThree = lazy(() => import('src/pages/dashboard/three'));
const PageFour = lazy(() => import('src/pages/dashboard/four'));
const PageFive = lazy(() => import('src/pages/dashboard/five'));
const PageSix = lazy(() => import('src/pages/dashboard/six'));
const UserListPage = lazy(() => import('src/pages/dashboard/user/list'));
const PaymentTypeListPage = lazy(() => import('src/pages/masters/payment-type/payment-type'));
const PaymentTypeAddPage = lazy(
  () => import('src/pages/masters/payment-type/add/payment-type-add')
);
const ExpenseType = lazy(() => import('src/pages/masters/expense-type/expense-type'));
const ExpenseTypeAddPage = lazy(
  () => import('src/pages/masters/expense-type/add/expense-type-add')
);
const AddUserPage = lazy(() => import('src/pages/dashboard/user/new'));
const UserEditPage = lazy(() => import('src/pages/dashboard/user/edit'));
const DiamondDetailsPage = lazy(() => import('src/pages/masters/diamond-details'));
const OfferMasterPage = lazy(() => import('src/pages/masters/offer-master'));
const ProductCategoriesPage = lazy(() => import('src/pages/masters/product-categories'));
const ProductsPage = lazy(() => import('src/pages/masters/products'));
const CustomerGroupsPage = lazy(() => import('src/pages/masters/customer-groups'));
const BarcodeLocationsPage = lazy(() => import('src/pages/masters/barcode-locations'));
const PackingPage = lazy(() => import('src/pages/masters/packing'));
const MakingChargesPage = lazy(() => import('src/pages/masters/making-charges'));
const WastagesPage = lazy(() => import('src/pages/masters/wastages'));
const LessTypesPage = lazy(() => import('src/pages/masters/less-types'));
const BonusMastersPage = lazy(() => import('src/pages/masters/bonus-masters'));
const MetalColorsPage = lazy(() => import('src/pages/masters/metal-colors'));
const GemStonesPage = lazy(() => import('src/pages/masters/gemstones'));
const AccountListPage = lazy(() => import('src/pages/account/account-list'));
const AccountCreationPage = lazy(() => import('src/pages/account/account-creation'));
const PurchaseListPage = lazy(() => import('src/pages/purchase/purchase-list'));
const PurchaseCreationPage = lazy(() => import('src/pages/purchase/purchase-creation'));
const PurchaseDetailsPage = lazy(() => import('src/pages/purchase/purchase-details'));
const BarcodeItemListPage = lazy(() => import('src/pages/barcode-item/list'));
const BarcodeItemAddPage = lazy(() => import('src/pages/barcode-item/add'));
const BarcodeItemUpdatePage = lazy(() => import('src/pages/barcode-item/update'));
const AllSalesPage = lazy(() => import('src/pages/sales/all-sales'));
const AddSalesPage = lazy(() => import('src/pages/sales/add-sales'));
const AllEstimationPage = lazy(() => import('src/pages/sales/all-estimation'));
const AddEstimationPage = lazy(() => import('src/pages/sales/add-estimation'));

// ----------------------------------------------------------------------

function SuspenseOutlet() {
  const pathname = usePathname();
  return (
    <Suspense key={pathname} fallback={<LoadingScreen />}>
      <Outlet />
    </Suspense>
  );
}

const dashboardLayout = () => (
  <DashboardLayout>
    <SuspenseOutlet />
  </DashboardLayout>
);

export const dashboardRoutes = [
  {
    path: 'dashboard',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      { element: <Analytics title="Analytics" />, index: true },
      { path: 'two', element: <PageTwo /> },
      { path: 'three', element: <PageThree /> },
      {
        path: 'group',
        children: [
          { element: <PageFour />, index: true },
          { path: 'five', element: <PageFive /> },
          { path: 'six', element: <PageSix /> },
        ],
      },
    ],
  },
  {
    path: 'company/settings',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [{ element: <CompanySetting />, index: true }],
  },
  {
    path: 'masters/user-management',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [{ element: <UserListPage />, index: true }],
  },
  {
    path: 'masters/user-management/add',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [{ element: <AddUserPage />, index: true }],
  },
  {
    path: 'masters/user-management/edit/:userId',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [{ element: <UserEditPage />, index: true }],
  },
  {
    path: 'masters/diamond-details',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [{ element: <DiamondDetailsPage />, index: true }],
  },
  {
    path: 'masters/offer-master',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [{ element: <OfferMasterPage />, index: true }],
  },
  {
    path: 'masters/product-categories',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [{ element: <ProductCategoriesPage />, index: true }],
  },
  {
    path: 'masters/products',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [{ element: <ProductsPage />, index: true }],
  },
  {
    path: 'masters/payment-type',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [{ element: <PaymentTypeListPage />, index: true }],
  },
  {
    path: 'masters/payment-type/add',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [{ element: <PaymentTypeAddPage />, index: true }],
  },
  {
    path: 'masters/expense-type',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [{ element: <ExpenseType />, index: true }],
  },
  {
    path: 'masters/expense-type/add',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [{ element: <ExpenseTypeAddPage />, index: true }],
  },
  {
    path: 'masters/expense-type/edit/:typeId',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [{ element: <ExpenseTypeAddPage />, index: true }],
  },
  {
    path: 'masters/customer-groups',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [{ element: <CustomerGroupsPage />, index: true }],
  },
  {
    path: 'masters/barcode-locations',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [{ element: <BarcodeLocationsPage />, index: true }],
  },
  {
    path: 'masters/packing',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [{ element: <PackingPage />, index: true }],
  },
  {
    path: 'masters/making-charges',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [{ element: <MakingChargesPage />, index: true }],
  },
  {
    path: 'masters/wastages',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [{ element: <WastagesPage />, index: true }],
  },
  {
    path: 'masters/less-types',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [{ element: <LessTypesPage />, index: true }],
  },
  {
    path: 'masters/bonus-masters',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [{ element: <BonusMastersPage />, index: true }],
  },
  {
    path: 'masters/metal-colors',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [{ element: <MetalColorsPage />, index: true }],
  },
  {
    path: 'masters/gem-stones',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [{ element: <GemStonesPage />, index: true }],
  },
  {
    path: 'expense/add-expense',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [{ element: <AddExpensePage />, index: true }],
  },
  {
    path: 'expense/all-expense',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [{ element: <AllExpensePage />, index: true }],
  },
  {
    path: 'account/list',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [{ element: <AccountListPage />, index: true }],
  },
  {
    path: 'account/creation',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [{ element: <AccountCreationPage />, index: true }],
  },
  {
    path: 'account/edit/:id',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [{ element: <AccountCreationPage />, index: true }],
  },
  {
    path: 'purchase/list',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [{ element: <PurchaseListPage />, index: true }],
  },
  {
    path: 'purchase/creation',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [{ element: <PurchaseCreationPage />, index: true }],
  },
  {
    path: 'purchase/edit/:id',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [{ element: <PurchaseCreationPage />, index: true }],
  },
  {
    path: 'purchase/details/:id',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [{ element: <PurchaseDetailsPage />, index: true }],
  },
  {
    path: 'barcode-item/list',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [{ element: <BarcodeItemListPage />, index: true }],
  },
  {
    path: 'barcode-item/add',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [{ element: <BarcodeItemAddPage />, index: true }],
  },
  {
    path: 'barcode-item/update/:id',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [{ element: <BarcodeItemUpdatePage />, index: true }],
  },
  {
    path: 'sales/list',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [{ element: <AllSalesPage />, index: true }],
  },
  {
    path: 'sales/add',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [{ element: <AddSalesPage />, index: true }],
  },
  {
    path: 'sales/estimation/list',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [{ element: <AllEstimationPage />, index: true }],
  },
  {
    path: 'sales/estimation/add',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [{ element: <AddEstimationPage />, index: true }],
  },
];
