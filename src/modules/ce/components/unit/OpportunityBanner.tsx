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
  CeOpportunityStatus,
  CeReferralStatus,
  UnitDetailFieldsFragment,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

interface Props {
  opportunity: NonNullable<UnitDetailFieldsFragment['latestOpportunity']>;
}

/**
 * Banner for displaying current status of Open or Locked opportunity
 */
const OpportunityBanner: React.FC<Props> = ({ opportunity }) => {
  const isTiny = useIsMobile('sm');
  const { referral } = opportunity;
  const { project } = useProjectDashboardContext();

  // Top prioritized candidate on the candidate pool, if this opportunity is open
  const topCandidate = useMemo(() => {
    if (opportunity.status !== CeOpportunityStatus.Open) return;
    return opportunity.candidates.nodes[0];
  }, [opportunity]);

  // Header is the current "ce status" of the unit
  const header = useMemo(() => {
    switch (opportunity.status) {
      case CeOpportunityStatus.Locked:
        return 'Referral In Progress';
      case CeOpportunityStatus.Open:
        return topCandidate ? 'Top Prioritized Client' : 'Accepting Referrals';
      default:
        throw new Error(`Unhandled opportunity status: ${opportunity.status}`);
    }
  }, [opportunity.status, topCandidate]);

  // Client name is either the name of the currently referred client (if viewable) or the name of the top candidate
  const clientName = useMemo(() => {
    if (referral) return referral.clientName;
    if (topCandidate) return topCandidate.clientName;
  }, [referral, topCandidate]);

  // Action to view in-progress referral, or start referral for new candidate
  const action = useMemo(() => {
    if (referral) {
      const to = generateSafePath(ProjectDashboardRoutes.REFERRAL, {
        projectId: opportunity.projectId,
        referralId: referral.id,
      });
      return (
        <ButtonLink to={to} color='primary' variant='contained'>
          View Referral
        </ButtonLink>
      );
    }

    const canStartReferral =
      project.access.canStartReferrals &&
      project.access.canViewReferrals &&
      opportunity.status === CeOpportunityStatus.Open;

    if (topCandidate && canStartReferral) {
      return (
        <StartReferralButton
          opportunity={opportunity}
          candidate={topCandidate}
          color='primary'
        />
      );
    }
  }, [referral, topCandidate, project.access, opportunity]);

  const linkToEligibleClients =
    opportunity &&
    opportunity.status !== CeOpportunityStatus.Closed &&
    project.access.canViewPrioritizedClientLists;

  return (
    <>
      <Stack
        alignItems='center'
        justifyContent='space-between'
        gap={2}
        mb={1}
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
      {clientName && (
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
            </Stack>
            {action}
          </Stack>
        </Paper>
      )}
    </>
  );
};

export default OpportunityBanner;
