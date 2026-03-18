import { startCase } from 'lodash-es';

import { SearchParamsStateType } from '@/hooks/useSearchParamState';
import { PickListArgs } from '@/modules/form/types';
import { getSchemaForInputType } from '@/modules/hmis/hmisUtil';
import { HmisEnums } from '@/types/gqlEnums';
import { GqlInputObjectSchemaType } from '@/types/gqlObjects';
import { PickListType } from '@/types/gqlTypes';
import {
  FilterType,
  BaseFilter,
  TableFilterType,
} from '@/types/tableFilterTypes';
import { ensureArray } from '@/utils/arrays';

// Default remote pick lists to use for filters, based on filter name
const FILTER_NAME_TO_PICK_LIST = {
  project: PickListType.Project,
  appliedToProject: PickListType.Project,
  organization: PickListType.Organization,
  assessmentName: PickListType.AssessmentNames,
  serviceType: PickListType.AllServiceTypes,
  user: PickListType.Users,
  clientRecordType: PickListType.ClientAuditEventRecordTypes,
  enrollmentRecordType: PickListType.EnrollmentAuditEventRecordTypes,
  assignedStaff: PickListType.EligibleStaffAssignmentUsers,
  workflowTemplate: PickListType.CeWorkflowTemplateIdentifiersIncludingRetired,
  unitType: PickListType.PossibleUnitTypesForProject,
  referralStatus: PickListType.CeReferralStatuses,
};

function remotePickListForFilterName(
  filterName: string
): PickListType | undefined {
  if (Object.keys(FILTER_NAME_TO_PICK_LIST).includes(filterName)) {
    return FILTER_NAME_TO_PICK_LIST[
      filterName as keyof typeof FILTER_NAME_TO_PICK_LIST
    ];
  }
  return undefined;
}

const getGraphqlSchemaTypeName = (
  type: GqlInputObjectSchemaType
): GqlInputObjectSchemaType['name'] => {
  if (!type.ofType) return type.name;
  return getGraphqlSchemaTypeName(type.ofType);
};

const getFilterForType = (
  fieldName: any,
  type: GqlInputObjectSchemaType,
  filterPickListArgs?: PickListArgs
): FilterType<any> | null => {
  const inputType = getGraphqlSchemaTypeName(type);
  if (!inputType) return null;

  const baseFields: BaseFilter<any> = {
    key: fieldName,
    label: startCase(fieldName).replace(/\bHoh\b/, 'HoH'),
    multi: type.kind === 'LIST',
  };

  let filter: FilterType<any> | null = null;

  if (inputType === 'ISO8601Date') filter = { ...baseFields, type: 'date' };
  if (inputType === 'Boolean') filter = { ...baseFields, type: 'boolean' };

  const remotePickList = remotePickListForFilterName(fieldName);
  if (remotePickList) {
    filter = {
      ...baseFields,
      type: 'remote_picklist',
      pickListReference: remotePickList,
      pickListArgs: filterPickListArgs,
    };
  }

  if (inputType in HmisEnums) {
    filter = {
      ...baseFields,
      enumType: inputType as keyof typeof HmisEnums,
      type: 'enum',
    };
  }

  if (!filter && inputType === 'String') {
    // console.log('Skipping free-text filter:', fieldName);
    return null; // Free-text filters are not supported because PII is not allowed in URL
  }

  return filter || null;
};

const getFilter = (
  inputType: string,
  fieldName: string,
  filterPickListArgs?: PickListArgs
): FilterType<any> | null => {
  const fieldSchema = (getSchemaForInputType(inputType)?.args || []).find(
    (f) => f.name === fieldName
  );
  if (!fieldSchema) return null;

  return getFilterForType(fieldName, fieldSchema.type, filterPickListArgs);
};

// Given a "filter type" (e.g. 'ClientFilterOptions'), build a TableFilterType for it
// by introspecting the GraphQL schema.
export function buildTableFilterType<T>(
  type?: string | null,
  omit: string[] = [],
  pickListArgs?: PickListArgs
): TableFilterType<T> {
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

  return result;
}

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

/** Build URL param definition from filter config; only includes non–free-text filters (no PII in URL). */
export function buildUrlParamsDefinition<T>(
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
