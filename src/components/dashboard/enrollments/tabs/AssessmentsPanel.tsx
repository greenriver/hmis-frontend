import { Stack, Typography } from '@mui/material';
import { useCallback, useMemo } from 'react';
import { generatePath } from 'react-router-dom';

import ButtonLink from '@/components/elements/ButtonLink';
import { ColumnDef } from '@/components/elements/GenericTable';
import GenericTableWithData from '@/components/elements/GenericTableWithData';
import {
  parseAndFormatDate,
  parseAndFormatDateTime,
} from '@/modules/hmis/hmisUtil';
import { DashboardRoutes } from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';
import {
  AssessmentFieldsFragment,
  AssessmentRole,
  EnrollmentFieldsFragment,
  GetEnrollmentAssessmentsDocument,
  GetEnrollmentAssessmentsQuery,
  GetEnrollmentAssessmentsQueryVariables,
  ProjectType,
} from '@/types/gqlTypes';

const ceColumns: ColumnDef<AssessmentFieldsFragment>[] = [
  {
    header: 'Type',
    render: (a) =>
      a.assessmentType && HmisEnums.AssessmentType[a.assessmentType],
    linkTreatment: true,
  },
  {
    header: 'Level',
    render: (a) =>
      a.assessmentLevel && HmisEnums.AssessmentLevel[a.assessmentLevel],
  },
  {
    header: 'Location',
    render: (e) => e.assessmentLocation,
  },
];

const columns: ColumnDef<AssessmentFieldsFragment>[] = [
  {
    header: 'Assessment Date',
    width: '20%',

    render: (e) => parseAndFormatDate(e.assessmentDate),
  },
  {
    header: 'Type',
    width: '10%',
    linkTreatment: true,
    render: (assessment) => assessment.assessmentDetail?.role,
  },
  {
    header: 'Status',
    width: '10%',
    render: (assessment) => assessment.assessmentDetail?.status,
  },

  {
    header: 'Last Updated',
    // width: '5%',
    render: (e) => parseAndFormatDateTime(e.dateUpdated),
  },
];

const AssessmentsPanel = ({
  clientId,
  enrollmentId,
  enrollment,
}: {
  clientId: string;
  enrollmentId: string;
  enrollment: EnrollmentFieldsFragment;
}) => {
  const rowLinkTo = useCallback(
    (assessment: AssessmentFieldsFragment) =>
      generatePath(DashboardRoutes.VIEW_ASSESSMENT, {
        clientId,
        enrollmentId,
        assessmentId: assessment.id,
      }),
    [clientId, enrollmentId]
  );
  const tableColumns = useMemo(
    () =>
      enrollment.project.projectType === ProjectType.Ce
        ? [...columns, ...ceColumns]
        : columns,
    [enrollment]
  );

  return (
    <Stack>
      <Stack sx={{ mb: 2, alignItems: 'center' }} direction='row' gap={3}>
        <Typography variant='h5'>Assessments</Typography>
        <ButtonLink
          variant='outlined'
          color='secondary'
          size='small'
          to={generatePath(DashboardRoutes.NEW_ASSESSMENT, {
            clientId,
            enrollmentId,
            assessmentRole: AssessmentRole.Update,
          })}
        >
          + Add Assessment
        </ButtonLink>
      </Stack>
      <GenericTableWithData<
        GetEnrollmentAssessmentsQuery,
        GetEnrollmentAssessmentsQueryVariables,
        AssessmentFieldsFragment
      >
        queryVariables={{ id: enrollmentId }}
        queryDocument={GetEnrollmentAssessmentsDocument}
        rowLinkTo={rowLinkTo}
        columns={tableColumns}
        toNodes={(data: GetEnrollmentAssessmentsQuery) =>
          data.enrollment?.assessments?.nodes || []
        }
        toNodesCount={(data: GetEnrollmentAssessmentsQuery) =>
          data.enrollment?.assessments?.nodesCount
        }
        noData='No assessments.'
      />
    </Stack>
  );
};

export default AssessmentsPanel;
