import { Paper } from '@mui/material';
import { getViewEnrollmentMenuItem } from '@/components/elements/table/tableRowActionUtil';
import { ColumnDef } from '@/components/elements/table/types';
import PageTitle from '@/components/layout/PageTitle';
import useSafeParams from '@/hooks/useSafeParams';
import { ClientAssessmentType } from '@/modules/assessments/assessmentTypes';
import {
  ASSESSMENT_COLUMNS,
  generateAssessmentPath,
} from '@/modules/assessments/util';
import useClientDashboardContext from '@/modules/client/hooks/useClientDashboardContext';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { useFilters } from '@/modules/hmis/filterUtil';
import { assessmentDescription, entryExitRange } from '@/modules/hmis/hmisUtil';
import {
  AssessmentSortOption,
  GetClientAssessmentsDocument,
  GetClientAssessmentsQuery,
  GetClientAssessmentsQueryVariables,
} from '@/types/gqlTypes';

const COLUMNS: ColumnDef<ClientAssessmentType>[] = [
  { ...ASSESSMENT_COLUMNS.date, sticky: 'left' },
  {
    header: 'Project Name',
    render: (row: ClientAssessmentType) => row.enrollment.projectName,
  },
  ASSESSMENT_COLUMNS.type,
  ASSESSMENT_COLUMNS.lastUpdated,
];

const ClientAssessmentsPage = () => {
  const { clientId } = useSafeParams() as { clientId: string };
  const { client } = useClientDashboardContext();

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
          columns={COLUMNS}
          rowLinkTo={(assessment) =>
            generateAssessmentPath(
              assessment,
              client.id,
              assessment.enrollment.id,
              true // open the assessment for individual viewing, even if it's an intake/exit in a multimember household
            )
          }
          rowName={(assessment) => assessmentDescription(assessment)}
          rowActionTitle='View Assessment'
          rowSecondaryActionConfigs={(assessment) => [
            {
              ...getViewEnrollmentMenuItem(assessment.enrollment, client),
              // override the default ariaLabel to provide the project name, since we are in the client context
              ariaLabel: `View Enrollment at ${assessment.enrollment.projectName} for ${entryExitRange(assessment.enrollment)}`,
            },
          ]}
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
