import { Grid } from '@mui/material';
import React from 'react';

import MatchRuleGrid from '@/modules/ce/components/unit/MatchRuleGrid';
import OpportunityBanner from '@/modules/ce/components/unit/OpportunityBanner';
import { UnitDetailFieldsFragment } from '@/types/gqlTypes';

interface Props {
  unit: UnitDetailFieldsFragment;
}
const UnitOverview: React.FC<Props> = ({ unit }) => {
  const opportunity = unit.latestOpportunity;

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
      {unit.eligibilityRequirements && (
        <Grid item xs={12} md={6}>
          <MatchRuleGrid
            title='Eligibility Requirements'
            rules={unit.eligibilityRequirements}
          />
        </Grid>
      )}
      {unit.priorityScheme && (
        <Grid item xs={12} md={6}>
          <MatchRuleGrid title='Prioritization' rules={[unit.priorityScheme]} />
        </Grid>
      )}
    </Grid>
  );
};

export default UnitOverview;
