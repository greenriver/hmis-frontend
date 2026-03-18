import { useMemo } from 'react';

import useSearchParamsState, {
  type SearchParamsStateType,
} from '@/hooks/useSearchParamState';

import { PickListArgs } from '@/modules/form/types';
import { getSchemaForInputType } from '@/modules/hmis/hmisUtil';
import { TableFilterConfigFieldsFragment } from '@/types/gqlTypes';
import { FilterType, TableFilterType } from '@/types/tableFilterTypes';
import { getFilter } from '@/utils/tableFilterUtil';

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

/** Build URL param definition from filter config; only includes non–free-text filters (no PII in URL). */
function buildUrlParamsDefinition<T>(
  filters: TableFilterType<T>,
  omitFromUrl: string[] = []
): SearchParamsStateType {
  const def: SearchParamsStateType = {};
  Object.entries(filters).forEach(([key, filter]) => {
    if (omitFromUrl.includes(key)) return;
    const f = filter as FilterType<any>;
    if (f.type === 'text') return; // never put free-text in URL (PII)
    if (f.type === 'date') {
      def[key] = { type: 'date', default: null };
      return;
    }
    if (f.type === 'boolean') {
      def[key] = { type: 'boolean', default: false };
      return;
    }
    if (
      f.type === 'enum' ||
      f.type === 'remote_picklist' ||
      f.type === 'local_picklist'
    ) {
      def[key] = {
        type: 'string',
        default: f.multi ? [] : null,
        multiple: !!f.multi,
      };
      return;
    }
  });
  return def;
}

const EMPTY_URL_PARAMS: SearchParamsStateType = {
  __noop: { type: 'string', default: null },
};

function useFiltersImpl<T>(
  params: Omit<FilterParams<T>, 'syncToUrl' | 'omitFromUrl'> & {
    initialFilterValues?: Partial<T>;
  }
): TableFilterType<T> {
  const { type, pickListArgs = {}, omit = [], dynamicFilters } = params;

  return useMemo(() => {
    if (!type) return {};

    const schema = getSchemaForInputType(type);
    if (!schema) return {};

    const result: Partial<Record<keyof T, FilterType<T>>> = {};

    schema.args.forEach(({ name }) => {
      if (omit.includes(name)) return;

      const filter = getFilter(type, name, pickListArgs);
      if (filter) {
        result[name as keyof T] = filter;
      }
    });

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
}

export default function useTableFilters<T = Record<string, unknown>>({
  type,
  initialFilterValues = {} as Partial<T>,
  pickListArgs = {},
  omit = [],
  dynamicFilters,
  syncToUrl = true,
  omitFromUrl = [],
}: FilterParams<T>): {
  filters: TableFilterType<T>; // filter configuration
  filterValues: Partial<T>; // filter values (if syncToUrl is true)
  setFilterValues: (values: Partial<T>) => void; // set filter values (if syncToUrl is true)
} {
  const filters = useFiltersImpl<T>({
    type,
    initialFilterValues,
    pickListArgs,
    omit,
    dynamicFilters,
  });

  const urlParamsDefinition = useMemo(() => {
    if (!syncToUrl || !filters || Object.keys(filters).length === 0) {
      return EMPTY_URL_PARAMS;
    }

    const def = buildUrlParamsDefinition(filters, omitFromUrl);
    return Object.keys(def).length > 0 ? def : EMPTY_URL_PARAMS;
  }, [syncToUrl, filters, omitFromUrl]);

  const [urlFilterValues, setUrlFilterValues] = useSearchParamsState({
    paramsDefinition: urlParamsDefinition,
    initial: initialFilterValues,
  });

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
