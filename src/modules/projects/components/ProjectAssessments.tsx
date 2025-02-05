import { Paper } from '@mui/material';
import { useProjectDashboardContext } from './ProjectDashboard';
import { getViewEnrollmentMenuItem } from '@/components/elements/table/tableRowActionUtil';
import { ColumnDef } from '@/components/elements/table/types';
import PageTitle from '@/components/layout/PageTitle';
import useSafeParams from '@/hooks/useSafeParams';
import {
  ASSESSMENT_CLIENT_NAME_COL,
  ASSESSMENT_COLUMNS,
  generateAssessmentPath,
} from '@/modules/assessments/util';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { useFilters } from '@/modules/hmis/filterUtil';
import {
  assessmentDescription,
  clientBriefName,
} from '@/modules/hmis/hmisUtil';
import { WITH_ENROLLMENT_COLUMNS } from '@/modules/projects/components/tables/ProjectClientEnrollmentsTable';
import {
  AssessmentSortOption,
  GetProjectAssessmentsDocument,
  GetProjectAssessmentsQuery,
  GetProjectAssessmentsQueryVariables,
} from '@/types/gqlTypes';

export type ProjectAssessmentType = NonNullable<
  GetProjectAssessmentsQuery['project']
>['assessments']['nodes'][number];

const COLUMNS: ColumnDef<ProjectAssessmentType>[] = [
  ASSESSMENT_CLIENT_NAME_COL,
  ASSESSMENT_COLUMNS.date,
  ASSESSMENT_COLUMNS.type,
  WITH_ENROLLMENT_COLUMNS.entryDate,
  WITH_ENROLLMENT_COLUMNS.exitDate,
];

const ProjectAssessments = () => {
  const { projectId } = useSafeParams() as {
    projectId: string;
  };
  const { project } = useProjectDashboardContext();

  const filters = useFilters({
    type: 'AssessmentsForProjectFilterOptions',
    pickListArgs: { projectId },
  });

  return (
    <>
      <PageTitle title='Assessments' />
      <Paper>
        <GenericTableWithData<
          GetProjectAssessmentsQuery,
          GetProjectAssessmentsQueryVariables,
          ProjectAssessmentType
        >
          queryVariables={{ id: projectId }}
          queryDocument={GetProjectAssessmentsDocument}
          columns={COLUMNS}
          rowLinkTo={(row) =>
            generateAssessmentPath(
              row,
              row.enrollment.client.id,
              row.enrollment.id,
              true
            )
          }
          rowLinkState={{ backToLabel: project.projectName }}
          rowName={(row) =>
            `${clientBriefName(row.enrollment.client)}'s ${assessmentDescription(row)}`
          }
          rowActionTitle='View Assessment'
          rowSecondaryActionConfigs={(row) => [
            getViewEnrollmentMenuItem(row.enrollment, row.enrollment.client),
          ]}
          noData='No assessments'
          pagePath='project.assessments'
          recordType='Assessment'
          filters={filters}
          defaultSortOption={AssessmentSortOption.AssessmentDate}
        />
      </Paper>
    </>
  );
};
export default ProjectAssessments;
