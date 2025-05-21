import { Grid } from '@mui/material';
import Loading from '@/components/elements/Loading';
import PageContainer from '@/components/layout/PageContainer';
import useAuth from '@/modules/auth/hooks/useAuth';
import { useUser } from '@/modules/dataFetching/hooks/useUser';
import YourClients from '@/modules/staffAssignment/components/YourClients';
import YourReferrals from '@/modules/userDashboard/components/YourReferrals';

const UserDashboardPage = () => {
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
          <YourClients />
        </Grid>
        <Grid item xs={12} lg={5}>
          <YourReferrals />
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default UserDashboardPage;
