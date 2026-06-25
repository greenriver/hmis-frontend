import { Paper, Stack, Typography } from '@mui/material';
import { ReactNode } from 'react';

export interface CeMatchRuleCountSummary {
  label: string;
  count: number;
}

interface Props {
  ownerName: string;
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
  effectiveRulesCount,
  ruleCountSummaries,
  children,
}) => (
  <Paper>
    <Stack gap={1} sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
      <Typography variant='cardTitle' component='h2' fontWeight='600'>
        Effective Rules for {ownerName} ({effectiveRulesCount})
      </Typography>
      <Stack direction='row' gap={4} flexWrap='wrap'>
        {ruleCountSummaries.map(({ label, count }) => (
          <Typography key={label} variant='body2'>
            {label}: {count} rules
          </Typography>
        ))}
      </Stack>
    </Stack>
    <Stack>{children}</Stack>
  </Paper>
);

export default CeMatchEffectiveRulesCard;
