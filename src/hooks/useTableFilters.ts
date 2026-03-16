import { startCase } from 'lodash-es';
import { useMemo } from 'react';

import useSearchParamsState, {
  type SearchParamsStateType,
} from '@/hooks/useSearchParamState';
import { TableFilterType } from '@/modules/dataFetching/components/GenericTableWithData';
import { BaseFilter, FilterType } from '@/modules/dataFetching/types';
import { PickListArgs } from '@/modules/form/types';
import { getSchemaForInputType } from '@/modules/hmis/hmisUtil';
import { HmisEnums } from '@/types/gqlEnums';
import { GqlInputObjectSchemaType } from '@/types/gqlObjects';
import {
  PickListType,
  TableFilterConfigFieldsFragment,
} from '@/types/gqlTypes';

const getType = (
  type: GqlInputObjectSchemaType
): GqlInputObjectSchemaType['name'] => {
  if (!type.ofType) return type.name;
  return getType(type.ofType);
};

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

function isPicklistType(
  filterName: string
): filterName is keyof typeof FILTER_NAME_TO_PICK_LIST {
  return Object.keys(FILTER_NAME_TO_PICK_LIST).includes(filterName);
}

const getFilterForType = (
  fieldName: any,
  type: GqlInputObjectSchemaType,
  filterPickListArgs?: PickListArgs
): FilterType<any> | null => {
  const inputType = getType(type);
  if (!inputType) return null;
  if (inputType === 'String') return null; // Free-text filters are not supported because PII is not allowed in URL

  const baseFields: BaseFilter<any> = {
    key: fieldName,
    label: startCase(fieldName).replace(/\bHoh\b/, 'HoH'),
    multi: type.kind === 'LIST',
  };

  let filter: FilterType<any> | null = null;

  if (inputType === 'ISO8601Date') filter = { ...baseFields, type: 'date' };
  if (inputType === 'Boolean') filter = { ...baseFields, type: 'boolean' };

  if (isPicklistType(fieldName)) {
    filter = {
      ...baseFields,
      type: 'remote_picklist',
      pickListReference: FILTER_NAME_TO_PICK_LIST[fieldName],
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

  return filter || null;
};

export const getFilter = (
  inputType: string,
  fieldName: string,
  filterPickListArgs?: PickListArgs
) => {
  const fieldSchema = (getSchemaForInputType(inputType)?.args || []).find(
    (f) => f.name === fieldName
  );
  if (!fieldSchema) return null;

  return getFilterForType(fieldName, fieldSchema.type, filterPickListArgs);
};

export interface FilterParams {
  type?: string | null; // filter input type for inferring filters if not provided
  pickListArgs?: PickListArgs; // optional: pick list args to be applied to all PickList filter items
  omit?: Array<string>; // optional: skip some filters
  dynamicFilters?: TableFilterConfigFieldsFragment[]; // optional: dynamic filters to include
  /** Whether to sync filter values to URL. If true, filterValues will be set from URL. */
  syncToUrl?: boolean;
  /** Keys to exclude from URL (e.g. PII). type 'text' is always excluded. */
  omitFromUrl?: Array<string>;
  /** Initial filter values. If provided, these will be used to populate the filter values initially. */
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
  params: Omit<FilterParams, 'initialFilterValues'> & {
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

export default function useTableFilters<T>({
  type,
  initialFilterValues = {},
  pickListArgs = {},
  omit = [],
  dynamicFilters,
  syncToUrl = true,
  omitFromUrl = [],
}: FilterParams): {
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
