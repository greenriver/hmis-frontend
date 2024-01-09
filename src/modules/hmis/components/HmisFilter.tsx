import { isNil, startCase } from 'lodash-es';

import { getSchemaForInputType } from '../hmisUtil';

import TableFilterItem from '@/components/elements/tableFilters/filters/FilterItem';
import { BaseFilter, FilterType } from '@/modules/dataFetching/types';
import { HmisEnums } from '@/types/gqlEnums';
import { GqlInputObjectSchemaType } from '@/types/gqlObjects';
import {
  AssessmentSortOption,
  EnrollmentSortOption,
  HouseholdSortOption,
  PickListType,
  ProjectSortOption,
} from '@/types/gqlTypes';

/**
 * Component for dynamically displaying a filter
 * on an input type, according to its type
 * defined in the graphql schema.
 */

interface Props {
  recordType: string;
  inputType: string;
  fieldName: string;
  value: any;
  onChange: (value: any) => any;
}

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
  serviceType: PickListType.AllServiceTypes,
  auditEventRecordType: PickListType.EnrollmentAuditEventRecordTypes,
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
  recordType: string,
  fieldName: any,
  type: GqlInputObjectSchemaType
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

  if (isPicklistType(fieldName)) {
    filter = {
      ...baseFields,
      type: 'picklist',
      pickListReference: FILTER_NAME_TO_PICK_LIST[fieldName],
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
  recordType: string,
  inputType: string,
  fieldName: string
) => {
  const fieldSchema = (getSchemaForInputType(inputType)?.args || []).find(
    (f) => f.name === fieldName
  );
  if (!fieldSchema) return null;

  return getFilterForType(recordType, fieldName, fieldSchema.type);
};

const HmisFilter = ({
  recordType,
  inputType,
  fieldName,
  value,
  onChange,
}: Props) => {
  if (isNil(value)) return null;

  const filter = getFilter(recordType, inputType, fieldName);
  if (!filter) return null;

  return (
    <TableFilterItem
      filter={filter}
      keyName={fieldName}
      value={value}
      onChange={onChange}
    />
  );
};

export default HmisFilter;
