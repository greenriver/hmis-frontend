import { Button } from '@mui/material';
import { Stack } from '@mui/system';

import { useMemo } from 'react';
import ButtonLink from '@/components/elements/ButtonLink';
import TitleCard from '@/components/elements/TitleCard';
import { useClientFormDialog } from '@/modules/client/hooks/useClientFormDialog';
import useEnrollmentDashboardContext from '@/modules/enrollment/hooks/useEnrollmentDashboardContext';
import { DashboardEnrollment } from '@/modules/hmis/types';
import { useHmisAppSettings } from '@/modules/hmisAppSettings/useHmisAppSettings';
import { useServiceDialog } from '@/modules/services/hooks/useServiceDialog';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import { DataCollectionFeatureRole } from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

const EnrollmentQuickActions = ({
  enrollment,
}: {
  enrollment: DashboardEnrollment;
}) => {
  const { getEnrollmentFeature } = useEnrollmentDashboardContext();
  const { globalFeatureFlags } = useHmisAppSettings();
  const { renderServiceDialog, openServiceDialog } = useServiceDialog({
    enrollment,
  });

  const { openClientFormDialog, renderClientFormDialog, clientLoading } =
    useClientFormDialog({
      clientId: enrollment.client.id,
    });

  const serviceFeature = getEnrollmentFeature(
    DataCollectionFeatureRole.Service
  );

  const canRecordService = useMemo(
    () =>
      !!serviceFeature &&
      !serviceFeature.legacy &&
      enrollment.access.canEditEnrollments,
    [serviceFeature, enrollment.access.canEditEnrollments]
  );

  const canEditClient = enrollment.client.access.canEditClient;

  const canViewEsgFundingReport =
    enrollment.project.access.canManageIncomingReferrals &&
    globalFeatureFlags?.externalReferrals;

  if (
    ![canRecordService, canEditClient, canViewEsgFundingReport].some((b) => !!b)
  ) {
    return null;
  }

  return (
    <TitleCard title='Quick Actions'>
      <Stack spacing={2} sx={{ px: 2, pb: 2, textAlign: 'center' }}>
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
