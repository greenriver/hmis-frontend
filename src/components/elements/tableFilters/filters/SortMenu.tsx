import { Menu, MenuItem, Typography } from '@mui/material';
import {
  bindMenu,
  bindTrigger,
  usePopupState,
} from 'material-ui-popup-state/hooks';

import TableFilterButton from './FilterButton';
import { SortIcon } from '@/components/elements/SemanticIcons';

export interface TableSortMenuProps<S> {
  sortOptions: S;
  sortOptionValue?: keyof S;
  setSortOptionValue?: (value: keyof S) => any;
}

const TableSortMenu = <S extends Record<string, string>>({
  setSortOptionValue = () => {},
  sortOptions,
  sortOptionValue,
}: TableSortMenuProps<S>): JSX.Element => {
  const popupState = usePopupState({
    variant: 'popover',
    popupId: 'sortMenu',
  });

  return (
    <>
      <TableFilterButton
        startIcon={<SortIcon />}
        aria-label={'Sort'}
        {...bindTrigger(popupState)}
      >
        Sort
      </TableFilterButton>
      <Menu
        {...bindMenu(popupState)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Typography variant='overline' px={2} mb={1} component='li'>
          Sort By
        </Typography>
        {Object.entries(sortOptions).map(([k, v]) => (
          <MenuItem
            key={String(k)}
            value={k}
            selected={k === sortOptionValue}
            onClick={() => setSortOptionValue(k)}
          >
            {v}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default TableSortMenu;
