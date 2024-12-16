import { Paper } from '@mui/material';
import { useCallback } from 'react';
import { useProjectDashboardContext } from './ProjectDashboard';
import {
  getViewAssessmentAction,
  getViewEnrollmentAction,
} from '@/components/elements/table/tableActions/tableRowActionUtil';
import { ColumnDef } from '@/components/elements/table/types';
import PageTitle from '@/components/layout/PageTitle';
import useSafeParams from '@/hooks/useSafeParams';
import {
  ASSESSMENT_CLIENT_NAME_COL,
  ASSESSMENT_COLUMNS,
} from '@/modules/assessments/util';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { useFilters } from '@/modules/hmis/filterUtil';
import { assessmentDescription } from '@/modules/hmis/hmisUtil';
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

  const getTableRowActions = useCallback(
    (record: ProjectAssessmentType) => {
      return {
        primaryAction: {
          ...getViewAssessmentAction(
            record,
            record.enrollment.client.id,
            record.enrollment.id
          ),
          state: { backToLabel: project.projectName },
        },
        secondaryActions: [
          getViewEnrollmentAction(record.enrollment, record.enrollment.client),
        ],
      };
    },
    [project]
  );

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
          getTableRowActions={getTableRowActions}
          getRowAccessibleName={(record) => assessmentDescription(record)}
          columns={COLUMNS}
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
