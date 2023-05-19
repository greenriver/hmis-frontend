import { Box, Typography } from '@mui/material';
import { compact, min } from 'lodash-es';
import React from 'react';

import TableFilterMenu from './filters/FilterMenu';

import { FilterType } from '@/modules/dataFetching/types';

export interface PaginationProps {
  totalEntries: number;
  limit: number;
  offset: number;
}

export interface TableFiltersProps<T> {
  filters?: {
    filters: Partial<Record<keyof T, FilterType<T>>>;
    filterValues: Partial<T>;
    setFilterValues: (value: Partial<T>) => any;
  };
  sorting?: {
    sortOptions?: Record<string, string>;
    sortOptionValue?: string;
    setSortOptionValue?: (value: string) => any;
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

const TableFilters = <T,>({
  filters,
  // sorting,
  pagination,
}: TableFiltersProps<T>) => {
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
    </Box>
  );
};

export default TableFilters;
