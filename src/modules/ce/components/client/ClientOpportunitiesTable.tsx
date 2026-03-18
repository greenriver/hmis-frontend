import { Paper, Typography } from '@mui/material';
import React from 'react';
import DateWithRelativeTooltip from '@/components/elements/DateWithRelativeTooltip';
import { ColumnDef } from '@/components/elements/table/types';
import useClientDashboardContext from '@/modules/client/hooks/useClientDashboardContext';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import ProjectTypeChip from '@/modules/hmis/components/ProjectTypeChip';
import { clientBriefName } from '@/modules/hmis/hmisUtil';
import { useFilters } from '@/modules/hmis/tableFilterUtil';
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
    header: 'Project Name',
    key: 'projectName',
    sticky: 'left',
    render: (opportunity: ClientCeOpportunitySummaryFieldsFragment) =>
      opportunity.projectName,
  },

  {
    header: 'Unit Name',
    key: 'unitName',
    render: 'name',
  },
  {
    header: 'Date Available',
    key: 'dateAvailable',
    render: ({ dateAvailable }) => (
      <DateWithRelativeTooltip dateString={dateAvailable} />
    ),
  },
  {
    header: 'Project Type',
    key: 'projectType',
    render: (opportunity: ClientCeOpportunitySummaryFieldsFragment) => (
      <ProjectTypeChip projectType={opportunity.projectType} />
    ),
  },
  {
    header: 'Last Updated',
    key: 'generatedAt',
    render: ({ candidatesGeneratedAt }) =>
      candidatesGeneratedAt && (
        <DateWithRelativeTooltip dateString={candidatesGeneratedAt} />
      ),
  },
];

/**
 * This component displays a table of open opportunities that the client is eligible for.
 */
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
          Available Units
        </Typography>
        <Typography variant='body2'>
          {clientName} is eligible for the units listed below. These units are
          currently available and accepting referrals. Click on a unit to view
          more details, including this client's position on the waitlist.
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
          noData='No units'
          paginationItemName='unit'
          rowLinkTo={(opportunity) =>
            generateSafePath(ProjectDashboardRoutes.UNIT, {
              projectId: opportunity.projectId,
              unitId: opportunity.unit?.id,
            })
          }
          rowActionTitle='View Unit'
        />
      </Paper>
    </>
  );
};

export default ClientOpportunitiesTable;
