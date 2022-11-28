import { get, isNil } from 'lodash-es';

import {
  formatCurrency,
  getSchemaForType,
  parseAndFormatDate,
  parseAndFormatDateTime,
} from '../hmisUtil';

import YesNoDisplay from '@/components/elements/YesNoDisplay';
import { isHmisEnum } from '@/modules/form/util/formUtil';
import { HmisEnums } from '@/types/gqlEnums';
import { GqlSchemaType } from '@/types/gqlObjects';

/**
 * Component for dynamically displaying a scalar
 * field on a record, according to its type
 * defined in the graphql schema.
 */

interface Props {
  record: any;
  recordType: string;
  fieldName: string;
}

const getType = (type: GqlSchemaType): GqlSchemaType['name'] => {
  if (!type.ofType) return type.name;
  return getType(type.ofType);
};

const getPrimitiveDisplay = (value: any, type: GqlSchemaType['name']) => {
  if (!type) return value;
  if (isHmisEnum(type)) {
    const enumMap = HmisEnums[type];
    if (value in enumMap) {
      if (type === 'NoYesReasonsForMissingData') {
        return <YesNoDisplay enumValue={value} />;
      }

      const key = value as keyof typeof enumMap;
      return <>{enumMap[key]}</>;
    }
  }
  switch (type) {
    case 'Boolean':
      if (!isNil(value)) return <YesNoDisplay booleanValue={value} />;
      break;
    case 'ISO8601Date':
      return parseAndFormatDate(value);
    case 'ISO8601DateTime':
      return parseAndFormatDateTime(value);
    case 'Float':
      return formatCurrency(value);
  }
  return value;
};

const HmisField = ({ record, recordType, fieldName }: Props) => {
  const value = get(record, fieldName);
  if (isNil(value)) return null;
  const defaultDisplay = <>{`${value}`}</>;

  const fieldSchema = (getSchemaForType(recordType)?.fields || []).find(
    (f) => f.name == fieldName
  );
  if (!fieldSchema) return defaultDisplay;

  const type = getType(fieldSchema.type);
  if (!type) return defaultDisplay;

  return <>{getPrimitiveDisplay(value, type)}</>;
};

export const renderHmisField =
  (recordType: string, fieldName: string) => (record: any) =>
    <HmisField recordType={recordType} fieldName={fieldName} record={record} />;

export default HmisField;
