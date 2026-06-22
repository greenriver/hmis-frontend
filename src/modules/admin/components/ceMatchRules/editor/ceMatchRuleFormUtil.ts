import { HmisEnums } from '@/types/gqlEnums';
import {
  CeMatchRuleBooleanOperator,
  CeMatchRuleClauseInput,
  CeMatchRuleComparator,
  CeMatchRuleOwnerType,
} from '@/types/gqlTypes';

export type CeMatchFieldSource = 'client' | 'custom';

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

export const getPluralCeMatchRuleOwnerLevelLabel = (
  ownerLevel: CeMatchRuleOwnerLevel
) => (ownerLevel === 'unit-group' ? 'unit groups' : `${ownerLevel}s`);

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
