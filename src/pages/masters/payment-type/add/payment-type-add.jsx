import React, { useEffect } from 'react';
import { useParams } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';

import { getPaymentTypeById, clearPaymentType } from 'src/redux/slices/paymentType.slice';

import { PaymentTypeCreateEditForm } from 'src/sections/masters/payment-type/payment-type-create-edit-form';
import { LoadingScreen } from 'src/components/loading-screen';

export default function PaymentTypeAdd() {
  const { typeId } = useParams();
  const dispatch = useDispatch();

  const { paymentType, loading } = useSelector((state) => state.paymentType);

  // ---------------- LOAD DATA ----------------
  useEffect(() => {
    if (typeId) {
      dispatch(getPaymentTypeById(typeId));
    }

    return () => {
      dispatch(clearPaymentType());
    };
  }, [typeId, dispatch]);
  if (loading) {
    return <LoadingScreen />;
  }
  return <PaymentTypeCreateEditForm currentPaymentType={typeId ? paymentType : null} />;
}
