import { Grid } from '@mui/material';
import React from 'react';

import MatchRuleCard from '@/modules/ce/components/unit/MatchRuleCard';
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
          <MatchRuleCard
            title='Eligibility Requirements'
            rules={unit.eligibilityRequirements}
          />
        </Grid>
      )}
      {unit.priorityScheme && (
        <Grid item xs={12} md={6}>
          <MatchRuleCard title='Prioritization' rules={[unit.priorityScheme]} />
        </Grid>
      )}
    </Grid>
  );
};

export default UnitOverview;
