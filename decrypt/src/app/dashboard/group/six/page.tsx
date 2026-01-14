import { CONFIG } from 'src/global-config';

import { BlankView } from 'src/sections/blank/view';
import { ModuleGuard } from 'src/auth/guard/module-guard';

// ----------------------------------------------------------------------

export const metadata = { title: `Page six | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
    <ModuleGuard requiredModule="six">
      <BlankView title="Page six" />
    </ModuleGuard>
  );
}
