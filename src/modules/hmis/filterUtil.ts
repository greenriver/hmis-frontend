import useTableFilters, {
  FilterParams,
  getFilter,
} from '@/hooks/useTableFilters';
import { TableFilterType } from '@/modules/dataFetching/components/GenericTableWithData';
import { HmisEnums } from '@/types/gqlEnums';
import {
  AssessmentSortOption,
  EnrollmentSortOption,
  HouseholdSortOption,
  ProjectSortOption,
} from '@/types/gqlTypes';
import { ensureArray } from '@/utils/arrays';

// Re-export moved hook for backwards compatibility
export { getFilter, type FilterParams };

// For backwards compatibility, re-export useTableFilters with old signature. New code should use useTableFilters directly.
export function useFilters<T = Record<string, unknown>>(
  params: Omit<FilterParams<T>, 'syncToUrl' | 'omitFromUrl'>
): TableFilterType<T> {
  const { filters } = useTableFilters<T>({ ...params, syncToUrl: false });
  return filters;
}

export const getSortOptionForType = (
  recordType: string
): Record<string, string> | null => {
  const expectedName = `${recordType}SortOption`;
  if (expectedName in HmisEnums) {
    const key = expectedName as keyof typeof HmisEnums;
    return HmisEnums[key];
  }

  // console.debug('No sort options for', recordType);
  return null;
};

export const getDefaultSortOptionForType = (
  recordType: string
): string | null => {
  if (recordType === 'Assessment') return AssessmentSortOption.AssessmentDate;
  if (recordType === 'Enrollment') return EnrollmentSortOption.MostRecent;
  if (recordType === 'Household') return HouseholdSortOption.MostRecent;
  if (recordType === 'Project') return ProjectSortOption.Name;

  return null;
};

/**
 * Method for transforming filter values by pulling out dynamic filters into separate key.
 * This is necessary when filtering by dynamic filters, which are backed by HMIS Table Configuration.
 *
 * Example transformation:
 *
 * { "ActualFilter": "1", "SomeDynamicFilter": "2"}
 *     =>
 * { "ActualFilter":  "1", "dynamicFilters": [ { "key": "SomeDynamicFilter", "values": ["2"] }] }
 */
export const transformDynamicFilters = <FilterOptionsType>(
  filters?: TableFilterType<FilterOptionsType>, // Filter configuration, so we know which ones are dynamic
  filterValues?: Partial<FilterOptionsType> // Current filter values
) => {
  if (!filterValues) return;

  // `filterValues` may be present even if `filters` is absent, on tables where `defaultFilterValues` are used without any user-facing filters (such as Bulk Services).
  // In this case, we know the filters aren't dynamic so we don't need to transform them, just return `filterValues` as-is
  if (!filters) return filterValues;

  // Pull out dynamic filters into separate array
  const dynamicFilters: Array<{ key: string; values: any[] }> = [];
  Object.keys(filterValues)
    .filter((key) => !!filters[key as keyof FilterOptionsType]?.isDynamic)
    .forEach((key) => {
      dynamicFilters.push({
        key,
        values: ensureArray(filterValues[key as keyof FilterOptionsType]),
      });
    });

  const dynamicKeys = new Set(dynamicFilters.map((f) => f.key));
  const valuesWithoutDynamicKeys = Object.fromEntries(
    Object.entries(filterValues).filter((e) => !dynamicKeys.has(e[0]))
  );
  return {
    ...valuesWithoutDynamicKeys,
    ...(dynamicFilters.length > 0 ? { dynamicFilters } : {}),
  };
};
