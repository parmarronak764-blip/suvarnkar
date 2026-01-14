import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { BarcodeItemForm } from './components/barcode-item-form';
import Container from '@mui/material/Container';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import Button from '@mui/material/Button';
import { useSettingsContext } from 'src/components/settings';
import { paths } from 'src/routes/paths';
import { useParams, useRouter } from 'src/routes/hooks';
import { Iconify } from 'src/components/iconify';
import LoadingButton from '@mui/lab/LoadingButton';
import Stack from '@mui/material/Stack';
import { usePurchaseBarcodeTag } from 'src/hooks/usePurchaseBarcodeTag';

export const BarcodeItemAddView = () => {
  const settings = useSettingsContext();

  const { getNextCode, loading } = usePurchaseBarcodeTag();

  const { id: barcode_item_id } = useParams();
  const isEditMode = !!barcode_item_id;

  const router = useRouter();
  // refs
  const componentLoadedRef = useRef(null);
  const tagRef = useRef(null);
  const variantRefs = useRef([]);

  // states
  const [tagData, setTagData] = useState({
    item_code: null,
    data: null,
  });
  const [variants, setVariants] = useState([]);
  const [activeButton, setActiveButton] = useState(null); // [save, save & add new , save & print]

  const { fetchItem: fetchBarcodeItem, datum: barcodeItem } = usePurchaseBarcodeTag();
  const handleFetchBarcodeItem = useCallback(
    async (id) => {
      console.log('id', id);
      return await fetchBarcodeItem(id);
    },
    [fetchBarcodeItem]
  );

  // Handle cancel
  const handleCancel = () => {
    router.push(paths.barcodeItem.list);
  };

  const onSubmitForm = (action) => {
    // Validate TAG first
    const isTagValid = tagRef?.current?.validateVariantForm?.();
    if (!isTagValid) return;
    // Validate VARIANTS
    let isValid = true;

    if (isTagValid && variants.length > 0) {
      const allValidVariants = Object.values(variantRefs.current)
        .filter(Boolean)
        .map((ref) => {
          if (!ref?.validateVariantForm) return false;
          return ref?.validateVariantForm();
        });
      // for (const ref of Object.values(variantRefs.current).filter(Boolean)) {
      //   const valid = ref?.validateVariantForm?.();
      //   if (!valid) return;
      // }
      isValid = allValidVariants.every(Boolean);
    }

    // Submit TAG form
    if (isValid) {
      tagRef.current?.onSubmitForm?.(action);
    }
  };

  // Effects will come here

  //  Load Initial Data
  const loadCode = useCallback(async () => {
    if (componentLoadedRef.current) return;
    componentLoadedRef.current = true;
    if (isEditMode) {
      const response = await handleFetchBarcodeItem(barcode_item_id);
      if (response.success) {
        setTagData({
          item_code: response.item_code,
          data: response,
        });
        for (const variant of response?.variants || []) {
          handleAddVariant(variant);
          // variantRefs.current[variant.randomUUID] = variant;
        }
      }
    } else {
      const response = await getNextCode();
      if (response.success) {
        setTagData({
          item_code: response.codes,
          data: null,
        });
      }
    }
  }, [isEditMode, barcode_item_id]);

  function generateUUID() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.floor(Math.random() * 16);
      const v = c === 'x' ? r : Math.floor((r % 4) + 8); // 8,9,a,b

      return v.toString(16);
    });
  }

  const handleAddVariant = (preData) => {
    setVariants((prev) => {
      const nextIndex = prev.length + 1;
      return [
        ...prev,
        {
          randomUUID: generateUUID(), // 🔑 unique & stable
          item_code: preData ? preData.item_code : `${tagData.item_code}_${nextIndex}`,
          data: preData ? preData : null,
        },
      ];
    });
  };

  const handleRemoveVariant = (index) => {
    setVariants((prev) => {
      const removedItem = prev[index];
      // remove ref
      if (removedItem?.randomUUID) {
        delete variantRefs.current[removedItem.randomUUID];
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  console.log('BARCODE ITEM', variants);

  useEffect(() => {
    loadCode();
  }, []);

  return (
    <Fragment>
      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <CustomBreadcrumbs
          heading={isEditMode ? 'Edit Tag Item' : 'Add Tag Item'}
          slotProps={{
            heading: {
              sx: { typography: 'h6' },
            },
          }}
          // links={[
          //   { name: 'Dashboard', href: paths.dashboard.root },
          //   { name: 'Barcode Item', href: paths.barcodeItem.list },
          //   { name: `${isEditMode ? 'Edit Item' : 'Add Item'}` },
          // ]}
          sx={{ mb: 1 }}
          action={
            <Button
              variant="outlined"
              color="black"
              onClick={handleCancel}
              startIcon={<Iconify icon="eva:arrow-back-fill" />}
            >
              Back
            </Button>
          }
        />
        {/* Tag Item Form details will come here */}
        <BarcodeItemForm
          ref={tagRef}
          key={tagData?.item_code}
          isVariant={false}
          barcodeFormData={!isEditMode ? null : barcodeItem}
          itemCode={tagData?.item_code}
          onFormValueChange={(updatedValue) => {
            setTagData({ ...tagData, data: updatedValue });
          }}
          availableVariants={variants}
        />

        {/* Variant Item Form details will come here */}

        {variants.map((item, index) => (
          <BarcodeItemForm
            ref={(el) => (variantRefs.current[item.randomUUID] = el)}
            key={item.randomUUID}
            isVariant
            itemCode={item?.item_code}
            barcodeFormData={!isEditMode ? null : item?.data}
            variantIndex={index}
            onFormValueChange={(updatedValue) => {
              const updatedVariants = [...variants];
              updatedVariants[index] = { ...item, data: updatedValue };
              setVariants(updatedVariants);
            }}
            onRemoveVariant={() => handleRemoveVariant(index)}
          />
        ))}

        {/* Action Buttons */}
        <Stack direction="row" spacing={2} sx={{ my: 3 }} justifyContent="flex-end">
          <LoadingButton
            variant="contained"
            color="success"
            disabled={loading}
            // loading={activeButton === 'save' && loading}
            onClick={() => handleAddVariant()}
            startIcon={<Iconify icon="eva:plus-fill" />}
            sx={{ minWidth: 100 }}
          >
            Add Variant
          </LoadingButton>

          <LoadingButton
            variant="contained"
            color="black"
            disabled={loading}
            // loading={activeButton === 'save' && loading}
            onClick={() => onSubmitForm('save')}
            startIcon={<Iconify icon="eva:save-fill" />}
            sx={{ minWidth: 100 }}
          >
            {isEditMode ? 'Update' : 'Save'}
          </LoadingButton>

          <LoadingButton
            variant="outlined"
            color="black"
            disabled={loading}
            // loading={activeButton === 'save_more' && loading}
            onClick={() => onSubmitForm('save_more')}
            startIcon={<Iconify icon="eva:plus-fill" />}
            sx={{ minWidth: 160 }}
          >
            {isEditMode ? 'Update' : 'Save'} & Add More
          </LoadingButton>

          <LoadingButton
            variant="outlined"
            color="black"
            disabled={loading}
            // loading={activeButton === 'save_print' && loading}
            onClick={() => onSubmitForm('save_print')}
            startIcon={<Iconify icon="eva:printer-fill" />}
            sx={{ minWidth: 140 }}
          >
            {isEditMode ? 'Update' : 'Save'} & Print
          </LoadingButton>
        </Stack>
      </Container>
    </Fragment>
  );
};
