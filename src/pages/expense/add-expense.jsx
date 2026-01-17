import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { getExpenseById } from 'src/redux/slices/expense.slice';
import AddExpenseForm from 'src/sections/expense/add-expense-form';

function AddExpensePage() {
  const { expenseId } = useParams();
  const dispatch = useDispatch();
  const companyId = useSelector((state) => state.user?.selectedCompany?.company?.id);
  const { expenseById } = useSelector((state) => state.expense);
  useEffect(() => {
    if (expenseId) {
      dispatch(
        getExpenseById({
          id: expenseId,
          company_id: companyId,
        })
      );
    }
  }, [expenseId, dispatch]);
  return (
    <div>
      <AddExpenseForm currentExpenseData={expenseId ? expenseById : null} />
    </div>
  );
}

export default AddExpensePage;
