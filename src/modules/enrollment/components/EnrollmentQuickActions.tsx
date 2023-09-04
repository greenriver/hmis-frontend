import { Button } from '@mui/material';
import { Stack } from '@mui/system';

import ButtonLink from '@/components/elements/ButtonLink';
import TitleCard from '@/components/elements/TitleCard';
import { useClientFormDialog } from '@/modules/client/hooks/useClientFormDialog';
import { DashboardEnrollment } from '@/modules/hmis/types';
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

  const canRecordService =
    enabledFeatures.includes(DataCollectionFeatureRole.Service) &&
    enrollment.access.canEditEnrollments;

  const canEditClient = enrollment.client.access.canEditClient;

  const canViewEsgFundingReport =
    enrollment.project.access.canManageIncomingReferrals;

  if (
    ![canRecordService, canEditClient, canViewEsgFundingReport].some((b) => !!b)
  ) {
    return null;
  }

  return (
    <TitleCard title='Quick Actions'>
      <Stack spacing={2} sx={{ px: 2, pb: 2 }}>
        {/* Record a Service */}
        {canRecordService && (
          <Button onClick={openServiceDialog} variant='outlined'>
            Record Service
          </Button>
        )}

        {/* Edit Client details */}
        {canEditClient && (
          <Button
            onClick={clientLoading ? undefined : openClientFormDialog}
            variant='outlined'
          >
            Update Client Details
          </Button>
        )}

        {/* View ESG Funding Report */}
        {canViewEsgFundingReport && (
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
        )}
        {canRecordService && renderServiceDialog()}
        {canEditClient && renderClientFormDialog()}
      </Stack>
    </TitleCard>
  );
};

export default EnrollmentQuickActions;
