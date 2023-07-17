import { Box, Grid, Paper, Stack, Typography } from '@mui/material';
import { format } from 'date-fns';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import DatePicker from '@/components/elements/input/DatePicker';
import ProjectSelect, {
  Option as ProjectOption,
} from '@/components/elements/input/ProjectSelect';
import Loading from '@/components/elements/Loading';
import LoadingButton from '@/components/elements/LoadingButton';
import { useClientDashboardContext } from '@/components/pages/ClientDashboard';
import NotFound from '@/components/pages/NotFound';
import useSafeParams from '@/hooks/useSafeParams';
import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import ErrorAlert from '@/modules/errors/components/ErrorAlert';
import { useValidationDialog } from '@/modules/errors/hooks/useValidationDialog';
import {
  emptyErrorState,
  ErrorState,
  partitionValidations,
} from '@/modules/errors/util';
import RequiredLabel from '@/modules/form/components/RequiredLabel';
import { clientBriefName } from '@/modules/hmis/hmisUtil';
import QuickAddHouseholdMembers from '@/modules/household/components/QuickAddHouseholdMembers';
import { useRecentHouseholdMembers } from '@/modules/household/hooks/useRecentHouseholdMembers';
import {
  ClientDashboardRoutes,
  EnrollmentDashboardRoutes,
} from '@/routes/routes';
import {
  CreateEnrollmentInput,
  RelationshipToHoH,
  useCreateEnrollmentMutation,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const NewEnrollment = () => {
  // ErrorState
  const [project, setProject] = useState<ProjectOption | null>(null);
  const [entryDate, setEntryDate] = useState<Date | null>(new Date());
  const [errorState, setErrors] = useState<ErrorState>(emptyErrorState);

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

  const { client } = useClientDashboardContext();

  const [mutateFunction, { loading }] = useCreateEnrollmentMutation({
    onCompleted: (data) => {
      if (data?.createEnrollment?.enrollments?.length) {
        const enrollmentId = data?.createEnrollment?.enrollments?.find(
          (e) => e.client.id === clientId
        )?.id;
        const path = enrollmentId
          ? generateSafePath(EnrollmentDashboardRoutes.ENROLLMENT_OVERVIEW, {
              clientId,
              enrollmentId,
            })
          : generateSafePath(ClientDashboardRoutes.CLIENT_ENROLLMENTS, {
              clientId,
            });
        navigate(path);
      } else if (data?.createEnrollment?.errors) {
        const errors = data?.createEnrollment?.errors || [];
        setErrors(partitionValidations(errors));
      }
    },
    onError: (apolloError) => setErrors({ ...emptyErrorState, apolloError }),
  });

  const handleSubmit = useCallback(
    (confirmed: boolean) => {
      if (!project || !entryDate) {
        setErrors(emptyErrorState);
        return;
      }
      const input: CreateEnrollmentInput = {
        projectId: project.code,
        entryDate: format(entryDate, 'yyyy-MM-dd'),
        householdMembers: Object.entries(members).map(([id, relation]) => ({
          id,
          relationshipToHoH: relation || RelationshipToHoH.DataNotCollected,
        })),
        confirmed,
      };
      console.log('CreateEnrollment with input:', input);
      void mutateFunction({ variables: { input } });
    },
    [entryDate, members, project, mutateFunction]
  );

  const { renderValidationDialog } = useValidationDialog({ errorState });

  if (!client) return <NotFound />;
  if (recentHouseholdMembersLoading) return <Loading />;

  const numMembers = Object.keys(members).length;

  return (
    <>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Typography variant='h4' sx={{ mb: 4 }}>
            Create enrollment
            <Box component='span' fontWeight={400}>
              {` for ${clientBriefName(client)}`}
            </Box>
          </Typography>
          <ApolloErrorAlert
            error={errorState.apolloError}
            AlertProps={{ sx: { mb: 2 } }}
          />
          <ErrorAlert
            errors={errorState.errors}
            AlertProps={{ sx: { mb: 2 } }}
          />
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant='h5' sx={{ mb: 2 }}>
              Enrollment Details
            </Typography>
            <Stack spacing={2} sx={{ mb: 2 }}>
              <ProjectSelect<false>
                value={project}
                onChange={(_, value) => setProject(value)}
                textInputProps={{
                  error: !!errorState.errors.find(
                    (e) => e.attribute === 'projectId'
                  ),
                  placeholder: 'Choose project...',
                }}
                sx={{ width: 400 }}
                label={<RequiredLabel text={'Project'} required />}
              />
              <DatePicker
                label={<RequiredLabel text={'Entry Date'} required />}
                value={entryDate}
                disableFuture
                sx={{ width: 200 }}
                error={
                  !!errorState.errors.find((e) => e.attribute === 'entryDate')
                }
                onChange={setEntryDate}
                textInputProps={{
                  id: 'entry-date',
                }}
              />
            </Stack>
          </Paper>

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
            <LoadingButton
              data-testid='createEnrollmentButton'
              loading={loading}
              onClick={() => handleSubmit(false)}
              disabled={!project || !entryDate}
              fullWidth
            >
              {numMembers > 1
                ? `Enroll ${clientBriefName(client)} and ${
                    numMembers - 1
                  } other${numMembers > 2 ? 's' : ''}`
                : `Enroll ${clientBriefName(client)}`}
            </LoadingButton>
          </Grid>
        </Grid>
        <Grid item xs></Grid>
      </Grid>
      {renderValidationDialog({
        onConfirm: () => handleSubmit(true),
        loading,
      })}
    </>
  );
};

export default NewEnrollment;
