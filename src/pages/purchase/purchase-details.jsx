import { useParams } from 'src/routes/hooks';

import { PurchaseDetailsView } from 'src/sections/purchase';

// ----------------------------------------------------------------------

export default function PurchaseDetailsPage() {
  const { id } = useParams();

  return (
    <>
      <title>Purchase Details | Suvarnakar ERP</title>

      <PurchaseDetailsView id={id} />
    </>
  );
}
