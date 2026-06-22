import { Stack, Typography } from '@mui/material';
import { ReactNode } from 'react';

interface Props {
  icon: ReactNode;
  title: string;
  count: number;
  variant?: 'current' | 'inherited';
}

/**
 * A header for a section of rules, supporting differentiated styling depending
 * on whether this section represents the current owner or an ancestor.
 */
const CeMatchRuleGroupHeader: React.FC<Props> = ({
  icon,
  title,
  count,
  variant = 'inherited',
}) => (
  <Stack direction='row' alignItems='center' gap={1}>
    {icon}
    <Typography
      variant='body1'
      fontWeight='600'
      component={variant === 'current' ? 'h3' : 'h4'}
      color={variant === 'current' ? 'primary.dark' : 'text.secondary'}
    >
      {title} ({count})
    </Typography>
  </Stack>
);

export default CeMatchRuleGroupHeader;
