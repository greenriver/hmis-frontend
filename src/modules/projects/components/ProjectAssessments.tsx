import { Paper } from '@mui/material';

import { omit } from 'lodash-es';
import { useMemo } from 'react';
import { ColumnDef } from '@/components/elements/table/types';
import PageTitle from '@/components/layout/PageTitle';
import useSafeParams from '@/hooks/useSafeParams';
import {
  ASSESSMENT_COLUMNS,
  ASSESSMENT_ENROLLMENT_COLUMNS,
} from '@/modules/assessments/assessmentColumns';
import { assessmentRowLinkTo } from '@/modules/assessments/util';
import ClientName from '@/modules/client/components/ClientName';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
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

  const displayColumns: ColumnDef<ProjectAssessmentType>[] = useMemo(() => {
    return [
      {
        header: 'First Name',
        linkTreatment: true,
        render: (a: ProjectAssessmentType) => (
          <ClientName client={a.enrollment.client} nameParts='first_only' />
        ),
      },
      {
        header: 'Last Name',
        linkTreatment: true,
        render: (a: ProjectAssessmentType) => (
          <ClientName
            client={a.enrollment.client}
            // linkToEnrollmentId={s.enrollment.id}
            nameParts='last_only'
          />
        ),
      },
      ASSESSMENT_COLUMNS.date,
      ASSESSMENT_COLUMNS.type,
      ASSESSMENT_ENROLLMENT_COLUMNS.period,
    ];
  }, []);

  const rowLinkTo = (record: ProjectAssessmentType) =>
    assessmentRowLinkTo(record, record.enrollment.client.id);

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
          rowLinkTo={rowLinkTo}
          columns={displayColumns}
          noData='No assessments'
          pagePath='project.assessments'
          recordType='Assessment'
          showFilters
          filters={(filters) => omit(filters, 'project', 'projectType')}
          defaultSortOption={AssessmentSortOption.AssessmentDate}
        />
      </Paper>
    </>
  );
};
export default ProjectAssessments;
