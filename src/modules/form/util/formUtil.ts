import { max, min } from 'date-fns';
import { isNil } from 'lodash-es';

import { parseHmisDateString } from '../../hmis/hmisUtil';
import { DynamicInputCommonProps } from '../components/DynamicField';

import { HmisEnums } from '@/types/gqlEnums';
import {
  BoundType,
  EnableBehavior,
  EnableOperator,
  EnableWhen,
  FormDefinitionJson,
  FormItem,
  PickListOption,
  ValueBound,
} from '@/types/gqlTypes';

export type FormValues = Record<string, any | null | undefined>;
export type ItemMap = Record<string, FormItem>;
export type LocalConstants = Record<string, any>;

export const isDataNotCollected = (s: string) => s.endsWith('_NOT_COLLECTED');

export const isHmisEnum = (k: string): k is keyof typeof HmisEnums => {
  return k in HmisEnums;
};

export function isDate(value: any | null | undefined): value is Date {
  return (
    !isNil(value) &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    typeof value.getMonth === 'function'
  );
}

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

const localResolvePickList = (
  pickListReference: string,
  includeDataNotCollected = false
): PickListOption[] | null => {
  if (isHmisEnum(pickListReference)) {
    let values = Object.entries(HmisEnums[pickListReference]);
    if (!includeDataNotCollected) {
      values = values.filter(([code]) => !isDataNotCollected(code));
    }
    return values.map(([code, label]) => ({
      code: code.toString(),
      label,
    }));
  }

  return null;
};

export const resolveOptionList = (
  item: FormItem,
  includeDataNotCollected = false
): PickListOption[] | null => {
  if (!item.pickListReference && !item.pickListOptions) return null;
  if (item.pickListOptions) return item.pickListOptions;
  if (item.pickListReference) {
    return localResolvePickList(
      item.pickListReference,
      includeDataNotCollected
    );
  }
  return null;
};

/**
 * Construct LinkID->Item map, for easier lookup
 */
