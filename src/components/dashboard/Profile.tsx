import { Box, Grid } from '@mui/material';

import { useDashboardClient } from '../pages/ClientDashboard';

import ClientActionsCard from '@/components/elements/ClientActionsCard';
import ClientEnrollmentCard from '@/components/elements/ClientEnrollmentCard';
import ClientProfileCard from '@/components/elements/ClientProfileCard';

const Profile = () => {
  const { client } = useDashboardClient();

  return (
    <Box data-testid='clientProfile'>
      <Grid container spacing={2}>
        <Grid item md={12} lg={6}>
          <ClientProfileCard client={client} />
        </Grid>
        <Grid item md={12} lg={6}>
          <ClientActionsCard client={client} />
          <ClientEnrollmentCard client={client} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
