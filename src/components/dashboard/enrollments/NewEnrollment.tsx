import {
  Breadcrumbs,
  Link,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import {
  Link as RouterLink,
  useLocation,
  useOutletContext,
  useParams,
  generatePath,
} from 'react-router-dom';

import DatePicker from '@/components/elements/input/DatePicker';
import ProjectSelect from '@/components/elements/input/ProjectSelect';
import { DashboardRoutes } from '@/routes/routes';
import { Client } from '@/types/gqlTypes';

const NewEnrollment = () => {
  const { pathname } = useLocation();
  const { clientId } = useParams() as {
    clientId: string;
  };
  const { client } = useOutletContext<{ client: Client | null }>();
  if (!client) throw Error('Missing client');

  const pathnames = [
    {
      label: 'Back to all enrollments',
      to: generatePath(DashboardRoutes.ALL_ENROLLMENTS, { clientId }),
    },
    { label: `Add Enrollment`, to: pathname },
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
            Add Enrollment
          </Typography>
          <Stack spacing={2}>
            <ProjectSelect
              value={null}
              onChange={(selectedOption) => {
                console.log(selectedOption);
              }}
              textInputProps={{ placeholder: 'Choose project...' }}
              sx={{ width: 400 }}
            />
            <DatePicker
              label='Entry Date'
              value={null}
              disableFuture
              sx={{ width: 200 }}
              onChange={(value) => {
                console.log(value);
              }}
            />
            <Paper sx={{ p: 2 }}>
              <Typography variant='h6' sx={{ mb: 2 }}>
                Household
              </Typography>
            </Paper>
            <Paper sx={{ p: 2 }}>
              <Typography variant='h6' sx={{ mb: 2 }}>
                Assessment
              </Typography>
            </Paper>
          </Stack>
        </Grid>
        <Grid item xs></Grid>
      </Grid>
    </>
  );
};

export default NewEnrollment;
