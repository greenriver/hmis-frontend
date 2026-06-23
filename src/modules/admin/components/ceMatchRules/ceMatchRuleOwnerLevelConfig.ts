import { generatePath } from 'react-router-dom';
import { AdminDashboardRoutes } from '@/routes/routes';
import { CeMatchRuleOwnerType } from '@/types/gqlTypes';

type RulePathParams = {
  ownerId?: string;
};

/**
 * Config object mapping CE rule owner levels to relevant routes and presentational details
 */
export const ceMatchRuleOwnerLevelConfigs = {
  global: {
    ownerType: CeMatchRuleOwnerType.DataSource,
    route: AdminDashboardRoutes.CE_RULES,
    getRulesPath: () => AdminDashboardRoutes.CE_RULES,
    getAddRulePath: () => AdminDashboardRoutes.CE_RULE_GLOBAL_NEW,
    label: 'Global',
  },
  organization: {
    ownerType: CeMatchRuleOwnerType.Organization,
    route: AdminDashboardRoutes.CE_RULE_ORGANIZATIONS,
    getRulesPath: ({ ownerId }: RulePathParams) =>
      ownerId
        ? generatePath(AdminDashboardRoutes.CE_RULE_ORGANIZATION, {
            organizationId: ownerId,
          })
        : AdminDashboardRoutes.CE_RULE_ORGANIZATIONS,
    getAddRulePath: ({ ownerId }: RulePathParams) =>
      ownerId
        ? generatePath(AdminDashboardRoutes.CE_RULE_ORGANIZATION_NEW, {
            organizationId: ownerId,
          })
        : undefined,
    label: 'Organization',
  },
  project: {
    ownerType: CeMatchRuleOwnerType.Project,
    route: AdminDashboardRoutes.CE_RULE_PROJECTS,
    getRulesPath: () => AdminDashboardRoutes.CE_RULE_PROJECTS,
    getAddRulePath: () => undefined,
    label: 'Project',
  },
  'unit-group': {
    ownerType: CeMatchRuleOwnerType.UnitGroup,
    route: AdminDashboardRoutes.CE_RULE_UNIT_GROUPS,
    getRulesPath: () => AdminDashboardRoutes.CE_RULE_UNIT_GROUPS,
    getAddRulePath: () => undefined,
    label: 'Unit Group',
  },
} as const;

export type CeMatchRuleOwnerLevel = keyof typeof ceMatchRuleOwnerLevelConfigs;

export const ceMatchRuleOwnerLevels = Object.keys(
  ceMatchRuleOwnerLevelConfigs
) as CeMatchRuleOwnerLevel[];
