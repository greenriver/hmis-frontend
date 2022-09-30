import { format } from 'date-fns';

import { AnswerOption, FormDefinition, isAnswerOption, Item } from './types';

import { HmisEnums } from '@/types/gqlEnums';

export const isHmisEnum = (k: string): k is keyof typeof HmisEnums => {
  return k in HmisEnums;
};

export const resolveAnswerValueSet = (
  answerValueSet: string
): AnswerOption[] => {
  if (isHmisEnum(answerValueSet)) {
    return Object.entries(HmisEnums[answerValueSet]).map(([code, display]) => ({
      valueCoding: { code: code.toString(), display },
    }));
  }
  if (answerValueSet === 'yesNoMissing') {
    return [
      {
        valueCoding: {
          code: '0',
          display: 'No',
        },
      },
      {
        valueCoding: {
          code: '1',
          display: 'Yes',
        },
      },
      {
        valueCoding: {
          code: '8',
          display: "Don't know",
        },
      },
      {
        valueCoding: {
          code: '9',
          display: 'Client refused',
        },
      },
      {
        valueCoding: {
          code: '99',
          display: 'Data not collected',
        },
      },
    ];
  }
  return [];
};

// Find a question item by linkId
const findItem = (
  items: Item[] | undefined,
  linkId: string
): Item | undefined => {
  if (!items || items.length === 0) return undefined;
  const found = items.find((i) => i.linkId === linkId);
  if (found) return found;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return items.find((item) => findItem(item.item, linkId));
};

// Transform form value based on the type
const transformValue = (value: any, item: Item): any => {
  if (value instanceof Date) {
    return format(value, 'yyyy-MM-dd');
  }
  if (
    item.type === 'choice' &&
    item.answerValueSet &&
    ['projects', 'organizations'].includes(item.answerValueSet)
  ) {
    if (Array.isArray(value)) {
      return value.map((option: { id: string }) => option.id);
    } else if (value) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return value.id;
    }
  } else if (['choice', 'openchoice'].includes(item.type)) {
    if (Array.isArray(value)) {
      return value.map(
        (option: AnswerOption) => option.valueString || option.valueCoding?.code
      );
    } else if (value) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return (value as AnswerOption).valueString || value.valueCoding?.code;
    }
  } else if (value === '') {
    return undefined;
  }
  return value;
};

const dataNotCollectedCode = (item: Item): string | undefined => {
  if (!item.answerOption) return undefined;
  return item.answerOption.find((opt) =>
    opt?.valueCoding?.code?.endsWith('_NOT_COLLECTED')
  )?.valueCoding?.code;
};

// Recursive helper for transformSubmitValues
const transformSubmitValuesInner = (
  items: Item[],
  values: Record<string, any>,
  transformed: Record<string, any>,
  mappingKey: string,
  autofillNotCollected: boolean
) => {
  items.forEach((item: Item) => {
    if (Array.isArray(item.item)) {
      transformSubmitValuesInner(
        item.item,
        values,
        transformed,
        mappingKey,
        autofillNotCollected
      );
    }
    if (!item.mapping) return;
    const key = item.mapping[mappingKey];
    if (!key) return;

    let value;
    if (item.linkId in values) {
      value = transformValue(values[item.linkId], item);
    }
    if (typeof value !== 'undefined') {
      transformed[key] = value;
    } else if (autofillNotCollected) {
      // If we don't have a value, fill in Not Collected code if present
      const notCollectedCode = dataNotCollectedCode(item);
      if (notCollectedCode) transformed[key] = notCollectedCode;
    }
  });
};

// Take a mapping of linkId->value and transform it into queryVariable -> value
export const transformSubmitValues = (
  definition: FormDefinition,
  values: Record<string, any>,
  mappingKey: string,
  autofillNotCollected = false
) => {
  const transformed: Record<string, any> = {};
  transformSubmitValuesInner(
    definition.item || [],
    values,
    transformed,
    mappingKey,
    autofillNotCollected
  );
  return transformed;
};

// Recursive helper for transformSubmitValues
const createInitialValuesInner = (
  items: Item[],
  record: Record<string, any>,
  transformed: Record<string, any>,
  mappingKey: string
) => {
  items.forEach((item: Item) => {
    if (Array.isArray(item.item)) {
      createInitialValuesInner(item.item, record, transformed, mappingKey);
    }
    if (!item.mapping) return;
    const key = item.mapping[mappingKey];
    if (!key || !record.hasOwnProperty(key)) return;

    if (
      record[key] &&
      ['choice', 'openchoice'].includes(item.type) &&
      item.answerValueSet
    ) {
      // This is a value for a choice item, like 'PSH', so transform it to the option object
      const option = resolveAnswerValueSet(item.answerValueSet).find(
        (opt) => opt.valueCoding?.code === record[key]
      );
      transformed[item.linkId] = option || {
        valueCoding: { code: record[key] },
      };
    } else {
      transformed[item.linkId] = record[key];
    }
  });
};

// Create initialValues for form based on mapping key and record
export const createInitialValues = (
  definition: FormDefinition,
  record: any,
  mappingKey: string
): Record<string, any> => {
  const initialValues: Record<string, any> = {};
  createInitialValuesInner(
    definition.item || [],
    record,
    initialValues,
    mappingKey
  );

  return initialValues;
};

export const shouldEnableItem = (dependentQuestionValue: any, item: Item) => {
  if (!item.enableWhen) return true;

  const currentValue = isAnswerOption(dependentQuestionValue)
    ? dependentQuestionValue.valueCoding?.code
    : undefined;
  if (!currentValue) return false;

  // If there is a value, evaluate all enableWhen conditions
  const booleans = item.enableWhen.map((en) => {
    const comparisonValue = en.answerCoding?.code;
    if (
      typeof currentValue === 'undefined' ||
      typeof comparisonValue === 'undefined'
    ) {
      return false;
    }
    switch (en.operator) {
      case '=':
        return currentValue === comparisonValue;
    }
    console.warn('Unsupported enableWhen operator', en.operator);
    return false;
  });

  if (item.enableBehavior === 'any') {
    return booleans.some(Boolean);
  } else {
    return booleans.every(Boolean);
  }
};
