import { Box, Container } from '@mui/system';
import { ReactNode } from 'react';

const PageHeader = ({ children }: { children: ReactNode }) => (
  <Box sx={{ backgroundColor: '#FCFCFC' }}>
    <Container
      maxWidth='xl'
      sx={{ pt: 2, pb: 2, borderBottom: 1, borderColor: '#eee' }}
    >
      {children}
    </Container>
  </Box>
);
export default PageHeader;
