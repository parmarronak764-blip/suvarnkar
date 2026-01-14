import { CONFIG } from 'src/global-config';

import { BlankView } from 'src/sections/blank/view';
import { ModuleGuard } from 'src/auth/guard/module-guard';


// ----------------------------------------------------------------------

export const metadata = { title: `Page five | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
    <ModuleGuard requiredModule="five">
      <BlankView title="Page five" />
    </ModuleGuard>
  );
}
