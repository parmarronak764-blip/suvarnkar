import { CONFIG } from 'src/global-config';
import { AddSalesView } from 'src/sections/sales/view/add-sales-view';

// ----------------------------------------------------------------------

const metadata = { title: `Add Sales | Sales - ${CONFIG.appName}` };

export default function AddSalesPage() {
    return (
        <>
            <title>{metadata.title}</title>
            <AddSalesView />
        </>
    );
}
