import { Chip, Stack, Typography } from '@mui/material';

/**
 * Summarizes total, local, and inherited rule counts for owner-level tables.
 */
const RuleCountSummary: React.FC<{
  total: number;
  localLabel?: string;
  localCount?: number;
  inheritedCount: number;
}> = ({ total, localLabel = 'Local', localCount, inheritedCount }) => (
  <Stack
    direction={{ xs: 'column', md: 'row' }}
    gap={{ xs: 0.5, md: 3 }}
    alignItems={{ xs: 'flex-start', md: 'center' }}
  >
    <Chip label={`${total} Rules`} size='small' sx={{ bgcolor: 'grey.100' }} />
    {localCount !== undefined && (
      <Typography variant='body2'>
        {localLabel}: {localCount}
      </Typography>
    )}
    <Typography variant='body2'>Inherited: {inheritedCount}</Typography>
  </Stack>
);

export default RuleCountSummary;
