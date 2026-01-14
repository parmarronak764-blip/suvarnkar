import { CONFIG } from 'src/global-config';

import { DiamondDetailsView } from 'src/sections/masters/diamond-details';

// ----------------------------------------------------------------------

const metadata = { title: `Diamond Details | Masters - ${CONFIG.appName}` };

export default function DiamondDetailsPage() {
  return (
    <>
      <title>{metadata.title}</title>

      <DiamondDetailsView />
    </>
  );
}
