import { Grid, Paper, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import React from 'react';

import LoadingButton from '@/components/elements/LoadingButton';
import MatchRuleCard from '@/modules/ce/components/unit/MatchRuleCard';
import OpportunityBanner from '@/modules/ce/components/unit/OpportunityBanner';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import { cache } from '@/providers/apolloClient';
import {
  UnitDetailFieldsFragment,
  useMarkUnitsAvailableMutation,
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

  if (availableError) throw availableError;

  return (
    <Grid container columnSpacing={6} rowSpacing={4}>
      {opportunity && (
        <Grid item xs={12}>
          <OpportunityBanner
            topCandidate={opportunity.candidates.nodes[0]}
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
