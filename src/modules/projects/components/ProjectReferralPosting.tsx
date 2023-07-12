import { Grid, Stack, Typography } from '@mui/material';

import { ProjectReferralPostingForm } from './ProjectReferralPostingForm';

import ButtonLink from '@/components/elements/ButtonLink';
import { CommonCard } from '@/components/elements/CommonCard';
import { CommonLabeledTextBlock } from '@/components/elements/CommonLabeledTextBlock';
import Loading from '@/components/elements/Loading';
import TitleCard from '@/components/elements/TitleCard';
import PageTitle from '@/components/layout/PageTitle';
import NotFound from '@/components/pages/NotFound';
import useSafeParams from '@/hooks/useSafeParams';
import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import ProjectReferralPostingDetails from '@/modules/projects/components/ReferralPostingDetails';
import ReferralHouseholdMembersTable from '@/modules/referrals/components/ProjectReferralHouseholdMembersTable';
import { ProjectDashboardRoutes } from '@/routes/routes';
import {
  ReferralPostingStatus,
  useGetReferralPostingQuery,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const ProjectReferralPosting: React.FC = () => {
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
            {`Referral from `}
            <b>{referralPosting.referredBy}</b>
          </Typography>
        }
      />
      <Grid spacing={4} container>
        <Grid item lg={4} sm={12}>
          <CommonCard title='Referral Details' sx={{ mb: 2 }}>
            <ProjectReferralPostingDetails referralPosting={referralPosting} />
          </CommonCard>
          <ButtonLink
            fullWidth
            variant='outlined'
            color='secondary'
            to={generateSafePath(ProjectDashboardRoutes.ESG_FUNDING_REPORT, {
              projectId: referralPosting.project?.id,
              referralPostingId,
            })}
          >
            ESG Funding Report
          </ButtonLink>
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
            {(referralPosting.referralNotes ||
              referralPosting.resourceCoordinatorNotes) && (
              <CommonCard title='Referral Notes'>
                <Stack spacing={4}>
                  {referralPosting.referralNotes && (
                    <CommonLabeledTextBlock title='Referral Notes'>
                      {referralPosting.referralNotes}
                    </CommonLabeledTextBlock>
                  )}
                  {referralPosting.resourceCoordinatorNotes && (
                    <CommonLabeledTextBlock title='Resource Coordinator Notes'>
                      {referralPosting.resourceCoordinatorNotes}
                    </CommonLabeledTextBlock>
                  )}
                </Stack>
              </CommonCard>
            )}
            <CommonCard
              title={
                referralPosting.status === ReferralPostingStatus.AssignedStatus
                  ? 'Update Referral Status'
                  : 'Referral Status'
              }
            >
              <ProjectReferralPostingForm
                referralPosting={referralPosting}
                readOnly={
                  referralPosting.status !==
                  ReferralPostingStatus.AssignedStatus
                }
              />
            </CommonCard>
          </Stack>
        </Grid>
      </Grid>
    </>
  );
};
export default ProjectReferralPosting;
