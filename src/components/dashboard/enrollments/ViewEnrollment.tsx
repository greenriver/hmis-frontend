import {
  Breadcrumbs,
  Link,
  Grid,
  Paper,
  Stack,
  Typography,
  Button,
} from '@mui/material';
import {
  generatePath,
  Link as RouterLink,
  useLocation,
  useOutletContext,
  useParams,
} from 'react-router-dom';

import { DashboardRoutes } from '@/routes/routes';
import { Client } from '@/types/gqlTypes';

const ViewEnrollment = () => {
  const { pathname } = useLocation();
  const { enrollmentId, clientId } = useParams() as {
    clientId: string;
    enrollmentId: string;
  };
  const { client } = useOutletContext<{ client: Client | null }>();
  if (!client) throw Error('Missing client');

  const pathnames = [
    {
      label: 'Back to all enrollments',
      to: generatePath(DashboardRoutes.ALL_ENROLLMENTS, { clientId }),
    },
    { label: `Enrollment ${enrollmentId}`, to: pathname },
  ];
  return (
    <>
      <Breadcrumbs aria-label='breadcrumb' sx={{ mb: 3 }}>
        {pathnames.map(({ label, to }, index) => {
          const last = index === pathnames.length - 1;

          return last ? (
            <Typography variant='body2' key={to}>
              {label}
            </Typography>
          ) : (
            <Link component={RouterLink} to={to} key={to} variant='body2'>
              {label}
            </Link>
          );
        })}
      </Breadcrumbs>
      <Grid container spacing={4}>
        <Grid item xs={9}>
          <Typography variant='h5' sx={{ mb: 2 }}>
            Enrollment {enrollmentId}
          </Typography>
          <Stack spacing={2}>
            <Paper sx={{ p: 2 }}>
              <Typography variant='h6' sx={{ mb: 2 }}>
                Household Members
              </Typography>
            </Paper>
            <Paper sx={{ p: 2 }}>
              <Typography variant='h6' sx={{ mb: 2 }}>
                Assessments
              </Typography>
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
                // component={RouterLink}
                // to={}
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
