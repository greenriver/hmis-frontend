import { Grid, Paper, Stack, Typography, Button } from '@mui/material';
import { useState } from 'react';
import {
  useOutletContext,
  useParams,
  generatePath,
  useNavigate,
} from 'react-router-dom';

// import Breadcrumbs from '@/components/elements/Breadcrumbs';
import AddHouseholdMembers from './AddHouseholdMembers';

import DatePicker from '@/components/elements/input/DatePicker';
import ProjectSelect, {
  Option as ProjectOption,
} from '@/components/elements/input/ProjectSelect';
import { clientName } from '@/modules/hmis/hmisUtil';
import { DashboardRoutes } from '@/routes/routes';
import { Client } from '@/types/gqlTypes';

const NewEnrollment = () => {
  const navigate = useNavigate();
  // const { pathname } = useLocation();
  const [project, setProject] = useState<ProjectOption | null>(null);
  const [entryDate, setEntryDate] = useState<Date | null>(new Date());
  const { clientId } = useParams() as {
    clientId: string;
  };
  const { client } = useOutletContext<{ client: Client | null }>();
  if (!client) throw Error('Missing client');

  // const crumbs = [
  //   {
  //     label: 'Back to all enrollments',
  //     to: DashboardRoutes.ALL_ENROLLMENTS,
  //   },
  //   { label: `Add Enrollment`, to: pathname },
  // ];
  return (
    <>
      {/* <Breadcrumbs crumbs={crumbs} /> */}
      <Grid container spacing={4}>
        <Grid item xs={9}>
          <Typography variant='h5' sx={{ mb: 2 }}>
            <b>Start new enrollment</b>
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

          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant='h6' sx={{ mb: 2 }}>
              Add Household Members
            </Typography>
            <AddHouseholdMembers />
          </Paper>

          <Button
            disabled={!project || !entryDate}
            onClick={() => {
              if (!project) return;
              // FIXME: send enrollment creation mutation, get id back
              const enrollmentId = '1';
              navigate(
                generatePath(DashboardRoutes.NEW_ASSESSMENT, {
                  assessmentType: 'intake',
                  enrollmentId,
                  clientId,
                })
              );
            }}
          >
            Begin Assessment
          </Button>
        </Grid>
        <Grid item xs></Grid>
      </Grid>
    </>
  );
};

export default NewEnrollment;
