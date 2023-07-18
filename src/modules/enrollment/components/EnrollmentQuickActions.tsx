import { Button, Typography } from '@mui/material';
import { Stack } from '@mui/system';

import ButtonLink from '@/components/elements/ButtonLink';
import { ClientPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import { FormRole } from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const EnrollmentQuickActions = ({
  clientId,
  enrollmentId,
  openServiceDialog,
}: {
  clientId: string;
  enrollmentId: string;
  openServiceDialog: VoidFunction;
}) => {
  return (
    <Stack spacing={2}>
      <Typography variant='h6'>Quick Actions</Typography>
      <ClientPermissionsFilter
        id={clientId}
        permissions={['canEditEnrollments']}
      >
        <ButtonLink
          to={generateSafePath(EnrollmentDashboardRoutes.ASSESSMENT, {
            clientId,
            enrollmentId,
            formRole: FormRole.Update,
          })}
        >
          Add Assessment
        </ButtonLink>
        <Button onClick={openServiceDialog} variant='outlined'>
          Record Service
        </Button>
        <ButtonLink to=''>Update Client Details</ButtonLink>
        <ButtonLink
          // Icon={PeopleIcon}
          to={generateSafePath(EnrollmentDashboardRoutes.EDIT_HOUSEHOLD, {
            clientId,
            enrollmentId,
          })}
        >
          Manage Household
        </ButtonLink>
      </ClientPermissionsFilter>
    </Stack>
  );
};

export default EnrollmentQuickActions;
