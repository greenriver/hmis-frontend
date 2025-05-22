import PeopleIcon from '@mui/icons-material/People';
import { Paper, Stack, Typography } from '@mui/material';
import React, { useMemo } from 'react';
import ButtonLink from '@/components/elements/ButtonLink';
import { CommonLabeledTextBlock } from '@/components/elements/CommonLabeledTextBlock';
import { useIsMobile } from '@/hooks/useIsMobile';
import BeginReferralButton from '@/modules/ce/components/BeginReferralButton';
import ReferralStatusChip from '@/modules/ce/components/ReferralStatusChip';
import { clientNameFromRecordWithOptionalClient } from '@/modules/hmis/hmisUtil';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import { ProjectDashboardRoutes } from '@/routes/routes';
import {
  CeCandidateFieldsFragment,
  CeOpportunityFieldsFragment,
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
    if (referral?.status === CeReferralStatus.Accepted) return 'Filled By';
    if (referral && referral.active) return 'In-Progress Referral';
    if (topCandidate) return 'Top Prioritization';
  }, [referral, topCandidate]);

  const clientName = useMemo(() => {
    if (referral) return clientNameFromRecordWithOptionalClient(referral);
    if (topCandidate)
      return clientNameFromRecordWithOptionalClient(topCandidate);
  }, [referral, topCandidate]);

  const action = useMemo(() => {
    if (referral) {
      const to = generateSafePath(ProjectDashboardRoutes.REFERRAL, {
        projectId: opportunity.projectId,
        opportunityId: opportunity.id,
        referralId: referral.id,
      });

      if (referral.status === CeReferralStatus.Accepted) {
        return (
          <ButtonLink color='grayscale' variant='contained' to={to}>
            View
          </ButtonLink>
        );
      }

      return (
        <ButtonLink to={to} color='primary' variant='contained'>
          Continue
        </ButtonLink>
      );
    }

    if (topCandidate && project.access.canStartReferrals) {
      return (
        <BeginReferralButton
          opportunityId={opportunity.id}
          projectId={opportunity.projectId}
          candidate={topCandidate}
          color='primary'
        />
      );
    }
  }, [
    referral,
    topCandidate,
    project.access.canStartReferrals,
    opportunity.projectId,
    opportunity.id,
  ]);

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
        {!isTiny && (
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
        <Stack direction='row' justifyContent='space-between'>
          <Stack gap={4} direction={isTiny ? 'column' : 'row'}>
            <CommonLabeledTextBlock title='Client'>
              {clientName}
            </CommonLabeledTextBlock>
            {referral && (
              <CommonLabeledTextBlock title='Status'>
                <ReferralStatusChip status={referral.status} />
              </CommonLabeledTextBlock>
            )}
            {!referral && topCandidate && (
              <CommonLabeledTextBlock title='Prioritization Score'>
                {topCandidate.priorityScore}
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
