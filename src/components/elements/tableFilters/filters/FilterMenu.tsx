import { Stack } from '@mui/material';
import { isDate, isValid } from 'date-fns';
import { isEmpty, isNil, startCase } from 'lodash-es';
import { useCallback, useMemo } from 'react';

import TableFilterItem from './FilterItem';
import TableControlPopover from './TableControlPopover';
import { FilterIcon } from '@/components/elements/SemanticIcons';
import useIntermediateState from '@/hooks/useIntermediateState';
import { FilterType } from '@/modules/dataFetching/types';
import { ensureArray } from '@/utils/arrays';

type DynamicFiltersArray<T> = Array<{
  key: string;
  values: Partial<T>[keyof T][];
}>;
export interface TableFilterMenuProps<T> {
  filters: Partial<Record<keyof T, FilterType<T>>>;
  filterValues: Partial<T>;
  setFilterValues: (
    value: Partial<T> & { dynamicFilters?: DynamicFiltersArray<T> }
  ) => any;
}

const TableFilterMenu = <T,>({
  filters,
  filterValues,
  setFilterValues,
}: TableFilterMenuProps<T>): JSX.Element => {
  const defaultValue = {};
  const { state, setState, reset, cancel } = useIntermediateState(
    filterValues,
    defaultValue as typeof filterValues
  );

  const { filterCount, filterHint } = useMemo(() => {
    const filterLabels = Object.entries(filterValues)
      // Skip filters that aren't visible to the user
      .filter(([k]) => filters.hasOwnProperty(k))
      // Count # of filters that have values applied
      .filter(([, v]) => (Array.isArray(v) ? !isEmpty(v) : !isNil(v)))
      // skip false (unchecked checkboxes)
      .filter(([, v]) => v !== false)
      // Get the human-readable label of this filter
      .map(([k]) => filters[k as keyof T]?.label || startCase(k));

    const filterCount = filterLabels.length;
    const filterHint = filterLabels
      .slice(0, 2) // only hint about the first 2
      .join(', ')
      .concat(filterCount > 2 ? `, ${filterCount - 2} more` : ''); // if > 2, show # of remaining filters

    return { filterCount, filterHint };
  }, [filterValues, filters]);

  const cleanValues = useCallback((values: Partial<T>) => {
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

  /**
   * Processes and sets the filter values by separating dynamic filters from static ones.
   *
   * - Cleans the provided filter values to remove invalid entries (e.g., invalid dates).
   * - Identifies dynamic filters based on the `isDynamic` property in the `filters` prop.
   * - Adds dynamic filters to a `dynamicFilters` array within the adjusted values.
   * - Calls the `setFilterValues` function with the adjusted values.
   *
   * @param values - The filter values to process and set.
   */
  const handleSetFilterValues = useCallback(
    (values: Partial<T>) => {
      const cleanedValues: Partial<T> = cleanValues(values);

      const dynamicFilters: DynamicFiltersArray<T> = [];
      // pull out dynamic filters
      Object.keys(cleanedValues)
        .filter((key) => !!filters[key as keyof T]?.isDynamic)
        .forEach((key) => {
          dynamicFilters.push({
            key,
            values: ensureArray(values[key as keyof T]),
          });
        });

      const dynamicKeys = new Set(dynamicFilters.map((f) => f.key));
      const valuesWithoutDynamicKeys = Object.fromEntries(
        Object.entries(cleanedValues).filter((e) => !dynamicKeys.has(e[0]))
      );
      setFilterValues({
        ...valuesWithoutDynamicKeys,
        ...(dynamicFilters.length > 0 ? { dynamicFilters } : {}),
      } as Partial<T> & { dynamicFilters?: DynamicFiltersArray<T> });
    },
    [cleanValues, filters, setFilterValues]
  );
  return (
    <TableControlPopover
      label='Filter'
      icon={<FilterIcon />}
      header='Filter By'
      applyLabel='Apply Filters'
      filterHint={filterHint}
      filterCount={filterCount}
      onCancel={cancel}
      onApply={() => handleSetFilterValues(state)}
      onReset={() => {
        handleSetFilterValues(defaultValue);
        reset();
      }}
    >
      <Stack gap={2}>
        {Object.entries(filters).map(([key, filter]) => (
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
