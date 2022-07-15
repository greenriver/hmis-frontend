import {
  Grid,
  Typography,
  Pagination as MuiPagination,
  PaginationProps,
  GridProps,
} from '@mui/material';
import React from 'react';

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
  const text = `${offset + 1}-${Math.min(
    totalEntries,
    offset + limit
  )} of ${totalEntries} ${itemName || 'items'}`;

  return (
    <Grid
      container
      justifyContent='space-between'
      alignItems='center'
      {...gridProps}
    >
      {totalEntries > 0 && <Typography>{text}</Typography>}
      {pageCount > 1 && (
        <MuiPagination
          count={pageCount}
          page={pageNumber}
          onChange={handleChangePage}
          shape='rounded'
          {...rest}
        />
      )}
    </Grid>
  );
};

export default Pagination;
