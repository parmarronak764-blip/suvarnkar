import { CONFIG } from 'src/global-config';

import { BlankView } from 'src/sections/blank/view';
import { UserListView } from 'src/sections/masters/salesman/view';
import { RouteGuard } from 'src/auth/guard';

// ----------------------------------------------------------------------

export const metadata = { title: `List Salesman | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
    <RouteGuard requiredModule="salesman">
      <UserListView />
    </RouteGuard>
  );
}