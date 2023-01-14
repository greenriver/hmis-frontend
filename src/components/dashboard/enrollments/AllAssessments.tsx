import { Paper, Stack, Typography } from '@mui/material';
import { startCase } from 'lodash-es';
import { useCallback } from 'react';
import { generatePath, useParams } from 'react-router-dom';

import AssessmentStatus from '@/components/elements/AssessmentStatus';
import { ColumnDef } from '@/components/elements/GenericTable';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import {
  parseAndFormatDate,
  parseAndFormatDateRange,
} from '@/modules/hmis/hmisUtil';
import { DashboardRoutes } from '@/routes/routes';
import {
  GetClientAssessmentsDocument,
  GetClientAssessmentsQuery,
  GetClientAssessmentsQueryVariables,
} from '@/types/gqlTypes';

type AssessmentType = NonNullable<
  NonNullable<GetClientAssessmentsQuery['client']>['assessments']
>['nodes'][0];

const columns: ColumnDef<AssessmentType>[] = [
  {
    header: 'Type',
    width: '15%',
    render: (assessment) =>
      startCase(assessment.assessmentDetail?.role?.toLowerCase()),
  },
  {
    header: 'Date',
    width: '15%',
    // linkTreatment: true,
    render: (e) => parseAndFormatDate(e.assessmentDate),
  },
  {
    header: 'Status',
    width: '15%',
    render: (a) => <AssessmentStatus assessment={a} />,
  },
  {
    header: 'Project',
    render: (a) => a.enrollment.project.projectName,
  },
  {
    header: 'Enrollment Period',
    render: (a) =>
      parseAndFormatDateRange(a.enrollment.entryDate, a.enrollment.exitDate),
  },
];

const AllAssessments = () => {
  const { clientId } = useParams() as { clientId: string };

  const rowLinkTo = useCallback(
    (record: AssessmentType) =>
      generatePath(DashboardRoutes.VIEW_ASSESSMENT, {
        clientId,
        enrollmentId: record.enrollment.id,
        assessmentId: record.id,
      }),
    [clientId]
  );

  return (
    <>
      <Stack
        gap={3}
        direction='row'
        justifyContent={'space-between'}
        sx={{ mb: 2, pr: 1, alignItems: 'center' }}
      >
        <Typography variant='h4'>All Assessments</Typography>
      </Stack>
      <Paper sx={{ p: 2 }}>
        <GenericTableWithData<
          GetClientAssessmentsQuery,
          GetClientAssessmentsQueryVariables,
          AssessmentType
        >
          queryVariables={{ id: clientId }}
          queryDocument={GetClientAssessmentsDocument}
          rowLinkTo={rowLinkTo}
          columns={columns}
          pagePath='client.assessments'
          fetchPolicy='cache-and-network'
          noData='No assessments.'
        />
      </Paper>
    </>
  );
};

export default AllAssessments;
