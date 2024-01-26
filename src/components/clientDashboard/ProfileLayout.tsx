import { Box, Grid, Stack } from '@mui/material';

import ClientAlertFrame, {
  AlertContext,
} from '@/modules/client/components/clientAlerts/ClientAlertFrame';
import ClientCustomDataElementsCard from '@/modules/client/components/ClientCustomDataElementsCard';
import ClientEnrollmentCard from '@/modules/client/components/ClientEnrollmentCard';
import ClientProfileCard from '@/modules/client/components/ClientProfileCard';
import { ClientFieldsFragment } from '@/types/gqlTypes';

export interface Props {
  client: ClientFieldsFragment;
}

const ProfileLayout: React.FC<Props> = ({ client }) => {
  const canViewEnrollments = client.access.canViewEnrollmentDetails;
  const canViewClientAlerts = client.access.canViewClientAlerts;
  return (
    <Box data-testid='clientProfile'>
      <Grid container spacing={2}>
        <Grid item md={12} lg={canViewEnrollments ? 6 : 8}>
          <Stack gap={2}>
            <ClientProfileCard client={client} />
            <ClientCustomDataElementsCard client={client} />
          </Stack>
        </Grid>
        <Grid item md={12} lg={6}>
          <Stack gap={2}>
            {canViewClientAlerts && (
              <ClientAlertFrame
                clients={[client]}
                alertContext={AlertContext.Client}
              />
            )}
            {canViewEnrollments && <ClientEnrollmentCard client={client} />}
          </Stack>
        </Grid>
        {/* disabled "quick actions" card because the only action was Enroll in Project, which
          we are disabling for now #185750557 */}
        {/* <ClientActionsCard client={client} /> */}
      </Grid>
    </Box>
  );
};

export default ProfileLayout;
