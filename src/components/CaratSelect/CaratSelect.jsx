// src/components/CaratSelect/CaratSelect.jsx
import { Field } from 'src/components/hook-form';
import MenuItem from '@mui/material/MenuItem';

export function CaratSelect({ index, metalId, metalName, carats }) {
  const filteredCarats = carats.filter((c) => c.metal_type === metalId);

  return (
    <Field.Select
      name={`carats.${index}`} // bind into array
      label={`${metalName} Carat`}
      required
    >
      <MenuItem value={0} disabled>
        Select {metalName} carat
      </MenuItem>
      {filteredCarats.map((carat) => (
        <MenuItem key={carat.id} value={carat.id}>
          {carat.name}
        </MenuItem>
      ))}
    </Field.Select>
  );
}
