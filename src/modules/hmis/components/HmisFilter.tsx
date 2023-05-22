import { isNil, startCase } from 'lodash-es';

import { getSchemaForInputType } from '../hmisUtil';

import TableFilterItem from '@/components/elements/tableFilters/filters/FilterItem';
import { BaseFilter, FilterType } from '@/modules/dataFetching/types';
import { HmisEnums } from '@/types/gqlEnums';
import { GqlInputObjectSchemaType } from '@/types/gqlObjects';
import { PickListType } from '@/types/gqlTypes';

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

const getFilterForType = (
  recordType: string,
  fieldName: any,
  type: GqlInputObjectSchemaType['name']
): FilterType<any> | null => {
  const baseFields: BaseFilter<any> = {
    key: fieldName,
    label: startCase(fieldName),
  };

  switch (fieldName) {
    case 'textSearch':
      return { ...baseFields, type: 'text' };
    case 'projects':
      return {
        ...baseFields,
        type: 'picklist',
        pickListReference: PickListType.Project,
        multi: ['Assessment'].includes(fieldName),
      };
  }

  switch (type) {
    case 'FormRole':
      return {
        ...baseFields,
        enumType: HmisEnums.FormRole,
        multi: ['Assessment'].includes(recordType),
        variant: 'select',
        label: 'Roles',
        type: 'enum',
      };
  }

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
