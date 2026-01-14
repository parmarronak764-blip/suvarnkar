import type { NavSectionProps } from 'src/components/nav-section';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

import { Label } from 'src/components/label';
import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor src={`${CONFIG.assetsDir}/assets/icons/navbar/${name}.svg`} />
);

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

export const navData: NavSectionProps['data'] = [
  /**
   * Overview
   */
  {
    // subheader: 'Overview',
    items: [
      {
        title: 'Dashboard',
        path: paths.dashboard.root,
        icon: ICONS.dashboard,
        // module: 'dashboard',
        // info: <Label>v{CONFIG.appVersion}</Label>,
      },
      {
        title: 'Company Settings',
        path: paths.company.settings,
        icon: ICONS.settings,
        allowedRoles: ['owner'], // Only owners can access company settings
      },
    ],
  },
  /**
   * Management
   */
  {
    subheader: 'Management',
    items: [
      {
        title: 'Masters',
        path: paths.dashboard.group.root,
        icon: ICONS.user,
        modules: ['salesman', 'five', 'six'], // Show if any of these modules are available
        children: [
          { 
            title: 'Salesman', 
            path: paths.masters.salesman,
            // module: 'salesman' // Only show if salesman module is available
          },
          { 
            title: 'Five', 
            path: paths.dashboard.group.five,
            module: 'five'
          },
          { 
            title: 'Six', 
            path: paths.dashboard.group.six,
            module: 'six'
          },
        ],
      },
      // {
      //   title: 'Sales',
      //   path: '/dashboard/sales',
      //   icon: ICONS.ecommerce,
      //   module: 'sales', // Only show if sales module is available
      //   children: [
      //     { 
      //       title: 'Orders', 
      //       path: '/dashboard/sales/orders',
      //       module: 'orders' // Only show if orders module is available
      //     },
      //     { 
      //       title: 'Invoices', 
      //       path: '/dashboard/sales/invoices',
      //       module: 'invoices' // Only show if invoices module is available
      //     },
      //   ],
      // },
      // {
      //   title: 'Reports',
      //   path: '/dashboard/reports',
      //   icon: ICONS.analytics,
      //   module: 'reports', // Only show if reports module is available
      //   children: [
      //     { 
      //       title: 'Sales Report', 
      //       path: '/dashboard/reports/sales',
      //       module: 'sales_reports' // Only show if sales_reports module is available
      //     },
      //     { 
      //       title: 'Financial Report', 
      //       path: '/dashboard/reports/financial',
      //       module: 'financial_reports' // Only show if financial_reports module is available
      //     },
      //   ],
      // },
    ]
  },
];
