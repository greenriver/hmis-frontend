import { Stack, SxProps, Typography } from '@mui/material';
import { ReactNode } from 'react';

export const LabeledTabGroup = ({
  label,
  children,
  labelSx,
}: {
  label: string;
  children: ReactNode;
  labelSx?: SxProps;
}) => (
  <Stack sx={{ height: '100%' }}>
    <Typography
      variant='caption'
      color='text.secondary'
      sx={{ height: '30%', py: 1, ...labelSx }}
    >
      {label}
    </Typography>
    {children}
  </Stack>
);

export default LabeledTabGroup;
