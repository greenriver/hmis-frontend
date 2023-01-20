import { Box, Button, Grid, Paper, Stack, Typography } from '@mui/material';
import { format } from 'date-fns';
import { useCallback, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

import DatePicker from '@/components/elements/input/DatePicker';
import ProjectSelect, {
  Option as ProjectOption,
} from '@/components/elements/input/ProjectSelect';
import Loading from '@/components/elements/Loading';
import useSafeParams from '@/hooks/useSafeParams';
import { clientBriefName } from '@/modules/hmis/hmisUtil';
import QuickAddHouseholdMembers from '@/modules/household/components/QuickAddHouseholdMembers';
import { useRecentHouseholdMembers } from '@/modules/household/components/useRecentHouseholdMembers';
import { DashboardRoutes } from '@/routes/routes';
import {
  Client,
  CreateEnrollmentInput,
  RelationshipToHoH,
  useCreateEnrollmentMutation,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const NewEnrollment = () => {
  const [project, setProject] = useState<ProjectOption | null>(null);
  const [entryDate, setEntryDate] = useState<Date | null>(new Date());
  const [projectError, setProjectError] = useState(false);
  const [dateError, setDateError] = useState(false);
  const navigate = useNavigate();
  const { clientId } = useSafeParams() as {
    clientId: string;
  };
  // map client id -> realtionship-to-hoh
  const [members, setMembers] = useState<
    Record<string, RelationshipToHoH | null>
  >({ [clientId]: RelationshipToHoH.SelfHeadOfHousehold });

  const [recentMembers, recentHouseholdMembersLoading] =
    useRecentHouseholdMembers(clientId, true);

  const { client } = useOutletContext<{ client: Client | null }>();
  if (!client) throw Error('Missing client');

  const [mutateFunction, { data, loading, error }] =
    useCreateEnrollmentMutation({
      onCompleted: (data) => {
        if (data?.createEnrollment?.enrollments?.length) {
          const enrollmentId = data?.createEnrollment?.enrollments?.find(
            (e) => e.client.id === clientId
          )?.id;
          const path = enrollmentId
            ? generateSafePath(DashboardRoutes.VIEW_ENROLLMENT, {
                clientId,
                enrollmentId,
              })
            : generateSafePath(DashboardRoutes.ALL_ENROLLMENTS, {
                clientId,
              });
          navigate(path);
        }
      },
    });

  const onSubmit = useCallback(() => {
    if (!project || !entryDate) {
      setProjectError(project ? false : true);
      setDateError(entryDate ? false : true);
      return;
    }
    const values: CreateEnrollmentInput = {
      projectId: project.code,
      startDate: format(entryDate, 'yyyy-MM-dd'),
      householdMembers: Object.entries(members).map(([id, relation]) => ({
        id,
        relationshipToHoH: relation || RelationshipToHoH.DataNotCollected,
      })),
      inProgress: true,
    };
    console.log('CreateEnrollment', values);
    void mutateFunction({
      variables: { input: values },
    });
  }, [entryDate, members, project, mutateFunction]);

  // TODO render validations
  if (data?.createEnrollment?.errors) {
    console.error('errors', data?.createEnrollment?.errors);
  }
  if (error) throw error;

  const numMembers = Object.keys(members).length;

  return (
    <>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Typography variant='h4' sx={{ mb: 2 }}>
            Create enrollment
            <Box component='span' fontWeight={400}>
              {` for ${clientBriefName(client)}`}
            </Box>
          </Typography>

          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant='h5' sx={{ mb: 2 }}>
              Enrollment Details
            </Typography>
            <Stack spacing={2} sx={{ mb: 2 }}>
              <ProjectSelect<false>
                value={project}
                onChange={(_, value) => {
                  setProject(value);
                  setProjectError(false);
                }}
                textInputProps={{
                  error: projectError,
                  placeholder: 'Choose project...',
                }}
                sx={{ width: 400 }}
              />
              <DatePicker
                label='Entry Date'
                value={entryDate}
                disableFuture
                sx={{ width: 200 }}
                error={dateError}
                onChange={(value) => {
                  setEntryDate(value);
                  setDateError(false);
                }}
              />
            </Stack>
          </Paper>

          {recentHouseholdMembersLoading && <Loading />}
          {recentMembers && recentMembers.length > 1 && (
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant='h5' sx={{ mb: 2 }}>
                Household
              </Typography>
              <QuickAddHouseholdMembers
                clientId={clientId}
                members={members}
                setMembers={setMembers}
                recentMembers={recentMembers}
              />
            </Paper>
          )}

          <Grid item xs={4}>
            <Button
              data-testid='createEnrollmentButton'
              disabled={loading}
              onClick={onSubmit}
              fullWidth
            >
              {loading
                ? 'Submitting...'
                : numMembers > 1
                ? `Enroll ${clientBriefName(client)} and ${
                    numMembers - 1
                  } other${numMembers > 2 ? 's' : ''}`
                : `Enroll ${clientBriefName(client)}`}
            </Button>
            {(projectError || dateError) && (
              <Typography variant='body2' color='error' sx={{ mt: 1 }}>
                {projectError && dateError
                  ? 'Please select a project and entry date.'
                  : projectError
                  ? 'Please select a project.'
                  : 'Please select an entry date.'}
              </Typography>
            )}
          </Grid>
        </Grid>
        <Grid item xs></Grid>
      </Grid>
    </>
  );
};

export default NewEnrollment;
