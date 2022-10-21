import EditIcon from '@mui/icons-material/Edit';
import { Grid, Paper, Stack, Typography } from '@mui/material';
import { useMemo } from 'react';
import { generatePath, useParams } from 'react-router-dom';

import EnrollmentRecordTabs from './EnrollmentRecordTabs';
import FinishIntakeButton from './FinishIntakeButton';
import HouseholdMemberTable from './household/HouseholdMemberTable';
import { useEnrollmentCrumbs } from './useEnrollmentCrumbs';

import Breadcrumbs from '@/components/elements/Breadcrumbs';
import ButtonLink from '@/components/elements/ButtonLink';
import Loading from '@/components/elements/Loading';
import { enrollmentName } from '@/modules/hmis/hmisUtil';
import { DashboardRoutes } from '@/routes/routes';
import { AssessmentRole } from '@/types/gqlTypes';

const ViewEnrollment = () => {
  const { clientId, enrollmentId } = useParams() as {
    enrollmentId: string;
    clientId: string;
  };
  const [crumbs, loading, enrollment] = useEnrollmentCrumbs();

  const editHouseholdPath = useMemo(
    () =>
      generatePath(`${DashboardRoutes.EDIT_HOUSEHOLD}`, {
        clientId,
        enrollmentId,
      }),
    [clientId, enrollmentId]
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
                gap={3}
                direction='row'
                justifyContent={'space-between'}
                sx={{ mb: 2, pr: 1, alignItems: 'center' }}
              >
                <Typography variant='h5' sx={{ mb: 0 }}>
                  Household
                </Typography>
                <ButtonLink
                  size='small'
                  variant='outlined'
                  color='secondary'
                  startIcon={<EditIcon fontSize='small' />}
                  to={`${editHouseholdPath}`}
                >
                  Edit Household
                </ButtonLink>
              </Stack>
              <HouseholdMemberTable
                clientId={clientId}
                enrollmentId={enrollmentId}
              />
              <ButtonLink
                size='small'
                variant='outlined'
                color='secondary'
                sx={{ mt: 2, ml: 6 }}
                to={`${editHouseholdPath}#add`}
              >
                + Add Household Members
              </ButtonLink>
            </Paper>
            <Paper sx={{ p: 2 }}>
              <EnrollmentRecordTabs enrollment={enrollment} />
            </Paper>
          </Stack>
        </Grid>
        <Grid item xs>
          <Paper sx={{ p: 2 }}>
            <Stack spacing={2} sx={{ mb: 3 }}>
              <Typography variant='h6'>Enrollment Status</Typography>

              {/* FIXME this should check whether ANY enrollments in the household are in progress, not just this one */}
              {enrollment.inProgress ? (
                <FinishIntakeButton
                  enrollmentId={enrollmentId}
                  clientId={clientId}
                  sx={{ pl: 3, justifyContent: 'left' }}
                />
              ) : (
                <Typography variant='body2'>Intake completed</Typography>
              )}
            </Stack>
            <Stack spacing={2}>
              <Typography variant='h6'>Add to Enrollment</Typography>
              <ButtonLink
                variant='outlined'
                color='secondary'
                sx={{ pl: 3, justifyContent: 'left' }}
                to={generatePath(DashboardRoutes.NEW_ASSESSMENT, {
                  clientId,
                  enrollmentId,
                  assessmentRole: AssessmentRole.Update,
                })}
              >
                + Assessment
              </ButtonLink>
              <ButtonLink
                variant='outlined'
                color='secondary'
                to=''
                sx={{ pl: 3, justifyContent: 'left' }}
              >
                + Service
              </ButtonLink>
              <ButtonLink
                variant='outlined'
                color='secondary'
                to=''
                sx={{ pl: 3, justifyContent: 'left' }}
              >
                + Event
              </ButtonLink>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default ViewEnrollment;
