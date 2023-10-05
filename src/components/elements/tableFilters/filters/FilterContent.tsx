import { Box, Button, Divider, Stack, Typography } from '@mui/material';
import { isDate, isValid } from 'date-fns';
import { useCallback, useState } from 'react';

import TableFilterItem from './FilterItem';

import { FilterType } from '@/modules/dataFetching/types';

export interface TableFilterContentProps<T> {
  filters: Partial<Record<keyof T, FilterType<T>>>;
  filterValues: Partial<T>;
  setFilterValues: (value: Partial<T>) => any;
  onCancel: VoidFunction;
}

const TableFilterContent = <T,>({
  filters,
  filterValues,
  setFilterValues,
  onCancel,
}: TableFilterContentProps<T>): JSX.Element => {
  const [intermediateValues, setIntermediateValues] =
    useState<Partial<T>>(filterValues);

  const cleanedValues = useCallback((values: Partial<T>) => {
    const cleaned: typeof values = {};
    Object.keys(values).forEach((key) => {
      const val = values[key as keyof T];
      if (val && isDate(val) && !isValid(val)) {
        // skip invalid dates
      } else {
        cleaned[key as keyof T] = val;
      }
    });
    return cleaned;
  }, []);

  return (
    <>
      <Typography variant='overline'>Filter By</Typography>
      <Stack gap={2} mt={2}>
        {Object.entries(filters).map(([key, filter]) => (
          <TableFilterItem
            key={key}
            filter={filter as FilterType<T>}
            keyName={key}
            value={intermediateValues[key as keyof T]}
            onChange={(value) => {
              // resize so that as pick list content changes, popper will reflow allowing scroll
              window.dispatchEvent(new CustomEvent('resize'));
              setIntermediateValues((prev) => ({ ...prev, [key]: value }));
            }}
          />
        ))}
      </Stack>
      <Divider sx={{ my: 3 }} />
      <Stack direction='row' gap={1}>
        <Box flexGrow={1}>
          <Button
            variant='text'
            color='error'
            size='small'
            onClick={() => {
              setIntermediateValues({});
              setFilterValues({});
            }}
          >
            <strong>Reset</strong>
          </Button>
        </Box>
        <Button
          variant='text'
          size='small'
          color='inherit'
          sx={(theme) => ({ color: theme.palette.text.secondary })}
          onClick={() => {
            setIntermediateValues(filterValues);
            onCancel();
          }}
        >
          <strong>Cancel</strong>
        </Button>
        <Button
          size='small'
          onClick={() => setFilterValues(cleanedValues(intermediateValues))}
        >
          <strong>Apply Filters</strong>
        </Button>
      </Stack>
    </>
  );
};

export default TableFilterContent;
