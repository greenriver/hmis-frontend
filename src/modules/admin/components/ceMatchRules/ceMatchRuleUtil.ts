import { localResolvePickList } from '@/modules/form/util/formUtil';
import { COMPARABLE_ITEM_TYPES } from '@/modules/formBuilder/formBuilderUtil';
import {
  CeMatchFieldFieldsFragment,
  CeMatchRuleBooleanOperator,
  CeMatchRuleClauseInput,
  CeMatchRuleComparator,
  PickListOption,
  ValidationError,
} from '@/types/gqlTypes';

export type CeMatchFieldSource = 'client' | 'custom';
export type CeMatchExpressionMode = 'structured' | 'freeText';

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

export interface CeMatchRuleFormValues {
  name: string;
  mode: CeMatchExpressionMode;
  structuredExpression: {
    operator: CeMatchRuleBooleanOperator;
    clauses: CeMatchDraftClause[];
  };
  freeTextExpression: string;
}

export const defaultCeMatchRuleFormValues = (): CeMatchRuleFormValues => ({
  name: '',
  mode: 'structured',
  structuredExpression: {
    operator: CeMatchRuleBooleanOperator.And,
    clauses: [newDraftClause()],
  },
  freeTextExpression: '',
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

export interface AffectedUnitGroup {
  unitGroupId: string;
  unitGroupName: string;
  projectId: string;
  projectName: string;
  currentCandidateCount: number;
  removedCandidateCount: number;
}

const isAffectedUnitGroup = (value: unknown): value is AffectedUnitGroup =>
  !!value &&
  typeof value === 'object' &&
  typeof (value as AffectedUnitGroup).unitGroupId === 'string' &&
  typeof (value as AffectedUnitGroup).unitGroupName === 'string' &&
  typeof (value as AffectedUnitGroup).projectId === 'string' &&
  typeof (value as AffectedUnitGroup).projectName === 'string' &&
  typeof (value as AffectedUnitGroup).currentCandidateCount === 'number' &&
  typeof (value as AffectedUnitGroup).removedCandidateCount === 'number';

export const getAffectedUnitGroups = (
  warnings: ValidationError[]
): AffectedUnitGroup[] =>
  warnings.flatMap((warning) => {
    const groups = warning.data?.affectedUnitGroups;
    if (!Array.isArray(groups)) return [];
    return groups.filter(isAffectedUnitGroup);
  });
