import {
  Grid,
  Typography,
  Pagination as MuiPagination,
  PaginationProps,
  GridProps,
  SxProps,
} from '@mui/material';
import pluralize from 'pluralize';
import React from 'react';

export const PaginationSummary = ({
  limit,
  offset,
  totalEntries,
  itemName = 'record',
  sx,
}: {
  limit: number;
  offset: number;
  totalEntries: number;
  itemName?: string;
  sx?: SxProps;
}) => {
  if (totalEntries < 1) return null;

  const start = offset + 1;
  const end = Math.min(totalEntries, offset + limit);
  const range = start === end && offset === 0 ? start : `${start}-${end}`;
  const total = totalEntries.toLocaleString('en-US');
  const text = `${range} of ${total} ${pluralize(itemName)}`;
  return (
    <Typography variant='body2' sx={sx}>
      {text}
    </Typography>
  );
};

interface Props extends Omit<PaginationProps, 'count' | 'page' | 'onChange'> {
  limit: number;
  offset: number;
  setOffset: (value: number) => void;
  totalEntries: number;
  itemName?: string;
  gridProps?: GridProps;
}

const Pagination: React.FC<Props> = ({
  limit,
  offset,
  setOffset,
  totalEntries,
  itemName,
  gridProps,
  ...rest
}) => {
  const pageCount = Math.ceil(totalEntries / limit);
  const pageNumber = 1 + Math.floor(offset / limit);

  const handleChangePage = (
    _event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setOffset((value - 1) * limit);
  };

  return (
    <Grid
      container
      justifyContent='space-between'
      alignItems='center'
      data-testid='pagination'
      {...gridProps}
    >
      <PaginationSummary
        limit={limit}
        offset={offset}
        totalEntries={totalEntries}
        itemName={itemName}
      />
      {pageCount > 1 && (
        <MuiPagination
          count={pageCount}
          page={pageNumber}
          onChange={handleChangePage}
          shape='rounded'
          size='small'
          {...rest}
        />
      )}
    </Grid>
  );
};

export default Pagination;
