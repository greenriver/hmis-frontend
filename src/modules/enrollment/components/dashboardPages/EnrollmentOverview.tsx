import { Grid, Stack } from '@mui/material';
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import EnrollmentDetails from '../EnrollmentDetails';

import EnrollmentReminders from '@/components/clientDashboard/enrollments/EnrollmentReminders';
import TitleCard from '@/components/elements/TitleCard';
import PageTitle from '@/components/layout/PageTitle';
import { useEnrollmentDashboardContext } from '@/components/pages/EnrollmentDashboard';
import NotFound from '@/components/pages/NotFound';
import useSafeParams from '@/hooks/useSafeParams';
import DeleteMutationButton from '@/modules/dataFetching/components/DeleteMutationButton';
import EnrollmentQuickActions from '@/modules/enrollment/components/EnrollmentQuickActions';
import { clientBriefName } from '@/modules/hmis/hmisUtil';
import HouseholdMemberTable, {
  HOUSEHOLD_MEMBER_COLUMNS,
} from '@/modules/household/components/HouseholdMemberTable';
import { ClientDashboardRoutes } from '@/routes/routes';
import {
  DeleteEnrollmentDocument,
  DeleteEnrollmentMutation,
  DeleteEnrollmentMutationVariables,
} from '@/types/gqlTypes';
import { evictDeletedEnrollment } from '@/utils/cacheUtil';
import generateSafePath from '@/utils/generateSafePath';

const EnrollmentOverview = () => {
  const { enrollment } = useEnrollmentDashboardContext();
  const navigate = useNavigate();
  const { clientId, enrollmentId } = useSafeParams() as {
    enrollmentId: string;
    clientId: string;
  };

  const householdColumns = useMemo(
    () => [
      HOUSEHOLD_MEMBER_COLUMNS.hohIndicator,
      HOUSEHOLD_MEMBER_COLUMNS.clientName({ currentClientId: clientId }),
      HOUSEHOLD_MEMBER_COLUMNS.relationshipToHoh,
      HOUSEHOLD_MEMBER_COLUMNS.enrollmentStatus,
    ],
    [clientId]
  );

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
        <Grid item xs={8}>
          <Stack spacing={4}>
            <TitleCard title='Household' headerVariant='border'>
              <HouseholdMemberTable
                clientId={clientId}
                enrollmentId={enrollmentId}
                hideActions
                columns={householdColumns}
                condensed
              />
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
          </Stack>
        </Grid>
        <Grid item xs={3}>
          <Stack spacing={2}>
            <EnrollmentReminders enrollmentId={enrollment.id} />
            <TitleCard title='Quick Actions'>
              <EnrollmentQuickActions enrollment={enrollment} />
            </TitleCard>
            {enrollment.inProgress && (
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
            )}
          </Stack>
        </Grid>
      </Grid>
    </>
  );
};

export default EnrollmentOverview;
