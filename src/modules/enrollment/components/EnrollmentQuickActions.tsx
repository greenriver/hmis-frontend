import { Button, Typography } from '@mui/material';
import { Stack } from '@mui/system';

import { useClientFormDialog } from '@/modules/client/hooks/useClientFormDialog';
import { ClientPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import { useServiceDialog } from '@/modules/services/hooks/useServiceDialog';
import { EnrollmentFieldsFragment } from '@/types/gqlTypes';

const EnrollmentQuickActions = ({
  enrollment,
}: {
  enrollment: EnrollmentFieldsFragment;
}) => {
  const { renderServiceDialog, openServiceDialog } = useServiceDialog({
    enrollment,
  });

  const { openClientFormDialog, renderClientFormDialog, clientLoading } =
    useClientFormDialog({
      clientId: enrollment.client.id,
    });

  return (
    <Stack spacing={2}>
      <Typography variant='h6'>Quick Actions</Typography>
      <ClientPermissionsFilter
        id={enrollment.client.id}
        permissions={['canEditEnrollments']}
      >
        {/* <ButtonLink
          to={generateSafePath(EnrollmentDashboardRoutes.ASSESSMENT, {
            clientId,
            enrollmentId,
            formRole: FormRole.Update,
          })}
        >
          Add Assessment
        </ButtonLink> */}
        <Button onClick={openServiceDialog} variant='outlined'>
          Record Service
        </Button>
      </ClientPermissionsFilter>
      <ClientPermissionsFilter
        id={enrollment.client.id}
        permissions='canEditClient'
      >
        <Button
          onClick={clientLoading ? undefined : openClientFormDialog}
          variant='outlined'
        >
          Update Client Details
        </Button>
      </ClientPermissionsFilter>
      {renderServiceDialog()}
      {renderClientFormDialog()}
    </Stack>
  );
};

export default EnrollmentQuickActions;
