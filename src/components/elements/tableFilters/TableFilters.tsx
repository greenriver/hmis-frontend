import { Box, Skeleton, Stack, Typography } from '@mui/material';
import { isEmpty, min } from 'lodash-es';
import pluralize from 'pluralize';
import React, { ReactNode } from 'react';

import TableColumnsMenu, { TableColumnsMenuProps } from './filters/ColumnsMenu';
import TableFilterMenu from './filters/FilterMenu';
import TableSortMenu from './filters/SortMenu';

import { FilterType } from '@/modules/dataFetching/types';

export interface PaginationProps {
  totalEntries: number;
  limit: number;
  offset: number;
  itemName?: string;
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
  optionalColumns?: TableColumnsMenuProps;
  pagination?: PaginationProps;
  loading?: boolean;
  noSort?: boolean;
  noFilter?: boolean;
  tableDisplayOptionButtons?: ReactNode;
}

const PaginationDisplay: React.FC<PaginationProps> = ({
  totalEntries,
  limit,
  offset,
  itemName = 'record',
}): JSX.Element => {
  const rangeEnd = min([totalEntries, offset + limit]);
  const rangeStart = limit < totalEntries ? offset + 1 : rangeEnd;

  const displayRange =
    rangeStart === rangeEnd ? rangeStart : [rangeStart, rangeEnd].join('-');
  return (
    <Typography variant='body2'>
      Displaying <strong>{displayRange}</strong> of{' '}
      <strong>{totalEntries.toLocaleString()}</strong>{' '}
      {pluralize(itemName, totalEntries)}
    </Typography>
  );
};

const TableFilters = <T, S extends Record<string, string>>({
  filters,
  sorting,
  pagination,
  tableDisplayOptionButtons,
  loading,
  noSort = false,
  noFilter = false,
  optionalColumns,
}: TableFiltersProps<T, S>) => {
  return (
    <Box display='flex' alignItems='center' gap={1}>
      <Stack flexGrow={1} direction='row' gap={6} alignItems='center'>
        {loading ? (
          <Skeleton variant='text'>
            <Typography variant='body2'>Displaying X of X results</Typography>
          </Skeleton>
        ) : (
          pagination && <PaginationDisplay {...pagination} />
        )}
        {tableDisplayOptionButtons}
      </Stack>
      {optionalColumns && !isEmpty(optionalColumns.columns) && (
        <Box>
          <TableColumnsMenu {...optionalColumns} />
        </Box>
      )}
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
