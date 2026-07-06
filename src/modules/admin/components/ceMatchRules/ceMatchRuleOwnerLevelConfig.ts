import { generatePath } from 'react-router-dom';
import {
  GlobalIcon,
  OrganizationIcon,
  ProjectIcon,
  UnitGroupIcon,
} from '@/components/elements/SemanticIcons';
import { AdminDashboardRoutes } from '@/routes/routes';
import { CeMatchRuleOwnerType } from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

interface GetRulePathArgs {
  ownerId?: string | null;
  ruleId: string;
}

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
    getRulePath: ({ ruleId }: GetRulePathArgs) =>
      generateSafePath(AdminDashboardRoutes.CE_RULE_GLOBAL_DETAIL, {
        ruleId,
      }),
    label: 'Global',
  },
  organization: {
    ownerType: CeMatchRuleOwnerType.Organization,
    Icon: OrganizationIcon,
    route: AdminDashboardRoutes.CE_RULE_ORGANIZATIONS,
    getRulesPath: ({ ownerId }: { ownerId?: string }) =>
      ownerId
        ? generatePath(AdminDashboardRoutes.CE_RULE_ORGANIZATION, {
            organizationId: ownerId,
          })
        : AdminDashboardRoutes.CE_RULE_ORGANIZATIONS,
    getAddRulePath: ({ ownerId }: { ownerId?: string }) =>
      ownerId
        ? generatePath(AdminDashboardRoutes.CE_RULE_ORGANIZATION_NEW, {
            organizationId: ownerId,
          })
        : undefined,
    getRulePath: ({ ownerId, ruleId }: GetRulePathArgs) =>
      ownerId
        ? generateSafePath(AdminDashboardRoutes.CE_RULE_ORGANIZATION_DETAIL, {
            organizationId: ownerId,
            ruleId,
          })
        : undefined,
    label: 'Organization',
  },
  project: {
    ownerType: CeMatchRuleOwnerType.Project,
    Icon: ProjectIcon,
    route: AdminDashboardRoutes.CE_RULE_PROJECTS,
    getRulesPath: ({ ownerId }: { ownerId?: string }) =>
      ownerId
        ? generatePath(AdminDashboardRoutes.CE_RULE_PROJECT, {
            projectId: ownerId,
          })
        : AdminDashboardRoutes.CE_RULE_PROJECTS,
    getAddRulePath: ({ ownerId }: { ownerId?: string }) =>
      ownerId
        ? generatePath(AdminDashboardRoutes.CE_RULE_PROJECT_NEW, {
            projectId: ownerId,
          })
        : undefined,
    getRulePath: ({ ownerId, ruleId }: GetRulePathArgs) =>
      ownerId
        ? generateSafePath(AdminDashboardRoutes.CE_RULE_PROJECT_DETAIL, {
            projectId: ownerId,
            ruleId,
          })
        : undefined,
    label: 'Project',
  },
  'unit-group': {
    ownerType: CeMatchRuleOwnerType.UnitGroup,
    Icon: UnitGroupIcon,
    route: AdminDashboardRoutes.CE_RULE_UNIT_GROUPS,
    getRulesPath: ({ ownerId }: { ownerId?: string }) =>
      ownerId
        ? generatePath(AdminDashboardRoutes.CE_RULE_UNIT_GROUP, {
            unitGroupId: ownerId,
          })
        : AdminDashboardRoutes.CE_RULE_UNIT_GROUPS,
    getAddRulePath: ({ ownerId }: { ownerId?: string }) =>
      ownerId
        ? generatePath(AdminDashboardRoutes.CE_RULE_UNIT_GROUP_NEW, {
            unitGroupId: ownerId,
          })
        : undefined,
    getRulePath: ({ ownerId, ruleId }: GetRulePathArgs) =>
      ownerId
        ? generateSafePath(AdminDashboardRoutes.CE_RULE_UNIT_GROUP_DETAIL, {
            unitGroupId: ownerId,
            ruleId,
          })
        : undefined,
    label: 'Unit Group',
  },
} as const;

export type CeMatchRuleOwnerLevel = keyof typeof ceMatchRuleOwnerLevelConfigs;

export const ceMatchRuleOwnerLevels = Object.keys(
  ceMatchRuleOwnerLevelConfigs
) as CeMatchRuleOwnerLevel[];

/**
 * Reverse lookup from OwnerType (API type) -> OwnerLevel (UI route/tab key)
 */
const ceMatchRuleOwnerLevelByOwnerType = Object.fromEntries(
  ceMatchRuleOwnerLevels.map((ownerLevel) => [
    ceMatchRuleOwnerLevelConfigs[ownerLevel].ownerType,
    ownerLevel,
  ])
) as Record<CeMatchRuleOwnerType, CeMatchRuleOwnerLevel>;

export const getCeMatchRuleOwnerLevelByOwnerType = (
  ownerType: CeMatchRuleOwnerType
) => ceMatchRuleOwnerLevelByOwnerType[ownerType];
