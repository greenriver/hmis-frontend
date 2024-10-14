import { Stack } from '@mui/material';
import MyClients from './MyClients';
import Loading from '@/components/elements/Loading';
import PageContainer from '@/components/layout/PageContainer';
import useAuth from '@/modules/auth/hooks/useAuth';
import { useUser } from '@/modules/dataFetching/hooks/useUser';

const MyDashboardPage = () => {
  const { user: { id } = {} } = useAuth();
  // Session storage doesn't store the user's firstName, so fetch with graphql
  const { user } = useUser(id);
  if (!user) return <Loading />;

  return (
    <PageContainer title={`${user.firstName}'s Dashboard`}>
      <Stack gap={2}>
        <MyClients />
      </Stack>
    </PageContainer>
  );
};

export default MyDashboardPage;
