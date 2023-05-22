import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { Button, Menu, MenuItem, Typography } from '@mui/material';
import {
  usePopupState,
  bindTrigger,
  bindMenu,
} from 'material-ui-popup-state/hooks';

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
      <Button
        size='small'
        color='inherit'
        variant='text'
        startIcon={<ArrowDownwardIcon />}
        sx={{ fontWeight: 600 }}
        {...bindTrigger(popupState)}
      >
        Sort
      </Button>
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
        <Typography variant='overline' px={2} mb={2} component='li'>
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
