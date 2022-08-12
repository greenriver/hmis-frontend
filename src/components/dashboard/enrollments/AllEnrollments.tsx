import { Button, Grid, Paper, Typography } from '@mui/material';
import {
  useNavigate,
  useOutletContext,
  Link as RouterLink,
  generatePath,
} from 'react-router-dom';

import GenericTable from '@/components/elements/GenericTable';
import * as HmisUtil from '@/modules/hmis/hmisUtil';
import { DashboardRoutes } from '@/routes/routes';
import { Client, Enrollment } from '@/types/gqlTypes';

const AllEnrollments = () => {
  const { client } = useOutletContext<{ client: Client | null }>();
  const navigate = useNavigate();
  if (!client) throw Error('Missing client');

  return (
    <Grid container spacing={4}>
      <Grid item xs={8}>
        <Paper sx={{ p: 2 }}>
          <Typography variant='h6' sx={{ mb: 2 }}>
            Enrollments
          </Typography>
          {client.enrollments.nodesCount === 0 && (
            <Typography>No enrollments</Typography>
          )}
          {client.enrollments.nodesCount !== 0 && (
            <GenericTable<Enrollment>
              rows={client.enrollments.nodes}
              handleRowClick={(enrollment) =>
                navigate(
                  generatePath(DashboardRoutes.VIEW_ENROLLMENT, {
                    clientId: client.id,
                    enrollmentId: enrollment.id,
                  })
                )
              }
              columns={[
                { header: 'ID', render: 'id' },
                { header: 'Project', render: (e) => e.project.projectName },
                {
                  header: 'Start Date',
                  render: (e) =>
                    e.entryDate
                      ? HmisUtil.parseAndFormatDate(e.entryDate)
                      : 'Unknown',
                },
                {
                  header: 'End Date',
                  render: (e) =>
                    e.exitDate
                      ? HmisUtil.parseAndFormatDate(e.exitDate)
                      : 'Active',
                },
              ]}
            />
          )}
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
              clientId: client.id,
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
