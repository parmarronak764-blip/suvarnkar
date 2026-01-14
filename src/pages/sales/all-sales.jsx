import { CONFIG } from 'src/global-config';
import { SalesListView } from 'src/sections/sales/view/sales-list-view';

// ----------------------------------------------------------------------

const metadata = { title: `All Sales | Sales - ${CONFIG.appName}` };

export default function AllSalesPage() {
    return (
        <>
            <title>{metadata.title}</title>
            <SalesListView />
        </>
    );
}
