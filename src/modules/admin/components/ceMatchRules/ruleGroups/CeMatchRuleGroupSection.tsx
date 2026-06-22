import { Button, Stack } from '@mui/material';
import { ReactNode } from 'react';
import { generatePath } from 'react-router-dom';
import {
  CeMatchRuleOwnerLevel,
  getCeMatchRuleOwnerLevelLabel,
} from '../editor/ceMatchRuleFormUtil';
import CeMatchRuleGroupHeader from './CeMatchRuleGroupHeader';
import CeMatchRuleGroupTable from './CeMatchRuleGroupTable';
import RouterLink from '@/components/elements/RouterLink';
import { AddIcon } from '@/components/elements/SemanticIcons';
import { AdminDashboardRoutes } from '@/routes/routes';
import { CeMatchRuleAdminSummaryFieldsFragment } from '@/types/gqlTypes';

interface Props {
  ownerLevel: CeMatchRuleOwnerLevel;
  icon: ReactNode;
  rules: CeMatchRuleAdminSummaryFieldsFragment[];
  count: number;
  title?: string;
}

const CeMatchRuleGroupSection: React.FC<Props> = ({
  ownerLevel,
  icon,
  rules,
  count,
  title,
}) => {
  const ownerLevelLabel = getCeMatchRuleOwnerLevelLabel(ownerLevel);
  const heading = title || `${ownerLevelLabel} Rules`;

  return (
    <Stack gap={1.5}>
      <Stack direction='row' justifyContent='space-between' alignItems='center'>
        <CeMatchRuleGroupHeader icon={icon} title={heading} count={count} />
        <Button
          component={RouterLink}
          to={generatePath(AdminDashboardRoutes.ELIGIBILITY_RULE_NEW, {
            ownerLevel,
          })}
          variant='outlined'
          startIcon={<AddIcon />}
        >
          Add {ownerLevelLabel} Rule
        </Button>
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
