import { Paper } from '@mui/material';
import { useCallback } from 'react';
import { getViewEnrollmentMenuItem } from '@/components/elements/table/tableRowActionUtil';
import PageTitle from '@/components/layout/PageTitle';
import useSafeParams from '@/hooks/useSafeParams';
import { ClientAssessmentType } from '@/modules/assessments/assessmentTypes';
import {
  ASSESSMENT_COLUMNS,
  generateAssessmentPath,
} from '@/modules/assessments/util';
import useClientDashboardContext from '@/modules/client/hooks/useClientDashboardContext';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { DataColumnDef } from '@/modules/dataFetching/types';
import { WITH_ENROLLMENT_COLUMNS } from '@/modules/enrollment/columns/enrollmentColumns';
import { useFilters } from '@/modules/hmis/filterUtil';
import { assessmentDescription, entryExitRange } from '@/modules/hmis/hmisUtil';
import {
  AssessmentSortOption,
  GetClientAssessmentsDocument,
  GetClientAssessmentsQuery,
  GetClientAssessmentsQueryVariables,
} from '@/types/gqlTypes';

const COLUMNS: DataColumnDef<
  ClientAssessmentType,
  GetClientAssessmentsQueryVariables
>[] = [
  { ...ASSESSMENT_COLUMNS.date, sticky: 'left' },
  ASSESSMENT_COLUMNS.type,
  ASSESSMENT_COLUMNS.lastUpdated,
  {
    header: 'Project Name',
    key: 'projectName',
    render: (row: ClientAssessmentType) => row.enrollment.projectName,
  },
  {
    ...WITH_ENROLLMENT_COLUMNS.entryDate,
    optional: {
      defaultHidden: true,
      // no queryVariableField, since we need to fetch entryDate anyway in order to correctly aria-label the row action
    },
  },
  WITH_ENROLLMENT_COLUMNS.exitDate,
  WITH_ENROLLMENT_COLUMNS.organizationName,
];

const ClientAssessmentsPage = () => {
  const { clientId } = useSafeParams() as { clientId: string };
  const { client } = useClientDashboardContext();

  const filters = useFilters({
    type: 'AssessmentFilterOptions',
  });

  const rowLinkTo = useCallback(
    (assessment: ClientAssessmentType) =>
      generateAssessmentPath(
        assessment,
        client.id,
        assessment.enrollment.id,
        true // open the assessment for individual viewing, even if it's an intake/exit in a multimember household
      ),
    [client]
  );

  const rowSecondaryActionConfigs = useCallback(
    (assessment: ClientAssessmentType) => [
      {
        ...getViewEnrollmentMenuItem(assessment.enrollment, client),
        // override the default ariaLabel to provide the project name, since we are in the client context
        ariaLabel: `View Enrollment at ${assessment.enrollment.projectName} for ${entryExitRange(assessment.enrollment)}`,
      },
    ],
    [client]
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
          columns={COLUMNS}
          rowLinkTo={rowLinkTo}
          rowName={(assessment) => assessmentDescription(assessment)}
          rowActionTitle='View Assessment'
          rowSecondaryActionConfigs={rowSecondaryActionConfigs}
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
