import { Stack, Typography } from '@mui/material';
import { TypographyProps } from '@mui/material/Typography';
import { ElementType, ReactNode } from 'react';

interface Props {
  icon: ReactNode;
  title: string;
  count: number;
  color?: TypographyProps['color'];
  component?: ElementType;
}

const CeMatchOwnerRulesHeader: React.FC<Props> = ({
  icon,
  title,
  count,
  color = 'primary.dark',
  component = 'h3',
}) => (
  <Stack direction='row' alignItems='center' gap={1}>
    {icon}
    <Typography
      variant='body1'
      fontWeight='600'
      component={component}
      color={color}
    >
      {title} ({count})
    </Typography>
  </Stack>
);

export default CeMatchOwnerRulesHeader;
