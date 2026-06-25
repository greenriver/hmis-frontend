import {
  GlobalIcon,
  OrganizationIcon,
  ProjectIcon,
  UnitGroupIcon,
} from '@/components/elements/SemanticIcons';
import { AdminDashboardRoutes } from '@/routes/routes';
import { CeMatchRuleOwnerType } from '@/types/gqlTypes';

/**
 * Defines route, API, and display behavior for each CE rule owner level.
 */
export const ceMatchRuleOwnerLevelConfigs = {
  global: {
    ownerType: CeMatchRuleOwnerType.DataSource,
    Icon: GlobalIcon,
    route: AdminDashboardRoutes.CE_RULES,
    getRulesPath: () => AdminDashboardRoutes.CE_RULES,
    getAddRulePath: () => AdminDashboardRoutes.CE_RULE_GLOBAL_NEW,
    label: 'Global',
  },
  organization: {
    ownerType: CeMatchRuleOwnerType.Organization,
    Icon: OrganizationIcon,
    route: AdminDashboardRoutes.CE_RULE_ORGANIZATIONS,
    getRulesPath: () => undefined,
    // TODO(#7544) - return the add-path for the given org ID
    //eslint-disable-next-line @typescript-eslint/no-unused-vars
    getAddRulePath: ({ ownerId }: { ownerId?: string }) => undefined,
    label: 'Organization',
  },
  project: {
    ownerType: CeMatchRuleOwnerType.Project,
    Icon: ProjectIcon,
    route: AdminDashboardRoutes.CE_RULE_PROJECTS,
    getRulesPath: () => AdminDashboardRoutes.CE_RULE_PROJECTS,
    getAddRulePath: () => undefined,
    label: 'Project',
  },
  'unit-group': {
    ownerType: CeMatchRuleOwnerType.UnitGroup,
    Icon: UnitGroupIcon,
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

const ceMatchRuleOwnerLevelByOwnerType = Object.fromEntries(
  ceMatchRuleOwnerLevels.map((ownerLevel) => [
    ceMatchRuleOwnerLevelConfigs[ownerLevel].ownerType,
    ownerLevel,
  ])
) as Record<CeMatchRuleOwnerType, CeMatchRuleOwnerLevel>;

export const getCeMatchRuleOwnerLevelByOwnerType = (
  ownerType: CeMatchRuleOwnerType
) => ceMatchRuleOwnerLevelByOwnerType[ownerType];
