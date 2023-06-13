import { isNil, startCase } from 'lodash-es';

import { getSchemaForInputType } from '../hmisUtil';

import TableFilterItem from '@/components/elements/tableFilters/filters/FilterItem';
import { BaseFilter, FilterType } from '@/modules/dataFetching/types';
import { HmisEnums } from '@/types/gqlEnums';
import { GqlInputObjectSchemaType } from '@/types/gqlObjects';
import { AssessmentSortOption, PickListType } from '@/types/gqlTypes';

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

const getFilterValuesForRecordType = <T,>(
  recordType: string,
  fieldName: string,
  baseFilter: FilterType<T>
): FilterType<T> => {
  if (recordType === 'Assessment') {
    if (fieldName === 'roles' && baseFilter.type === 'enum')
      return { ...baseFilter, multi: true };
    if (fieldName === 'projects' && baseFilter.type === 'picklist')
      return { ...baseFilter, multi: true };
  }

  return baseFilter;
};

export const getSortOptionForType = (
  recordType: string
): Record<string, string> | null => {
  if (recordType === 'Assessment')
    return HmisEnums.AssessmentSortOption as Record<string, string>;

  return null;
};

export const getDefaultSortOptionForType = (
  recordType: string
): string | null => {
  if (recordType === 'Assessment') return AssessmentSortOption.AssessmentDate;

  return null;
};

export const getInputTypeForRecordType = (
  recordType: string
): string | null => {
  if (recordType === 'Assessment') return 'AssessmentFilterOptions';

  return null;
};

const getFilterForType = (
  recordType: string,
  fieldName: any,
  type: GqlInputObjectSchemaType['name']
): FilterType<any> | null => {
  if (!type) return null;

  const baseFields: BaseFilter<any> = {
    key: fieldName,
    label: startCase(fieldName),
  };

  let filter: FilterType<any> | null = null;

  switch (fieldName) {
    case 'textSearch':
      filter = { ...baseFields, type: 'text' };
      break;
    case 'projects':
      filter = {
        ...baseFields,
        type: 'picklist',
        pickListReference: PickListType.Project,
      };
      break;
  }

  if (type in HmisEnums) {
    const enumType = HmisEnums[type as keyof typeof HmisEnums];
    filter = {
      ...baseFields,
      enumType,
      variant: 'select',
      type: 'enum',
    };
  }

  if (filter)
    return getFilterValuesForRecordType(recordType, fieldName, filter);

  return null;
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

  const type = getType(fieldSchema.type);
  if (!type) return null;

  return getFilterForType(recordType, fieldName, type);
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
