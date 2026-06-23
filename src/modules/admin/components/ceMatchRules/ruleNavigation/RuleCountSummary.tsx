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
  <Stack direction='row' gap={3} alignItems='center' flexWrap='wrap'>
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
