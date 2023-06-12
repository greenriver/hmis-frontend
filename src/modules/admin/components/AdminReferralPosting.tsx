import { Grid, Stack } from '@mui/material';
import { useParams } from 'react-router-dom';

import AdminReferralPostingDetails from './AdminReferralPostingDetails';

import { CommonCard } from '@/components/elements/CommonCard';
import { CommonLabeledTextBlock } from '@/components/elements/CommonLabeledTextBlock';
import Loading from '@/components/elements/Loading';
import TitleCard from '@/components/elements/TitleCard';
import PageTitle from '@/components/layout/PageTitle';
import NotFound from '@/components/pages/NotFound';
import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import ReferralHouseholdMembersTable from '@/modules/referrals/components/ProjectReferralHouseholdMembersTable';
import { useGetReferralPostingQuery } from '@/types/gqlTypes';

const AdminReferralPosting: React.FC = () => {
  const { referralPostingId } = useParams<{ referralPostingId: string }>();
  const { data, loading, error } = useGetReferralPostingQuery({
    variables: { id: referralPostingId as any as string },
    fetchPolicy: 'network-only',
  });
  const referralPosting = data?.referralPosting;

  if (loading) {
    return <Loading />;
  }
  if (error) {
    return <ApolloErrorAlert error={error} />;
  }
  if (!referralPosting) {
    return <NotFound />;
  }

  return (
    <>
      <PageTitle title='Manage Denied Referral' />
      <Grid spacing={4} container>
        <Grid item lg={4} sm={12}>
          <CommonCard title='Referral Details' sx={{ mb: 2 }}>
            <AdminReferralPostingDetails referralPosting={referralPosting} />
          </CommonCard>
        </Grid>
        <Grid item lg={8} sm={12}>
          <Stack spacing={4}>
            <TitleCard
              title='Referred Household'
              sx={{ mb: 0 }}
              headerVariant='border'
            >
              <ReferralHouseholdMembersTable
                rows={referralPosting.householdMembers}
              />
            </TitleCard>
            <CommonCard title='Accept/Reject Denial'>
              <Stack spacing={4}>
                <CommonLabeledTextBlock title='Status Note'>
                  {referralPosting.statusNote}
                </CommonLabeledTextBlock>
              </Stack>
            </CommonCard>
          </Stack>
        </Grid>
      </Grid>
    </>
  );
};
export default AdminReferralPosting;