export const getItemMap = (
  definition: FormDefinitionJson,
  preserveNestedItems = true
) => {
  const allItems: ItemMap = {};

  // Recursive helper for traversing the FormDefinition
  function rescursiveFillMap(items: FormItem[], itemMap: ItemMap) {
    items.forEach((item: FormItem) => {
      const { item: children, ...rest } = item;
      if (preserveNestedItems) {
        itemMap[item.linkId] = item;
      } else {
        itemMap[item.linkId] = rest;
      }
      if (Array.isArray(children)) {
        rescursiveFillMap(children, itemMap);
      }
    });
  }

  rescursiveFillMap(definition.item || [], allItems);

  return allItems;
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
 * Evaluate a single `enableWhen` condition.
 * Used for enabling/disabling items AND for autofill.
 */
const evaluateEnableWhen = (
  en: EnableWhen,
  values: FormValues,
  itemMap: ItemMap,
  // pass function to avoid circular dependency
  shouldEnableFn: (
    item: FormItem,
    values: FormValues,
    itemMap: ItemMap
  ) => boolean
) => {
  const linkId = en.question;

  // Current form value to compare
  let currentValue = values[linkId];
  if (currentValue && isPickListOption(currentValue)) {
    currentValue = en.answerGroupCode
      ? currentValue.groupCode
      : currentValue.code;
  }

  // Comparison value from the form definition
  let comparisonValue;
  if (en.operator !== EnableOperator.Exists) {
    comparisonValue = [
      en.answerBoolean,
      en.answerCode,
      en.answerGroupCode,
      en.answerNumber,
      en.answerCodes,
      en.compareQuestion ? values[en.compareQuestion] : undefined,
    ].filter((e) => !isNil(e))[0];
  }

  let result;
  switch (en.operator) {
    case EnableOperator.Equal:
      result = currentValue === comparisonValue;
      break;
    case EnableOperator.NotEqual:
      result = currentValue !== comparisonValue;
      break;
    case EnableOperator.GreaterThan:
      result =
        !isNil(currentValue) &&
        !isNil(comparisonValue) &&
        currentValue > comparisonValue;
      break;
    case EnableOperator.GreaterThanEqual:
      result =
        !isNil(currentValue) &&
        !isNil(comparisonValue) &&
        currentValue >= comparisonValue;
      break;
    case EnableOperator.LessThan:
      result =
        !isNil(currentValue) &&
        !isNil(comparisonValue) &&
        currentValue < comparisonValue;
      break;
    case EnableOperator.LessThanEqual:
      result =
        !isNil(currentValue) &&
        !isNil(comparisonValue) &&
        currentValue <= comparisonValue;
      break;
    case EnableOperator.Exists:
      result = !isNil(currentValue);
      // flip the result if this is "not exists"
      if (en.answerBoolean === false) {
        result = !result;
      }
      break;
    case EnableOperator.Enabled:
      const dependentItem = itemMap[linkId];
      result = shouldEnableFn(dependentItem, values, itemMap);
      // flip the result if this is "not enabled"
      if (en.answerBoolean === false) {
        result = !result;
      }
      break;
    case EnableOperator.In:
      if (Array.isArray(comparisonValue)) {
        result = !!comparisonValue.find((val) => val === currentValue);
      } else {
        console.warn("Can't use IN operator without array comparison value");
      }
      break;
    default:
      result = false;
      console.warn('Unsupported enableWhen operator', en.operator);
  }

  // console.log(
  //   'COMPARING:',
  //   currentValue,
  //   en.operator,
  //   comparisonValue,
  //   '?',
  //   result
  // );
  return result;
};

/**
 * Decide whether an item should be enabled based on enableWhen logic.
 */
export const shouldEnableItem = (
  item: FormItem,
  values: FormValues,
  itemMap: ItemMap
): boolean => {
  if (!item.enableWhen) return true;

  // Evaluate all enableWhen conditions
  const booleans = item.enableWhen.map((en) =>
    evaluateEnableWhen(en, values, itemMap, shouldEnableItem)
  );

  // console.log(item.linkId, booleans);
  if (item.enableBehavior === EnableBehavior.Any) {
    return booleans.some(Boolean);
  } else {
    return booleans.every(Boolean);
  }
};

/**
 * Autofill values based on changed item.
 * Changes `values` in place.
 *
 * @return boolen true if values changed
 */
export const autofillValues = (
  item: FormItem,
  values: FormValues,
  itemMap: ItemMap
): boolean => {
  if (!item.autofillValues) return false;

  // use `some` to stop iterating when true is returned
  return item.autofillValues.some((av) => {
    // Evaluate all enableWhen conditions
    const booleans = (av.autofillWhen || []).map((en) =>
      evaluateEnableWhen(en, values, itemMap, shouldEnableItem)
    );

    const shouldAutofillValue =
      av.autofillBehavior === EnableBehavior.Any
        ? booleans.some(Boolean)
        : booleans.every(Boolean);

    if (shouldAutofillValue) {
      const newValue = [av.valueBoolean, av.valueCode, av.valueNumber].filter(
        (e) => !isNil(e)
      )[0];
      if (values[item.linkId] !== newValue) {
        console.log(
          `AUTOFILL: Changing ${item.linkId} from ${
            values[item.linkId]
          } to ${newValue}`
        );
        values[item.linkId] = newValue;
        return true;
      }
    }
    return false;
  });
};

export const getBoundValue = (
  bound: ValueBound,
  values: Record<string, any>
) => {
  if (bound.question) {
    return values[bound.question];
  }
  if (bound.valueDate) {
    return parseHmisDateString(bound.valueDate);
  }
  return bound.valueNumber;
};

const compareNumOrDate = (
  boundType: BoundType,
  value: number | Date,
  comparison: number | Date | undefined
) => {
  if (isNil(comparison)) return value;
  if (isDate(comparison) && isDate(value)) {
    // do inverse operation to choose the tightest bound
    return boundType === BoundType.Min
      ? max([value, comparison])
      : min([value, comparison]);
  }

  // do inverse operation to choose the tightest bound
  return boundType === BoundType.Min
    ? Math.max(value as number, comparison as number)
    : Math.min(value as number, comparison as number);
};

export const buildCommonInputProps = (
  item: FormItem,
  values: Record<string, any>
): DynamicInputCommonProps => {
  const inputProps: DynamicInputCommonProps = {};
  if (item.readOnly) {
    inputProps.disabled = true;
  }

  (item.bounds || []).forEach((bound) => {
    const value = getBoundValue(bound, values);
    if (isNil(value)) return;

    if (bound.type === BoundType.Min) {
      inputProps.min = compareNumOrDate(bound.type, value, inputProps.min);
    } else if (bound.type === BoundType.Max) {
      inputProps.max = compareNumOrDate(bound.type, value, inputProps.max);
    } else {
      console.warn('Unrecognized bound type', bound.type);
    }
  });

  return inputProps;
};

/**
 * Convert string value to option value ({ code: "something" })
 */
export const getOptionValue = (value: string, item: FormItem) => {
  if (value && isDataNotCollected(value)) {
    return null;
  }
  if (item.pickListReference) {
    // This is a value for a choice item, like 'PSH', so transform it to the option object
    const option = (localResolvePickList(item.pickListReference) || []).find(
      (opt) => opt.code === value
    );
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
  return { code: value };
};

/**
 * Create initial form state based on initial values specified in the form definition
 */
export const getInitialValues = (
  definition: FormDefinitionJson,
  localConstants?: LocalConstants
): Record<string, any> => {
  const initialValues: Record<string, any> = {};

  // Recursive helper for traversing the FormDefinition
  function recursiveFillInValues(
    items: FormItem[],
    values: Record<string, any> // intialValues object to be filled in
  ) {
    items.forEach((item: FormItem) => {
      if (Array.isArray(item.item)) {
        recursiveFillInValues(item.item, values);
      }
      if (!item.initial) return;

      // TODO handle multiple initials for multi-select questions
      const initial = item.initial[0];
      if (!isNil(initial.valueBoolean)) {
        values[item.linkId] = initial.valueBoolean;
      } else if (!isNil(initial.valueNumber)) {
        values[item.linkId] = initial.valueNumber;
      } else if (initial.valueCode) {
        values[item.linkId] = getOptionValue(initial.valueCode, item);
      } else if (initial.valueLocalConstant) {
        const varName = initial.valueLocalConstant.replace(/^\$/, '');
        if (localConstants && varName in localConstants) {
          values[item.linkId] = localConstants[varName];
        }
      }
    });
  }

  recursiveFillInValues(definition.item || [], initialValues);

  return initialValues;
};

export const getPopulatableChildren = (item: FormItem): FormItem[] => {
  function recursiveFind(items: FormItem[], fields: FormItem[]) {
    items.forEach((item) => {
      if (Array.isArray(item.item)) {
        recursiveFind(item.item, fields);
      }
      if (item.fieldName) {
        fields.push(item);
      }
    });
  }

  const result: FormItem[] = [];
  recursiveFind(item.item || [], result);
  return result;
};
