import { useMemo, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import debounce from 'lodash/debounce';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import dayjs from 'dayjs';
import { Form, Field } from 'src/components/hook-form';

export function ExpenseFilters({ onFilterChange, onSearchChange, onReset }) {
  const methods = useForm({
    defaultValues: {
      from_date: null,
      to_date: null,
    },
  });

  const { handleSubmit, reset, setError, clearErrors } = methods;
  const [searchValue, setSearchValue] = useState('');

  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        onSearchChange(value);
      }, 500),
    [onSearchChange]
  );

  useEffect(() => {
    debouncedSearch(searchValue);
    return () => debouncedSearch.cancel();
  }, [searchValue, debouncedSearch]);

  const onSubmit = handleSubmit((data) => {
    const from = data.from_date ? dayjs(data.from_date) : null;
    const to = data.to_date ? dayjs(data.to_date) : null;

    if (from && to && from.isAfter(to)) {
      setError('to_date', {
        type: 'manual',
        message: 'To date must be after From date',
      });
      return;
    }

    clearErrors();

    onFilterChange({
      from_date: from ? from.format('YYYY-MM-DD') : null,
      to_date: to ? to.format('YYYY-MM-DD') : null,
    });
  });

  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      gap={2}
      justifyContent="space-between"
      sx={{ mb: 2 }}
    >
      <Form methods={methods} onSubmit={onSubmit}>
        <Stack direction="row" spacing={2} alignItems="stretch">
          <Field.DatePicker name="from_date" label="From Date" />

          <Field.DatePicker name="to_date" label="To Date" />

          <Button type="submit" variant="contained" sx={{ maxHeight: 56 }}>
            Apply
          </Button>

          <Button
            variant="outlined"
            sx={{ maxHeight: 56 }}
            onClick={() => {
              reset();
              setSearchValue('');
              onReset();
            }}
          >
            Reset
          </Button>
        </Stack>
      </Form>

      <TextField
        placeholder="Search expenses..."
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        sx={{
          minHeight: 56,
          '& .MuiInputBase-root': {
            height: 56,
          },
        }}
      />
    </Stack>
  );
}
