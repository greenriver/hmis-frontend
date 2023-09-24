import { Grid, Stack } from '@mui/material';

import AdminReferralPostingDetails from './AdminReferralPostingDetails';
import AdminReferralPostingForm from './AdminReferralPostingForm';

import { CommonLabeledTextBlock } from '@/components/elements/CommonLabeledTextBlock';
import Loading from '@/components/elements/Loading';
import TitleCard from '@/components/elements/TitleCard';
import PageTitle from '@/components/layout/PageTitle';
import NotFound from '@/components/pages/NotFound';
import useSafeParams from '@/hooks/useSafeParams';
import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import ReferralHouseholdMembersTable from '@/modules/referrals/components/ProjectReferralHouseholdMembersTable';
import {
  ReferralPostingStatus,
  useGetReferralPostingQuery,
} from '@/types/gqlTypes';

const AdminReferralPosting: React.FC = () => {
  const { referralPostingId } = useSafeParams<{ referralPostingId: string }>();
  const { data, loading, error } = useGetReferralPostingQuery({
    variables: { id: referralPostingId as any as string },
    fetchPolicy: 'network-only',
  });
  const referralPosting = data?.referralPosting;

  if (loading) {
    return <Loading />;
  }
  if (error) {
    return <ApolloErrorAlert error={error} inline />;
  }
  if (!referralPosting) {
    return <NotFound />;
  }

  return (
    <>
      <PageTitle title='Manage Denied Referral' />
      <Grid spacing={4} container>
        <Grid item lg={4} sm={12}>
          <TitleCard title='Referral Details' sx={{ mb: 2 }} padded>
            <AdminReferralPostingDetails referralPosting={referralPosting} />
          </TitleCard>
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
            <TitleCard title='Accept/Reject Denial' padded>
              <Stack spacing={4}>
                <CommonLabeledTextBlock title='Provider Notes'>
                  {referralPosting.statusNote}
                </CommonLabeledTextBlock>
                <AdminReferralPostingForm
                  referralPosting={referralPosting}
                  readOnly={
                    referralPosting.status !=
                    ReferralPostingStatus.DeniedPendingStatus
                  }
                />
              </Stack>
            </TitleCard>
          </Stack>
        </Grid>
      </Grid>
    </>
  );
};
export default AdminReferralPosting;
