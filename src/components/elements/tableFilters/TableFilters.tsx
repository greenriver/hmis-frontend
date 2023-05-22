import { Box, Typography } from '@mui/material';
import { compact, min } from 'lodash-es';
import React from 'react';

import TableFilterMenu from './filters/FilterMenu';
import TableSortMenu from './filters/SortMenu';

import { FilterType } from '@/modules/dataFetching/types';

export interface PaginationProps {
  totalEntries: number;
  limit: number;
  offset: number;
}

export interface TableFiltersProps<T, S> {
  filters?: {
    filters: Partial<Record<keyof T, FilterType<T>>>;
    filterValues: Partial<T>;
    setFilterValues: (value: Partial<T>) => any;
  };
  sorting?: {
    sortOptions: S;
    sortOptionValue?: keyof S;
    setSortOptionValue?: (value: keyof S) => any;
  };
  pagination?: PaginationProps;
}

const PaginationDisplay: React.FC<PaginationProps> = ({
  totalEntries,
  limit,
  offset,
}): JSX.Element => {
  return (
    <Typography variant='body2'>
      Displaying{' '}
      <strong>
        {compact([
          limit < totalEntries ? offset + 1 : undefined,
          min([totalEntries, offset + limit]),
        ]).join('-')}
      </strong>{' '}
      of <strong>{totalEntries}</strong> records
    </Typography>
  );
};

const TableFilters = <T, S extends Record<string, string>>({
  filters,
  sorting,
  pagination,
}: TableFiltersProps<T, S>) => {
  return (
    <Box display='flex' alignItems='center'>
      <Box flexGrow={1}>
        {pagination && <PaginationDisplay {...pagination} />}
      </Box>
      {filters && (
        <Box>
          <TableFilterMenu {...filters} />
        </Box>
      )}
      {sorting && (
        <Box>
          <TableSortMenu {...sorting} />
        </Box>
      )}
    </Box>
  );
};

export default TableFilters;
