import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Grid, Paper, Stack, Typography } from '@mui/material';
import { useOutletContext } from 'react-router-dom';

import EnrollmentRecordTabs from './EnrollmentRecordTabs';

import ButtonLink from '@/components/elements/ButtonLink';
import { DashboardContext } from '@/components/pages/ClientDashboard';
import NotFound from '@/components/pages/NotFound';
import useSafeParams from '@/hooks/useSafeParams';
import IdDisplay from '@/modules/hmis/components/IdDisplay';
import { enrollmentName } from '@/modules/hmis/hmisUtil';
import HouseholdMemberTable from '@/modules/household/components/HouseholdMemberTable';
import { ClientPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import { DashboardRoutes, Routes } from '@/routes/routes';
import { FormRole } from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const ViewEnrollment = () => {
  const { enrollment } = useOutletContext<DashboardContext>();
  const { clientId, enrollmentId } = useSafeParams() as {
    enrollmentId: string;
    clientId: string;
  };

  if (!enrollment) return <NotFound />;

  return (
    <>
      <Stack justifyContent={'space-between'} direction='row' sx={{ mb: 3 }}>
        <Typography variant='h4'>{enrollmentName(enrollment)}</Typography>
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
            <Paper sx={{ pt: 2 }}>
              <EnrollmentRecordTabs enrollment={enrollment} />
            </Paper>
          </Stack>
        </Grid>
        <Grid item xs>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Stack spacing={2}>
              <Typography variant='h6'>Actions</Typography>
              <ClientPermissionsFilter
                id={clientId}
                permissions={['canEditEnrollments']}
              >
                <ButtonLink
                  to={generateSafePath(DashboardRoutes.NEW_ASSESSMENT, {
                    clientId,
                    enrollmentId,
                    formRole: FormRole.Update.toLowerCase(),
                  })}
                  Icon={LibraryAddIcon}
                  leftAlign
                >
                  New Assessment
                </ButtonLink>
                <ButtonLink
                  to={generateSafePath(DashboardRoutes.NEW_SERVICE, {
                    clientId,
                    enrollmentId,
                  })}
                  Icon={LibraryAddIcon}
                  leftAlign
                >
                  Add Service
                </ButtonLink>
                <ButtonLink to='' Icon={LibraryAddIcon} leftAlign>
                  Add Event
                </ButtonLink>
              </ClientPermissionsFilter>
              <ButtonLink
                fullWidth
                to={generateSafePath(Routes.PROJECT, {
                  projectId: enrollment.project.id,
                })}
                Icon={OpenInNewIcon}
                leftAlign
              >
                Open Project
              </ButtonLink>
            </Stack>
          </Paper>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Stack gap={1}>
              <IdDisplay
                prefix='Enrollment'
                color='text.secondary'
                id={enrollment.id}
              />
              <IdDisplay
                prefix='Household'
                color='text.secondary'
                id={enrollment.household.shortId}
              />
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default ViewEnrollment;
