import { startCase } from 'lodash-es';

import { useMemo } from 'react';
import { TableFilterType } from '@/modules/dataFetching/components/GenericTableWithData';
import { BaseFilter, FilterType } from '@/modules/dataFetching/types';
import { PickListArgs } from '@/modules/form/types';
import { getSchemaForInputType } from '@/modules/hmis/hmisUtil';
import { HmisEnums } from '@/types/gqlEnums';
import { GqlInputObjectSchemaType } from '@/types/gqlObjects';
import {
  AssessmentSortOption,
  EnrollmentSortOption,
  HouseholdSortOption,
  PickListType,
  ProjectSortOption,
} from '@/types/gqlTypes';

const getType = (
  type: GqlInputObjectSchemaType
): GqlInputObjectSchemaType['name'] => {
  if (!type.ofType) return type.name;
  return getType(type.ofType);
};

export const getSortOptionForType = (
  recordType: string
): Record<string, string> | null => {
  const expectedName = `${recordType}SortOption`;
  if (Object.hasOwn(HmisEnums, expectedName)) {
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

  const baseFields: BaseFilter<any> = {
    key: fieldName,
    label: startCase(fieldName).replace(/\bHoh\b/, 'HoH'),
    multi: type.kind === 'LIST',
  };

  let filter: FilterType<any> | null = null;

  if (inputType === 'ISO8601Date') filter = { ...baseFields, type: 'date' };
  if (inputType === 'String') filter = { ...baseFields, type: 'text' };
  if (inputType === 'Boolean') filter = { ...baseFields, type: 'boolean' };

  if (isPicklistType(fieldName)) {
    filter = {
      ...baseFields,
      type: 'picklist',
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

  if (!filter) console.error(`Failed to create filter for ${fieldName}`);

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

interface FilterParams {
  type?: string | null; // filter input type type for inferring filters if not provided
  pickListArgs?: PickListArgs; // optional: pick list args to be applied to all PickList filter items
  omit?: Array<string>; // optional: skip some filters
}
export function useFilters<T>({
  type,
  pickListArgs = {},
  omit = [],
}: FilterParams): TableFilterType<T> {
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
      } else {
        console.error(`Unable to create filter for ${name}`);
      }
    });

    return result;
  }, [type, pickListArgs, omit]);
}
