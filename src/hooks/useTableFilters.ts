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
  type?: string | null; // filter input type for inferring filters if not provided
  pickListArgs?: PickListArgs; // optional: pick list args to be applied to all PickList filter items
  omit?: Array<string>; // optional: skip some filters
  dynamicFilters?: TableFilterConfigFieldsFragment[]; // optional: dynamic filters to include
  /** Whether to sync filter values to URL. If true, filterValues will be set from URL. */
  syncToUrl?: boolean;
  /** Keys to exclude from URL (e.g. PII). type 'text' is always excluded. */
  omitFromUrl?: Array<string>;
  /** Initial filter values (e.g. defaults when URL has no params). Typed by the same T as useTableFilters<T>. */
  initialFilterValues?: Partial<T>;
}

/** useTableFilters export is intentionally overloaded so that when syncToUrl is false,
 * the return type is only { filters }; when true it includes filterValues and setFilterValues.
 * Callers then get accurate types without optional/undefined.
 *
 * If using useTableFilters with 'syncToUrl: false', filter state is managed by GenericTableWithData.
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
  omitFromUrl = [],
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
    const result: TableFilterType<T> = buildTableFilterType(
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
        type: 'local_picklist',
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
    return buildUrlParamsDefinition(filters, omitFromUrl);
  }, [syncToUrl, filters, omitFromUrl]);

  // state/setState for filter values that are synced to URL.
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
  params: Omit<FilterParams<T>, 'syncToUrl' | 'omitFromUrl'>
): TableFilterType<T> {
  const { filters } = useTableFilters<T>({ ...params, syncToUrl: false });
  return filters;
}
