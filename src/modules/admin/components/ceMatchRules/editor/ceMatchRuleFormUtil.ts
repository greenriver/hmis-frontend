import {
  CeMatchRuleBooleanOperator,
  CeMatchRuleClauseInput,
  CeMatchRuleComparator,
} from '@/types/gqlTypes';

export type CeMatchFieldSource = 'client' | 'custom';

// Extend the submitted clause input with UI-only state collected by the form.
export interface CeMatchDraftClause extends CeMatchRuleClauseInput {
  id: string;
  source: CeMatchFieldSource | '';
  customAssessmentFormIdentifier?: string;
}

export interface CeMatchRuleFormValues {
  name: string;
  structuredExpression: {
    operator: CeMatchRuleBooleanOperator;
    clauses: CeMatchDraftClause[];
  };
}

export const newDraftClause = (): CeMatchDraftClause => ({
  id: crypto.randomUUID(),
  source: '',
  field: '',
  comparator: CeMatchRuleComparator.Eq,
  value: '',
});
