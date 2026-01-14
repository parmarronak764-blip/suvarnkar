import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { AnalyticsView } from 'src/sections/dashboard-analytics/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <AnalyticsView title="Dashboard" />;
}
