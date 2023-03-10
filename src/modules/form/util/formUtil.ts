import { getYear, isValid, max, min } from 'date-fns';
import { compact, isNil, sum } from 'lodash-es';

import { DynamicInputCommonProps, HIDDEN_VALUE } from '../types';

import {
  age,
  formatDateForGql,
  INVALID_ENUM,
  parseHmisDateString,
} from '@/modules/hmis/hmisUtil';
import { HmisEnums } from '@/types/gqlEnums';
import {
  AutofillValue,
  BoundType,
  DataCollectedAbout,
  EnableBehavior,
  EnableOperator,
  EnableWhen,
  FormDefinitionJson,
  FormDefinitionWithJsonFragment,
  FormItem,
  InitialBehavior,
  ItemType,
  NoYesReasonsForMissingData,
  PickListOption,
  RelationshipToHoH,
  ServiceDetailType,
  ValueBound,
} from '@/types/gqlTypes';

export type FormValues = Record<string, any | null | undefined>;
export type ItemMap = Record<string, FormItem>;
export type LinkIdMap = Record<string, string[]>;
export type LocalConstants = Record<string, any>;
export const isDataNotCollected = (s?: string) =>
  s && s.endsWith('_NOT_COLLECTED');

export const isHmisEnum = (k: string): k is keyof typeof HmisEnums => {
  return k in HmisEnums;
};

export const isQuestionItem = (item: FormItem): boolean =>
  ![ItemType.Display, ItemType.Group].includes(item.type);

export function isDate(value: any | null | undefined): value is Date {
  return (
    !isNil(value) &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    typeof value.getMonth === 'function'
  );
}

export const isValidDate = (value: Date, maxYear = 1900) =>
  isDate(value) && isValid(value) && getYear(value) > maxYear;

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

export function areEqualValues(
  value1: any | null | undefined,
  value2: any | null | undefined
): boolean {
  if (isPickListOption(value1) && isPickListOption(value2)) {
    return value1.code === value2.code;
  }
  return value1 === value2;
}

export const hasMeaningfulValue = (
  value: string | object | null | undefined
): boolean => {
  if (Array.isArray(value) && value.length == 0) return false;
  if (isNil(value)) return false;
  if (value === '') return false;
  return true;
};

