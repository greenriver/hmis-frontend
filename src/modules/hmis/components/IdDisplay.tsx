import { Box, Typography, TypographyProps } from '@mui/material';
import { ReactNode } from 'react';

interface Props extends TypographyProps {
  prefix?: string;
  value?: ReactNode;
  withoutEmphasis?: boolean;
}

const IdDisplay = ({ value, prefix, withoutEmphasis, ...props }: Props) => {
  return (
    <Typography
      variant='body2'
      color='text.disabled'
      {...props}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.8,
        ...props.sx,
      }}
    >
      {prefix ? `${prefix} ` : ''} ID:{' '}
      <Box
        component='span'
        sx={{
          fontWeight: withoutEmphasis ? undefined : 600,
          wordBreak: 'break-all',
        }}
      >
        {value}
      </Box>
    </Typography>
  );
};

export default IdDisplay;
