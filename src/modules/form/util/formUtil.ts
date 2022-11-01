import { isNil } from 'lodash-es';

import { parseHmisDateString } from '../../hmis/hmisUtil';

import { HmisEnums } from '@/types/gqlEnums';
import {
  EnableBehavior,
  EnableOperator,
  FormDefinitionJson,
  FormItem,
  PickListOption,
  ValueBound,
} from '@/types/gqlTypes';

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

  if (pickListReference === 'YesNoMissing') {
    return [
      { code: 'YES', label: 'Yes' },
      { code: 'NO', label: 'No' },
      { code: 'CLIENT_DOESN_T_KNOW', label: "Client doesn't know" },
      { code: 'CLIENT_REFUSED', label: 'Client refused' },
      // { code: 'DATA_NOT_COLLECTED', label: 'Data not collected' },
    ];
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
export const getItemMap = (definition: FormDefinitionJson) => {
  const allItems: Record<string, FormItem> = {};

  // Recursive helper for traversing the FormDefinition
  function rescursiveFillMap(
    items: FormItem[],
    itemMap: Record<string, FormItem>
  ) {
    items.forEach((item: FormItem) => {
      itemMap[item.linkId] = item;
      if (Array.isArray(item.item)) {
        rescursiveFillMap(item.item, itemMap);
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
  values: Record<string, any | null | undefined>,
  itemMap: Record<string, FormItem>
): boolean => {
  if (!item.enableWhen) return true;

  // Evaluate all enableWhen conditions
  const booleans = item.enableWhen.map((en) => {
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
      case EnableOperator.Exists:
        result = !isNil(currentValue);
        // flip the result if this is "not exists"
        if (en.answerBoolean === false) {
          result = !result;
        }
        break;
      case EnableOperator.Enabled:
        const dependentItem = itemMap[linkId];
        result = shouldEnableItem(dependentItem, values, itemMap);
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
  });

  // console.log(item.linkId, booleans);
  if (item.enableBehavior === EnableBehavior.Any) {
    return booleans.some(Boolean);
  } else {
    return booleans.every(Boolean);
  }
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
  definition: FormDefinitionJson
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
      console.log(item.initial);
      // FIXME handle multiple initials for multi-select questions
      const initial = item.initial[0];
      if (initial.valueBoolean) values[item.linkId] = initial.valueBoolean;
      if (initial.valueNumber) values[item.linkId] = initial.valueNumber;
      if (initial.valueCode) {
        values[item.linkId] = getOptionValue(initial.valueCode, item);
      }
    });
  }

  recursiveFillInValues(definition.item || [], initialValues);

  return initialValues;
};
