import { Paper } from '@mui/material';
import { useCallback } from 'react';

import { getViewAssessmentAction } from '@/components/elements/table/tableActions/tableRowActionUtil';
import { ColumnDef } from '@/components/elements/table/types';
import PageTitle from '@/components/layout/PageTitle';
import useSafeParams from '@/hooks/useSafeParams';
import { ClientAssessmentType } from '@/modules/assessments/assessmentTypes';
import { ASSESSMENT_COLUMNS } from '@/modules/assessments/util';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { useFilters } from '@/modules/hmis/filterUtil';
import { assessmentDescription } from '@/modules/hmis/hmisUtil';
import {
  AssessmentSortOption,
  GetClientAssessmentsDocument,
  GetClientAssessmentsQuery,
  GetClientAssessmentsQueryVariables,
} from '@/types/gqlTypes';

const COLUMNS: ColumnDef<ClientAssessmentType>[] = [
  ASSESSMENT_COLUMNS.date,
  {
    header: 'Project Name',
    render: (row) => row.enrollment.projectName,
  },
  ASSESSMENT_COLUMNS.type,
  ASSESSMENT_COLUMNS.lastUpdated,
];

const ClientAssessmentsPage = () => {
  const { clientId } = useSafeParams() as { clientId: string };

  const filters = useFilters({
    type: 'AssessmentFilterOptions',
  });

  const getTableRowActions = useCallback(
    (record: ClientAssessmentType) => {
      return {
        primaryAction: getViewAssessmentAction(
          record,
          clientId,
          record.enrollment.id
        ),
      };
    },
    [clientId]
  );

  return (
    <>
      <PageTitle title='Assessments' />
      <Paper>
        <GenericTableWithData<
          GetClientAssessmentsQuery,
          GetClientAssessmentsQueryVariables,
          ClientAssessmentType
        >
          filters={filters}
          queryVariables={{ id: clientId }}
          queryDocument={GetClientAssessmentsDocument}
          getTableRowActions={getTableRowActions}
          getRowAccessibleName={(row) => assessmentDescription(row)}
          columns={COLUMNS}
          pagePath='client.assessments'
          fetchPolicy='cache-and-network'
          noData='No assessments'
          recordType='Assessment'
          defaultSortOption={AssessmentSortOption.AssessmentDate}
        />
      </Paper>
    </>
  );
};

export default ClientAssessmentsPage;
