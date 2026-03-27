import { useMemo } from 'react';

import useSearchParamsState, {
  SearchParamsStateType,
} from '@/hooks/useSearchParamState';

import { PickListArgs } from '@/modules/form/types';
import { TableFilterConfigFieldsFragment } from '@/types/gqlTypes';
import { FilterType, TableFilterType } from '@/types/tableFilterTypes';
import {
  buildTableFilterType,
  buildUrlParamsDefinition,
} from '@/utils/tableFilterUtil';

export interface FilterParams<T = Record<string, unknown>> {
  /** GraphQL type to use for inferring filters (e.g. 'ClientFilterOptions') */
  type: string;
  /** (Optional) Pick list args to be applied to all PickList filter items */
  pickListArgs?: PickListArgs;
  /** (Optional) Keys to skip when inferring filters. Filters that are text-based are always skipped
   * because they are not supported in the filter widget (due to limiting PII in URL). */
  omit?: Array<string>;
  /** (Optional) Dynamic filters to include (e.g. from HMIS Table Configuration) */
  dynamicFilters?: TableFilterConfigFieldsFragment[];
  /** (Optional) Whether to sync filter values to URL. If true, filterValues are reflected as URL search params. (Default: true) */
  syncToUrl?: boolean;
  /** (Optional) Initial filter values to set when URL has no params. Ignored if syncToUrl is false. */
  initialFilterValues?: Partial<T>;
}

/**
 * Builds a table filter configuration from a GraphQL filter input type (e.g. `ClientFilterOptions`)
 * and optionally mirrors filter values in the URL so they persist on navigation and can be shared.
 *
 * With `syncToUrl: false`, filter state is owned by GenericTableWithData (internal filter UI).
 * With `syncToUrl: true`, the calling component owns filter state and typically passes
 * filterValues and setFilterValues into GenericTableWithData so the filter widget reads/writes
 * URL-backed state.
 *
 * Design notes:
 * -  The useTableFilters export is intentionally overloaded so that when syncToUrl is false,
 * the return type is only { filters }; when true it includes filterValues and setFilterValues.
 * Callers then get accurate types without optional/undefined.
 * - Unlike Optional Table Columns (which similarly have logic to sync to URL),
 * filter values do not persist to localStorage. This was an intentional design choice.
 **/
export default function useTableFilters<T = Record<string, unknown>>(
  params: FilterParams<T> & { syncToUrl?: true }
): {
  filters: TableFilterType<T>;
  filterValues: Partial<T>;
  setFilterValues: (values: Partial<T>) => void;
};
export default function useTableFilters<T = Record<string, unknown>>(
  params: FilterParams<T> & { syncToUrl: false }
): { filters: TableFilterType<T> };

export default function useTableFilters<T = Record<string, unknown>>({
  type, // Filter type, e.g. 'ClientFilterOptions'
  initialFilterValues = {} as Partial<T>,
  pickListArgs = {},
  omit = [],
  dynamicFilters,
  syncToUrl = true,
}: FilterParams<T>):
  | {
      filters: TableFilterType<T>; // filter configuration
      filterValues: Partial<T>; // filter values (if syncToUrl is true)
      setFilterValues: (values: Partial<T>) => void; // set filter values (if syncToUrl is true)
    }
  | { filters: TableFilterType<T> } {
  // Build TableFilterType filter configuration by introspecting on the GraphQL schema for the given filter type.
  // If dynamicFilters are provided, add them to the filter configuration.
  const filters = useMemo(() => {
    const result: TableFilterType<T> = buildTableFilterType<T>(
      type,
      omit,
      pickListArgs
    );
    // Add dynamic filters if provided
    (dynamicFilters || []).forEach(({ key, label, options }) => {
      result[key as keyof T] = {
        key,
        label,
        multi: true,
        type: 'local_picklist', // Dynamic filters must have picklist options defined on them
        isDynamic: true,
        pickListOptions: options,
      } as FilterType<T>;
    });

    return result;
  }, [type, dynamicFilters, omit, pickListArgs]);

  // Build URL param definition from filter configuration; if syncing filter state to URL.
  const urlParamsDefinition: SearchParamsStateType = useMemo(() => {
    if (!syncToUrl || !filters || Object.keys(filters).length === 0) {
      return {};
    }
    return buildUrlParamsDefinition(filters, omit);
  }, [syncToUrl, filters, omit]);

  // state/setState for filter values that are synced to URL. (Not returned if syncToUrl is false)
  const [urlFilterValues, setUrlFilterValues] = useSearchParamsState({
    paramsDefinition: urlParamsDefinition,
    initial: initialFilterValues,
  });

  if (!syncToUrl) {
    return { filters };
  }

  return {
    filters,
    filterValues: urlFilterValues as Partial<T>,
    setFilterValues: setUrlFilterValues as (values: Partial<T>) => void,
  };
}

// LEGACY: For backwards compatibility, re-export useTableFilters with old signature.
// New code should use useTableFilters directly.
export function useFilters<T = Record<string, unknown>>(
  params: Omit<FilterParams<T>, 'syncToUrl' | 'initialFilterValues'>
): TableFilterType<T> {
  const { filters } = useTableFilters<T>({ ...params, syncToUrl: false });
  return filters;
}