const localResolvePickList = (
  pickListReference: string,
  includeDataNotCollected = false
): PickListOption[] | null => {
  if (isHmisEnum(pickListReference)) {
    let values = Object.entries(HmisEnums[pickListReference]);
    if (!includeDataNotCollected) {
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
 * Convert string value to option value ({ code: "something" })
 */
export const getOptionValue = (
  value: string | null | undefined,
  item: FormItem
) => {
  if (!value) return null;
  if (isPickListOption(value)) return value;
  if (isDataNotCollected(value)) {
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
  return [
    av.valueBoolean,
    av.valueNumber,
    getOptionValue(av.valueCode, targetItem),
  ].filter((e) => !isNil(e))[0];
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
export const autofillValues = (
  item: FormItem,
  values: FormValues,
  itemMap: ItemMap
): boolean => {
  if (!item.autofillValues) return false;

  // use `some` to stop iterating when true is returned
  return item.autofillValues.some((av) => {
    // Evaluate all enableWhen conditions
    const booleans = av.autofillWhen.map((en) =>
      evaluateEnableWhen(en, values, itemMap, shouldEnableItem)
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
      // console.log(
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
 * Trasnform GraphQL value shape into form value shape
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
        // DNC gets filtered out here
        return compact(value.map((v) => getOptionValue(v, item)));
      }
      return getOptionValue(value, item);

    default:
      // Set the property directly as the initial form value
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
 */
export const formValueToGqlValue = (value: any, item: FormItem): any => {
  if (isNil(value)) return value;
  if (value === '') return undefined;

  if (item.type === ItemType.Date) {
    // Try to make sure we have a date object
    let date = value;
    if (typeof date === 'string') {
      date = parseHmisDateString(value);
    }
    if (date instanceof Date) return formatDateForGql(date) || undefined;
    // If this isn't parseable/formattable into a date, return undefined
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
  } else if ([ItemType.Choice, ItemType.OpenChoice].includes(item.type)) {
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
        // Make sure all HUD fields are present in values to begin
        if (item.fieldName && behavior !== InitialBehavior.Overwrite)
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
          if (!isNil(value)) {
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
      if (item.fieldName) {
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
export const buildAutofillDependencyMap = (itemMap: ItemMap): LinkIdMap => {
  const deps: LinkIdMap = {};
  Object.values(itemMap).forEach((item) => {
    if (!item.autofillValues) return;

    // A change in "id" may cause "item.linkId" to autofill
    function addDependency(id: string) {
      if (!deps[id]) deps[id] = [];
      if (deps[id].indexOf(item.linkId) === -1) deps[id].push(item.linkId);
    }

    item.autofillValues.forEach((av) => {
      // If this item sums other items using sumQuestions, add those dependencies
      if (av.sumQuestions) {
        av.sumQuestions.forEach((summedLinkId) => {
          addDependency(summedLinkId);
        });
      }

      // If this autofill is conditional on other items, add those dependencies
      if (av.autofillWhen) {
        av.autofillWhen.forEach((en) => {
          addDependency(en.question);
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
    if (!deps[en.question]) deps[en.question] = [];
    deps[en.question].push(linkId);
    if (en.compareQuestion) {
      if (!deps[en.compareQuestion]) deps[en.compareQuestion] = [];
      deps[en.compareQuestion].push(linkId);
    }

    // If this item is dependent on another item being enabled,
    // recusively add those to its dependency list
    if (en.operator === EnableOperator.Enabled) {
      (itemMap[en.question].enableWhen || []).forEach((en2) =>
        addEnableWhen(linkId, en2)
      );
    }
  }

  Object.values(itemMap).forEach((item) => {
    if (!item.enableWhen) return;
    item.enableWhen.forEach((en) => addEnableWhen(item.linkId, en));
  });
  return deps;
};

/**
 * List of link IDs that should be disabled, based on provided form values
 */
export const getDisabledLinkIds = (
  itemMap: ItemMap,
  values: FormValues
): string[] => {
  return Object.keys(itemMap).filter(
    (linkId) => !shouldEnableItem(itemMap[linkId], values, itemMap)
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
 */
export const applyDataCollectedAbout = (
  items: FormDefinitionWithJsonFragment['definition']['item'],
  client: ClientNameDobVeteranFields,
  relationshipToHoH: RelationshipToHoH
) =>
  items.filter((item) => {
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
          (clientAge && clientAge >= 18)
        );
      case DataCollectedAbout.VeteranHoh:
        return (
          relationshipToHoH === RelationshipToHoH.SelfHeadOfHousehold &&
          client.veteranStatus === NoYesReasonsForMissingData.Yes
        );
      default:
        return true;
    }
  });

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
  const options = resolveOptionList(item, true) || [];

  return options.find(
    (opt) => isDataNotCollected(opt.code) || opt.code === 'NOT_APPLICABLE'
  )?.code;
};

type TransformSubmitValuesParams = {
  definition: FormDefinitionJson;
  /** form state (from DynamicForm) to transform */
  values: FormValues;
  /** ONLY transform the assessment date field */
  assessmentDateOnly?: boolean;
  /** whether to fill unanswered boolean questions `false` */
  autofillBooleans?: boolean;
  /** whether to fill unanswered questions with Data Not Collected option (if present) */
  autofillNotCollected?: boolean;
  /** whether to fill unanswered questions with `null` */
  autofillNulls?: boolean;
  /** key results field name (instead of link ID) */
  keyByFieldName?: boolean;
  /** set value to HIDDEN if link id is not present in values */
  autofillHidden?: boolean;
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
  assessmentDateOnly = false,
  autofillBooleans = false,
  autofillNotCollected = false,
  autofillNulls = false,
  keyByFieldName = false,
  autofillHidden = false,
}: TransformSubmitValuesParams) => {
  // Recursive helper for traversing the FormDefinition
  function rescursiveFillMap(
    items: FormItem[],
    result: Record<string, any>,
    currentRecord?: string
  ) {
    items.forEach((item: FormItem) => {
      if (Array.isArray(item.item)) {
        const recordName = item.recordType
          ? HmisEnums.RelatedRecordType[item.recordType]
          : currentRecord;
        rescursiveFillMap(item.item, result, recordName);
      }
      if (!item.fieldName) return;
      if (assessmentDateOnly && !item.assessmentDate) return;

      // Build key for result map
      let key = keyByFieldName ? item.fieldName : item.linkId;
      // Prefix key like "Enrollment.livingSituation"
      if (keyByFieldName && currentRecord) key = `${currentRecord}.${key}`;

      let value;
      if (item.linkId in values) {
        // Transform into gql value, for example Date -> YYYY-MM-DD string
        value = formValueToGqlValue(values[item.linkId], item);
      } else if (autofillHidden) {
        result[key] = HIDDEN_VALUE;
        return;
      }

      if (typeof value !== 'undefined') {
        result[key] = value;
      }

      if (autofillNotCollected && isNil(value)) {
        // If we don't have a value, fill in Not Collected code if present
        const notCollectedCode = findDataNotCollectedCode(item);
        if (notCollectedCode) result[key] = notCollectedCode;
      }
      if (autofillNulls && isNil(result[key])) {
        result[key] = null;
      }
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
  itemMap: Record<string, FormItem>,
  record: any
): Record<string, any> => {
  const initialValues: Record<string, any> = {};

  Object.values(itemMap).forEach((item) => {
    // Skip: this question doesn't map to a field
    if (!item.fieldName) return;

    // Skip: the record doesn't have a value for this property
    if (!record.hasOwnProperty(item.fieldName)) return;

    initialValues[item.linkId] = gqlValueToFormValue(
      record[item.fieldName],
      item
    );
  });

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
  definition: FormDefinitionJson,
  values: FormValues
): FormValues => {
  const itemMap = getItemMap(definition, false);
  const initialValues: FormValues = {};
  Object.values(itemMap).forEach((item) => {
    if (!values.hasOwnProperty(item.linkId)) return;
    initialValues[item.linkId] = gqlValueToFormValue(values[item.linkId], item);
  });
  return initialValues;
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
    // autofillNulls: true,
    keyByFieldName: true,
    autofillHidden: true,
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

  console.log('%c FORM STATE:', 'color: #BB7AFF');
  if (transformValuesFn) {
    console.log(transformValuesFn(values, definition));
  } else {
    console.log(values);
  }

  let hudValues = transformSubmitValues({
    definition,
    values,
    autofillNotCollected: true,
    autofillNulls: true,
    keyByFieldName: true,
  });

  if (transformHudValuesFn) {
    hudValues = transformHudValuesFn(values, definition);
  }

  window.debug = { hudValues };
  console.log('%c HUD VALUES BY FIELD NAME:', 'color: #BB7AFF');
  console.log(hudValues);

  return true;
};
