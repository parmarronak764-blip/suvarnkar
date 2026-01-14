import { CONFIG } from 'src/global-config';

import { AccountCreationView } from 'src/sections/account';

// ----------------------------------------------------------------------

const metadata = { title: `Create Account | ${CONFIG.appName}` };

export default function AccountCreationPage() {
  return (
    <>
      <title>{metadata.title}</title>

      <AccountCreationView />
    </>
  );
}
