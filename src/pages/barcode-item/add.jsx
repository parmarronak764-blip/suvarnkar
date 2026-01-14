import { CONFIG } from 'src/global-config';

import { BarcodeItemAddView } from 'src/sections/barcode-item/barcode-item-add-view';

// ----------------------------------------------------------------------

const metadata = { title: `Add Item | Barcode Item - ${CONFIG.appName}` };

export default function BarcodeItemAddPage() {
  return (
    <>
      <title>{metadata.title}</title>

      <BarcodeItemAddView />
    </>
  );
}
