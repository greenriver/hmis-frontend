import { Paper } from '@mui/material';
import { useCallback } from 'react';

import { ColumnDef } from '@/components/elements/table/types';
import PageTitle from '@/components/layout/PageTitle';
import useSafeParams from '@/hooks/useSafeParams';
import { ClientAssessmentType } from '@/modules/assessments/assessmentTypes';
import {
  ASSESSMENT_COLUMNS,
  ASSESSMENT_ENROLLMENT_COLUMNS,
  assessmentRowLinkTo,
} from '@/modules/assessments/util';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import AssessmentDateWithStatusIndicator from '@/modules/hmis/components/AssessmentDateWithStatusIndicator';
import { useFilters } from '@/modules/hmis/filterUtil';
import { assessmentDescription } from '@/modules/hmis/hmisUtil';
import {
  AssessmentSortOption,
  GetClientAssessmentsDocument,
  GetClientAssessmentsQuery,
  GetClientAssessmentsQueryVariables,
} from '@/types/gqlTypes';

const columns: ColumnDef<ClientAssessmentType>[] = [
  ASSESSMENT_COLUMNS.linkedType,
  {
    header: 'Assessment Date',
    render: (a) => <AssessmentDateWithStatusIndicator assessment={a} />,
    ariaLabel: (row) => assessmentDescription(row),
  },
  {
    header: 'Project Name',
    render: (row) => row.enrollment.projectName,
  },
  ASSESSMENT_ENROLLMENT_COLUMNS.period,
];

const ClientAssessmentsPage = () => {
  const { clientId } = useSafeParams() as { clientId: string };

  const rowLinkTo = useCallback(
    (record: ClientAssessmentType) => assessmentRowLinkTo(record, clientId),
    [clientId]
  );

  const filters = useFilters({
    type: 'AssessmentFilterOptions',
  });

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
          rowLinkTo={rowLinkTo}
          columns={columns}
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
