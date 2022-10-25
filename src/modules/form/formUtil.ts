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

const isDataNotCollected = (s: string) => s.endsWith('_NOT_COLLECTED');

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
    return Object.entries(hmisEnum)
      .filter(([code]) => !isDataNotCollected(code))
      .map(([code, label]) => ({
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

const dataNotCollectedCode = (item: FormItem): string | undefined => {
  const options = resolveOptionList(item) || [];

  return options.find(
    (opt) => isDataNotCollected(opt.code) || opt.code === 'NOT_APPLICABLE'
  )?.code;
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

// Convert gql value into value for form state
const getFormValue = (value: any | null | undefined, item: FormItem) => {
  if (isNil(value)) return value;

  switch (item.type) {
    case ItemType.Date:
      return parseHmisDateString(value);

    case ItemType.Choice:
    case ItemType.OpenChoice:
      if (value && isDataNotCollected(value)) {
        return null;
      }
      if (item.pickListReference) {
        // This is a value for a choice item, like 'PSH', so transform it to the option object
        const option = (
          localResolvePickList(item.pickListReference) || []
        ).find((opt) => opt.code === value);
        return option || { code: value };
      }
      if (item.pickListOptions) {
        const option = item.pickListOptions.find((opt) => opt.code === value);
        if (!option)
          console.error(
            `Value '${value}' does not match answer options for question '${item.linkId}'`
          );
        return option || { code: value };
      }
      break;

    default:
      // Set the property directly as the initial form value
      return value;
  }
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
      if (!record.hasOwnProperty(item.queryField)) return;

      values[item.linkId] = getFormValue(record[item.queryField], item);
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
  item: FormItem,
  values: Record<string, any | null | undefined>
) => {
  if (!item.enableWhen) return true;

  // Evaluate all enableWhen conditions
  const booleans = item.enableWhen.map((en) => {
    const linkId = en.question;
    const dependentQuestionValue = values[linkId];
    let currentValue;
    let comparisonValue;
    if (!isNil(en.answerBoolean)) {
      currentValue = dependentQuestionValue;
      comparisonValue = en.answerBoolean;
    } else if (en.answerCode) {
      currentValue =
        dependentQuestionValue && isPickListOption(dependentQuestionValue)
          ? dependentQuestionValue.code
          : undefined;
      comparisonValue = en.answerCode;
    } else if (en.answerGroupLabel) {
      currentValue =
        dependentQuestionValue && isPickListOption(dependentQuestionValue)
          ? dependentQuestionValue.groupLabel
          : undefined;
      comparisonValue = en.answerGroupLabel;
    } else {
      console.warn('Missing answer value:', en);
    }

    let result;
    switch (en.operator) {
      case EnableOperator.Equal:
        result = currentValue === comparisonValue;
        break;
      case EnableOperator.NotEqual:
        result = currentValue !== comparisonValue;
        break;
      default:
        result = false;
        console.warn('Unsupported enableWhen operator', en.operator);
    }

    console.log(
      'COMPARING:',
      currentValue,
      en.operator,
      comparisonValue,
      '?',
      result
    );
    return result;
  });

  if (item.enableBehavior === EnableBehavior.Any) {
    return booleans.some(Boolean);
  } else {
    return booleans.every(Boolean);
  }
};
