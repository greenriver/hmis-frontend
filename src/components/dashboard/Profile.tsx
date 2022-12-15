import { Box } from '@mui/material';

import { useDashboardClient } from '../pages/ClientDashboard';

import ClientCard from '@/components/elements/ClientCard';

const Profile = () => {
  const { client } = useDashboardClient();

  return (
    <Box data-testid='clientProfile'>
      <ClientCard client={client} showEditLink />
    </Box>
  );
};

export default Profile;
