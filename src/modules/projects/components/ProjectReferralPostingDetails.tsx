import { Stack, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';

import { ProjectReferralHouseholdMembersTable } from './tables/ProjectReferralHouseholdMembersTable';

import { CommonCard } from '@/components/elements/CommonCard';
import { CommonLabeledTextBlock } from '@/components/elements/CommonLabeledTextBlock';
import Loading from '@/components/elements/Loading';
import PageTitle from '@/components/layout/PageTitle';
import NotFound from '@/components/pages/NotFound';
import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import { useGetReferralPostingQuery } from '@/types/gqlTypes';

const ProjectReferralPostingDetails: React.FC = () => {
  const { referralPostingId } = useParams<{ referralPostingId: string }>();
  console.info(referralPostingId);
  const { data, loading, error } = useGetReferralPostingQuery({
    variables: { id: referralPostingId as any as string },
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
      <PageTitle
        title={
          <Typography variant='h3'>
            {`Incoming Referral from `}
            <b>{referralPosting.referredBy}</b>
          </Typography>
        }
      />
      <Stack spacing={4}>
        <CommonCard title='Referred Household'>
          <ProjectReferralHouseholdMembersTable
            rows={referralPosting.householdMembers}
          />
        </CommonCard>
        <CommonCard title='Referral Notes'>
          <Stack spacing={4}>
            <CommonLabeledTextBlock title='Provider Notes'>
              {referralPosting.referralNotes}
            </CommonLabeledTextBlock>
            <CommonLabeledTextBlock title='Resource Coordinator Notes'>
              {referralPosting.resourceCoordinatorNotes}
            </CommonLabeledTextBlock>
          </Stack>
        </CommonCard>
      </Stack>
    </>
  );
};
export default ProjectReferralPostingDetails;
