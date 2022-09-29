import { Typography } from '@mui/material';
import { Container } from '@mui/system';

import PageHeader from '../layout/PageHeader';

import ClientSearch from '@/modules/search/components/ClientSearch';

const Dashboard: React.FC = () => {
  return (
    <>
      <PageHeader>
        <Typography variant='h4'>Clients</Typography>
      </PageHeader>
      <Container maxWidth='xl' sx={{ pt: 3, pb: 6 }}>
        <ClientSearch cardsEnabled />
      </Container>
    </>
  );
};

export default Dashboard;
