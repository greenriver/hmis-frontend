import { Stack, SvgIconProps, Typography } from '@mui/material';
import { ComponentType } from 'react';

interface Props {
  Icon: ComponentType<SvgIconProps>;
  title: string;
  count: number;
  variant?: 'current' | 'inherited';
}

/**
 * A header for a section of rules, supporting differentiated styling depending
 * on whether this section represents the current owner or an ancestor.
 */
const CeMatchRuleGroupHeader: React.FC<Props> = ({
  Icon,
  title,
  count,
  variant = 'inherited',
}) => {
  const color = variant === 'current' ? 'primary.dark' : 'text.secondary';

  return (
    <Stack direction='row' alignItems='center' gap={1} color={color}>
      <Icon fontSize='small' />
      <Typography fontWeight='600' component='h3'>
        {title} ({count})
      </Typography>
    </Stack>
  );
};

export default CeMatchRuleGroupHeader;
