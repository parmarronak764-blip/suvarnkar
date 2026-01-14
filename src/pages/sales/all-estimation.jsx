import { CONFIG } from 'src/global-config';
import { EstimationListView } from 'src/sections/sales/view/estimation-list-view';

// ----------------------------------------------------------------------

const metadata = { title: `All Estimation | Sales - ${CONFIG.appName}` };

export default function AllEstimationPage() {
    return (
        <>
            <title>{metadata.title}</title>
            <EstimationListView/>
        </>
    );
}
