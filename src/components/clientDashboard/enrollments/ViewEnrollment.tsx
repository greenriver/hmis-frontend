import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import { Button, Grid, Paper, Stack, Typography } from '@mui/material';

import EnrollmentRecordTabs from './EnrollmentRecordTabs';

import ButtonLink from '@/components/elements/ButtonLink';
import RouterLink from '@/components/elements/RouterLink';
import TitleCard from '@/components/elements/TitleCard';
import { useClientDashboardContext } from '@/components/pages/ClientDashboard';
import NotFound from '@/components/pages/NotFound';
import useSafeParams from '@/hooks/useSafeParams';
import IdDisplay from '@/modules/hmis/components/IdDisplay';
import { enrollmentName } from '@/modules/hmis/hmisUtil';
import HouseholdMemberTable from '@/modules/household/components/HouseholdMemberTable';
import { ClientPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import { useServiceDialog } from '@/modules/services/hooks/useServiceDialog';
import { ClientDashboardRoutes, Routes } from '@/routes/routes';
import { FormRole } from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const ViewEnrollment = () => {
  const { enrollment } = useClientDashboardContext();
  const { clientId, enrollmentId } = useSafeParams() as {
    enrollmentId: string;
    clientId: string;
  };

  const { renderServiceDialog, openServiceDialog } = useServiceDialog({
    enrollment,
  });

  if (!enrollment) return <NotFound />;

  return (
    <>
      <Stack justifyContent={'space-between'} direction='row' sx={{ mb: 3 }}>
        <Typography variant='h4'>{enrollmentName(enrollment)}</Typography>
      </Stack>
      <Grid container spacing={4}>
        <Grid item xs={9}>
          <Stack spacing={2}>
            <TitleCard title='Household' headerVariant='border'>
              <HouseholdMemberTable
                clientId={clientId}
                enrollmentId={enrollmentId}
              />
            </TitleCard>

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
                  to={generateSafePath(ClientDashboardRoutes.NEW_ASSESSMENT, {
                    clientId,
                    enrollmentId,
                    formRole: FormRole.Update.toLowerCase(),
                  })}
                  Icon={LibraryAddIcon}
                  leftAlign
                >
                  New Assessment
                </ButtonLink>
                <Button
                  onClick={openServiceDialog}
                  startIcon={<LibraryAddIcon fontSize='small' />}
                  variant='outlined'
                  color='secondary'
                  sx={{ pl: 3, justifyContent: 'left' }}
                >
                  Add Service
                </Button>
                <ButtonLink to='' Icon={LibraryAddIcon} leftAlign>
                  Add Event
                </ButtonLink>
              </ClientPermissionsFilter>
            </Stack>
          </Paper>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Stack gap={1}>
              <Typography variant='body2' color='text.secondary'>
                Project:{' '}
                <RouterLink
                  to={generateSafePath(Routes.PROJECT, {
                    projectId: enrollment.project.id,
                  })}
                >
                  {enrollment.project.projectName}
                </RouterLink>
              </Typography>
              <IdDisplay
                prefix='Enrollment'
                color='text.secondary'
                value={enrollment.id}
              />
              <IdDisplay
                prefix='Household'
                color='text.secondary'
                value={enrollment.household.shortId}
              />
            </Stack>
          </Paper>
        </Grid>
      </Grid>
      {renderServiceDialog()}
    </>
  );
};

export default ViewEnrollment;
