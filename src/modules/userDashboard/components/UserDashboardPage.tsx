import { Grid } from '@mui/material';
import Loading from '@/components/elements/Loading';
import PageContainer from '@/components/layout/PageContainer';
import NotFound from '@/components/pages/NotFound';
import useAuth from '@/modules/auth/hooks/useAuth';
import { useUser } from '@/modules/dataFetching/hooks/useUser';
import YourClients from '@/modules/staffAssignment/components/YourClients';
import YourReferrals from '@/modules/userDashboard/components/YourReferrals';
import { useGetUserDashboardConfigQuery } from '@/types/gqlTypes';

const UserDashboardPage = () => {
  const { user: { id } = {} } = useAuth();
  // Session storage doesn't store the user's firstName, so fetch with graphql
  const { user } = useUser(id);

  const { data, loading, error } = useGetUserDashboardConfigQuery({
    fetchPolicy: 'cache-first',
  });

  const showStaffAssignment =
    data?.userDashboard.userDashboardConfig.showStaffAssignment;
  const showReferrals = data?.userDashboard.userDashboardConfig.showReferrals;

  if (loading) return <Loading />;
  if (error) throw error;
  if (!showStaffAssignment && !showReferrals) return <NotFound />;

  return (
    <PageContainer
      title={'HMIS Dashboard'}
      overlineText={`${user.firstName} ${user.lastName}`}
      maxWidth={showStaffAssignment && showReferrals ? 'xl' : 'lg'}
    >
      <Grid container spacing={2}>
        {showStaffAssignment && (
          <Grid item xs={12} lg={showReferrals ? 7 : 12}>
            <YourClients />
          </Grid>
        )}
        {showReferrals && (
          <Grid item xs={12} lg={showStaffAssignment ? 5 : 12}>
            <YourReferrals />
          </Grid>
        )}
      </Grid>
    </PageContainer>
  );
};

export default UserDashboardPage;
