import { Paper, Stack, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { To } from 'react-router-dom';
import RouterLink from '@/components/elements/RouterLink';

export interface CeMatchRuleCountSummary {
  label: string;
  count: number;
  to?: To;
}

interface Props {
  ownerName: string;
  ownerTo?: To;
  effectiveRulesCount: number;
  ruleCountSummaries: CeMatchRuleCountSummary[];
  children: ReactNode;
}

/**
 * Card displaying the effective rules for a given owner.
 * Most of the work is delegated to the children, which render
 * collapsible sections for rules grouped by their ancestors (global, project, org, etc.).
 */
const CeMatchEffectiveRulesCard: React.FC<Props> = ({
  ownerName,
  ownerTo,
  effectiveRulesCount,
  ruleCountSummaries,
  children,
}) => (
  <Paper>
    <Stack gap={1} sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
      <Typography variant='cardTitle' component='h2' fontWeight='600'>
        Effective Rules for{' '}
        {ownerTo ? (
          <RouterLink to={ownerTo}>{ownerName}</RouterLink>
        ) : (
          ownerName
        )}{' '}
        ({effectiveRulesCount})
      </Typography>
      {ownerName !== 'Global' && ( // Hide summary on the Global page, where it's redundant
        <Stack direction='row' gap={4} flexWrap='wrap'>
          {ruleCountSummaries.map(({ label, count, to }) => (
            <Typography key={label} variant='body2'>
              {to ? <RouterLink to={to}>{label}</RouterLink> : label}: {count}{' '}
              rules
            </Typography>
          ))}
        </Stack>
      )}
    </Stack>
    <Stack>{children}</Stack>
  </Paper>
);

export default CeMatchEffectiveRulesCard;
