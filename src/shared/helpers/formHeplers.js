export const disabledOption = (Name) => [{ label: `Select ${Name}`, disabled: true }];
export const requiredOption = (Name) => [{ label: `Select ${Name}`, required: true }];
export const calcFormula = (formula, index, watch, formName) => {
  if (!formula || !formula.type || !formula.fields) return null;

  const values = formula.fields.map((fieldName) => {
    const val = watch(`${formName}.${index}.${fieldName}`);
    return Number(val) || 0;
  });

  switch (formula.type) {
    case 'multiplication':
      return values.reduce((acc, v) => acc * v, 1);

    case 'addition':
      return values.reduce((acc, v) => acc + v, 0);

    case 'subtraction':
      return values.reduce((acc, v) => acc - v);

    case 'division':
      return values.reduce((acc, v) => (v !== 0 ? acc / v : acc));

    default:
      return null;
  }
};
