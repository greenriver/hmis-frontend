import { Grid, Stack } from '@mui/material';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import EnrollmentDetails from '../EnrollmentDetails';
import EnrollmentReminders from '../EnrollmentReminders';

import TitleCard from '@/components/elements/TitleCard';
import PageTitle from '@/components/layout/PageTitle';
import NotFound from '@/components/pages/NotFound';
import useSafeParams from '@/hooks/useSafeParams';
import { ClientAlertHouseholdWrapper } from '@/modules/clientAlerts/components/ClientAlertWrappers';
import DeleteMutationButton from '@/modules/dataFetching/components/DeleteMutationButton';
import EnrollmentQuickActions from '@/modules/enrollment/components/EnrollmentQuickActions';
import useEnrollmentDashboardContext from '@/modules/enrollment/hooks/useEnrollmentDashboardContext';
import { clientBriefName } from '@/modules/hmis/hmisUtil';
import HouseholdOverviewTable from '@/modules/household/components/HouseholdOverviewTable';
import StaffAssignmentCard from '@/modules/staffAssignment/components/StaffAssignmentCard';
import { ClientDashboardRoutes } from '@/routes/routes';
import {
  DeleteEnrollmentDocument,
  DeleteEnrollmentMutation,
  DeleteEnrollmentMutationVariables,
} from '@/types/gqlTypes';
import { evictDeletedEnrollment } from '@/utils/cacheUtil';
import { generateSafePath } from '@/utils/pathEncoding';

const EnrollmentOverview = () => {
  const { enrollment, getEnrollmentFeature } = useEnrollmentDashboardContext();
  const navigate = useNavigate();
  const { clientId, enrollmentId } = useSafeParams() as {
    enrollmentId: string;
    clientId: string;
  };

  const onSuccessfulDelete = useCallback(() => {
    evictDeletedEnrollment({ enrollmentId, clientId });
    navigate(
      generateSafePath(ClientDashboardRoutes.CLIENT_ENROLLMENTS, { clientId })
    );
  }, [navigate, clientId, enrollmentId]);

  if (!enrollment) return <NotFound />;

  return (
    <>
      <PageTitle title='Enrollment Overview' />
      <Grid container spacing={4}>
        <Grid item md={8} xs={12}>
          <Stack spacing={4}>
            <TitleCard title='Household' headerVariant='border'>
              <HouseholdOverviewTable enrollmentId={enrollmentId} />
            </TitleCard>
            <TitleCard
              title={`${
                enrollment.householdSize > 1
                  ? clientBriefName(enrollment.client)
                  : ''
              } Enrollment Details`}
            >
              <EnrollmentDetails enrollment={enrollment} />
            </TitleCard>
            {enrollment.project.staffAssignmentsEnabled && (
              <StaffAssignmentCard householdId={enrollment.householdId} />
            )}
          </Stack>
        </Grid>
        <Grid item md={4} xs={12}>
          <Stack spacing={4}>
            <ClientAlertHouseholdWrapper householdId={enrollment.householdId} />
            <EnrollmentReminders enrollmentId={enrollment.id} />
            <EnrollmentQuickActions
              enrollment={enrollment}
              getEnrollmentFeature={getEnrollmentFeature}
            />
            {
              // User sees the Delete Enrollment button here under two circumstances:
              // 1. The enrollment is incomplete, and the user has permission to edit the enrollment
              ((enrollment.access.canEditEnrollments &&
                enrollment.inProgress) ||
                // 2. The enrollment is complete but missing an intake (bad data), and the user has permission to delete the enrollment.
                // (Normally completed enrollments can only be deleted by deleting their intake assessment, so this workaround enables cleaning up bad data)
                (enrollment.access.canDeleteEnrollments &&
                  !enrollment.inProgress &&
                  !enrollment.intakeAssessment)) && (
                <DeleteMutationButton<
                  DeleteEnrollmentMutation,
                  DeleteEnrollmentMutationVariables
                >
                  queryDocument={DeleteEnrollmentDocument}
                  variables={{ input: { id: enrollment.id } }}
                  idPath='deleteEnrollment.enrollment.id'
                  recordName='Enrollment'
                  onSuccess={onSuccessfulDelete}
                  ButtonProps={{
                    sx: {
                      justifyContent: 'left',
                      alignSelf: 'flex-end',
                      width: 'fit-content',
                    },
                    size: 'small',
                  }}
                  deleteIcon
                >
                  Delete Enrollment
                </DeleteMutationButton>
              )
            }
          </Stack>
        </Grid>
      </Grid>
    </>
  );
};

export default EnrollmentOverview;
