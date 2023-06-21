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
  if (recordType === 'Assessment')
    return HmisEnums.AssessmentSortOption as Record<string, string>;
  if (recordType === 'Enrollment')
    return HmisEnums.EnrollmentSortOption as Record<string, string>;
  if (recordType === 'Household')
    return HmisEnums.HouseholdSortOption as Record<string, string>;
  if (recordType === 'Project')
    return HmisEnums.ProjectSortOption as Record<string, string>;

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

  if (fieldName === 'project')
    filter = {
      ...baseFields,
      type: 'picklist',
      pickListReference: PickListType.Project,
    };

  if (fieldName === 'serviceType')
    filter = {
      ...baseFields,
      type: 'picklist',
      pickListReference: PickListType.ServiceType,
    };

  if (inputType in HmisEnums) {
    filter = {
      ...baseFields,
      enumType: inputType as keyof typeof HmisEnums,
      variant: 'select',
      type: 'enum',
    };
  }

  return filter || null;
};

export const getFilter = (
  recordType: string,
  inputType: string,
  fieldName: string
) => {
  const fieldSchema = (getSchemaForInputType(inputType)?.args || []).find(
    (f) => f.name == fieldName
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
