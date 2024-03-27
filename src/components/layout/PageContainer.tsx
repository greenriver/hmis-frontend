import { Typography } from '@mui/material';
import { Box, Container, Stack } from '@mui/system';
import { ReactNode } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';

const PageContainer = ({
  children,
  title,
  actions,
}: {
  children: ReactNode;
  title: ReactNode;
  actions?: ReactNode;
}) => {
  const isTiny = useIsMobile('sm');
  return (
    <Container maxWidth='lg' sx={{ px: { xs: 1, sm: 3, lg: 4 }, pt: 4, pb: 6 }}>
      <Stack
        spacing={2}
        direction={isTiny ? 'column' : 'row'}
        justifyContent='space-between'
        sx={{ mb: { xs: actions ? 2 : 0, sm: 4 } }}
        alignItems={isTiny ? 'left' : 'center'}
      >
        <Typography variant='h3'>{title}</Typography>
        <Box sx={{ width: 'fit-content' }}>{actions}</Box>
      </Stack>

      {children}
    </Container>
  );
};
export default PageContainer;
