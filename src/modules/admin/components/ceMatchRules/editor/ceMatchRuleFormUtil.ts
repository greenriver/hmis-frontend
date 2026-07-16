import {
  CeMatchRuleBooleanOperator,
  CeMatchRuleClauseInput,
  CeMatchRuleComparator,
  CeMatchRuleDetailsFragment,
  CeMatchRuleFieldSource,
} from '@/types/gqlTypes';

export type CeMatchExpressionMode = 'structured' | 'freeText';

// Extend the submitted clause input with UI-only state collected by the form.
export interface CeMatchDraftClause extends CeMatchRuleClauseInput {
  id: string;
  source: CeMatchRuleFieldSource | '';
  customAssessmentFormIdentifier?: string;
}

export interface CeMatchRuleFormValues {
  name: string;
  mode: CeMatchExpressionMode;
  structuredExpression: {
    operator: CeMatchRuleBooleanOperator;
    clauses: CeMatchDraftClause[];
  };
  freeTextExpression: string;
}

export const newDraftClause = (): CeMatchDraftClause => ({
  id: crypto.randomUUID(),
  source: '',
  field: '',
  comparator: CeMatchRuleComparator.Eq,
  value: '',
});

export const defaultCeMatchRuleFormValues = (): CeMatchRuleFormValues => ({
  name: '',
  mode: 'structured',
  structuredExpression: {
    operator: CeMatchRuleBooleanOperator.And,
    clauses: [newDraftClause()],
  },
  freeTextExpression: '',
});

export const ceMatchRuleToFormValues = (
  rule: CeMatchRuleDetailsFragment
): CeMatchRuleFormValues => {
  const structuredExpression = rule.structuredExpression;
  if (!structuredExpression) {
    return {
      name: rule.name,
      mode: 'freeText',
      structuredExpression: defaultCeMatchRuleFormValues().structuredExpression,
      freeTextExpression: rule.expression,
    };
  }

  return {
    name: rule.name,
    mode: 'structured',
    structuredExpression: {
      operator: structuredExpression.operator,
      clauses: structuredExpression.clauses.map(
        ({
          field,
          fieldSource,
          formDefinitionIdentifier,
          comparator,
          value,
        }) => ({
          id: crypto.randomUUID(),
          source: fieldSource,
          customAssessmentFormIdentifier:
            fieldSource === CeMatchRuleFieldSource.CustomDataElement
              ? formDefinitionIdentifier || undefined
              : undefined,
          field,
          comparator,
          value,
        })
      ),
    },
    freeTextExpression: rule.expression,
  };
};
