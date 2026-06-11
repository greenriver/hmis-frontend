import { localResolvePickList } from '@/modules/form/util/formUtil';
import { COMPARABLE_ITEM_TYPES } from '@/modules/formBuilder/formBuilderUtil';
import {
  CeMatchFieldFieldsFragment,
  CeMatchRuleBooleanOperator,
  CeMatchRuleClauseInput,
  CeMatchRuleComparator,
  PickListOption,
} from '@/types/gqlTypes';

export type CeMatchFieldSource = 'client' | 'custom';

export type CeMatchBuilderField = CeMatchFieldFieldsFragment;

export interface CeMatchDraftClause extends CeMatchRuleClauseInput {
  id: string;
  source: CeMatchFieldSource | '';
  customAssessmentFormIdentifier?: string;
}

export interface CeMatchDraftCustomAssessmentForm {
  cacheKey: string;
  identifier: string;
  title: string;
}

export const newDraftClause = (): CeMatchDraftClause => ({
  id: crypto.randomUUID(),
  source: '',
  field: '',
  comparator: CeMatchRuleComparator.Eq,
  value: '',
});

export const fieldLabel = (field: CeMatchBuilderField) =>
  field.label.trim() || field.expressionField || field.key;

export const fieldToOption = (
  field: CeMatchBuilderField,
  groupLabel?: string
): PickListOption => ({
  code: field.expressionField,
  label: fieldLabel(field),
  groupLabel,
});

export const customAssessmentFormToOption = (
  form: CeMatchDraftCustomAssessmentForm
): PickListOption => ({
  code: form.identifier,
  label: form.title,
});

export const pickListOptionsForField = (
  field?: CeMatchBuilderField
): PickListOption[] => {
  if (!field) return [];

  // Keep CE match CDED metadata aligned with FormItem: enum references are
  // resolved by the frontend, while backend pick list references are not
  // expanded here. If historical form versions used a different reference, the
  // free-text expression builder can still target those raw legacy values.
  if (field.pickListReference) {
    return localResolvePickList(field.pickListReference) || [];
  }

  return field.pickListOptions || [];
};

export const comparatorLabel = (comparator: CeMatchRuleComparator) => {
  switch (comparator) {
    case CeMatchRuleComparator.Eq:
      return 'Equals';
    case CeMatchRuleComparator.NotEq:
      return 'Does not equal';
    case CeMatchRuleComparator.Gt:
      return 'Greater than';
    case CeMatchRuleComparator.Gte:
      return 'Greater than or equal to';
    case CeMatchRuleComparator.Lt:
      return 'Less than';
    case CeMatchRuleComparator.Lte:
      return 'Less than or equal to';
    case CeMatchRuleComparator.Includes:
      return 'Includes';
    case CeMatchRuleComparator.Excludes:
      return 'Excludes';
    default:
      return comparator;
  }
};

export const comparatorOptionsForField = (
  field?: CeMatchBuilderField
): PickListOption[] => {
  if (field?.repeats) {
    return [CeMatchRuleComparator.Includes, CeMatchRuleComparator.Excludes].map(
      (code) => ({
        code,
        label: comparatorLabel(code),
      })
    );
  }

  const comparators = new Set<CeMatchRuleComparator>([
    CeMatchRuleComparator.Eq,
    CeMatchRuleComparator.NotEq,
  ]);

  if (field && COMPARABLE_ITEM_TYPES.includes(field.itemType)) {
    comparators.add(CeMatchRuleComparator.Gt);
    comparators.add(CeMatchRuleComparator.Gte);
    comparators.add(CeMatchRuleComparator.Lt);
    comparators.add(CeMatchRuleComparator.Lte);
  }

  return Array.from(comparators).map((code) => ({
    code,
    label: comparatorLabel(code),
  }));
};

export const booleanOperatorOptions: PickListOption[] = [
  { code: CeMatchRuleBooleanOperator.And, label: 'ALL' },
  { code: CeMatchRuleBooleanOperator.Or, label: 'ANY' },
];
