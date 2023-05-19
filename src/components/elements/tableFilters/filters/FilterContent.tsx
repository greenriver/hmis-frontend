import { Button, Divider, Stack, Typography } from '@mui/material';
import React, { useState } from 'react';

import TableFilterItem from './FilterItem';

import { FilterType } from '@/modules/dataFetching/types';

export interface TableFilterContentProps<T> {
  filters: Partial<Record<keyof T, FilterType<T>>>;
  filterValues: Partial<T>;
  setFilterValues: (value: Partial<T>) => any;
}

const TableFilterContent = <T,>({
  filters,
  filterValues,
  setFilterValues,
}: TableFilterContentProps<T>): JSX.Element => {
  const [intermediateValues, setIntermediateValues] =
    useState<Partial<T>>(filterValues);

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
            onChange={(value) =>
              setIntermediateValues((prev) => ({ ...prev, [key]: value }))
            }
          />
        ))}
      </Stack>
      <Divider sx={{ my: 3 }} />
      <Stack direction='row' gap={1}>
        <Button
          variant='outlined'
          size='small'
          color='inherit'
          onClick={() => setIntermediateValues({})}
        >
          Clear All
        </Button>
        <Button
          size='small'
          onClick={() => setFilterValues(intermediateValues)}
        >
          Apply Filters
        </Button>
      </Stack>
    </>
  );
};

export default TableFilterContent;
