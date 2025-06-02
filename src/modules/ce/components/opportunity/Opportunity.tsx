import { Grid, Paper, Typography } from '@mui/material';
import React, { useMemo } from 'react';
import MatchRuleGrid from './MatchRuleGrid';
import CommonTabs from '@/components/elements/CommonTabs';
import Loading from '@/components/elements/Loading';
import PageTitle from '@/components/layout/PageTitle';
import NotFound from '@/components/pages/NotFound';
import useSafeParams from '@/hooks/useSafeParams';
import OpportunityBanner from '@/modules/ce/components/opportunity/OpportunityBanner';
import PrioritizedClientsTable from '@/modules/ce/components/opportunity/PrioritizedClientsTable';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import {
  useGetCeOpportunityCandidatesQuery,
  useGetCeOpportunityQuery,
} from '@/types/gqlTypes';

interface Props {}
const Opportunity: React.FC<Props> = ({}) => {
  const { opportunityId, projectId } = useSafeParams() as {
    opportunityId: string;
    projectId: string;
  };

  const { project } = useProjectDashboardContext();

  const {
    data: { ceOpportunity: opportunity } = {},
    loading,
    error,
  } = useGetCeOpportunityQuery({
    variables: {
      id: opportunityId,
    },
  });

  // query for the opportunity's top candidate here, rather than inside the OpportunityBanner,
  // so we can batch it with the above query for the Opportunity
  const {
    data: { ceOpportunity } = {},
    loading: topCandidateLoading,
    error: topCandidateError,
  } = useGetCeOpportunityCandidatesQuery({
    variables: {
      opportunityId: opportunityId,
      limit: 1,
    },
  });

  const topCandidate = useMemo(() => {
    if (!ceOpportunity || ceOpportunity.candidates.nodes.length === 0) {
      return undefined;
    }

    return ceOpportunity.candidates.nodes[0];
  }, [ceOpportunity]);

  const tabDefinitions = useMemo(() => {
    if (!opportunity) return [];
    const defs = [];

    if (project.access.canViewUnits) {
      // just for symmetry; should already be the case if opportunity was returned
      defs.push({
        title: 'Overview',
        key: 'overview',
        contents: (
          <Grid container columnSpacing={2} rowSpacing={4}>
            <Grid item xs={12}>
              <OpportunityBanner
                topCandidate={topCandidate}
                opportunity={opportunity}
              />
            </Grid>
            {opportunity.eligibilityRequirements && (
              <Grid item xs={12} md={6}>
                <MatchRuleGrid
                  title='Requirements'
                  rules={opportunity.eligibilityRequirements}
                />
              </Grid>
            )}
            {opportunity.priorityScheme && (
              <Grid item xs={12} md={6}>
                <MatchRuleGrid
                  title='Prioritization'
                  rules={[opportunity.priorityScheme]}
                />
              </Grid>
            )}
          </Grid>
        ),
      });
    }

    if (project.access.canViewPrioritizedClientLists) {
      defs.push({
        title: 'Eligible Clients',
        key: 'clients',
        contents: (
          <Paper>
            <PrioritizedClientsTable
              opportunityId={opportunityId}
              projectId={projectId}
              status={opportunity.status}
            />
          </Paper>
        ),
      });
    }

    return defs;
  }, [
    opportunity,
    opportunityId,
    project.access.canViewPrioritizedClientLists,
    project.access.canViewUnits,
    projectId,
    topCandidate,
  ]);

  if (loading || topCandidateLoading) return <Loading />;
  if (error) throw error;
  if (topCandidateError) throw topCandidateError;
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
        ariaLabel={'Eligible Clients and Details tabs'}
        tabDefinitions={tabDefinitions}
      />
    </>
  );
};

export default Opportunity;
