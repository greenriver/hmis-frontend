import { startCase } from 'lodash-es';

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

export const getInputTypeForRecordType = (
  recordType: string
): string | null => {
  return `${recordType}FilterOptions`;
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
