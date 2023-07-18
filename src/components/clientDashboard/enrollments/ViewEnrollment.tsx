import { Grid, Paper, Stack } from '@mui/material';

import EnrollmentRecordTabs from './EnrollmentRecordTabs';

import { ClickToCopyId } from '@/components/elements/ClickToCopyId';
import { CommonLabeledTextBlock } from '@/components/elements/CommonLabeledTextBlock';
import TitleCard from '@/components/elements/TitleCard';
import PageTitle from '@/components/layout/PageTitle';
import { useEnrollmentDashboardContext } from '@/components/pages/EnrollmentDashboard';
import NotFound from '@/components/pages/NotFound';
import useSafeParams from '@/hooks/useSafeParams';
import EnrollmentQuickActions from '@/modules/enrollment/components/EnrollmentQuickActions';
import HouseholdMemberTable from '@/modules/household/components/HouseholdMemberTable';
import { useServiceDialog } from '@/modules/services/hooks/useServiceDialog';

const ViewEnrollment = () => {
  const { enrollment } = useEnrollmentDashboardContext();
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
      <PageTitle title='Enrollment Overview' />
      <Grid container spacing={4}>
        <Grid item xs={8}>
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
              />
            </TitleCard>

            <Paper sx={{ pt: 2 }}>
              <EnrollmentRecordTabs enrollment={enrollment} />
            </Paper>
          </Stack>
        </Grid>
        <Grid item xs={3}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <EnrollmentQuickActions
              clientId={clientId}
              enrollmentId={enrollmentId}
              openServiceDialog={openServiceDialog}
            />
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
      {renderServiceDialog()}
    </>
  );
};

export default ViewEnrollment;
