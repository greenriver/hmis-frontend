import { Paper } from '@mui/material';
import React from 'react';
import { ColumnDef } from '@/components/elements/table/types';
import PageTitle from '@/components/layout/PageTitle';
import useSafeParams from '@/hooks/useSafeParams';
import CreateOpportunityButton from '@/modules/ce/components/CreateOpportunityButton';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { ProjectDashboardRoutes } from '@/routes/routes';
import {
  CeOpportunitySummaryFieldsFragment,
  GetProjectCeOpportunitiesDocument,
  GetProjectCeOpportunitiesQuery,
  GetProjectCeOpportunitiesQueryVariables,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

const COLUMNS: ColumnDef<CeOpportunitySummaryFieldsFragment>[] = [
  {
    header: 'ID',
    render: 'id',
    key: 'id',
  },
  {
    header: 'Name',
    render: 'name',
    key: 'name',
  },
  {
    header: 'Status',
    render: 'status',
    key: 'status',
  },
];

interface Props {}
const Opportunities: React.FC<Props> = ({}) => {
  const { projectId } = useSafeParams() as {
    projectId: string;
  };

  return (
    <>
      <PageTitle
        title={'Opportunities'}
        actions={<CreateOpportunityButton projectId={projectId} />}
      />

      <Paper>
        <GenericTableWithData<
          GetProjectCeOpportunitiesQuery,
          GetProjectCeOpportunitiesQueryVariables,
          CeOpportunitySummaryFieldsFragment
        >
          columns={COLUMNS}
          queryVariables={{ id: projectId }}
          queryDocument={GetProjectCeOpportunitiesDocument}
          pagePath='project.ceOpportunities'
          noData='No opportunities'
          paginationItemName='opportunities'
          rowLinkTo={(row) =>
            generateSafePath(ProjectDashboardRoutes.OPPORTUNITY, {
              projectId,
              opportunityId: row.id,
            })
          }
          rowActionTitle='View Opportunity'
        />
      </Paper>
    </>
  );
};

export default Opportunities;
