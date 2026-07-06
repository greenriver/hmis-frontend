import {
  ceMatchRuleOwnerLevelConfigs,
  getCeMatchRuleOwnerLevelByOwnerType,
} from '../ceMatchRuleOwnerLevelConfig';
import { CeMatchRuleGroupFieldsFragment } from '@/types/gqlTypes';

export const getCeMatchRuleGroupCount = (
  group?: CeMatchRuleGroupFieldsFragment
) => group?.rules.length || 0;

/**
 * Builds stable accordion keys from owner identity.
 * Strictly speaking, this is unnecessary right now, because a unit group will never be in more than one project or organization.
 * However, it could be useful in the future, for example if we enable rules owned at the Project Group level.
 */
export const getCeMatchRuleGroupKey = (group: CeMatchRuleGroupFieldsFragment) =>
  `${group.ownerType}-${group.ownerId || 'global'}`;

export const getCeMatchRuleGroupLabel = (
  group: CeMatchRuleGroupFieldsFragment
) =>
  ceMatchRuleOwnerLevelConfigs[
    getCeMatchRuleOwnerLevelByOwnerType(group.ownerType)
  ].label;

export const getCeMatchRuleGroupPath = (
  group: CeMatchRuleGroupFieldsFragment
) => {
  const ownerLevel = getCeMatchRuleOwnerLevelByOwnerType(group.ownerType);

  return ceMatchRuleOwnerLevelConfigs[ownerLevel].getRulesPath({
    ownerId: group.ownerId || undefined,
  });
};
