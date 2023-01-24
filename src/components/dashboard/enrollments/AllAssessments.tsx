import { Paper, Stack, Typography } from '@mui/material';
import { useCallback } from 'react';

import AssessmentStatus from '@/components/elements/AssessmentStatus';
import { ColumnDef } from '@/components/elements/GenericTable';
import useSafeParams from '@/hooks/useSafeParams';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import {
  assessmentDescription,
  assessmentRoleDisplay,
  enrollmentName,
  parseAndFormatDate,
  parseAndFormatDateRange,
} from '@/modules/hmis/hmisUtil';
import { DashboardRoutes } from '@/routes/routes';
import {
  GetClientAssessmentsDocument,
  GetClientAssessmentsQuery,
  GetClientAssessmentsQueryVariables,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

type AssessmentType = NonNullable<
  NonNullable<GetClientAssessmentsQuery['client']>['assessments']
>['nodes'][0];

const columns: ColumnDef<AssessmentType>[] = [
  {
    header: 'Status',
    width: '15%',
    render: (a) => <AssessmentStatus assessment={a} />,
  },
  {
    header: 'Type',
    width: '15%',
    render: (assessment) => `${assessmentRoleDisplay(assessment)} Assessment`,
    linkTreatment: true,
    ariaLabel: (row) => assessmentDescription(row),
  },
  {
    header: 'Project',
    render: (row) => enrollmentName(row.enrollment),
  },
  {
    header: 'Date',
    width: '15%',
    render: (e) => parseAndFormatDate(e.assessmentDate),
  },

  {
    header: 'Enrollment Period',
    render: (a) =>
      parseAndFormatDateRange(a.enrollment.entryDate, a.enrollment.exitDate),
  },
];

const AllAssessments = () => {
  const { clientId } = useSafeParams() as { clientId: string };

  const rowLinkTo = useCallback(
    (record: AssessmentType) =>
      generateSafePath(DashboardRoutes.VIEW_ASSESSMENT, {
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
      <Paper>
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
