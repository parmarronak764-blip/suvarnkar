import { CONFIG } from 'src/global-config';
import { DashboardLayout } from 'src/layouts/dashboard';

import { AuthGuard } from 'src/auth/guard';
import { ModuleGuard } from 'src/auth/guard/module-guard';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  if (CONFIG.auth.skip) {
    return (
      // <ModuleGuard requiredModules={['masters', 'salesman', 'five', 'six']}>
        <DashboardLayout>{children}</DashboardLayout>
      // </ModuleGuard>
    );
  }

  return (
    <AuthGuard>
      {/* <ModuleGuard requiredModules={['masters', 'salesman', 'five', 'six']}> */}
        <DashboardLayout>{children}</DashboardLayout>
      {/* </ModuleGuard> */}
    </AuthGuard>
  );
}
