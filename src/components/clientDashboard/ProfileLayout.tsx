import { Box, Grid, Stack } from '@mui/material';

import { ClientAlertProfileWrapper } from '@/modules/client/components/clientAlerts/ClientAlertWrappers';
import ClientCustomDataElementsCard from '@/modules/client/components/ClientCustomDataElementsCard';
import ClientEnrollmentCard from '@/modules/client/components/ClientEnrollmentCard';
import ClientProfileCard from '@/modules/client/components/ClientProfileCard';
import { ClientFieldsFragment } from '@/types/gqlTypes';

export interface Props {
  client: ClientFieldsFragment;
}

const ProfileLayout: React.FC<Props> = ({ client }) => {
  const { canViewEnrollmentDetails, canViewClientAlerts } = client.access;
  const hasRightColumn = canViewEnrollmentDetails || canViewClientAlerts;
  return (
    <Box data-testid='clientProfile'>
      <Grid container spacing={2}>
        <Grid item md={12} lg={hasRightColumn ? 6 : 8}>
          <Stack gap={2}>
            <ClientProfileCard client={client} />
            <ClientCustomDataElementsCard client={client} />
          </Stack>
        </Grid>
        {hasRightColumn && (
          <Grid item md={12} lg={6}>
            <Stack gap={2}>
              {canViewClientAlerts && (
                <ClientAlertProfileWrapper client={client} />
              )}
              {canViewEnrollmentDetails && (
                <ClientEnrollmentCard client={client} />
              )}
            </Stack>
          </Grid>
        )}
        {/* disabled "quick actions" card because the only action was Enroll in Project, which
          we are disabling for now #185750557 */}
        {/* <ClientActionsCard client={client} /> */}
      </Grid>
    </Box>
  );
};

export default ProfileLayout;
