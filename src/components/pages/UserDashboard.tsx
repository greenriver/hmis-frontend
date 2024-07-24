import { Stack } from '@mui/material';
import PageContainer from '../layout/PageContainer';
import useAuth from '@/modules/auth/hooks/useAuth';
import MyClients from '@/modules/userDashboard/MyClients';

const UserDashboard = () => {
  const { user: currentUser } = useAuth();

  if (!currentUser) return;

  return (
    <PageContainer title={`${currentUser?.name}'s Dashboard`}>
      <Stack gap={2}>
        <MyClients />
      </Stack>
    </PageContainer>
  );
};

export default UserDashboard;
