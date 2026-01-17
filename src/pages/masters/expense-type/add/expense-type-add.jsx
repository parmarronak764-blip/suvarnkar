import { useDispatch, useSelector } from 'react-redux';

import { ExpenseTypeCreateEditForm } from 'src/sections/masters/expense-type/expense-type-create-edit-form';

import { getExpenseTypeById } from 'src/redux/slices/expenseType.slice';
import { useParams } from 'react-router';
import { useEffect } from 'react';
import { LoadingScreen } from 'src/components/loading-screen';

const ExpenseTypeAdd = () => {
  const { typeId } = useParams();
  const dispatch = useDispatch();

  const { expenseType, loading } = useSelector((state) => state.expenseType);

  // ✅ CALL API IF EDIT MODE
  useEffect(() => {
    if (typeId) {
      dispatch(getExpenseTypeById(typeId));
    }
  }, [typeId, dispatch]);

  if (loading) {
    return <LoadingScreen />;
  }

  return <ExpenseTypeCreateEditForm currentExpenseType={typeId ? expenseType : null} />;
};

export default ExpenseTypeAdd;
