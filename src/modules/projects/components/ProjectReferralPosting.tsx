import { Button, Grid, Stack, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';

import { ProjectReferralPostingDetails } from './ProjectReferralPostingDetails';
import { ProjectReferralPostingForm } from './ProjectReferralPostingForm';
import { ProjectReferralHouseholdMembersTable } from './tables/ProjectReferralHouseholdMembersTable';

import { CommonCard } from '@/components/elements/CommonCard';
import { CommonLabeledTextBlock } from '@/components/elements/CommonLabeledTextBlock';
import Loading from '@/components/elements/Loading';
import TitleCard from '@/components/elements/TitleCard';
import PageTitle from '@/components/layout/PageTitle';
import NotFound from '@/components/pages/NotFound';
import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import { useGetReferralPostingQuery } from '@/types/gqlTypes';

const ProjectReferralPosting: React.FC = () => {
  const { referralPostingId } = useParams<{ referralPostingId: string }>();
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
      <Grid spacing={4} container>
        <Grid item lg={4} sm={12}>
          <CommonCard title='Incoming Referral Details' sx={{ mb: 2 }}>
            <ProjectReferralPostingDetails referralPosting={referralPosting} />
          </CommonCard>
          <Button
            fullWidth
            variant='outlined'
            color='secondary'
            onClick={() => alert('Not yet implemented')}
          >
            ESG Funding Report
          </Button>
        </Grid>
        <Grid item lg={8} sm={12}>
          <Stack spacing={4}>
            <TitleCard title='Referred Household' sx={{ mb: 0 }}>
              <ProjectReferralHouseholdMembersTable
                rows={referralPosting.householdMembers}
              />
            </TitleCard>
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
            <CommonCard title='Update Referral Status'>
              <ProjectReferralPostingForm referralPosting={referralPosting} />
            </CommonCard>
          </Stack>
        </Grid>
      </Grid>
    </>
  );
};
export default ProjectReferralPosting;
