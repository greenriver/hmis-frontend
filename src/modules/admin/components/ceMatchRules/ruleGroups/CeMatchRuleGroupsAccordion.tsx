import {
  ceMatchRuleOwnerLevelConfigs,
  getCeMatchRuleOwnerLevelByOwnerType,
} from '../ceMatchRuleOwnerLevelConfig';
import CeMatchRuleGroup from './CeMatchRuleGroup';
import CeMatchRuleGroupHeader from './CeMatchRuleGroupHeader';
import CeMatchRuleGroupTable from './CeMatchRuleGroupTable';
import {
  getCeMatchRuleGroupCount,
  getCeMatchRuleGroupKey,
} from './ceMatchRuleGroupUtil';
import SimpleAccordion from '@/components/elements/SimpleAccordion';
import { CeMatchRuleGroupFieldsFragment } from '@/types/gqlTypes';

interface Props {
  ruleGroups: CeMatchRuleGroupFieldsFragment[];
}

/**
 * Renders effective CE rule groups for an owner detail page.
 * Inherited groups are collapsible in an accordion;
 * the current owner's group is rendered directly (outside the accordion)
 * so it can include the add-rule action.
 */
const CeMatchRuleGroupsAccordion: React.FC<Props> = ({ ruleGroups }) => {
  const inheritedRuleGroups = ruleGroups.filter((group) => !group.local);
  const localRuleGroup = ruleGroups.find((group) => group.local);

  if (ruleGroups.length === 0) return null;

  return (
    <>
      {inheritedRuleGroups.length > 0 && (
        <SimpleAccordion
          items={inheritedRuleGroups.map((group) => {
            const ownerLevel = getCeMatchRuleOwnerLevelByOwnerType(
              group.ownerType
            );
            const { Icon, label } = ceMatchRuleOwnerLevelConfigs[ownerLevel];

            return {
              key: getCeMatchRuleGroupKey(group),
              header: (
                <CeMatchRuleGroupHeader
                  Icon={Icon}
                  title={`${label} Rules`}
                  count={getCeMatchRuleGroupCount(group)}
                  variant='inherited'
                />
              ),
              content: (
                <CeMatchRuleGroupTable
                  ownerLevel={ownerLevel}
                  rules={group.rules.nodes}
                  variant='inherited'
                />
              ),
            };
          })}
          // Render header and content directly, otherwise SimpleAccordion wraps them in a Typography
          renderHeader={(content) => content}
          renderContent={(content) => content}
          AccordionProps={{
            disableGutters: true,
            sx: { borderLeft: 0, borderRight: 0, borderTop: 0 },
          }}
        />
      )}
      {localRuleGroup && (
        <CeMatchRuleGroup
          ownerLevel={getCeMatchRuleOwnerLevelByOwnerType(
            localRuleGroup.ownerType
          )}
          ownerId={localRuleGroup.ownerId}
          rules={localRuleGroup.rules.nodes}
          count={getCeMatchRuleGroupCount(localRuleGroup)}
        />
      )}
    </>
  );
};

export default CeMatchRuleGroupsAccordion;
