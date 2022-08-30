import { Grid, Paper, Stack, Typography, Button } from '@mui/material';
import {
  useLocation,
  useParams,
  generatePath,
  Link as RouterLink,
} from 'react-router-dom';

import EnrollmentRecordTabs from './EnrollmentRecordTabs';
import HouseholdMemberTable from './HouseholdMemberTable';

import Breadcrumbs from '@/components/elements/Breadcrumbs';
import Loading from '@/components/elements/Loading';
import { enrollmentName } from '@/modules/hmis/hmisUtil';
import apolloClient from '@/providers/apolloClient';
import { DashboardRoutes } from '@/routes/routes';
import {
  EnrollmentFieldsFragmentDoc,
  useGetEnrollmentQuery,
} from '@/types/gqlTypes';

const ViewEnrollment = () => {
  const { pathname } = useLocation();
  const { clientId, enrollmentId } = useParams() as {
    enrollmentId: string;
    clientId: string;
  };

  const enrollment = apolloClient.readFragment({
    id: `Enrollment:${enrollmentId}`,
    fragment: EnrollmentFieldsFragmentDoc,
  });

  const { loading, error } = useGetEnrollmentQuery({
    variables: { id: enrollmentId },
    skip: !!enrollment,
  });
  if (error) throw error;
  if (loading) return <Loading />;

  if (!enrollment) throw Error('Enrollment not found');

  const crumbs = [
    {
      label: 'Back to all enrollments',
      to: DashboardRoutes.ALL_ENROLLMENTS,
    },
    { label: enrollmentName(enrollment), to: pathname },
  ];
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
