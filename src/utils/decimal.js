export const handleDecimalInput = (event) => {
  const value = event.target.value;
  if (value.includes('.') && value.split('.')[1].length > 3) {
    event.target.value = value.slice(0, value.indexOf('.') + 4);
  }
};
