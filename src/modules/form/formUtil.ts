import { format } from 'date-fns';
import { isNil } from 'lodash-es';

import { AnswerOption, FormDefinition, isAnswerOption, Item } from './types';

import { HmisEnums } from '@/types/gqlEnums';

export const isHmisEnum = (k: string): k is keyof typeof HmisEnums => {
  return k in HmisEnums;
};

export const resolveAnswerValueSet = (
  answerValueSet: string
): AnswerOption[] => {
  if (isHmisEnum(answerValueSet)) {
    const hmisEnum = HmisEnums[answerValueSet];
    return Object.entries(hmisEnum).map(([code, display]) => ({
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

/**
 * Recursively find a question item by linkId
 */
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

/**
 * Transform form value shape into GraphQL value shape.
 * For example, a selected option '{ valueCoding: { code: 'ES' }}'
 * is converted to enum 'ES'.
 *
 * @param value value from the form state
 * @param item corresponding FormDefinition item
 * @returns transformed value
 */
const transformFormValueToGqlValue = (value: any, item: Item): any => {
  if (value instanceof Date) {
    return format(value, 'yyyy-MM-dd');
  }

  if (
    item.type === 'choice' &&
    item.answerValueSet &&
    ['projects', 'organizations'].includes(item.answerValueSet)
  ) {
    // Special case for project/org selectors which key on ID
    if (Array.isArray(value)) {
      return value.map((option: { id: string }) => option.id);
    } else if (value) {
      return (value as { id: string }).id;
    }
  } else if (['choice', 'openchoice'].includes(item.type)) {
    if (Array.isArray(value)) {
      return value.map(
        (option: AnswerOption) => option.valueString || option.valueCoding?.code
      );
    } else if (value) {
      return (value as AnswerOption).valueString || value.valueCoding?.code;
    }
  }

  if (value === '') {
    return undefined;
  }
  return value;
};

const dataNotCollectedCode = (item: Item): string | undefined => {
  const options = item.answerValueSet
    ? resolveAnswerValueSet(item.answerValueSet)
    : item.answerOption || [];

  return options.find((opt) =>
    opt?.valueCoding?.code?.endsWith('_NOT_COLLECTED')
  )?.valueCoding?.code;
};

/**
 * Given the form state of a completed form, transform it into
 * query variables for a mutation. This is used for dynamic forms that
 * edit one record directly, like the Client, Project, and Organization edit screens.
 *
 * @param definition
 * @param values form state (from DynamicForm) to transform
 * @param mappingKey key used in the FormDefinition to specify the record field that corresponds to the question
 * @param autofillNotCollected whether to fill unanswered questions with Data Not Collected option (if present)
 * @param autofillNulls whether to fill unanswered questions with null
 *
 * @returns values extracted from the form state, ready to submit
 *  to a graphql mutation as query variables.
 */
export const transformSubmitValues = (
  definition: FormDefinition,
  values: Record<string, any>,
  mappingKey: string,
  autofillNotCollected = false,
  autofillNulls = false
) => {
  const result: Record<string, any> = {};

  // Recursive helper for traversing the FormDefinition
  function recursiveTransformValues(
    items: Item[],
    values: Record<string, any>,
    transformed: Record<string, any>, // result map to be filled in
    mappingKey: string
  ) {
    items.forEach((item: Item) => {
      if (Array.isArray(item.item)) {
        recursiveTransformValues(item.item, values, transformed, mappingKey);
      }
      if (!item.mapping) return;
      const key = item.mapping[mappingKey];
      if (!key) return;

      let value;
      if (item.linkId in values) {
        value = transformFormValueToGqlValue(values[item.linkId], item);
      }

      if (typeof value !== 'undefined') {
        transformed[key] = value;
      }

      if (autofillNotCollected && isNil(value)) {
        // If we don't have a value, fill in Not Collected code if present
        const notCollectedCode = dataNotCollectedCode(item);
        if (notCollectedCode) transformed[key] = notCollectedCode;
      }
      if (autofillNulls && isNil(transformed[key])) {
        transformed[key] = null;
      }
    });
  }

  recursiveTransformValues(definition.item || [], values, result, mappingKey);

  return result;
};

/**
 * Create initial form values. This is used for dynamic forms that
 * edit one record directly, like the Client, Project, and Organization edit screens.
 *
 * @param definition FormDefinition
 * @param record  GQL HMIS record, like Project or Organization
 * @param mappingKey key used in the FormDefinition to specify the record field that corresponds to the question
 *
 * @returns initial form state, ready to pass to DynamicForm as initialValues
 */
export const createInitialValues = (
  definition: FormDefinition,
  record: any,
  mappingKey: string
): Record<string, any> => {
  const initialValues: Record<string, any> = {};

  // Recursive helper for traversing the FormDefinition
  function recursiveFillInValues(
    items: Item[],
    record: Record<string, any>,
    values: Record<string, any>, // intialValues object to be filled in
    mappingKey: string
  ) {
    items.forEach((item: Item) => {
      if (Array.isArray(item.item)) {
        recursiveFillInValues(item.item, record, values, mappingKey);
      }
      // Skip: this question doesn't have a mapping key
      if (!item.mapping) return;

      // Skip: this question doesn't have THIS mapping key, or
      // the record doesn't have a value for this property
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
        values[item.linkId] = option || {
          valueCoding: { code: record[key] },
        };
      } else {
        // Set the property directly as the initial form value
        values[item.linkId] = record[key];
      }
    });
  }

  recursiveFillInValues(
    definition.item || [],
    record,
    initialValues,
    mappingKey
  );

  return initialValues;
};

/**
 * Decide whether an item should be enabled based on enableWhen logic.
 * NOTE for now this only takes ONE dependent question value for the sake of speed,
 * even though enableWhen can technically specify dependency on multiple different questions.
 * Will probably need to update to support that later.
 *
 * NOTE: only supports dependency on option questions right now
 *
 * @param dependentQuestionValue The value of the question that this item depends on
 * @param item Item that we're deciding whether to enable or not
 * @returns boolean
 */
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
