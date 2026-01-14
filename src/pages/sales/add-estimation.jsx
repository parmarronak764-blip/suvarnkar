import { CONFIG } from 'src/global-config';

import { AddEstimationView } from 'src/sections/sales/view/add-estimation-view';

// ----------------------------------------------------------------------

const metadata = { title: `Add Estimation | Sales - ${CONFIG.appName}` };

export default function AddEstimationPage() {
    return (
        <>
            <title>{metadata.title}</title>

            <AddEstimationView />
        </>
    );
}
