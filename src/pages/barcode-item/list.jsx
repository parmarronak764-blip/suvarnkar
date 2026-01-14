import { CONFIG } from 'src/global-config';

import { BarcodeItemListView } from 'src/sections/barcode-item/barcode-item-list-view';

// ----------------------------------------------------------------------

const metadata = { title: `Current Barcode List | Barcode Item - ${CONFIG.appName}` };

export default function BarcodeItemListPage() {
  return (
    <>
      <title>{metadata.title}</title>

      <BarcodeItemListView />
    </>
  );
}
