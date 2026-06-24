import { Button, Stack } from '@mui/material';
import {
  ceMatchRuleOwnerLevelConfigs,
  type CeMatchRuleOwnerLevel,
} from '../ceMatchRuleOwnerLevelConfig';
import CeMatchRuleGroupHeader from './CeMatchRuleGroupHeader';
import CeMatchRuleGroupTable from './CeMatchRuleGroupTable';
import RouterLink from '@/components/elements/RouterLink';
import { AddIcon } from '@/components/elements/SemanticIcons';
import { CeMatchRuleAdminSummaryFieldsFragment } from '@/types/gqlTypes';

interface Props {
  ownerLevel: CeMatchRuleOwnerLevel;
  ownerId?: string;
  rules: CeMatchRuleAdminSummaryFieldsFragment[];
  count: number;
}

/**
 * Renders the current level of CE rule group with its header, add action, and table.
 * For collapsible inherited rule groups, see CeMatchRuleGroupsAccordion.
 */
const CeMatchRuleGroup: React.FC<Props> = ({
  ownerLevel,
  ownerId,
  rules,
  count,
}) => {
  const ownerLevelConfig = ceMatchRuleOwnerLevelConfigs[ownerLevel];
  const { Icon, label: ownerLevelLabel, getAddRulePath } = ownerLevelConfig;

  const addRulePath = getAddRulePath({ ownerId });

  return (
    <Stack gap={1.5} p={2}>
      <Stack
        direction='row'
        justifyContent='space-between'
        alignItems='center'
        width='100%'
      >
        <CeMatchRuleGroupHeader
          Icon={Icon}
          title={`${ownerLevelLabel} Rules`}
          count={count}
          variant={'current'}
        />
        {addRulePath && (
          <Button
            component={RouterLink}
            to={addRulePath}
            variant='outlined'
            startIcon={<AddIcon />}
          >
            Add {ownerLevelLabel} Rule
          </Button>
        )}
      </Stack>
      <CeMatchRuleGroupTable
        ownerLevel={ownerLevel}
        rules={rules}
        variant={'current'}
      />
    </Stack>
  );
};

export default CeMatchRuleGroup;
