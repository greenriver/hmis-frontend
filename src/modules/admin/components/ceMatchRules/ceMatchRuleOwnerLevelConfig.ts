import { SvgIconProps } from '@mui/material';
import { ComponentType } from 'react';
import { generatePath } from 'react-router-dom';
import {
  GlobalIcon,
  OrganizationIcon,
  ProjectIcon,
  UnitGroupIcon,
} from '@/components/elements/SemanticIcons';
import { AdminDashboardRoutes } from '@/routes/routes';
import { CeMatchRuleOwnerType } from '@/types/gqlTypes';

type RulePathParams = {
  ownerId?: string;
};

type OwnerLevelIcon = ComponentType<SvgIconProps>;

/**
 * Defines route, API, and display behavior for each CE rule owner level.
 * Project and Unit Group entries are scaffolded ahead of their full UI support.
 */
export const ceMatchRuleOwnerLevelConfigs = {
  global: {
    ownerType: CeMatchRuleOwnerType.DataSource,
    Icon: GlobalIcon as OwnerLevelIcon,
    route: AdminDashboardRoutes.CE_RULES,
    getRulesPath: () => AdminDashboardRoutes.CE_RULES,
    getAddRulePath: () => AdminDashboardRoutes.CE_RULE_GLOBAL_NEW,
    label: 'Global',
  },
  organization: {
    ownerType: CeMatchRuleOwnerType.Organization,
    Icon: OrganizationIcon as OwnerLevelIcon,
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
    Icon: ProjectIcon as OwnerLevelIcon,
    route: AdminDashboardRoutes.CE_RULE_PROJECTS,
    getRulesPath: () => AdminDashboardRoutes.CE_RULE_PROJECTS,
    getAddRulePath: () => undefined,
    label: 'Project',
  },
  'unit-group': {
    ownerType: CeMatchRuleOwnerType.UnitGroup,
    Icon: UnitGroupIcon as OwnerLevelIcon,
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
