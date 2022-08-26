import { Button, Stack, Typography } from '@mui/material';
import { useMemo } from 'react';
import {
  Link as RouterLink,
  generatePath,
  useNavigate,
} from 'react-router-dom';

import { Columns } from '@/components/elements/GenericTable';
import GenericTableWithData from '@/components/elements/GenericTableWithData';
import { humanizeEnum, parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import { DashboardRoutes } from '@/routes/routes';
import {
  AssessmentFieldsFragment,
  GetEnrollmentAssessmentsDocument,
  GetEnrollmentAssessmentsQuery,
  GetEnrollmentAssessmentsQueryVariables,
} from '@/types/gqlTypes';

const columns: Columns<AssessmentFieldsFragment>[] = [
  { header: 'ID', render: 'id' },
  {
    header: 'Type',
    render: (e) => humanizeEnum(e.assessmentType),
  },
  {
    header: 'Level',
    render: (e) => humanizeEnum(e.assessmentLevel),
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
  const navigate = useNavigate();

  const handleRowClick = useMemo(() => {
    return (assessment: AssessmentFieldsFragment) =>
      navigate(
        generatePath(DashboardRoutes.VIEW_ASSESSMENT, {
          clientId,
          enrollmentId,
          assessmentId: assessment.id,
        })
      );
  }, [clientId, enrollmentId, navigate]);

  return (
    <Stack>
      <Stack sx={{ mb: 2, alignItems: 'center' }} direction='row' gap={3}>
        <Typography variant='h5'>Assessments</Typography>
        <Button
          variant='outlined'
          color='secondary'
          component={RouterLink}
          size='small'
          to={generatePath(DashboardRoutes.NEW_ASSESSMENT, {
            clientId,
            enrollmentId,
            assessmentType: 'TODO',
          })}
        >
          + Add Assessment
        </Button>
      </Stack>
      <GenericTableWithData<
        GetEnrollmentAssessmentsQuery,
        GetEnrollmentAssessmentsQueryVariables,
        AssessmentFieldsFragment
      >
        queryVariables={{ id: enrollmentId }}
        queryDocument={GetEnrollmentAssessmentsDocument}
        handleRowClick={handleRowClick}
        columns={columns}
        toNodes={(data: GetEnrollmentAssessmentsQuery) =>
          data.enrollment?.assessments?.nodes || []
        }
        toNodesCount={(data: GetEnrollmentAssessmentsQuery) =>
          data.enrollment?.assessments?.nodesCount
        }
      />
    </Stack>
  );
};

export default AssessmentsPanel;
