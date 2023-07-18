import { Grid, Paper, Stack } from '@mui/material';
import { useMemo } from 'react';

import { ClickToCopyId } from '@/components/elements/ClickToCopyId';
import { CommonLabeledTextBlock } from '@/components/elements/CommonLabeledTextBlock';
import TitleCard from '@/components/elements/TitleCard';
import PageTitle from '@/components/layout/PageTitle';
import { useEnrollmentDashboardContext } from '@/components/pages/EnrollmentDashboard';
import NotFound from '@/components/pages/NotFound';
import useSafeParams from '@/hooks/useSafeParams';
import EnrollmentQuickActions from '@/modules/enrollment/components/EnrollmentQuickActions';
import HouseholdMemberTable, {
  HOUSEHOLD_MEMBER_COLUMNS,
} from '@/modules/household/components/HouseholdMemberTable';

const EnrollmentOverview = () => {
  const { enrollment } = useEnrollmentDashboardContext();
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

  if (!enrollment) return <NotFound />;

  return (
    <>
      <PageTitle title='Enrollment Overview' />
      <Grid container spacing={4}>
        <Grid item xs={9}>
          <Stack spacing={2}>
            <TitleCard
              title='Household'
              headerVariant='border'
              actions={
                <CommonLabeledTextBlock title='Household ID' horizontal>
                  <ClickToCopyId value={enrollment.householdId} />
                </CommonLabeledTextBlock>
              }
            >
              <HouseholdMemberTable
                clientId={clientId}
                enrollmentId={enrollmentId}
                hideActions
                columns={householdColumns}
              />
            </TitleCard>
          </Stack>
        </Grid>
        <Grid item xs={3}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <EnrollmentQuickActions enrollment={enrollment} />
          </Paper>
          {enrollment.currentUnit && (
            <Paper sx={{ p: 2, mb: 2 }}>
              <CommonLabeledTextBlock title='Unit Assignment'>
                {enrollment.currentUnit.name}
              </CommonLabeledTextBlock>
            </Paper>
          )}
        </Grid>
      </Grid>
    </>
  );
};

export default EnrollmentOverview;
