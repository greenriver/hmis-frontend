import EditIcon from '@mui/icons-material/Edit';
import { Grid, Paper, Stack, Typography, Button } from '@mui/material';
import { useCallback } from 'react';
import {
  useParams,
  generatePath,
  Link as RouterLink,
  useNavigate,
} from 'react-router-dom';

import EnrollmentRecordTabs from './EnrollmentRecordTabs';
import HouseholdMemberTable from './household/HouseholdMemberTable';
import { useEnrollmentCrumbs } from './useEnrollmentCrumbs';

import Breadcrumbs from '@/components/elements/Breadcrumbs';
import Loading from '@/components/elements/Loading';
import { enrollmentName } from '@/modules/hmis/hmisUtil';
import { DashboardRoutes } from '@/routes/routes';

const ViewEnrollment = () => {
  const navigate = useNavigate();
  const { clientId, enrollmentId } = useParams() as {
    enrollmentId: string;
    clientId: string;
  };
  const [crumbs, loading, enrollment] = useEnrollmentCrumbs();

  const handleClickEditHousehold = useCallback(
    () =>
      navigate(
        generatePath(DashboardRoutes.EDIT_HOUSEHOLD, {
          clientId,
          enrollmentId,
        })
      ),
    [navigate, clientId, enrollmentId]
  );

  if (loading) return <Loading />;
  if (!crumbs || !enrollment) throw Error('Enrollment not found');

  return (
    <>
      <Breadcrumbs crumbs={crumbs} />
      <Typography variant='h4' sx={{ mb: 2 }}>
        {enrollmentName(enrollment)}
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={9}>
          <Stack spacing={2}>
            <Paper sx={{ p: 2 }}>
              <Stack
                spacing={4}
                direction='row'
                justifyContent={'space-between'}
                sx={{ mb: 2, pr: 1 }}
              >
                <Typography variant='h5' sx={{ mb: 0 }}>
                  Household
                </Typography>
                <Button
                  size='small'
                  variant='outlined'
                  color='secondary'
                  endIcon={<EditIcon fontSize='small' />}
                  onClick={handleClickEditHousehold}
                >
                  Edit Household
                </Button>
              </Stack>
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

              {/* FIXME this should check whether ANY enrollments in the household are in progress, not just this one */}
              {enrollment.inProgress ? (
                <Button
                  variant='outlined'
                  color='error'
                  sx={{ pl: 3, justifyContent: 'left' }}
                >
                  Perform Intake
                </Button>
              ) : (
                <Typography variant='body2'>Intake completed</Typography>
              )}
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
