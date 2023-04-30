import { Button, Card, Grid, Typography } from '@mui/material';

import ButtonLink from '@/components/elements/ButtonLink';
import { ClientPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import { ClientDashboardRoutes } from '@/routes/routes';
import { ClientFieldsFragment } from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

interface Props {
  client: ClientFieldsFragment;
}

const ClientActionsCard: React.FC<Props> = ({ client }) => {
  return (
    <ClientPermissionsFilter
      id={client.id}
      permissions={['canEditEnrollments']}
    >
      <Card sx={{ mb: 2, p: 2 }}>
        <Typography sx={{ mb: 2 }}>Quick Actions</Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6}>
            <ButtonLink
              fullWidth
              variant='outlined'
              data-testid='enrollButton'
              to={generateSafePath(ClientDashboardRoutes.NEW_ENROLLMENT, {
                clientId: client.id,
              })}
            >
              Enroll
            </ButtonLink>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button fullWidth variant='outlined' color='secondary'>
              Add Service
            </Button>
          </Grid>
        </Grid>
      </Card>
    </ClientPermissionsFilter>
  );
};

export default ClientActionsCard;
