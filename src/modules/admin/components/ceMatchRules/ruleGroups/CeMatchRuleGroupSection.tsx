import { Button, Stack } from '@mui/material';
import { ReactNode } from 'react';
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
  icon: ReactNode;
  rules: CeMatchRuleAdminSummaryFieldsFragment[];
  count: number;
  title?: string;
  variant?: 'current' | 'inherited';
}

/**
 * todo @martha - this is a lie, collapsible is not true.  sx={{border: '5px solid red'}}
 * A collapsible section of rules, representing a single owner level,
 * wrapping the CeMatchRuleGroupTable for rules owned at this level.
 */
const CeMatchRuleGroupSection: React.FC<Props> = ({
  ownerLevel,
  ownerId,
  icon,
  rules,
  count,
  title,
  variant = 'inherited',
}) => {
  const ownerLevelConfig = ceMatchRuleOwnerLevelConfigs[ownerLevel];
  const ownerLevelLabel = ownerLevelConfig.label;
  const heading = title || `${ownerLevelLabel} Rules`;
  const addRulePath = ownerLevelConfig.getAddRulePath({ ownerId });

  return (
    <Stack gap={1.5}>
      <Stack direction='row' justifyContent='space-between' alignItems='center'>
        <CeMatchRuleGroupHeader
          icon={icon}
          title={heading}
          count={count}
          variant={variant}
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
        variant='current'
      />
    </Stack>
  );
};

export default CeMatchRuleGroupSection;
