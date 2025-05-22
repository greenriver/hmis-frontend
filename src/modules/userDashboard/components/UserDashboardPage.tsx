import { Grid } from '@mui/material';
import Loading from '@/components/elements/Loading';
import PageContainer from '@/components/layout/PageContainer';
import NotFound from '@/components/pages/NotFound';
import useAuth from '@/modules/auth/hooks/useAuth';
import { useUser } from '@/modules/dataFetching/hooks/useUser';
import { useHasRootPermissions } from '@/modules/permissions/useHasPermissionsHooks';
import YourClients from '@/modules/staffAssignment/components/YourClients';
import YourReferrals from '@/modules/userDashboard/components/YourReferrals';

const UserDashboardPage = () => {
  const { user: { id } = {} } = useAuth();
  // Session storage doesn't store the user's firstName, so fetch with graphql
  const { user } = useUser(id);

  const [canHaveAssignedStaff] = useHasRootPermissions([
    'canHaveAssignedStaff',
  ]);
  const [canHaveAssignedReferralTasks] = useHasRootPermissions([
    'canHaveAssignedReferralTasks',
  ]);

  if (!user) return <Loading />;
  if (!canHaveAssignedStaff && !canHaveAssignedReferralTasks)
    return <NotFound />; // user shouldn't even see the link, but just in case

  return (
    <PageContainer
      title={'HMIS Dashboard'}
      overlineText={`${user.firstName} ${user.lastName}`}
      maxWidth={
        canHaveAssignedStaff && canHaveAssignedReferralTasks ? 'xl' : 'lg'
      }
    >
      <Grid container spacing={2}>
        {canHaveAssignedStaff && (
          <Grid item xs={12} lg={canHaveAssignedReferralTasks ? 7 : 12}>
            <YourClients />
          </Grid>
        )}
        {canHaveAssignedReferralTasks && (
          <Grid item xs={12} lg={canHaveAssignedStaff ? 5 : 12}>
            <YourReferrals />
          </Grid>
        )}
      </Grid>
    </PageContainer>
  );
};

export default UserDashboardPage;
