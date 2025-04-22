import { Paper, Typography } from '@mui/material';
import React from 'react';
import DateWithRelativeTooltip from '@/components/elements/DateWithRelativeTooltip';
import { ColumnDef } from '@/components/elements/table/types';
import useClientDashboardContext from '@/modules/client/hooks/useClientDashboardContext';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import ProjectTypeChip from '@/modules/hmis/components/ProjectTypeChip';
import { useFilters } from '@/modules/hmis/filterUtil';
import { clientBriefName } from '@/modules/hmis/hmisUtil';
import { ProjectDashboardRoutes } from '@/routes/routes';
import {
  ClientCeOpportunitySummaryFieldsFragment,
  GetClientEligibleOpportunitiesDocument,
  GetClientEligibleOpportunitiesQuery,
  GetClientEligibleOpportunitiesQueryVariables,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

const COLUMNS: ColumnDef<ClientCeOpportunitySummaryFieldsFragment>[] = [
  {
    header: 'Opportunity Name',
    key: 'opportunityName',
    render: 'name',
    sticky: 'left',
  },
  {
    header: 'Project Name',
    key: 'projectName',
    render: (opportunity: ClientCeOpportunitySummaryFieldsFragment) =>
      opportunity.projectName,
  },
  {
    header: 'Project Type',
    key: 'projectType',
    render: (opportunity: ClientCeOpportunitySummaryFieldsFragment) => (
      <ProjectTypeChip projectType={opportunity.projectType} />
    ),
  },
  {
    header: 'Candidates Generated At',
    key: 'generatedAt',
    render: ({ candidatesGeneratedAt }) =>
      candidatesGeneratedAt && (
        <DateWithRelativeTooltip dateString={candidatesGeneratedAt} />
      ),
  },
];

const ClientOpportunitiesTable: React.FC = () => {
  const { client } = useClientDashboardContext();
  const { id: clientId } = client;
  const clientName = clientBriefName(client);

  const filters = useFilters({
    type: 'ClientEligibleCeOpportunityFilterOptions',
  });

  return (
    <>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant='h5' component='h2' pb={1}>
          About Eligible Opportunities
        </Typography>
        <Typography variant='body2'>
          {clientName} is eligible for the below open opportunities. Click the
          opportunity to see more details, including {clientName}'s position on
          the waitlist.
        </Typography>
      </Paper>
      <Paper>
        <GenericTableWithData<
          GetClientEligibleOpportunitiesQuery,
          GetClientEligibleOpportunitiesQueryVariables,
          ClientCeOpportunitySummaryFieldsFragment
        >
          columns={COLUMNS}
          queryVariables={{
            id: clientId,
          }}
          filters={filters}
          queryDocument={GetClientEligibleOpportunitiesDocument}
          pagePath='client.eligibleCeOpportunities'
          noData='No opportunities'
          paginationItemName='opportunities'
          rowLinkTo={(opportunity) =>
            generateSafePath(ProjectDashboardRoutes.OPPORTUNITY, {
              projectId: opportunity.projectId,
              opportunityId: opportunity.id,
            })
          }
          rowActionTitle='View Opportunity'
        />
      </Paper>
    </>
  );
};

export default ClientOpportunitiesTable;
