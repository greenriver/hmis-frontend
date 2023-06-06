import { Box, Skeleton, Typography } from '@mui/material';
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
// # bug: referal not preesent in read only
// # bug: saving edit creates a new one

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
  loading?: boolean;
  noSort?: boolean;
  noFilter?: boolean;
}

const PaginationDisplay: React.FC<PaginationProps> = ({
  totalEntries,
  limit,
  offset,
}): JSX.Element => {
  return (
    <Typography variant='body2'>
      Displaying {/* fix */}
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
  loading,
  noSort = false,
  noFilter = false,
}: TableFiltersProps<T, S>) => {
  return (
    <Box display='flex' alignItems='center' gap={1}>
      <Box flexGrow={1}>
        {loading ? (
          <Skeleton variant='text'>
            <Typography variant='body2'>Displaying X of X results</Typography>
          </Skeleton>
        ) : (
          pagination && <PaginationDisplay {...pagination} />
        )}
      </Box>
      {filters && !noFilter && (
        <Box>
          <TableFilterMenu {...filters} />
        </Box>
      )}
      {sorting && !noSort && (
        <Box>
          <TableSortMenu {...sorting} />
        </Box>
      )}
    </Box>
  );
};

export default TableFilters;
