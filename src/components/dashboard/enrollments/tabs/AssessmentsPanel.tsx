import { Stack, Typography } from '@mui/material';
import { useCallback } from 'react';
import { generatePath } from 'react-router-dom';

import ButtonLink from '@/components/elements/ButtonLink';
import { ColumnDef } from '@/components/elements/GenericTable';
import GenericTableWithData from '@/components/elements/GenericTableWithData';
import { parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import { DashboardRoutes } from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';
import {
  AssessmentFieldsFragment,
  GetEnrollmentAssessmentsDocument,
  GetEnrollmentAssessmentsQuery,
  GetEnrollmentAssessmentsQueryVariables,
} from '@/types/gqlTypes';

const columns: ColumnDef<AssessmentFieldsFragment>[] = [
  { header: 'ID', render: 'id' },
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
  {
    header: 'Date',
    render: (e) => parseAndFormatDate(e.assessmentDate),
  },
  {
    header: 'Last Updated',
    render: (e) => parseAndFormatDate(e.dateUpdated),
  },
];

const AssessmentsPanel = ({
  clientId,
  enrollmentId,
}: {
  clientId: string;
  enrollmentId: string;
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
            assessmentType: 'TODO',
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
        columns={columns}
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
