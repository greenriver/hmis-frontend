import { format } from 'date-fns';

import { AnswerOption, FormDefinition, isAnswerOption, Item } from './types';

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
  if (item.type === 'choice' && item.answerValueSet) {
    if (Array.isArray(value)) {
      return value.map((option: { id: string }) => option.id);
    } else if (value) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return value.id;
    }
  } else if (
    ['choice', 'openchoice'].includes(item.type) &&
    item.answerOption
  ) {
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

export const resolveAnswerValueSet = (
  answerValueSet: string
): AnswerOption[] => {
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
