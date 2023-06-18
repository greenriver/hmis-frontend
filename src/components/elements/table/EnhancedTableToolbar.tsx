import { alpha, Stack, Toolbar, Typography } from '@mui/material';
import { ReactNode } from 'react';

export interface EnhancedTableToolbarProps {
  title?: string;
  selectedIds?: readonly string[];
  renderBulkAction?: (selectedIds: readonly string[]) => ReactNode;
}

const EnhancedTableToolbar = ({
  selectedIds = [],
  title,
  renderBulkAction,
}: EnhancedTableToolbarProps) => {
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
        ) : (
          <Typography variant='h5' component='div'>
            {title}
          </Typography>
        )}
        {selectedIds.length > 0 &&
          renderBulkAction &&
          renderBulkAction(selectedIds)}
      </Stack>
    </Toolbar>
  );
};

export default EnhancedTableToolbar;
