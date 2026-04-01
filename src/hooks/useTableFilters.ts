import { useMemo } from 'react';

import useSearchParamsState from '@/hooks/useSearchParamState';

import { PickListArgs } from '@/modules/form/types';
import type { FilterOptionsByName } from '@/types/gqlFilterOptionsTypes.generated';
import { TableFilterConfigFieldsFragment } from '@/types/gqlTypes';
import { FilterType, TableFilterType } from '@/types/tableFilterTypes';
import {
  buildTableFilterType,
  buildUrlParamsDefinition,
} from '@/utils/tableFilterUtil';

type Args<K extends keyof FilterOptionsByName> = {
  /** GraphQL input type name for filter fields (must match a generated *FilterOptions type). */
  type: K;
  /** (Optional) Pick list args to be applied to all PickList filter items */
  pickListArgs?: PickListArgs;
  /** (Optional) Keys to skip when inferring filters. Filters that are text-based are always skipped
   * because they are not supported in the filter widget (due to limiting PII in URL). */
  omit?: Array<keyof FilterOptionsByName[K]>;
  /** (Optional) Dynamic filters to include (e.g. from HMIS Table Configuration) */
  dynamicFilters?: TableFilterConfigFieldsFragment[];
  /** (Optional) Whether to sync filter values to URL. If true, filterValues are reflected as URL search params. (Default: true) */
  syncToUrl?: boolean;
  /** (Optional) Initial filter values to set when URL has no params. Ignored if syncToUrl is false. */
  initialFilterValues?: Partial<FilterOptionsByName[K]>;
};

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
export default function useTableFilters<K extends keyof FilterOptionsByName>(
  args: Args<K> & { syncToUrl?: true }
): {
  filters: TableFilterType<FilterOptionsByName[K]>;
  filterValues: Partial<FilterOptionsByName[K]>;
  setFilterValues: (values: Partial<FilterOptionsByName[K]>) => void;
};
export default function useTableFilters<K extends keyof FilterOptionsByName>(
  args: Args<K> & { syncToUrl: false }
): { filters: TableFilterType<FilterOptionsByName[K]> };

export default function useTableFilters<K extends keyof FilterOptionsByName>({
  type, // Filter type, e.g. 'ClientFilterOptions'
  initialFilterValues = {} as Partial<FilterOptionsByName[K]>,
  pickListArgs = {},
  omit = [],
  dynamicFilters,
  syncToUrl = true,
}: Args<K>):
  | {
      filters: TableFilterType<FilterOptionsByName[K]>; // filter configuration
      filterValues: Partial<FilterOptionsByName[K]>; // filter values (if syncToUrl is true)
      setFilterValues: (values: Partial<FilterOptionsByName[K]>) => void; // set filter values (if syncToUrl is true)
    }
  | { filters: TableFilterType<FilterOptionsByName[K]> } {
  // Build TableFilterType filter configuration by introspecting on the GraphQL schema for the given filter type.
  // If dynamicFilters are provided, add them to the filter configuration.
  const filters = useMemo(() => {
    const result = buildTableFilterType<FilterOptionsByName[K]>(
      type,
      omit,
      pickListArgs
    );
    // Add dynamic filters if provided
    (dynamicFilters || []).forEach(({ key, label, options }) => {
      result[key as keyof FilterOptionsByName[K]] = {
        key,
        label,
        multi: true,
        type: 'local_picklist', // Dynamic filters must have picklist options defined on them
        isDynamic: true,
        pickListOptions: options,
      } as FilterType<FilterOptionsByName[K]>;
    });

    return result;
  }, [type, dynamicFilters, omit, pickListArgs]);

  // Build URL param definition from filter configuration; if syncing filter state to URL.
  const urlParamsDefinition = useMemo(() => {
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
    filterValues: urlFilterValues as Partial<FilterOptionsByName[K]>,
    setFilterValues: setUrlFilterValues as (
      values: Partial<FilterOptionsByName[K]>
    ) => void,
  };
}
