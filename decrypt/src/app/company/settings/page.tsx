import { CompanySettingsView } from 'src/sections/company/settings/view';
import { RouteGuard } from 'src/auth/guard/route-guard';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Company Settings',
};

export default function CompanySettingsPage() {
  return (
    <RouteGuard 
      requiredRoles={['owner']} 
      fallbackPath="/dashboard"
      showPopup={true}
    >
      <CompanySettingsView />
    </RouteGuard>
  );
} 