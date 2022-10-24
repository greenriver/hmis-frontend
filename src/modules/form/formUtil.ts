import { isNil } from 'lodash-es';
import { ReactNode } from 'react';

import { formatDateForGql, parseHmisDateString } from '../hmis/hmisUtil';

import { HmisEnums } from '@/types/gqlEnums';
import {
  EnableBehavior,
  EnableOperator,
  FormDefinitionJson,
  FormItem,
  ItemType,
  PickListOption,
} from '@/types/gqlTypes';

export type DynamicInputCommonProps = {
  disabled?: boolean;
  label?: ReactNode;
  error?: boolean;
  helperText?: ReactNode;
};

export const isHmisEnum = (k: string): k is keyof typeof HmisEnums => {
  return k in HmisEnums;
};
export function isPickListOption(
  value: any | null | undefined
): value is PickListOption {
  return (
    !isNil(value) &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    !!value.code
  );
}

export const localResolvePickList = (
  pickListReference: string
): PickListOption[] | null => {
  if (isHmisEnum(pickListReference)) {
    const hmisEnum = HmisEnums[pickListReference];
    return Object.entries(hmisEnum).map(([code, label]) => ({
      code: code.toString(),
      label,
    }));
  }

  return null;
};

export const resolveOptionList = (item: FormItem): PickListOption[] | null => {
  if (!item.pickListReference && !item.pickListOptions) return null;
  if (item.pickListOptions) return item.pickListOptions;
  if (item.pickListReference) {
    return localResolvePickList(item.pickListReference);
  }
  return null;
};

/**
 * Recursively find a question item by linkId
 */
const findItem = (
  items: FormItem[] | null | undefined,
  linkId: string
): FormItem | undefined => {
  if (!items || items.length === 0) return undefined;
  const found = items.find((i) => i.linkId === linkId);
  if (found) return found;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return items.find((item) => findItem(item.item, linkId));
};

/**
 * Transform form value shape into GraphQL value shape.
 * For example, a selected option '{ code: 'ES' }'
 * is converted to enum 'ES'.
 *
 * @param value value from the form state
 * @param item corresponding FormDefinition item
 * @returns transformed value
 */
export const formValueToGqlValue = (value: any, item: FormItem): any => {
  if (value instanceof Date) {
    return formatDateForGql(value);
  }

  if (item.type === ItemType.Integer) {
    return parseInt(value);
  }

  if (
    item.type === ItemType.Choice &&
    item.pickListReference &&
    ['projects', 'organizations'].includes(item.pickListReference)
  ) {
    // Special case for project/org selectors which key on ID
    if (Array.isArray(value)) {
      return value.map((option: { id: string }) => option.id);
    } else if (value) {
      return (value as { id: string }).id;
    }
  } else if ([ItemType.Choice, ItemType.OpenChoice].includes(item.type)) {
    if (Array.isArray(value)) {
      return value.map((option: PickListOption) => option.code);
    } else if (value) {
      return (value as PickListOption).code;
    }
  }

  if (value === '') {
    return undefined;
  }
  return value;
};

const dataNotCollectedCode = (item: FormItem): string | undefined => {
  const options = resolveOptionList(item) || [];

  return options.find(
    (opt) =>
      opt.code?.endsWith('_NOT_COLLECTED') || opt.code === 'NOT_APPLICABLE'
  )?.code;
};

type TransformSubmitValuesParams = {
  definition: FormDefinitionJson;
  /** form state (from DynamicForm) to transform */
  values: Record<string, any>;
  /** whether to fill unanswered questions with Data Not Collected option (if present) */
  autofillNotCollected?: boolean;
  /** whether to fill unanswered questions with `null` */
  autofillNulls?: boolean;
  /** whether to fill unanswered boolean questions `false` */
  autofillBooleans?: boolean;
};

/**
 * Given the form state of a completed form, transform it into
 * query variables for a mutation. This is used for dynamic forms that
 * edit one record directly, like the Client, Project, and Organization edit screens.
 */
