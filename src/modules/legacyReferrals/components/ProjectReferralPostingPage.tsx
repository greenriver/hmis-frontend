import { Button, Grid, Stack, Typography } from '@mui/material';

import { ProjectReferralPostingForm } from './ProjectReferralPostingForm';

import ButtonLink from '@/components/elements/ButtonLink';
import { CommonLabeledTextBlock } from '@/components/elements/CommonLabeledTextBlock';
import Loading from '@/components/elements/Loading';
import NewTabIcon from '@/components/elements/NewTabIcon';
import TitleCard from '@/components/elements/TitleCard';
import PageTitle from '@/components/layout/PageTitle';
import NotFound from '@/components/pages/NotFound';
import { useGlobalFeatureFlags } from '@/hooks/useGlobalFeatureFlags';
import useSafeParams from '@/hooks/useSafeParams';
import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import ReferralHouseholdMembersTable from '@/modules/legacyReferrals/components/ProjectReferralHouseholdMembersTable';
import ProjectReferralPostingDetails from '@/modules/legacyReferrals/components/ReferralPostingDetails';
import { fetchPreventionAssessmentReportUrl } from '@/modules/legacyReferrals/externalReportApi';
import { ProjectDashboardRoutes } from '@/routes/routes';
import {
  ReferralPostingStatus,
  useGetReferralPostingQuery,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

const ProjectReferralPostingPage: React.FC = () => {
  const {
    globalFeatureFlags: {
      externalReferralsEnabled,
      esgFundingReportEnabled,
    } = {},
  } = useGlobalFeatureFlags();
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
      <PageTitle
        title={
          <Typography component='h1' variant='h3'>
            {`Referral from `}
            <b>{referralPosting.referredBy}</b>
          </Typography>
        }
      />
      <Grid spacing={4} container>
        <Grid item lg={4} sm={12}>
          <TitleCard title='Referral Details' sx={{ mb: 2 }} padded>
            <ProjectReferralPostingDetails
              referralPosting={referralPosting}
              externalReferrals={externalReferralsEnabled}
            />
          </TitleCard>
          <Stack gap={2}>
            {esgFundingReportEnabled && (
              <ButtonLink
                fullWidth
                variant='outlined'
                to={generateSafePath(
                  ProjectDashboardRoutes.ESG_FUNDING_REPORT,
                  {
                    projectId: referralPosting.project?.id,
                    referralPostingId,
                  }
                )}
              >
                ESG Funding Report
              </ButtonLink>
            )}
            {referralPosting.referralIdentifier && (
              <Button
                fullWidth
                variant='outlined'
                target='_blank'
                href={fetchPreventionAssessmentReportUrl(
                  referralPosting.referralIdentifier
                )}
                endIcon={<NewTabIcon />}
              >
                LINK Prevention Assessment Report
              </Button>
            )}
          </Stack>
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
              <TitleCard title='Referral Notes' padded>
                <Stack spacing={4}>
                  {referralPosting.referralNotes && (
                    // only present on externalReferrals
                    <CommonLabeledTextBlock title='Referral Notes'>
                      {referralPosting.referralNotes}
                    </CommonLabeledTextBlock>
                  )}
                  {referralPosting.resourceCoordinatorNotes && (
                    // this label is specific to external referral integration. for other cases, just rely on card title
                    <CommonLabeledTextBlock
                      title={
                        externalReferralsEnabled
                          ? 'Resource Coordinator Notes'
                          : ''
                      }
                    >
                      {referralPosting.resourceCoordinatorNotes}
                    </CommonLabeledTextBlock>
                  )}
                </Stack>
              </TitleCard>
            )}
            <TitleCard
              title={
                referralPosting.status === ReferralPostingStatus.AssignedStatus
                  ? 'Update Referral Status'
                  : 'Referral Status'
              }
              padded
            >
              <ProjectReferralPostingForm
                referralPosting={referralPosting}
                readOnly={
                  referralPosting.status !==
                    ReferralPostingStatus.AssignedStatus &&
                  referralPosting.status !==
                    ReferralPostingStatus.AcceptedPendingStatus
                }
              />
            </TitleCard>
          </Stack>
        </Grid>
      </Grid>
    </>
  );
};
export default ProjectReferralPostingPage;
