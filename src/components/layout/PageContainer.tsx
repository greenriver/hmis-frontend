import { Typography } from '@mui/material';
import { Container, Stack } from '@mui/system';
import { ReactNode } from 'react';

const PageContainer = ({
  children,
  title,
  actions,
}: {
  children: ReactNode;
  title: ReactNode;
  actions?: ReactNode;
}) => (
  <Container maxWidth='lg' sx={{ px: { xs: 1, sm: 3, lg: 4 }, pt: 4, pb: 6 }}>
    <Stack
      spacing={2}
      direction='row'
      justifyContent='space-between'
      sx={{ mb: 4 }}
      alignItems='center'
    >
      <Typography variant='h3'>{title}</Typography>
      {actions}
    </Stack>

    {children}
  </Container>
);
export default PageContainer;
