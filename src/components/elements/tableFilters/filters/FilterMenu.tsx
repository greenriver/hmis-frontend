import FilterListIcon from '@mui/icons-material/FilterList';
import { Box, Popover } from '@mui/material';
import { isEmpty } from 'lodash-es';
import {
  usePopupState,
  bindTrigger,
  bindPopover,
} from 'material-ui-popup-state/hooks';

import TableFilterButton from './FilterButton';
import TableFilterContent from './FilterContent';

import { FilterType } from '@/modules/dataFetching/types';

export interface TableFilterMenuProps<T> {
  filters: Partial<Record<keyof T, FilterType<T>>>;
  filterValues: Partial<T>;
  setFilterValues: (value: Partial<T>) => any;
}

const TableFilterMenu = <T,>(props: TableFilterMenuProps<T>): JSX.Element => {
  const popupState = usePopupState({
    variant: 'popover',
    popupId: 'filterMenu',
  });

  const filterCount = Object.entries(props.filterValues).filter(
    ([, v]) => !isEmpty(v)
  ).length;

  return (
    <>
      <TableFilterButton
        startIcon={<FilterListIcon />}
        active={filterCount > 0}
        {...bindTrigger(popupState)}
      >
        Filters
        {filterCount > 0 && <> ({filterCount})</>}
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
          <TableFilterContent
            {...props}
            setFilterValues={(val) => {
              popupState.close();
              props.setFilterValues(val);
            }}
          ></TableFilterContent>
        </Box>
      </Popover>
    </>
  );
};

export default TableFilterMenu;
