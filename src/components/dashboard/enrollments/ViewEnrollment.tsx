import { Grid, Paper, Stack, Typography, Button } from '@mui/material';
import { useParams, generatePath, Link as RouterLink } from 'react-router-dom';

import EnrollmentRecordTabs from './EnrollmentRecordTabs';
import HouseholdMemberTable from './HouseholdMemberTable';
import { useEnrollmentCrumbs } from './useEnrollmentCrumbs';

import Breadcrumbs from '@/components/elements/Breadcrumbs';
import Loading from '@/components/elements/Loading';
import { enrollmentName } from '@/modules/hmis/hmisUtil';
import { DashboardRoutes } from '@/routes/routes';

const ViewEnrollment = () => {
  const { clientId, enrollmentId } = useParams() as {
    enrollmentId: string;
    clientId: string;
  };
  const [crumbs, loading, enrollment] = useEnrollmentCrumbs();
  if (loading) return <Loading />;
  if (!crumbs || !enrollment) throw Error('Enrollment not found');

  return (
    <>
      <Breadcrumbs crumbs={crumbs} />
      <Grid container spacing={4}>
        <Grid item xs={9}>
          <Typography variant='h4' sx={{ mb: 2 }}>
            {enrollmentName(enrollment)}
          </Typography>
          <Stack spacing={2}>
            <Paper sx={{ p: 2 }}>
              <HouseholdMemberTable
                clientId={clientId}
                enrollmentId={enrollmentId}
              />
            </Paper>
            <Paper sx={{ p: 2 }}>
              <EnrollmentRecordTabs />
            </Paper>
          </Stack>
        </Grid>
        <Grid item xs>
          <Paper sx={{ p: 2 }}>
            <Stack spacing={2} sx={{ mb: 3 }}>
              <Typography variant='h6'>Enrollment Status</Typography>

              <Button
                variant='outlined'
                color='secondary'
                sx={{ pl: 3, justifyContent: 'left' }}
              >
                Intake (finish now)
              </Button>
            </Stack>
            <Stack spacing={2}>
              <Typography variant='h6'>Add to Enrollment</Typography>
              <Button
                variant='outlined'
                color='secondary'
                sx={{ pl: 3, justifyContent: 'left' }}
                component={RouterLink}
                to={generatePath(DashboardRoutes.NEW_ASSESSMENT, {
                  clientId,
                  enrollmentId,
                  // FIXME
                  assessmentType: 'annual',
                })}
              >
                + Assessment
              </Button>
              <Button
                variant='outlined'
                color='secondary'
                sx={{ pl: 3, justifyContent: 'left' }}
              >
                + Service
              </Button>
              <Button
                variant='outlined'
                color='secondary'
                sx={{ pl: 3, justifyContent: 'left' }}
              >
                + Event
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default ViewEnrollment;
