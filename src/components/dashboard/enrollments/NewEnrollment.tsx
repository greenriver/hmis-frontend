import { Grid, Paper, Stack, Typography, Button } from '@mui/material';
import { format } from 'date-fns';
import { useMemo, useState } from 'react';
import {
  useOutletContext,
  useParams,
  useLocation,
  generatePath,
  useNavigate,
} from 'react-router-dom';

import QuickAddHouseholdMembers from './household/QuickAddHouseholdMembers';
import { useRecentHouseholdMembers } from './household/useRecentHouseholdMembers';

import Breadcrumbs from '@/components/elements/Breadcrumbs';
import DatePicker from '@/components/elements/input/DatePicker';
import ProjectSelect, {
  Option as ProjectOption,
} from '@/components/elements/input/ProjectSelect';
import Loading from '@/components/elements/Loading';
import { clientName } from '@/modules/hmis/hmisUtil';
import { DashboardRoutes } from '@/routes/routes';
import {
  Client,
  CreateEnrollmentInput,
  RelationshipToHoH,
  useCreateEnrollmentMutation,
} from '@/types/gqlTypes';

const NewEnrollment = () => {
  const { pathname } = useLocation();
  const [project, setProject] = useState<ProjectOption | null>(null);
  const [entryDate, setEntryDate] = useState<Date | null>(new Date());
  const navigate = useNavigate();
  const { clientId } = useParams() as {
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
            ? generatePath(DashboardRoutes.VIEW_ENROLLMENT, {
                clientId,
                enrollmentId,
              })
            : generatePath(DashboardRoutes.ALL_ENROLLMENTS, {
                clientId,
              });
          navigate(path);
        }
      },
    });

  const onSubmit = useMemo(
    () => () => {
      if (!project || !entryDate) return;
      const values: CreateEnrollmentInput = {
        projectId: project.id,
        startDate: format(entryDate, 'yyyy-MM-dd'),
        householdMembers: Object.entries(members).map(([id, relation]) => ({
          id,
          relationshipToHoH: relation || RelationshipToHoH.DataNotCollected,
        })),
        inProgress: true,
      };
      console.log(JSON.stringify(values, null, 2));
      void mutateFunction({
        variables: { input: values },
      });
    },
    [entryDate, members, project, mutateFunction]
  );

  // TODO render validations
  if (data?.createEnrollment?.errors) {
    console.error('errors', data?.createEnrollment?.errors);
  }
  if (error) throw error;

  const crumbs = [
    {
      label: 'Back to all enrollments',
      to: DashboardRoutes.ALL_ENROLLMENTS,
    },
    { label: `Add Enrollment`, to: pathname },
  ];

  const numMembers = Object.keys(members).length;
  return (
    <>
      <Breadcrumbs crumbs={crumbs} />
      <Grid container spacing={4}>
        <Grid item xs={11}>
          <Typography variant='h5' sx={{ mb: 2 }}>
            <b>Create enrollment</b>
            {` for ${clientName(client)}`}
          </Typography>

          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant='h6' sx={{ mb: 2 }}>
              Enrollment Details
            </Typography>
            <Stack spacing={2} sx={{ mb: 2 }}>
              <ProjectSelect<false>
                value={project}
                onChange={(_, value) => setProject(value)}
                textInputProps={{ placeholder: 'Choose project...' }}
                sx={{ width: 400 }}
              />
              <DatePicker
                label='Entry Date'
                value={entryDate}
                disableFuture
                sx={{ width: 200 }}
                onChange={(value) => setEntryDate(value)}
              />
            </Stack>
          </Paper>

          {recentHouseholdMembersLoading && <Loading />}
          {recentMembers && recentMembers.length > 1 && (
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant='h6' sx={{ mb: 2 }}>
                Set up Household
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
              disabled={!project || !entryDate || loading}
              onClick={onSubmit}
              fullWidth
            >
              {loading
                ? 'Submitting...'
                : numMembers > 1
                ? `Enroll ${clientName(client)} and ${numMembers - 1} other${
                    numMembers > 2 ? 's' : ''
                  }`
                : `Enroll ${clientName(client)}`}
            </Button>
          </Grid>
        </Grid>
        <Grid item xs></Grid>
      </Grid>
    </>
  );
};

export default NewEnrollment;
