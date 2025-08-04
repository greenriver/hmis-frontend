import PeopleIcon from '@mui/icons-material/People';
import { Paper, Stack, Typography } from '@mui/material';
import React, { useMemo } from 'react';
import ButtonLink from '@/components/elements/ButtonLink';
import { CommonLabeledTextBlock } from '@/components/elements/CommonLabeledTextBlock';
import { useIsMobile } from '@/hooks/useIsMobile';
import ReferralStatusChip from '@/modules/ce/components/referral/ReferralStatusChip';
import StartReferralButton from '@/modules/ce/components/unit/StartReferralButton';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import { ProjectDashboardRoutes } from '@/routes/routes';
import {
  CeCandidateFieldsFragment,
  CeOpportunityFieldsFragment,
  CeOpportunityStatus,
  CeReferralStatus,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

interface Props {
  opportunity: CeOpportunityFieldsFragment;
  topCandidate?: CeCandidateFieldsFragment;
}
const OpportunityBanner: React.FC<Props> = ({ opportunity, topCandidate }) => {
  const isTiny = useIsMobile('sm');
  const { referral } = opportunity;
  const { project } = useProjectDashboardContext();

  const header = useMemo(() => {
    if (referral?.status === CeReferralStatus.Accepted)
      return 'Accepted Referral';
    if (referral && referral.active) return 'In-Progress Referral';
    if (topCandidate) return 'Top Prioritized Client';
  }, [referral, topCandidate]);

  const clientName = useMemo(() => {
    if (referral) return referral.clientName;
    if (topCandidate) return topCandidate.clientName;
  }, [referral, topCandidate]);

  const action = useMemo(() => {
    if (referral) {
      const to = generateSafePath(ProjectDashboardRoutes.REFERRAL, {
        projectId: opportunity.projectId,
        referralId: referral.id,
      });

      if (referral.status === CeReferralStatus.Accepted) {
        return (
          <ButtonLink color='grayscale' variant='contained' to={to}>
            View Referral
          </ButtonLink>
        );
      }

      return (
        <ButtonLink to={to} color='primary' variant='contained'>
          Continue Referral
        </ButtonLink>
      );
    }

    if (topCandidate && project.access.canStartReferrals) {
      return (
        <StartReferralButton
          opportunity={opportunity}
          candidate={topCandidate}
          color='primary'
        />
      );
    }
  }, [referral, topCandidate, project.access.canStartReferrals, opportunity]);

  const linkToEligibleClients =
    opportunity &&
    opportunity.status !== CeOpportunityStatus.Closed &&
    project.access.canViewPrioritizedClientLists;

  if (!referral && !topCandidate) return;

  return (
    <>
      <Stack
        mb={2}
        alignItems='center'
        justifyContent='space-between'
        gap={2}
        direction='row'
      >
        <Typography variant='h5' component='h3'>
          {header}
        </Typography>
        {!isTiny && linkToEligibleClients && (
          <ButtonLink to={'#clients'} startIcon={<PeopleIcon />} variant='text'>
            View All Eligible Clients
          </ButtonLink>
        )}
      </Stack>
      <Paper
        sx={{
          backgroundColor:
            referral?.status === CeReferralStatus.Accepted
              ? undefined
              : 'primary.surface',
          p: 2,
        }}
      >
        <Stack
          direction='row'
          justifyContent='space-between'
          alignItems='center'
        >
          <Stack gap={4} direction={isTiny ? 'column' : 'row'}>
            <CommonLabeledTextBlock title='Client Name'>
              {clientName}
            </CommonLabeledTextBlock>
            {referral && (
              <CommonLabeledTextBlock title='Referral Status'>
                <ReferralStatusChip referral={referral} />
              </CommonLabeledTextBlock>
            )}
            {!referral && topCandidate && (
              <CommonLabeledTextBlock title='Prioritization Score'>
                {topCandidate.priorityScores.join(', ')}
              </CommonLabeledTextBlock>
            )}
          </Stack>
          {action}
        </Stack>
      </Paper>
    </>
  );
};

export default OpportunityBanner;
