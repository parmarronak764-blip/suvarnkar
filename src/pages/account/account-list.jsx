import { CONFIG } from 'src/global-config';

import { AccountListView } from 'src/sections/account/account-list-view';

// ----------------------------------------------------------------------

const metadata = { title: `Account List | ${CONFIG.appName}` };

export default function AccountListPage() {
  return (
    <>
      <title>{metadata.title}</title>

      <AccountListView />
    </>
  );
}
