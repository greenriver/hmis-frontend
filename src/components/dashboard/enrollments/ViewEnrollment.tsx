import EditIcon from '@mui/icons-material/Edit';
import { Grid, Paper, Stack, Typography } from '@mui/material';
import { useMemo } from 'react';
import { generatePath, useOutletContext, useParams } from 'react-router-dom';

import EnrollmentRecordTabs from './EnrollmentRecordTabs';
import HouseholdMemberTable from './household/HouseholdMemberTable';
import { useIntakeAssessment } from './useIntakeAssessment';

import ButtonLink from '@/components/elements/ButtonLink';
import { DashboardContext } from '@/components/pages/ClientDashboard';
import { enrollmentName, parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import { DashboardRoutes } from '@/routes/routes';
import { AssessmentRole } from '@/types/gqlTypes';

const ViewEnrollment = () => {
  const { enrollment } = useOutletContext<DashboardContext>();
  const { clientId, enrollmentId } = useParams() as {
    enrollmentId: string;
    clientId: string;
  };

  const [assessment, fetchIntakeStatus] = useIntakeAssessment(enrollmentId);
  const editHouseholdPath = useMemo(
    () =>
      generatePath(`${DashboardRoutes.EDIT_HOUSEHOLD}`, {
        clientId,
        enrollmentId,
      }),
    [clientId, enrollmentId]
  );

  if (!enrollment) throw Error('Enrollment not found');

  let enrollmentStatus = '';
  if (enrollment.exitDate) {
    enrollmentStatus = `Exited on ${parseAndFormatDate(enrollment.exitDate)}`;
  } else if (assessment && assessment.inProgress) {
    enrollmentStatus = 'Intake Incomplete';
  } else if (!fetchIntakeStatus.loading && !assessment) {
    enrollmentStatus = 'Intake Incomplete';
  } else if (!fetchIntakeStatus.loading) {
    enrollmentStatus = 'Active';
  }

  return (
    <>
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
                  Update Household
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
              <Typography variant='body2' sx={{ fontWeight: 600 }}>
                {enrollmentStatus}
              </Typography>
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
