import {
  CeMatchRuleBooleanOperator,
  CeMatchRuleClauseInput,
  CeMatchRuleComparator,
} from '@/types/gqlTypes';

export type CeMatchFieldSource = 'client' | 'custom';
export type CeMatchExpressionMode = 'structured' | 'freeText';

// Extend the submitted clause input with UI-only state collected by the form.
export interface CeMatchDraftClause extends CeMatchRuleClauseInput {
  id: string;
  source: CeMatchFieldSource | '';
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
