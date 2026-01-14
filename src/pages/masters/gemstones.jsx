import { CONFIG } from 'src/global-config';

import { GemstonesView } from 'src/sections/masters/gemstones';

// ----------------------------------------------------------------------

const metadata = { title: `Gemstones | Masters - ${CONFIG.appName}` };

export default function GemstonesPage() {
  return (
    <>
      <title>{metadata.title}</title>

      <GemstonesView />
    </>
  );
}
