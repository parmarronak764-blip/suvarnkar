import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => <SvgColor src={`${CONFIG.assetsDir}/assets/icons/navbar/${name}.svg`} />;

const ICONS = {
  job: icon('ic-job'),
  blog: icon('ic-blog'),
  chat: icon('ic-chat'),
  mail: icon('ic-mail'),
  user: icon('ic-user'),
  file: icon('ic-file'),
  lock: icon('ic-lock'),
  tour: icon('ic-tour'),
  order: icon('ic-order'),
  label: icon('ic-label'),
  blank: icon('ic-blank'),
  kanban: icon('ic-kanban'),
  folder: icon('ic-folder'),
  course: icon('ic-course'),
  params: icon('ic-params'),
  banking: icon('ic-banking'),
  booking: icon('ic-booking'),
  invoice: icon('ic-invoice'),
  product: icon('ic-product'),
  calendar: icon('ic-calendar'),
  disabled: icon('ic-disabled'),
  external: icon('ic-external'),
  subpaths: icon('ic-subpaths'),
  menuItem: icon('ic-menu-item'),
  ecommerce: icon('ic-ecommerce'),
  analytics: icon('ic-analytics'),
  dashboard: icon('ic-dashboard'),
  settings: icon('ic-settings'),
};

// ----------------------------------------------------------------------

export const navData = [
  {
    items: [
      {
        title: 'Dashboard',
        path: paths.dashboard.root,
        icon: ICONS.dashboard,
        permission: 'dashboard.view',
      },
      {
        title: 'Company Settings',
        path: paths.company.settings,
        icon: ICONS.settings,
        permission: 'company.view',
      },
    ],
  },
  /**
   * Masters
   */
  {
    subheader: 'Masters',
    items: [
      {
        title: 'Masters',
        path: paths.dashboard.group.root,
        icon: ICONS.user,
        children: [
          {
            title: 'User Management',
            path: paths.masters.userManagement,
            permission: 'user.view',
          },
          {
            title: 'Diamond Details',
            path: paths.masters.diamondDetails,
            permission: 'diamond_details.view',
          },
          {
            title: 'Offer Master',
            path: paths.masters.offerMaster,
            permission: 'offer_master.view',
          },
          {
            title: 'Product Categories',
            path: paths.masters.productCategories,
            permission: 'product_categories.view',
          },
          {
            title: 'Products',
            path: paths.masters.products,
            permission: 'products.view',
          },
          {
            title: 'Payment Type',
            path: paths.masters.paymentType,
            permission: 'payment_type.view',
          },
          {
            title: "All Expense Type",
            path: paths.masters.expenseType,
            permission: 'expense_type.view',
          },
          {
            title: 'EMI Customer Groups',
            path: paths.masters.customerGroups,
            permission: 'customer_groups.view',
          },
          {
            title: 'Barcode Locations',
            path: paths.masters.barcodeLocations,
            permission: 'barcode_locations.view',
          },
          {
            title: 'Packing Materials',
            path: paths.masters.packing,
            permission: 'packing.view',
          },
          {
            title: 'Making Charges',
            path: paths.masters.makingCharges,
            permission: 'making_charges.view',
          },
          {
            title: 'Wastages',
            path: paths.masters.wastages,
            permission: 'wastages.view',
          },
          {
            title: 'Less Types',
            path: paths.masters.lessTypes,
            permission: 'less_types.view',
          },
          {
            title: 'Bonus Masters',
            path: paths.masters.bonusMasters,
            permission: 'bonus_masters.view',
          },
          {
            title: 'Metal Colors',
            path: paths.masters.metalColors,
            permission: 'metal_colors.view',
          },
          {
            title: 'Gem Stones',
            path: paths.masters.gemStones,
            permission: 'gem_stones.view',
          },
        ],
      },
    ],
  },

  {
    subheader: 'Expense',
    items: [
      {
        title: 'Expense',
        path: paths.dashboard.group.root,
        icon: ICONS.user,
        children: [
          {
            title: 'All Expense',
            path: paths.expense.allExpense,
            permission: 'allExpense.view',
          },
        ],
      },
    ],
  },
  /**
   * Account
   */
  {
    subheader: 'Account',
    items: [
      {
        title: 'Account',
        path: paths.account.list,
        icon: ICONS.user,
        permission: 'user.view',
      },
    ],
  },
  /**
   * Purchase
   */
  {
    subheader: 'Purchase',
    items: [
      {
        title: 'Purchase',
        path: paths.purchase.list,
        icon: ICONS.ecommerce,
        permission: 'purchase.view',
      },
    ],
  },
  /**
   * Sales
   */
  {
    subheader: 'Sales',
    items: [
      {
        title: 'Sales',
        path: paths.sales.root,
        icon: ICONS.order,
        children: [
          {
            title: 'All Sales',
            path: paths.sales.allSales,
            permission: 'sales.view',
          },
          {
            title: 'All Estimation',
            path: paths.sales.allEstimation,
            permission: 'sales.view',
          },
        ],
      },
    ],
  },
  /**
   * Barcode Item
   */
  {
    subheader: 'Barcode Item',
    items: [
      {
        title: 'Barcode Item',
        path: paths.barcodeItem.list,
        icon: ICONS.label,
        children: [
          {
            title: 'Current Barcode List',
            path: paths.barcodeItem.list,
            permission: 'barcode_item.view',
          },
          {
            title: 'Add Item',
            path: paths.barcodeItem.add,
            permission: 'barcode_item.create',
          },
        ],
      },
    ],
  },
];
