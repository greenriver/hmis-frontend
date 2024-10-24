import { Box, Button, Divider, Popover, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import {
  usePopupState,
  bindTrigger,
  bindPopover,
} from 'material-ui-popup-state/hooks';
import { ReactNode, useMemo } from 'react';

import TableFilterButton from './FilterButton';
import { useIsMobile } from '@/hooks/useIsMobile';

export interface TableControlPopoverProps {
  filterCount?: number;
  filterHint?: ReactNode;
  children: ReactNode;
  onCancel: VoidFunction;
  onReset: VoidFunction;
  onApply: VoidFunction;
  header: ReactNode;
  label: ReactNode;
  icon: ReactNode;
  applyLabel?: ReactNode;
}

const TableControlPopover = (props: TableControlPopoverProps): JSX.Element => {
  const {
    filterCount = 0,
    filterHint,
    children,
    onCancel,
    onReset,
    onApply,
    header,
    label,
    icon,
    applyLabel = 'Apply',
  } = props;
  const popupState = usePopupState({
    variant: 'popover',
    popupId: 'filterMenu',
  });

  const isTiny = useIsMobile('sm');
  const filterSummary = useMemo(() => {
    if (filterCount === 0) return;
    // show num filters applied on mobile, or if we dont have a more descriptive hint
    if (isTiny || !filterHint) {
      return <> ({filterCount})</>;
    }
    // show hint summarizing applied filters
    return <> ({filterHint})</>;
  }, [filterCount, filterHint, isTiny]);

  return (
    <>
      <TableFilterButton
        startIcon={icon}
        active={filterCount > 0}
        {...bindTrigger(popupState)}
      >
        {label}
        {filterSummary}
      </TableFilterButton>
      <Popover
        {...bindPopover(popupState)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box p={2} width={320}>
          <Typography variant='overline'>{header}</Typography>
          <Box mt={2}>{children}</Box>
          <Divider sx={{ my: 3 }} />
          <Stack direction='row' gap={1}>
            <Box flexGrow={1}>
              <Button
                variant='text'
                color='error'
                size='small'
                onClick={() => {
                  onReset();
                  popupState.close();
                }}
              >
                <strong>Reset</strong>
              </Button>
            </Box>
            <Button
              variant='text'
              size='small'
              color='inherit'
              sx={{ color: 'text.secondary' }}
              onClick={() => {
                onCancel();
                popupState.close();
              }}
            >
              <strong>Cancel</strong>
            </Button>
            <Button
              size='small'
              onClick={() => {
                onApply();
                popupState.close();
              }}
            >
              <strong>{applyLabel}</strong>
            </Button>
          </Stack>
        </Box>
      </Popover>
    </>
  );
};

export default TableControlPopover;
