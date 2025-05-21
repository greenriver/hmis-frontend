import { Grid } from '@mui/material';
import Loading from '@/components/elements/Loading';
import PageContainer from '@/components/layout/PageContainer';
import useAuth from '@/modules/auth/hooks/useAuth';
import { useUser } from '@/modules/dataFetching/hooks/useUser';
import UserReferrals from '@/modules/myDashboard/components/UserReferrals';
import MyClients from '@/modules/staffAssignment/components/MyClients';

const MyDashboardPage = () => {
  const { user: { id } = {} } = useAuth();
  // Session storage doesn't store the user's firstName, so fetch with graphql
  const { user } = useUser(id);
  if (!user) return <Loading />;

  return (
    <PageContainer
      title={'HMIS Dashboard'}
      overlineText={`${user.firstName} ${user.lastName}`}
      maxWidth='xl'
    >
      <Grid container spacing={2}>
        <Grid item xs={12} lg={7}>
          <MyClients />
        </Grid>
        <Grid item xs={12} lg={5}>
          <UserReferrals />
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default MyDashboardPage;
