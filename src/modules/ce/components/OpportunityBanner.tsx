import PeopleIcon from '@mui/icons-material/People';
import { Button, Chip, Paper, Stack, Typography } from '@mui/material';
import React, { useMemo } from 'react';
import ButtonLink from '@/components/elements/ButtonLink';
import { CommonLabeledTextBlock } from '@/components/elements/CommonLabeledTextBlock';
import { useIsMobile } from '@/hooks/useIsMobile';
import BeginReferralButton from '@/modules/ce/components/BeginReferralButton';
import ReferralStatusChip from '@/modules/ce/components/ReferralStatusChip';
import { clientBriefName } from '@/modules/hmis/hmisUtil';
import { ProjectDashboardRoutes } from '@/routes/routes';
import { CeOpportunityFieldsFragment } from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

interface Props {
  opportunity: CeOpportunityFieldsFragment;
  viewAllEligibleClients: VoidFunction;
}
const OpportunityBanner: React.FC<Props> = ({
  opportunity,
  viewAllEligibleClients,
}) => {
  const isTiny = useIsMobile('sm');
  const { activeReferral, acceptedReferral, topCandidate } = opportunity;
  const referral = acceptedReferral || activeReferral;

  const header = useMemo(() => {
    if (acceptedReferral) return 'Filled By';
    if (activeReferral) return 'In-Progress Referral';
    if (topCandidate) return 'Top Prioritization';
  }, [acceptedReferral, activeReferral, topCandidate]);

  const clientName = useMemo(() => {
    if (referral) return clientBriefName(referral.client);
    if (topCandidate)
      return topCandidate.client ? (
        clientBriefName(topCandidate.client)
      ) : (
        <Chip label={topCandidate.id} />
      );
  }, [referral, topCandidate]);

  const action = useMemo(() => {
    if (referral) {
      const to = generateSafePath(ProjectDashboardRoutes.REFERRAL_DETAILS, {
        projectId: opportunity.projectId,
        opportunityId: opportunity.id,
        referralId: referral.id,
      });

      if (acceptedReferral) {
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

    if (topCandidate && topCandidate.client) {
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
    acceptedReferral,
    opportunity.id,
    opportunity.projectId,
    referral,
    topCandidate,
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
          <Button
            onClick={viewAllEligibleClients}
            startIcon={<PeopleIcon />}
            variant='text'
          >
            View All Eligible Clients
          </Button>
        )}
      </Stack>
      <Paper
        sx={{
          backgroundColor: acceptedReferral ? undefined : 'primary.surface',
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
