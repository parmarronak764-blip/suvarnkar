import { CONFIG } from 'src/global-config';

import { OfferMasterView } from 'src/sections/masters/offer-master';

// ----------------------------------------------------------------------

const metadata = { title: `Offer Master | Masters - ${CONFIG.appName}` };

export default function OfferMasterPage() {
  return (
    <>
      <title>{metadata.title}</title>

      <OfferMasterView />
    </>
  );
}
