import { Grid, Paper, Stack, Typography } from '@mui/material';
import { useOutletContext } from 'react-router-dom';

import { useRecentAssessments } from '../../../modules/assessments/components/useRecentAssessments';

import EnrollmentRecordTabs from './EnrollmentRecordTabs';

import ButtonLink from '@/components/elements/ButtonLink';
import { DashboardContext } from '@/components/pages/ClientDashboard';
import useSafeParams from '@/hooks/useSafeParams';
import IdDisplay from '@/modules/hmis/components/IdDisplay';
import { enrollmentName, parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import HouseholdMemberTable from '@/modules/household/components/HouseholdMemberTable';
import { DashboardRoutes } from '@/routes/routes';
import { AssessmentRole } from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const ViewEnrollment = () => {
  const { enrollment } = useOutletContext<DashboardContext>();
  const { clientId, enrollmentId } = useSafeParams() as {
    enrollmentId: string;
    clientId: string;
  };

  const { intake, loading } = useRecentAssessments(enrollmentId);

  if (!enrollment) throw Error('Enrollment not found');

  let enrollmentStatus = '';
  if (enrollment.exitDate) {
    enrollmentStatus = `Exited on ${parseAndFormatDate(enrollment.exitDate)}`;
  } else if (loading) {
    enrollmentStatus = '';
  } else if (intake && intake.inProgress) {
    enrollmentStatus = 'Intake Incomplete';
  } else {
    enrollmentStatus = 'Active';
  }

  return (
    <>
      <Stack justifyContent={'space-between'} direction='row' sx={{ mb: 2 }}>
        <Typography variant='h4'>{enrollmentName(enrollment)}</Typography>
        <IdDisplay id={enrollment.id} />
      </Stack>
      <Grid container spacing={4}>
        <Grid item xs={9}>
          <Stack spacing={2}>
            <Paper sx={{ pt: 2 }}>
              <Stack
                gap={3}
                direction='row'
                justifyContent={'space-between'}
                sx={{ mb: 2, px: 3, alignItems: 'center' }}
              >
                <Typography variant='h5' sx={{ mb: 0 }}>
                  Household
                </Typography>
              </Stack>
              <HouseholdMemberTable
                clientId={clientId}
                enrollmentId={enrollmentId}
              />
            </Paper>
            <Paper sx={{ py: 2 }}>
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
                to={generateSafePath(DashboardRoutes.NEW_ASSESSMENT, {
                  clientId,
                  enrollmentId,
                  assessmentRole: AssessmentRole.Update.toLowerCase(),
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
