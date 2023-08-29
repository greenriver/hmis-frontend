import {
  add,
  getYear,
  isDate,
  isValid,
  max,
  min,
  startOfToday,
  sub,
} from 'date-fns';
import {
  compact,
  get,
  isArray,
  isNil,
  isObject,
  isUndefined,
  lowerFirst,
  mapValues,
  omit,
  omitBy,
  sum,
  uniq,
} from 'lodash-es';

import {
  AssessmentForPopulation,
  DynamicInputCommonProps,
  FormValues,
  HIDDEN_VALUE,
  isHmisEnum,
  isPickListOption,
  isPickListOptionArray,
  isQuestionItem,
  isTypedObject,
  isTypedObjectWithId,
  ItemMap,
  LinkIdMap,
  LocalConstants,
  TypedObject,
} from '../types';

import {
  age,
  customDataElementValueForKey,
  formatDateForGql,
  INVALID_ENUM,
  parseHmisDateString,
  safeParseDateOrString,
} from '@/modules/hmis/hmisUtil';
import { HmisEnums } from '@/types/gqlEnums';
import {
  AutofillValue,
  BoundType,
  Component,
  DataCollectedAbout,
  DisabledDisplay,
  EnableBehavior,
  EnableOperator,
  EnableWhen,
  FieldMapping,
  FormDefinitionFieldsFragment,
  FormDefinitionJson,
  FormItem,
  FullAssessmentFragment,
  InitialBehavior,
  InputSize,
  ItemType,
  NoYesReasonsForMissingData,
  PickListOption,
  RelatedRecordType,
  RelationshipToHoH,
  ServiceDetailType,
  ValueBound,
} from '@/types/gqlTypes';

export const maxWidthAtNestingLevel = (nestingLevel: number) =>
  600 - nestingLevel * 26;

export const isDataNotCollected = (val?: any): boolean => {
  if (typeof val === 'string') {
    return val.endsWith('_NOT_COLLECTED') || val.endsWith(' not collected');
  }
  if (isPickListOption(val)) return isDataNotCollected(val.code);
  return false;
};
export const yesCode = { code: 'YES', label: 'Yes' };

export const isValidDate = (value: Date, maxYear = 1900) =>
  isDate(value) && isValid(value) && getYear(value) > maxYear;

export function areEqualValues(
  value1: any | null | undefined,
  value2: any | null | undefined
): boolean {
  if (isPickListOption(value1) && isPickListOption(value2)) {
    return value1.code === value2.code;
  }
  return value1 === value2;
}

export const hasMeaningfulValue = (value: any): boolean => {
  if (Array.isArray(value) && value.length == 0) return false;
  if (isNil(value)) return false;
  if (value === '') return false;
  if (value == HIDDEN_VALUE) return false;
  return true;
};

export const localResolvePickList = (
  pickListReference: string,
  excludeDataNotCollected = false
): PickListOption[] | null => {
  if (isHmisEnum(pickListReference)) {
    let values = Object.entries(HmisEnums[pickListReference]);
    if (excludeDataNotCollected) {
      values = values.filter(([code]) => !isDataNotCollected(code));
    }
    return values
      .filter((pair) => pair[0] !== INVALID_ENUM)
      .map(([code, label]) => ({
        code: code.toString(),
        label,
      }));
  }

  return null;
};

export const isEnabled = (
  item: FormItem,
  disabledLinkIds: string[] = []
): boolean => {
  if (item.hidden) return false;
  if (!item.enableWhen && item.item) {
    // This is a group. Only show it if some children are visible.
    return item.item.some(
      (i) =>
        i.disabledDisplay !== DisabledDisplay.Hidden ||
        isEnabled(i, disabledLinkIds)
    );
  }
  return !disabledLinkIds.includes(item.linkId);
};

export const isShown = (item: FormItem, disabledLinkIds: string[] = []) => {
  const disabled = !isEnabled(item, disabledLinkIds);
  if (disabled && item.disabledDisplay === DisabledDisplay.Hidden) return false;
  return true;
};

export const resolveOptionList = (
  item: FormItem,
  excludeDataNotCollected = false
): PickListOption[] | null => {
  if (!item.pickListReference && !item.pickListOptions) return null;
  if (item.pickListOptions) return item.pickListOptions;
  if (item.pickListReference) {
    return localResolvePickList(
      item.pickListReference,
      excludeDataNotCollected
    );
  }
  return null;
};

/**
 * Convert string value to option value ({ code: "something" })
 */
