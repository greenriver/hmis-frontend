import { Button, Stack } from '@mui/material';
import { ReactNode } from 'react';
import { generatePath } from 'react-router-dom';
import CeMatchOwnerRulesHeader from './CeMatchOwnerRulesHeader';
import CeMatchOwnerRulesTable from './CeMatchOwnerRulesTable';
import {
  CeMatchRuleOwnerLevel,
  getCeMatchRuleOwnerLevelLabel,
} from './ceMatchRuleFormUtil';
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

const CeMatchOwnerRulesCurrentLevel: React.FC<Props> = ({
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
        <CeMatchOwnerRulesHeader icon={icon} title={heading} count={count} />
        <Button
          component={RouterLink}
          to={generatePath(AdminDashboardRoutes.CE_MATCH_RULE_NEW, {
            ownerLevel,
          })}
          variant='outlined'
          startIcon={<AddIcon />}
        >
          Add {ownerLevelLabel} Rule
        </Button>
      </Stack>
      <CeMatchOwnerRulesTable
        ownerLevel={ownerLevel}
        rules={rules}
        variant='current'
      />
    </Stack>
  );
};

export default CeMatchOwnerRulesCurrentLevel;
