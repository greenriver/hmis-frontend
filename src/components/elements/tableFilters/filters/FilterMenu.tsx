import FilterListIcon from '@mui/icons-material/FilterList';
import { Stack } from '@mui/material';
import { isDate, isValid } from 'date-fns';
import { isEmpty, isNil } from 'lodash-es';
import { useCallback } from 'react';

import TableFilterItem from './FilterItem';
import TableControlPopover from './TableControlPopover';
import useIntermediateState from '@/hooks/useIntermediateState';
import { FilterType } from '@/modules/dataFetching/types';

export interface TableFilterMenuProps<T> {
  filters: Partial<Record<keyof T, FilterType<T>>>;
  filterValues: Partial<T>;
  setFilterValues: (value: Partial<T>) => any;
}

const TableFilterMenu = <T,>(props: TableFilterMenuProps<T>): JSX.Element => {
  const defaultValue = {};
  const { state, setState, reset, cancel } = useIntermediateState(
    props.filterValues,
    defaultValue as typeof props.filterValues
  );

  // Count # of filters that have values applied
  const filterCount = Object.entries(props.filterValues)
    // Skip filters that aren't visible to the user
    .filter(([k]) => props.filters.hasOwnProperty(k))
    .filter(([, v]) => (Array.isArray(v) ? !isEmpty(v) : !isNil(v))).length;

  const cleanedValues = useCallback((values: Partial<T>) => {
    const cleaned: typeof values = {};
    Object.keys(values).forEach((key) => {
      const val = values[key as keyof T];
      if (val && isDate(val) && !isValid(val)) {
        // skip invalid dates
      } else {
        cleaned[key as keyof T] = val;
      }
    });
    return cleaned;
  }, []);

  return (
    <TableControlPopover
      label='Filters'
      icon={<FilterListIcon />}
      header='Filter By'
      applyLabel='Apply Filters'
      filterCount={filterCount}
      onCancel={cancel}
      onApply={() => props.setFilterValues(cleanedValues(state))}
      onReset={() => {
        props.setFilterValues(cleanedValues(defaultValue));
        reset();
      }}
    >
      <Stack gap={2}>
        {Object.entries(props.filters).map(([key, filter]) => (
          <TableFilterItem
            key={key}
            filter={filter as FilterType<T>}
            keyName={key}
            value={state[key as keyof T]}
            onChange={(value) => {
              // resize so that as pick list content changes, popper will reflow allowing scroll
              window.dispatchEvent(new CustomEvent('resize'));
              setState((prev) => ({ ...prev, [key]: value }));
            }}
          />
        ))}
      </Stack>
    </TableControlPopover>
  );
};

export default TableFilterMenu;
