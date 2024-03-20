import { alpha, Stack, Toolbar, Typography } from '@mui/material';
import { ReactNode, useMemo } from 'react';

export interface EnhancedTableToolbarProps<T> {
  title?: ReactNode;
  selectedIds?: readonly string[];
  rows: T[];
  renderBulkAction?: (
    selectedIds: readonly string[],
    selectedRows: T[]
  ) => ReactNode;
}

const EnhancedTableToolbar = <T extends { id: string }>({
  selectedIds = [],
  title,
  renderBulkAction,
  rows,
}: EnhancedTableToolbarProps<T>) => {
  const selectedRows = useMemo(() => {
    return rows.filter((r) => selectedIds.includes(r.id));
  }, [rows, selectedIds]);

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        borderBottomColor: 'borders.light',
        borderBottomWidth: 1,
        borderBottomStyle: 'solid',
        ...(selectedIds.length > 0 && {
          bgcolor: (theme) =>
            alpha(
              theme.palette.primary.main,
              theme.palette.action.activatedOpacity
            ),
        }),
      }}
    >
      <Stack
        justifyContent='space-between'
        alignItems={'center'}
        direction={'row'}
        sx={{
          width: '100%',
          pr: 1,
        }}
      >
        {selectedIds.length > 0 ? (
          <Typography variant='subtitle1' component='div'>
            {selectedIds.length} selected
          </Typography>
        ) : typeof title === 'string' ? (
          <Typography variant='h5' component='div'>
            {title}
          </Typography>
        ) : (
          title
        )}
        {selectedIds.length > 0 &&
          renderBulkAction &&
          renderBulkAction(selectedIds, selectedRows)}
      </Stack>
    </Toolbar>
  );
};

export default EnhancedTableToolbar;
