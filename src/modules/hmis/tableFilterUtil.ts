import useTableFilters, { FilterParams } from '@/hooks/useTableFilters';
import { HmisEnums } from '@/types/gqlEnums';
import {
  AssessmentSortOption,
  EnrollmentSortOption,
  HouseholdSortOption,
  ProjectSortOption,
} from '@/types/gqlTypes';
import { TableFilterType } from '@/types/tableFilterTypes';
import { ensureArray } from '@/utils/arrays';

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
  if (!filterValues) return; // No filter values, nothing to transform

  // `filterValues` may be present even if `filters` is absent, on tables where `defaultFilterValues` are used without any user-facing filters (such as Bulk Services).
  // In this case, we know the filters aren't dynamic so we don't need to transform them, just return `filterValues` as-is
  if (!filters) return filterValues;

  // Split filter values into static and dynamic
  const staticFilterValues: Record<string, unknown> = {};
  const dynamicFilters: Array<{ key: string; values: any[] }> = []; // { dynamic_key => [value1, value2, ...] }

  for (const [key, value] of Object.entries(filterValues)) {
    const isDynamic = filters[key as keyof FilterOptionsType]?.isDynamic;
    if (isDynamic) {
      const values = ensureArray(value);
      if (values.length > 0) dynamicFilters.push({ key, values });
    } else {
      staticFilterValues[key] = value;
    }
  }

  if (dynamicFilters.length > 0) {
    return { ...staticFilterValues, dynamicFilters };
  }
  return staticFilterValues;
};
