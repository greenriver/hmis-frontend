import { Grid, Stack, Typography } from '@mui/material';
import { useCallback, useMemo } from 'react';
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
import {
  clientBriefName,
  isHeadOfMultiMemberHousehold,
} from '@/modules/hmis/hmisUtil';
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

  const isHoHInMultiMemberHousehold = useMemo(
    () => (enrollment ? isHeadOfMultiMemberHousehold(enrollment) : false),
    [enrollment]
  );

  if (!enrollment) return <NotFound />;

  const { canDeleteEnrollments, canEditEnrollments } = enrollment.access;

  return (
    <>
      <PageTitle title='Enrollment Overview' />
      <Grid container spacing={4}>
        <Grid item md={8} xs={12}>
          <Stack spacing={4}>
            <TitleCard
              title='Household'
              headerVariant='border'
              headerComponent='h2'
            >
              <HouseholdOverviewTable enrollmentId={enrollmentId} />
            </TitleCard>
            <TitleCard
              title={`${
                enrollment.householdSize > 1
                  ? clientBriefName(enrollment.client)
                  : ''
              } Enrollment Details`}
              headerComponent='h2'
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
            {canDeleteEnrollments &&
              canEditEnrollments &&
              (enrollment.inProgress || !enrollment.intakeAssessment) && (
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
                  confirmationDialogContent={
                    <Stack gap={1}>
                      <Typography>
                        Are you sure you want to delete this enrollment?
                      </Typography>
                      {isHoHInMultiMemberHousehold && (
                        <Typography fontWeight={600}>
                          This will delete all enrollments in the household.
                        </Typography>
                      )}
                    </Stack>
                  }
                >
                  Delete Enrollment
                </DeleteMutationButton>
              )}
          </Stack>
        </Grid>
      </Grid>
    </>
  );
};

export default EnrollmentOverview;
