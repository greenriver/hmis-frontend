import { alpha, Stack, Toolbar, Typography } from '@mui/material';
import { ReactNode, useMemo } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';

export interface EnhancedTableToolbarProps<T> {
  title?: ReactNode;
  selectedIds?: readonly string[];
  rows: T[];
  renderBulkAction?: (
    selectedIds: readonly string[],
    selectedRows: T[]
  ) => ReactNode;
  stackVertically?: boolean;
}

const EnhancedTableToolbar = <T extends { id: string }>({
  selectedIds = [],
  title,
  renderBulkAction,
  rows,
  stackVertically = false,
}: EnhancedTableToolbarProps<T>) => {
  const selectedRows = useMemo(() => {
    return rows.filter((r) => selectedIds.includes(r.id));
  }, [rows, selectedIds]);

  const isTiny = useIsMobile('sm');
  const shouldStack = stackVertically || isTiny;

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
        justifyContent={shouldStack ? undefined : 'space-between'}
        alignItems={shouldStack ? 'right' : 'center'}
        direction={shouldStack ? 'column' : 'row'}
        gap={1}
        my={shouldStack ? 1 : 0}
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
