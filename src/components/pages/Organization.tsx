import { Container, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';

import PageHeader from '../layout/PageHeader';

const Organization = () => {
  const { id } = useParams() as {
    id: string;
  };
  return (
    <>
      <PageHeader>
        <Typography variant='h5'>Projects</Typography>
      </PageHeader>
      <Container maxWidth='lg' sx={{ pt: 3, pb: 6 }}>
        Organization {id}
      </Container>
    </>
  );
};
export default Organization;
