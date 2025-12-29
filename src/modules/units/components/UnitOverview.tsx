import { Alert, Grid, Paper, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import React from 'react';

import LoadingButton from '@/components/elements/LoadingButton';
import MatchRuleCard from '@/modules/ce/components/unit/MatchRuleCard';
import OpportunityBanner from '@/modules/ce/components/unit/OpportunityBanner';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import { cache } from '@/providers/apolloClient';
import {
  CeOpportunityStatus,
  UnitDetailFieldsFragment,
  useMarkUnitsAvailableMutation,
  useMarkUnitsUnavailableMutation,
} from '@/types/gqlTypes';

interface Props {
  unit: UnitDetailFieldsFragment;
}
const UnitOverview: React.FC<Props> = ({ unit }) => {
  const { project } = useProjectDashboardContext();

  const opportunity = unit.latestOpportunity;
  const [
    markUnitAvailable,
    { loading: availableLoading, error: availableError },
  ] = useMarkUnitsAvailableMutation({
    variables: { unitIds: [unit.id] },
    onCompleted: () => cache.evict({ id: `Unit:${unit.id}` }),
  });

  const [
    markUnitUnavailable,
    { loading: unavailableLoading, error: unavailableError },
  ] = useMarkUnitsUnavailableMutation({
    variables: { unitIds: [unit.id] },
    onCompleted: () => cache.evict({ id: `Unit:${unit.id}` }),
  });

  if (availableError) throw availableError;
  if (unavailableError) throw unavailableError;

  return (
    <Grid container columnSpacing={6} rowSpacing={4}>
      {opportunity?.active && (
        <Grid item xs={12}>
          <OpportunityBanner
            topCandidate={
              opportunity.status === CeOpportunityStatus.Open
                ? opportunity.candidates.nodes[0]
                : undefined // dont pass topCandidate for locked referral
            }
            opportunity={opportunity}
          />
        </Grid>
      )}

      {unit.canBeMarkedAvailableToday && (
        <Grid item xs={12}>
          <Paper sx={{ p: 2, backgroundColor: 'primary.surface' }}>
            <Stack
              direction='row'
              spacing={2}
              alignItems='center'
              justifyContent={'space-between'}
            >
              <Typography>
                This unit is not currently accepting referrals.
              </Typography>
              {project.access.canUpdateUnitAvailability && (
                <LoadingButton
                  onClick={() => markUnitAvailable()}
                  loading={availableLoading}
                >
                  Start Accepting Referrals
                </LoadingButton>
              )}
            </Stack>
          </Paper>
        </Grid>
      )}
      {opportunity?.status === CeOpportunityStatus.Open &&
        opportunity?.stale && (
          <Grid item xs={12}>
            <Alert
              severity='warning'
              action={
                <LoadingButton
                  loading={unavailableLoading}
                  color={'warning'}
                  variant={'outlined'}
                  onClick={() => markUnitUnavailable()}
                >
                  Stop Accepting Referrals
                </LoadingButton>
              }
            >
              The requirements below may be outdated. To refresh them, stop and
              re-start accepting referrals for this unit.
            </Alert>
          </Grid>
        )}
      <Grid item xs={12} md={6}>
        <MatchRuleCard
          title='Eligibility Requirements'
          rules={unit.eligibilityRequirements || []}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <MatchRuleCard
          title='Prioritization'
          rules={unit.prioritySchemes || []}
        />
      </Grid>
    </Grid>
  );
};

export default UnitOverview;