export const transformSubmitValues = ({
  definition,
  values,

  autofillNotCollected = false,
  autofillNulls = false,
  autofillBooleans = false,
}: TransformSubmitValuesParams) => {
  const result: Record<string, any> = {};

  // Recursive helper for traversing the FormDefinition
  function recursiveTransformValues(
    items: FormItem[],
    values: Record<string, any>,
    transformed: Record<string, any> // result map to be filled in
  ) {
    items.forEach((item: FormItem) => {
      if (Array.isArray(item.item)) {
        recursiveTransformValues(item.item, values, transformed);
      }

      const key = item.queryField;
      if (!key) return;

      let value;
      if (item.linkId in values) {
        // Transform into gql value, for example Date -> YYYY-MM-DD string
        value = formValueToGqlValue(values[item.linkId], item);
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
      if (
        autofillBooleans &&
        isNil(transformed[key]) &&
        item.type === ItemType.Boolean
      ) {
        transformed[key] = false;
      }
    });
  }

  recursiveTransformValues(definition.item || [], values, result);

  return result;
};

/**
 * Create initial form values. This is used for dynamic forms that
 * edit one record directly, like the Client, Project, and Organization edit screens.
 *
 * @param definition FormDefinition
 * @param record  GQL HMIS record, like Project or Organization
 *
 * @returns initial form state, ready to pass to DynamicForm as initialValues
 */
export const createInitialValues = (
  definition: FormDefinitionJson,
  record: any
): Record<string, any> => {
  const initialValues: Record<string, any> = {};

  // Recursive helper for traversing the FormDefinition
  function recursiveFillInValues(
    items: FormItem[],
    record: Record<string, any>,
    values: Record<string, any> // intialValues object to be filled in
  ) {
    items.forEach((item: FormItem) => {
      if (Array.isArray(item.item)) {
        recursiveFillInValues(item.item, record, values);
      }
      // Skip: this question doesn't map to a field
      if (!item.queryField) return;

      // Skip: the record doesn't have a value for this property
      const key = item.queryField;
      if (!record.hasOwnProperty(key)) return;

      if (
        record[key] &&
        [ItemType.Choice, ItemType.OpenChoice].includes(item.type) &&
        item.pickListReference
      ) {
        // This is a value for a choice item, like 'PSH', so transform it to the option object
        const option = (
          localResolvePickList(item.pickListReference) || []
        ).find((opt) => opt.code === record[key]);
        values[item.linkId] = option || { code: record[key] };
      } else if (
        item.type === ItemType.Date &&
        typeof record[key] === 'string'
      ) {
        // Convert date string to Date object
        values[item.linkId] = parseHmisDateString(record[key]);
      } else {
        // Set the property directly as the initial form value
        values[item.linkId] = record[key];
      }
    });
  }

  recursiveFillInValues(definition.item || [], record, initialValues);

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
 * @param item FormItem that we're deciding whether to enable or not
 * @returns boolean
 */
export const shouldEnableItem = (
  dependentQuestionValue: any,
  item: FormItem
) => {
  if (!item.enableWhen) return true;

  const currentValue = isPickListOption(dependentQuestionValue)
    ? dependentQuestionValue.code
    : undefined;
  if (!currentValue) return false;

  // If there is a value, evaluate all enableWhen conditions
  const booleans = item.enableWhen.map((en) => {
    const comparisonValue = en.answerCode;
    if (
      typeof currentValue === 'undefined' ||
      typeof comparisonValue === 'undefined'
    ) {
      return false;
    }
    switch (en.operator) {
      case EnableOperator.Equal:
        return currentValue === comparisonValue;
    }
    console.warn('Unsupported enableWhen operator', en.operator);
    return false;
  });

  if (item.enableBehavior === EnableBehavior.Any) {
    return booleans.some(Boolean);
  } else {
    return booleans.every(Boolean);
  }
};