export const getOptionValue = (
  value: object | string | null | undefined,
  item: FormItem
) => {
  if (!value) return null;
  if (isPickListOption(value)) return value;

  // Allow convertying object (like a Unit or Project) into a
  // pick list option; assuming 'id' is the code.
  if (isTypedObjectWithId(value)) {
    return { code: value.id };
  }

  if (typeof value !== 'string') {
    throw Error(
      `Can't get option value for ${value}, unexpected type ${typeof value}`
    );
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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
type EvaluateEnableWhenArgs = {
  en: EnableWhen;
  values: FormValues;
  itemMap: ItemMap;
  localConstants: LocalConstants;
  // pass function to avoid circular dependency
  shouldEnableFn: typeof shouldEnableItem;
};

const evaluateEnableWhen = ({
  en,
  values,
  itemMap,
  localConstants,
  shouldEnableFn,
}: EvaluateEnableWhenArgs) => {
  if (!en.question && !en.localConstant) {
    throw new Error('question or local_constant required');
  }

  // Current value
  let currentValue = en.question
    ? values[en.question]
    : en.localConstant
    ? localConstants[en.localConstant.replace('$', '')]
    : null;
  if (isPickListOption(currentValue)) {
    currentValue = en.answerGroupCode
      ? currentValue.groupCode
      : currentValue.code;
  } else if (isPickListOptionArray(currentValue)) {
    currentValue = currentValue.map((o) => o.code);
  }

  // Comparison value
  let comparisonValue: any;
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
      result = hasMeaningfulValue(currentValue);
      // flip the result if this is "not exists"
      if (en.answerBoolean === false) {
        result = !result;
      }
      break;
    case EnableOperator.Enabled:
      if (!en.question) {
        throw new Error(
          'Enabled operator must be used in conjunction with question'
        );
      }
      const dependentItem = itemMap[en.question];
      if (!dependentItem) {
        result = false; // can happen if item removed because of a 'rule'. treat as not enabled.
      } else {
        result = shouldEnableFn({
          item: dependentItem,
          values,
          itemMap,
          localConstants,
        });
      }
      // flip the result if this is "not enabled"
      if (en.answerBoolean === false) {
        result = !result;
      }
      break;
    case EnableOperator.In:
      if (Array.isArray(comparisonValue)) {
        result = !!comparisonValue.find((val) => val === currentValue);
      } else {
        console.warn("Can't use INCLUDES operator without array value");
      }
      break;
    case EnableOperator.Includes:
      if (Array.isArray(currentValue)) {
        result = !!currentValue.find((v) => v === comparisonValue);
      } else {
        console.warn("Can't use IN operator without array comparison value");
      }
      break;
    default:
      result = false;
      console.warn('Unsupported enableWhen operator', en.operator);
  }

  // console.debug(
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
type ShouldEnableItemArgs = {
  item: FormItem;
  values: FormValues;
  itemMap: ItemMap;
  localConstants: LocalConstants;
};
export const shouldEnableItem = ({
  item,
  values,
  itemMap,
  localConstants,
}: ShouldEnableItemArgs): boolean => {
  if (!item.enableWhen) return true;

  // Evaluate all enableWhen conditions
  const booleans = item.enableWhen.map((en) =>
    evaluateEnableWhen({
      en,
      values,
      itemMap,
      localConstants,
      shouldEnableFn: shouldEnableItem,
    })
  );

  // console.debug(item.linkId, booleans);
  if (item.enableBehavior === EnableBehavior.Any) {
    return booleans.some(Boolean);
  } else {
    return booleans.every(Boolean);
  }
};

export const getAutofillComparisonValue = (
  av: AutofillValue,
  values: FormValues,
  targetItem: FormItem
) => {
  // Perform summation if applicable
  if (av.sumQuestions && av.sumQuestions.length > 0) {
    const numbers = av.sumQuestions
      .map((linkId) => values[linkId])
      .map((n) => (Number.isNaN(Number(n)) ? undefined : Number(n)))
      .filter((n) => !isNil(n));
    return sum(numbers);
  }

  // Choose first present value from Boolean, Number, and Code attributes
  if (!isNil(av.valueBoolean)) return av.valueBoolean;
  if (!isNil(av.valueNumber)) return av.valueNumber;
  if (!isNil(av.valueCode)) return getOptionValue(av.valueCode, targetItem);
  if (!isNil(av.valueQuestion)) return values[av.valueQuestion];
};

/**
 * Autofill values based on changed item.
 * If there are multiple autofill rules, the first matching one is used
 * ("matching" meaning autofill_when evaluated to true).
 *
 * Changes `values` in place.
 *
 * @return boolen true if values changed
 */
type AutofillValuesArgs = {
  item: FormItem;
  values: FormValues;
  itemMap: ItemMap;
  localConstants: LocalConstants;
};
export const autofillValues = ({
  item,
  values,
  itemMap,
  localConstants,
}: AutofillValuesArgs): boolean => {
  if (!item.autofillValues) return false;

  // use `some` to stop iterating when true is returned
  return item.autofillValues.some((av) => {
    // Evaluate all enableWhen conditions
    const booleans = av.autofillWhen.map((en) =>
      evaluateEnableWhen({
        en,
        values,
        itemMap,
        shouldEnableFn: shouldEnableItem,
        localConstants,
      })
    );

    // If there were no conditions specify, it should always be autofilled
    if (booleans.length === 0) booleans.push(true);

    const shouldAutofillValue =
      av.autofillBehavior === EnableBehavior.Any
        ? booleans.some(Boolean)
        : booleans.every(Boolean);

    if (!shouldAutofillValue) return false;

    const newValue = getAutofillComparisonValue(av, values, item);

    if (!areEqualValues(values[item.linkId], newValue)) {
      // console.debug(
      //   `AUTOFILL: Changing ${item.linkId} from ${JSON.stringify(
      //     values[item.linkId]
      //   )} to ${JSON.stringify(newValue)}`,
      //   av
      // );
      values[item.linkId] = newValue;
    }

    // Stop iterating through enable when conditions
    return true;
  });
};

const getBoundValue = (
  bound: ValueBound,
  values: FormValues,
  localConstants: LocalConstants
) => {
  if (bound.question) {
    return values[bound.question];
  }
  if (bound.valueDate) {
    return parseHmisDateString(bound.valueDate);
  }
  if (bound.valueLocalConstant) {
    return localConstants[bound.valueLocalConstant.replace('$', '')];
  }
  return bound.valueNumber;
};

const compareNumOrDate = ({
  boundType,
  value,
  comparison,
  offset = 0,
}: {
  boundType: BoundType;
  value: number | Date;
  comparison?: number | Date;
  offset?: number;
}) => {
  // Add offset to value
  const date = safeParseDateOrString(value);
  if (date) {
    value = add(date, { days: offset });
  } else if (!isNaN(Number(value))) {
    value = Number(value) + offset;
  } else {
    throw new Error(
      `cannot use value ${value} as a bound, must be num or date`
    );
  }

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

export const buildCommonInputProps = ({
  item,
  values,
  localConstants,
}: {
  item: FormItem;
  values: FormValues;
  localConstants: LocalConstants;
}): DynamicInputCommonProps => {
  const inputProps: DynamicInputCommonProps = {};
  if (item.readOnly) {
    inputProps.disabled = true;
  }

  (item.bounds || []).forEach((bound) => {
    const value = getBoundValue(bound, values, localConstants);
    if (isNil(value)) return;

    const args = {
      boundType: bound.type,
      value,
      offset: bound.offset || undefined,
    };
    if (bound.type === BoundType.Min) {
      inputProps.min = compareNumOrDate({
        comparison: inputProps.min,
        ...args,
      });
    } else if (bound.type === BoundType.Max) {
      inputProps.max = compareNumOrDate({
        comparison: inputProps.max,
        ...args,
      });
    } else {
      console.warn('Unrecognized bound type', bound.type);
    }
  });

  // console.log(inputProps, localConstants);
  return inputProps;
};

const cleanTypedObject = (o: TypedObject) => {
  return omit(
    o,
    '__typename',
    'dateUpdated',
    'dateCreated',
    'dateDeleted',
    'user'
  );
};

/**
 * Transform GraphQL value shape into form value shape
 *
 * @param value GraphQL value (eg "ES" or "2020-01-01")
 * @param item Form item
 * @returns value (eg {code: "ES", label: '..' } or Date object)
 */
export const gqlValueToFormValue = (
  value: any | null | undefined,
  item: FormItem
) => {
  if (isNil(value)) return value;

  switch (item.type) {
    case ItemType.Date:
      return typeof value === 'string' ? parseHmisDateString(value) : value;
    case ItemType.Choice:
    case ItemType.OpenChoice:
      if (Array.isArray(value)) {
        return compact(value.map((v) => getOptionValue(v, item)));
      }
      return getOptionValue(value, item);

    default:
      // Set the property directly as the initial form value
      if (Array.isArray(value)) {
        return value.map((v) => (isTypedObject(v) ? cleanTypedObject(v) : v));
      } else if (isTypedObject(value)) {
        return cleanTypedObject(value);
      }

      return value;
  }
};

/**
 * Transform form value shape into GraphQL value shape.
 * For example, a selected option '{ code: 'ES' }'
 * is converted to enum 'ES'.
 *
 * @param value value from the form state
 * @param item corresponding FormDefinition item
 * @returns transformed value
 *
 * Should only return UNDEFINED if the value is somehow invalid (to ignore it).
 * If the value is "empty," return NULL to nullify it.
 */
export const formValueToGqlValue = (
  value: any,
  item: FormItem
): number | string | string[] | null | undefined => {
  if (isNil(value)) return null;
  if (value === '') return null;

  if (item.type === ItemType.Date) {
    // Try to make sure we have a date object
    let date = value;
    if (typeof date === 'string') {
      date = parseHmisDateString(value);
    }
    if (date instanceof Date) return formatDateForGql(date) || undefined;
    // This isn't parseable/formattable into a date, return undefined to ignore it
    return undefined;
  }

  if ([ItemType.Integer, ItemType.Currency].includes(item.type)) {
    const num = Number(value);
    return Number.isNaN(num) ? undefined : num;
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
  } else if (
    [ItemType.Choice, ItemType.OpenChoice].includes(item.type) ||
    item.pickListReference
  ) {
    if (Array.isArray(value)) {
      return value.map((option: PickListOption) => option.code);
    } else if (value) {
      return (value as PickListOption).code;
    }
  }

  return value;
};

/**
 * Create initial form state based on initial values specified in the form definition
 */
export const getInitialValues = (
  definition: FormDefinitionJson,
  localConstants?: LocalConstants,
  behavior?: InitialBehavior
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
      if (!item.initial) {
        // Make sure all linked fields are present in values to begin
        if (item.mapping && behavior !== InitialBehavior.Overwrite)
          values[item.linkId] = null;

        return;
      }

      // TODO handle multiple initials for multi-select questions
      const initial = item.initial[0];

      if (behavior && initial.initialBehavior !== behavior) return;

      if (!isNil(initial.valueBoolean)) {
        values[item.linkId] = initial.valueBoolean;
      } else if (!isNil(initial.valueNumber)) {
        values[item.linkId] = initial.valueNumber;
      } else if (initial.valueCode) {
        values[item.linkId] = getOptionValue(initial.valueCode, item);
      } else if (initial.valueLocalConstant) {
        const varName = initial.valueLocalConstant.replace(/^\$/, '');
        if (localConstants && varName in localConstants) {
          const value = localConstants[varName];
          if (isNil(value)) {
            // Even if there's no  value, we still want to set it to null
            // in case there are other questions that depend on its (lack of) presence.
            values[item.linkId] = null;
          } else {
            values[item.linkId] = gqlValueToFormValue(value, item) || value;
          }
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
      if (item.mapping) {
        fields.push(item);
      }
    });
  }

  const result: FormItem[] = [];
  recursiveFind(item.item || [], result);
  return result;
};

export const getAllChildLinkIds = (item: FormItem): string[] => {
  function recursiveFind(items: FormItem[], ids: string[]) {
    items.forEach((item) => {
      if (Array.isArray(item.item)) {
        recursiveFind(item.item, ids);
      }

      if (isQuestionItem(item)) {
        ids.push(item.linkId);
      }
    });
  }

  const result: string[] = [];
  recursiveFind(item.item || [], result);
  return result;
};

/**
 * Map { linkId => array of Link IDs that depend on it for autofill }
 */
export const buildAutofillDependencyMap = (
  itemMap: ItemMap,
  viewOnly = false
): LinkIdMap => {
  const deps: LinkIdMap = {};
  Object.values(itemMap).forEach((item) => {
    if (!item.autofillValues) return;

    // A change in "id" may cause "item.linkId" to autofill
    function addDependency(id: string) {
      if (!deps[id]) deps[id] = [];
      if (deps[id].indexOf(item.linkId) === -1) deps[id].push(item.linkId);
    }

    item.autofillValues.forEach((av) => {
      if (viewOnly && !av.autofillReadonly) return;

      // If this item sums other items using sumQuestions, add those dependencies
      if (av.sumQuestions) {
        av.sumQuestions.forEach((summedLinkId) => {
          addDependency(summedLinkId);
        });
      }

      // If this autofill is conditional on other items, add those dependencies
      if (av.autofillWhen) {
        av.autofillWhen.forEach((en) => {
          if (en.question) addDependency(en.question);
          if (en.compareQuestion) addDependency(en.compareQuestion);
        });
      }
    });
  });
  return deps;
};

/**
 * Map { linkId => array of Link IDs that depend on it for enabled status }
 */
export const buildEnabledDependencyMap = (itemMap: ItemMap): LinkIdMap => {
  const deps: LinkIdMap = {};

  function addEnableWhen(linkId: string, en: EnableWhen) {
    if (en.question && itemMap[en.question]) {
      if (!deps[en.question]) deps[en.question] = [];
      deps[en.question].push(linkId);
    }
    if (en.compareQuestion && itemMap[en.compareQuestion]) {
      if (!deps[en.compareQuestion]) deps[en.compareQuestion] = [];
      deps[en.compareQuestion].push(linkId);
    }

    // If this item is dependent on another item being enabled,
    // recusively add those to its dependency list
    if (
      en.operator === EnableOperator.Enabled &&
      en.question &&
      itemMap[en.question]
    ) {
      (itemMap[en.question].enableWhen || []).forEach((en2) =>
        addEnableWhen(linkId, en2)
      );
    }
  }

  Object.values(itemMap).forEach((item) => {
    if (!item.enableWhen) return;
    item.enableWhen.forEach((en) => addEnableWhen(item.linkId, en));
  });

  // Add deps of deps to deps
  Object.keys(deps).forEach((id) => {
    deps[id].forEach((id2) => {
      if (deps[id2]) deps[id].push(...deps[id2]);
    });
    deps[id] = uniq(deps[id]);
  });
  return deps;
};

/**
 * List of link IDs that should be disabled, based on provided form values
 */
export const getDisabledLinkIds = ({
  itemMap,
  values,
  localConstants,
}: {
  itemMap: ItemMap;
  values: FormValues;
  localConstants: LocalConstants;
}): string[] => {
  return Object.keys(itemMap).filter(
    (linkId) =>
      !shouldEnableItem({
        item: itemMap[linkId],
        values,
        itemMap,
        localConstants,
      })
  );
};

/**
 * Given a list of link IDs, returns a list of the same link IDs including
 * all their descendants link IDs.
 */
export const addDescendants = (
  linkIds: string[],
  definition: FormDefinitionJson
): string[] => {
  function recurAdd(items: FormItem[], ids: string[], parentIncluded: boolean) {
    items.forEach((item: FormItem) => {
      const include = parentIncluded || ids.includes(item.linkId);
      if (include) ids.push(item.linkId);

      if (Array.isArray(item.item)) {
        recurAdd(item.item, ids, include);
      }
    });
  }

  const result: string[] = [...linkIds];
  recurAdd(definition.item, result, false);
  return result;
};

export type ClientNameDobVeteranFields = {
  dob?: string | null;
  veteranStatus: NoYesReasonsForMissingData;
};

/**
 * Apply "data collected about" filters.
 * Returns a modified copy of the definition.
 * Only checks at 2 levels of nesting.
 */
export const applyDataCollectedAbout = (
  items: FormDefinitionFieldsFragment['definition']['item'],
  client: ClientNameDobVeteranFields,
  relationshipToHoH: RelationshipToHoH
) => {
  // FIXME do a recursive check
  function isApplicable(item: FormItem) {
    if (!item.dataCollectedAbout) return true;

    switch (item.dataCollectedAbout) {
      case DataCollectedAbout.AllClients:
        return true;
      case DataCollectedAbout.Hoh:
        return relationshipToHoH === RelationshipToHoH.SelfHeadOfHousehold;
      case DataCollectedAbout.HohAndAdults:
        const clientAge = age(client);
        return (
          relationshipToHoH === RelationshipToHoH.SelfHeadOfHousehold ||
          isNil(client.dob) ||
          (!isNil(clientAge) && clientAge >= 18)
        );
      case DataCollectedAbout.VeteranHoh:
        return (
          relationshipToHoH === RelationshipToHoH.SelfHeadOfHousehold &&
          client.veteranStatus === NoYesReasonsForMissingData.Yes
        );
      default:
        return true;
    }
  }

  return items
    .map((item) => {
      if (!item.item) return item;
      const { item: childItems, ...rest } = item;
      return {
        item: childItems.filter((child) => isApplicable(child)),
        ...rest,
      };
    })
    .filter((item) => isApplicable(item));
};

/**
 * Extracts target-only fields from the form definition
 * @param definition The form definition to pull items from
 * @returns The items that are target-only
 */
export const extractClientItemsFromDefinition = (
  definition: FormDefinitionJson
) => {
  const itemMap = getItemMap(definition, false); // flattened map { linkId => item }
  const targetItems = Object.values(itemMap).filter(
    ({ serviceDetailType }) => serviceDetailType === ServiceDetailType.Client
  );

  return targetItems;
};

const findDataNotCollectedCode = (item: FormItem): string | undefined => {
  const options = resolveOptionList(item) || [];

  return options.find(
    (opt) => isDataNotCollected(opt.code) || opt.code === 'NOT_APPLICABLE'
  )?.code;
};

type TransformSubmitValuesParams = {
  definition: FormDefinitionJson;
  /** form state (from DynamicForm) to transform */
  values: FormValues;
  /** set value to `null` or `_HIDDEN` if link id is not present in values */
  includeMissingKeys?: 'AS_NULL' | 'AS_HIDDEN';
  /** whether to fill unanswered/null boolean questions `false` */
  autofillBooleans?: boolean;
  /** whether to fill unanswered/null questions with Data Not Collected option (if present) */
  autofillNotCollected?: boolean;
  /** key results field name (instead of link ID) */
  keyByFieldName?: boolean;
};

/**
 * Given the form state of a completed form, transform it into
 * query variables for a mutation. This is used for dynamic forms that
 * edit one record directly, like the Client, Project, and Organization edit screens.
 * It's also used when submitting an assessment, to generate `hudValues`
 */
export const transformSubmitValues = ({
  definition,
  values,
  includeMissingKeys,
  autofillBooleans = false,
  autofillNotCollected = false,
  keyByFieldName = false,
}: TransformSubmitValuesParams) => {
  // Recursive helper for traversing the FormDefinition
  function rescursiveFillMap(
    items: FormItem[],
    result: Record<string, any>,
    parentRecordType?: string
  ) {
    items.forEach((item: FormItem) => {
      const mapping = item.mapping || {};
      const recordType = mapping.recordType
        ? HmisEnums.RelatedRecordType[mapping.recordType]
        : parentRecordType;

      if (Array.isArray(item.item)) {
        rescursiveFillMap(item.item, result, recordType);
      }
      const fieldName = mapping.fieldName || mapping.customFieldKey;
      if (!fieldName) return; // If there is no field name, it can't be extracted so don't bother sending it

      // Build key for result map
      let key = keyByFieldName ? fieldName : item.linkId;
      // Prefix key like "Enrollment.livingSituation"
      if (keyByFieldName && recordType) key = `${recordType}.${key}`;

      // If key is already in result and has a value, skip.
      // This can occur if there are multiple questions tied to the same field,
      // with one of them hidden (eg W5 Subsidy Information)
      if (hasMeaningfulValue(result[key])) return;

      if (item.linkId in values) {
        // Transform into gql value, for example Date -> YYYY-MM-DD string
        const transformedValue = formValueToGqlValue(values[item.linkId], item);
        // Undefined indicates invalid value, so we ignore it
        if (!isUndefined(transformedValue)) result[key] = transformedValue;
      } else if (includeMissingKeys === 'AS_HIDDEN') {
        // Option: set missing fields to '_HIDDEN'
        result[key] = HIDDEN_VALUE;
        return;
      } else if (includeMissingKeys === 'AS_NULL') {
        // Option: set missing fields to null
        result[key] = null;
      }

      // Option: set null/undefined to DATA_NOT_COLLECTED
      if (autofillNotCollected && isNil(result[key])) {
        const notCollectedCode = findDataNotCollectedCode(item);
        if (notCollectedCode) result[key] = notCollectedCode;
      }

      // Option: set null/undefined boolean fields to false
      if (
        autofillBooleans &&
        isNil(result[key]) &&
        item.type === ItemType.Boolean
      ) {
        result[key] = false;
      }
    });
  }

  const result: Record<string, any> = {};
  rescursiveFillMap(definition.item, result);
  return result;
};

const getMappedValue = (record: any, mapping: FieldMapping) => {
  let relatedRecordAttribute;
  if (mapping.recordType) {
    const recordType = HmisEnums.RelatedRecordType[mapping.recordType];
    if (recordType !== record.__typename) {
      relatedRecordAttribute = lowerFirst(recordType);
      if (!record.hasOwnProperty(relatedRecordAttribute)) {
        console.error(
          `Expected record to have ${relatedRecordAttribute}`,
          mapping
        );
      }
    }
  }

  if (mapping.customFieldKey) {
    const cdes = get(
      record,
      compact([relatedRecordAttribute, 'customDataElements'])
    );
    return customDataElementValueForKey(mapping.customFieldKey, cdes);
  } else if (mapping.fieldName) {
    return get(record, compact([relatedRecordAttribute, mapping.fieldName]));
  }
};

/**
 * Create initial form values based on a record.
 * This is only used for forms that edit a record directly, like the Client, Project, and Organization edit screens.
 *
 * @param itemMap Map of linkId -> Item
 * @param record  GQL HMIS record, like Project or Organization
 *
 * @returns initial form state, ready to pass to DynamicForm as initialValues
 */
export const createInitialValuesFromRecord = (
  itemMap: ItemMap,
  record: any // could be assmt
): Record<string, any> => {
  const initialValues: Record<string, any> = {};

  Object.values(itemMap).forEach((item) => {
    if (!item.mapping) return;
    if (!item.mapping.customFieldKey && !item.mapping.fieldName) return;

    const value = getMappedValue(record, item.mapping);
    if (hasMeaningfulValue(value)) {
      initialValues[item.linkId] = gqlValueToFormValue(value, item);
    }
  });

  // console.debug('Created initial values from record', record, initialValues);
  return initialValues;
};

/**
 * Create initial form values based on saved assessment values.
 *
 * @param itemMap Map of linkId -> Item
 * @param values  Vaved value state
 *
 * @returns initial form state, ready to pass to DynamicForm as initialValues
 */
export const createInitialValuesFromSavedValues = (
  itemMap: ItemMap,
  values: FormValues
): FormValues => {
  const initialValues: FormValues = {};
  Object.values(itemMap).forEach((item) => {
    if (!values.hasOwnProperty(item.linkId)) return;
    initialValues[item.linkId] = gqlValueToFormValue(values[item.linkId], item);
  });
  return initialValues;
};

export const initialValuesFromAssessment = (
  itemMap: ItemMap,
  assessment: FullAssessmentFragment
) => {
  // If non-WIP, construct based on related records
  if (!assessment.inProgress) {
    return createInitialValuesFromRecord(itemMap, assessment);
  }
  // If WIP, construt based on stored JSON values
  if (!assessment.wipValues)
    throw Error(`WIP assessment without values: ${assessment.id}`);

  return createInitialValuesFromSavedValues(itemMap, assessment.wipValues);
};

export const createValuesForSubmit = (
  values: FormValues,
  definition: FormDefinitionJson
) => transformSubmitValues({ definition, values });

export const createHudValuesForSubmit = (
  values: FormValues,
  definition: FormDefinitionJson
) =>
  transformSubmitValues({
    definition,
    values,
    keyByFieldName: true,
    includeMissingKeys: 'AS_HIDDEN',
  });

export const debugFormValues = (
  event: React.MouseEvent<HTMLButtonElement>,
  values: FormValues,
  definition: FormDefinitionJson,
  transformValuesFn?: (
    values: FormValues,
    definition: FormDefinitionJson
  ) => FormValues,
  transformHudValuesFn?: (
    values: FormValues,
    definition: FormDefinitionJson
  ) => FormValues
) => {
  if (import.meta.env.MODE === 'production') return false;
  if (!event.ctrlKey && !event.metaKey) return false;

  // eslint-disable-next-line no-console
  console.debug('%c FORM STATE:', 'color: #BB7AFF');
  if (transformValuesFn) {
    // eslint-disable-next-line no-console
    console.debug(transformValuesFn(values, definition));
  } else {
    // eslint-disable-next-line no-console
    console.debug(values);
  }

  let hudValues = transformSubmitValues({
    definition,
    values,
    autofillNotCollected: true,
    includeMissingKeys: 'AS_NULL',
    keyByFieldName: true,
  });

  if (transformHudValuesFn) {
    hudValues = transformHudValuesFn(values, definition);
  }

  window.debug = { hudValues };
  // eslint-disable-next-line no-console
  console.debug('%c HUD VALUES BY FIELD NAME:', 'color: #BB7AFF');
  // eslint-disable-next-line no-console
  console.debug(hudValues);

  return true;
};

type GetDependentItemsDisabledStatus = {
  changedLinkIds: string[];
  localValues: any;
  enabledDependencyMap: LinkIdMap;
  itemMap: ItemMap;
  localConstants: LocalConstants;
};

export const getDependentItemsDisabledStatus = ({
  changedLinkIds,
  localValues,
  enabledDependencyMap,
  itemMap,
  localConstants,
}: GetDependentItemsDisabledStatus) => {
  const enabledLinkIds: string[] = [];
  const disabledLinkIds: string[] = [];
  // If none of these are dependencies, return immediately
  if (!changedLinkIds.find((id) => !!enabledDependencyMap[id]))
    return { enabledLinkIds, disabledLinkIds };

  changedLinkIds.forEach((changedLinkId) => {
    if (!enabledDependencyMap[changedLinkId]) return;

    // iterate through all items that are dependent on this item,
    // and see if they need to be enabled or disabled
    enabledDependencyMap[changedLinkId]
      .filter((id) => !!itemMap[id]) // can happen if removed because of a 'rule'. ignore.
      .forEach((dependentLinkId) => {
        const enabled = shouldEnableItem({
          item: itemMap[dependentLinkId],
          values: localValues,
          itemMap,
          localConstants,
        });
        if (enabled) {
          enabledLinkIds.push(dependentLinkId);
        } else {
          disabledLinkIds.push(dependentLinkId);
          // if the disabled field is hidden, nullify its value (so that related enableWhens dont consider it present).
          // this needs to happen here, rather than in the caller, because subsequent iterations of this loop
          // may depend on the presence of this item.
          if (
            itemMap[dependentLinkId].disabledDisplay !==
            DisabledDisplay.ProtectedWithValue
          ) {
            localValues[dependentLinkId] = null;
          }
        }
      });
  });

  return {
    enabledLinkIds: uniq(enabledLinkIds),
    disabledLinkIds: uniq(disabledLinkIds),
  };
};

const underscoreKey = (v: any, k: string) => k.startsWith('_');

// Remove any keys that start with "_" (those are frontend-specific values like keys that shouldnt be sent)
export const dropUnderscorePrefixedKeys = (
  obj: Record<string, any>
): Record<string, any> => {
  const cleaned = omitBy(obj, underscoreKey);
  return mapValues(cleaned, (v) =>
    isArray(v)
      ? v.map((item) => (isObject(item) ? omitBy(item, underscoreKey) : item))
      : v
  );
};

export const chooseSelectComponentType = (
  item: FormItem,
  picklistLength: number,
  isLocalPickList: boolean
): Component => {
  if (item.component) return item.component;
  if (item.repeats) return Component.Dropdown;
  if (picklistLength === 0) return Component.Dropdown;
  if (picklistLength < 4 && isLocalPickList) return Component.RadioButtons;
  return Component.Dropdown;
};

export const AlwaysPresentLocalConstants = {
  today: startOfToday(),
  age18Dob: sub(startOfToday(), { years: 18 }),
};

export const placeholderText = (item: FormItem) => {
  if (item.size === InputSize.Xsmall) return;
  const text = `Select ${item.briefText || item.text || ''}`;
  if (text.length > 30) return 'Select Response';
  return text;
};

export const getFieldOnAssessment = (
  assessment: AssessmentForPopulation,
  mapping: FieldMapping
) => {
  const recordType =
    HmisEnums.RelatedRecordType[mapping.recordType as RelatedRecordType];
  if (!recordType) {
    throw new Error(`${mapping.recordType} not a valid record type`);
  }

  const relatedRecordAttribute = lowerFirst(recordType);
  if (!assessment.hasOwnProperty(relatedRecordAttribute)) {
    throw new Error(`Expected assessment to have ${relatedRecordAttribute}`);
  }

  const record = get(assessment, relatedRecordAttribute);

  let value;
  if (mapping.fieldName) {
    value = get(record, mapping.fieldName);
  } else if (mapping.customFieldKey) {
    value = customDataElementValueForKey(
      mapping.customFieldKey,
      record.customDataElements
    );
  }

  return { record, recordType, value };
};

export const itemDefaults = {
  disabledDisplay: DisabledDisplay.Hidden,
  enableBehavior: EnableBehavior.Any,
  required: false,
  prefill: false,
  readOnly: false,
  warnIfEmpty: false,
  hidden: false,
  repeats: false,
};
