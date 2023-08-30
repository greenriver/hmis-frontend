import { Box, Button, Divider, Stack, Typography } from '@mui/material';
import React, { useState } from 'react';

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
          onClick={() => setFilterValues(intermediateValues)}
        >
          <strong>Apply Filters</strong>
        </Button>
      </Stack>
    </>
  );
};

export default TableFilterContent;
