import { get, isNil } from 'lodash-es';

import {
  customDataElementValueAsString,
  formatCurrency,
  getSchemaForType,
  parseAndFormatDate,
  parseAndFormatDateTime,
} from '../hmisUtil';

import { hasCustomDataElements } from '../types';
import YesNoDisplay from '@/components/elements/YesNoDisplay';
import { isHmisEnum } from '@/modules/form/types';
import HmisEnum, { MultiHmisEnum } from '@/modules/hmis/components/HmisEnum';
import { HmisEnums } from '@/types/gqlEnums';
import { GqlSchemaType } from '@/types/gqlObjects';

/**
 * Component for dynamically displaying a scalar
 * field on a record, according to its type
 * defined in the graphql schema.
 */

const getType = (type: GqlSchemaType): GqlSchemaType['name'] => {
  if (!type.ofType) return type.name;
  return getType(type.ofType);
};

const getPrimitiveDisplay = (value: any, type: GqlSchemaType['name']) => {
  if (!type) return value;
  if (isHmisEnum(type)) {
    const enumMap = HmisEnums[type];
    if (
      [
        'NoYesMissing',
        'NoYesReasonsForMissingData',
        'DisabilityResponse',
      ].includes(type)
    ) {
      return <YesNoDisplay enumValue={value} />;
    }
    return Array.isArray(value) ? (
      <MultiHmisEnum values={value} enumMap={enumMap} />
    ) : (
      <HmisEnum value={value} enumMap={enumMap} />
    );
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

interface Props {
  record: any;
  recordType: string;
  fieldName?: string;
  customFieldKey?: string;
}

const HmisField = ({
  record,
  recordType,
  fieldName,
  customFieldKey,
}: Props) => {
  if (fieldName) {
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
  }

  if (customFieldKey) {
    if (!hasCustomDataElements(record)) throw new Error('Expected to have CDE');

    const cde = record.customDataElements.find(
      (cde) => cde.key === customFieldKey
    );
    if (!cde) {
      throw new Error(`Expected to have CDE with key ${customFieldKey}`);
    }

    const value = customDataElementValueAsString(cde);
    if (isNil(value)) return null;
    return <>{value}</>;
  }
  return null;
};

export const renderHmisField =
  (recordType: string, fieldName: string) => (record: any) =>
    <HmisField recordType={recordType} fieldName={fieldName} record={record} />;

export default HmisField;
