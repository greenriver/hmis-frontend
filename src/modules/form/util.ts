import { format } from 'date-fns';

import { AnswerOption, FormDefinition, Item } from './types';

// Find a question item by linkId
const findItem = (
  items: Item[] | undefined,
  linkId: string
): Item | undefined => {
  if (!items || items.length === 0) return undefined;
  const found = items.find((i) => i.linkId === linkId);
  if (found) return found;
  return items.find((item) => findItem(item.item, linkId));
};

// Transform form value based on the type
const transformValue = (value: any, item: Item): any => {
  if (value instanceof Date) {
    return format(value, 'yyyy-MM-dd');
  }
  if (item.type === 'choice' && item.answerValueSet) {
    if (Array.isArray(value)) {
      return value.map((option: { id: string }) => option.id);
    } else if (value) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return value.id;
    }
  } else if (item.type === 'choice' && item.answerOption) {
    if (Array.isArray(value)) {
      return value.map(
        (option: AnswerOption) => option.valueString || option.valueCoding?.code
      );
    } else if (value) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return (value as AnswerOption).valueString || value.valueCoding?.code;
    }
  }
  return value;
};

// Take a mapping of linkId->value and transform it into queryVariable -> value
export const transformSubmitValues = (
  definition: FormDefinition,
  values: Record<string, any>,
  mappingKey: string
) => {
  const transformed: Record<string, any> = {};
  Object.keys(values).forEach((linkId) => {
    const item = findItem(definition.item, linkId);
    if (!item || !item.mapping) return;
    const key = item.mapping[mappingKey];
    if (!key) return;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    transformed[key] = transformValue(values[linkId], item);
  });
  return transformed;
};
