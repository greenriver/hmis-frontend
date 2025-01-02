import { Paper } from '@mui/material';
import { useMemo } from 'react';
import { useProjectDashboardContext } from './ProjectDashboard';
import TableRowActions from '@/components/elements/table/TableRowActions';
import {
  BASE_ACTION_COLUMN_DEF,
  getViewAssessmentAction,
  getViewEnrollmentAction,
} from '@/components/elements/table/tableRowActionUtil';
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

const ProjectAssessments = () => {
  const { projectId } = useSafeParams() as {
    projectId: string;
  };
  const { project } = useProjectDashboardContext();

  const columns = useMemo(() => {
    return [
      ASSESSMENT_CLIENT_NAME_COL,
      ASSESSMENT_COLUMNS.date,
      ASSESSMENT_COLUMNS.type,
      WITH_ENROLLMENT_COLUMNS.entryDate,
      WITH_ENROLLMENT_COLUMNS.exitDate,
      {
        ...BASE_ACTION_COLUMN_DEF,
        render: (record: ProjectAssessmentType) => (
          <TableRowActions
            record={record}
            recordName={assessmentDescription(record)}
            primaryActionConfig={{
              ...getViewAssessmentAction(
                record,
                record.enrollment.client.id,
                record.enrollment.id
              ),
              linkState: { backToLabel: project.projectName },
            }}
            secondaryActionConfigs={[
              getViewEnrollmentAction(
                record.enrollment,
                record.enrollment.client
              ),
            ]}
          />
        ),
      },
    ];
  }, [project]);

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
          columns={columns}
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
