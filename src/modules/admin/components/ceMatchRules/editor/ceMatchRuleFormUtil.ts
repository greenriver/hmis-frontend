import { HmisEnums } from '@/types/gqlEnums';
import {
  CeMatchRuleBooleanOperator,
  CeMatchRuleClauseInput,
  CeMatchRuleComparator,
  CeMatchRuleOwnerType,
} from '@/types/gqlTypes';

export type CeMatchFieldSource = 'client' | 'custom';
export type CeMatchExpressionMode = 'structured' | 'freeText';

export const ceMatchRuleOwnerTypeByRouteParam = {
  global: CeMatchRuleOwnerType.DataSource,
  organization: CeMatchRuleOwnerType.Organization,
  project: CeMatchRuleOwnerType.Project,
  'unit-group': CeMatchRuleOwnerType.UnitGroup,
};

export type CeMatchRuleOwnerLevel =
  keyof typeof ceMatchRuleOwnerTypeByRouteParam;

export const getCeMatchRuleOwnerLevelLabel = (
  ownerLevel: CeMatchRuleOwnerLevel
) =>
  HmisEnums.CeMatchRuleOwnerType[ceMatchRuleOwnerTypeByRouteParam[ownerLevel]];

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
