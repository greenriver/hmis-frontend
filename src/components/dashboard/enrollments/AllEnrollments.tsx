import { Button, Grid, Paper, Typography } from '@mui/material';
import { Link as RouterLink, generatePath, useParams } from 'react-router-dom';

import EnrollmentsTable from '@/components/dashboard/enrollments/tables/EnrollmentsTable';
import { DashboardRoutes } from '@/routes/routes';

const AllEnrollments = () => {
  const { clientId } = useParams() as { clientId: string };

  return (
    <Grid container spacing={4}>
      <Grid item xs={8}>
        <Paper sx={{ p: 2 }}>
          <Typography variant='h6' sx={{ mb: 2 }}>
            Enrollments
          </Typography>
          <EnrollmentsTable clientId={clientId} />
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
