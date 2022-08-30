import { Button, Grid, Paper, Typography } from '@mui/material';
import { useMemo } from 'react';
import {
  Link as RouterLink,
  generatePath,
  useParams,
  useNavigate,
} from 'react-router-dom';

import { Columns } from '@/components/elements/GenericTable';
import GenericTableWithData from '@/components/elements/GenericTableWithData';
import * as HmisUtil from '@/modules/hmis/hmisUtil';
import { DashboardRoutes } from '@/routes/routes';
import {
  EnrollmentFieldsFragment,
  GetClientEnrollmentsDocument,
  GetClientEnrollmentsQuery,
  GetClientEnrollmentsQueryVariables,
} from '@/types/gqlTypes';

const columns: Columns<EnrollmentFieldsFragment>[] = [
  { header: 'ID', render: 'id' },
  {
    header: 'Project',
    render: (e) => e.project.projectName,
  },
  {
    header: 'Start Date',
    render: (e) =>
      e.entryDate ? HmisUtil.parseAndFormatDate(e.entryDate) : 'Unknown',
  },
  {
    header: 'End Date',
    render: (e) =>
      e.exitDate ? HmisUtil.parseAndFormatDate(e.exitDate) : 'Active',
  },
];

const AllEnrollments = () => {
  const { clientId } = useParams() as { clientId: string };

  const navigate = useNavigate();

  const handleRowClick = useMemo(() => {
    return (enrollment: EnrollmentFieldsFragment) =>
      navigate(
        generatePath(DashboardRoutes.VIEW_ENROLLMENT, {
          clientId,
          enrollmentId: enrollment.id,
        })
      );
  }, [clientId, navigate]);

  return (
    <Grid container spacing={4}>
      <Grid item xs={8}>
        <Paper sx={{ p: 2 }}>
          <Typography variant='h6' sx={{ mb: 2 }}>
            Enrollments
          </Typography>
          <GenericTableWithData<
            GetClientEnrollmentsQuery,
            GetClientEnrollmentsQueryVariables,
            EnrollmentFieldsFragment
          >
            queryVariables={{ id: clientId }}
            queryDocument={GetClientEnrollmentsDocument}
            handleRowClick={handleRowClick}
            columns={columns}
            toNodes={(data: GetClientEnrollmentsQuery) =>
              data.client?.enrollments?.nodes || []
            }
            toNodesCount={(data: GetClientEnrollmentsQuery) =>
              data.client?.enrollments?.nodesCount
            }
          />
        </Paper>
      </Grid>
      <Grid item xs>
        <Paper sx={{ p: 2 }}>
          <Typography variant='h6' sx={{ mb: 2 }}>
            Actions
          </Typography>
          <Button
            variant='outlined'
            color='secondary'
            component={RouterLink}
            to={generatePath(DashboardRoutes.NEW_ENROLLMENT, {
              clientId,
            })}
          >
            + Add Enrollment
          </Button>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default AllEnrollments;
