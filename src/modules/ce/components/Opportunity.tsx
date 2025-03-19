import { Grid, Paper, Typography } from '@mui/material';
import React, { useState } from 'react';
import MatchRuleGrid from './MatchRuleGrid';
import CommonTabs from '@/components/elements/CommonTabs';
import Loading from '@/components/elements/Loading';
import PageTitle from '@/components/layout/PageTitle';
import NotFound from '@/components/pages/NotFound';
import useSafeParams from '@/hooks/useSafeParams';
import OpportunityBanner from '@/modules/ce/components/OpportunityBanner';
import PrioritizedClientsTable from '@/modules/ce/components/PrioritizedClientsTable';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import { CeMatchRuleType, useGetCeOpportunityQuery } from '@/types/gqlTypes';

interface Props {}
const Opportunity: React.FC<Props> = ({}) => {
  const { opportunityId, projectId } = useSafeParams() as {
    opportunityId: string;
    projectId: string;
  };

  const { project } = useProjectDashboardContext();

  const [currentTab, setCurrentTab] = useState(0);

  const {
    data: { ceOpportunity: opportunity } = {},
    loading,
    error,
  } = useGetCeOpportunityQuery({
    variables: {
      id: opportunityId,
    },
  });

  const eligibilityRequirements = (opportunity?.rules || []).filter(
    (r) => r.type === CeMatchRuleType.EligibilityRequirement
  );
  const prioritySchemes = (opportunity?.rules || []).filter(
    (r) => r.type === CeMatchRuleType.PriorityScheme
  );

  if (loading) return <Loading />;
  if (error) throw error;
  if (!opportunity) return <NotFound />;

  if (opportunity.projectId !== projectId) {
    return <NotFound />;
  }

  return (
    <>
      <PageTitle title={opportunity.name} />
      <Typography variant='body2' mb={2}>
        {project.projectName} Opportunity
      </Typography>
      <CommonTabs
        currentTab={currentTab}
        onChangeTab={(tab) => setCurrentTab(tab)}
        ariaLabel={'Eligible Clients and Details tabs'}
        tabDefinitions={[
          {
            title: 'Overview',
            contents: (
              <Grid container columnSpacing={2} rowSpacing={4}>
                <Grid item xs={12}>
                  <OpportunityBanner
                    opportunity={opportunity}
                    viewAllEligibleClients={() => setCurrentTab(1)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <MatchRuleGrid
                    title='Requirements'
                    rules={eligibilityRequirements}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <MatchRuleGrid
                    title='Prioritization'
                    rules={prioritySchemes}
                  />
                </Grid>
              </Grid>
            ),
          },
          {
            title: 'Eligible Clients',
            contents: (
              <Paper>
                {/*todo @martha - discuss showing current referral and status here */}
                <PrioritizedClientsTable
                  opportunityId={opportunityId}
                  status={opportunity.status}
                />
              </Paper>
            ),
          },
        ]}
      />
    </>
  );
};

export default Opportunity;
