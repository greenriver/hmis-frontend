import { Button } from '@mui/material';
import { Stack } from '@mui/system';

import ButtonLink from '@/components/elements/ButtonLink';
import { useClientFormDialog } from '@/modules/client/hooks/useClientFormDialog';
import { DashboardEnrollment } from '@/modules/hmis/types';
import {
  ClientPermissionsFilter,
  ProjectPermissionsFilter,
} from '@/modules/permissions/PermissionsFilters';
import { useServiceDialog } from '@/modules/services/hooks/useServiceDialog';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import { DataCollectionFeatureRole } from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const EnrollmentQuickActions = ({
  enrollment,
  enabledFeatures,
}: {
  enrollment: DashboardEnrollment;
  enabledFeatures: DataCollectionFeatureRole[];
}) => {
  const { renderServiceDialog, openServiceDialog } = useServiceDialog({
    enrollment,
  });

  const { openClientFormDialog, renderClientFormDialog, clientLoading } =
    useClientFormDialog({
      clientId: enrollment.client.id,
    });

  return (
    <Stack spacing={2} sx={{ px: 2, pb: 2 }}>
      {/* Record a Service */}
      {enabledFeatures.includes(DataCollectionFeatureRole.Service) &&
        enrollment.access.canEditEnrollments && (
          <Button onClick={openServiceDialog} variant='outlined'>
            Record Service
          </Button>
        )}

      {/* Edit Client details */}
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

      {/* View ESG Funding Report */}
      <ProjectPermissionsFilter
        id={enrollment.project.id}
        permissions='canManageIncomingReferrals'
      >
        <ButtonLink
          fullWidth
          variant='outlined'
          to={generateSafePath(EnrollmentDashboardRoutes.ESG_FUNDING_REPORT, {
            enrollmentId: enrollment.id,
            clientId: enrollment.client.id,
          })}
        >
          ESG Funding Report
        </ButtonLink>
      </ProjectPermissionsFilter>
      {renderServiceDialog()}
      {renderClientFormDialog()}
    </Stack>
  );
};

export default EnrollmentQuickActions;
