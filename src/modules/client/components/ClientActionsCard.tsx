import { Card, Grid, Typography } from '@mui/material';

import ButtonLink from '@/components/elements/ButtonLink';
import {
  ClientPermissionsFilter,
  RootPermissionsFilter,
} from '@/modules/permissions/PermissionsFilters';
import { ClientDashboardRoutes } from '@/routes/routes';
import { ClientFieldsFragment } from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

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
          <RootPermissionsFilter permissions='canEnrollClients'>
            <Grid item xs={12} sm={6}>
              <ButtonLink
                fullWidth
                variant='outlined'
                data-testid='enrollButton'
                to={generateSafePath(ClientDashboardRoutes.NEW_ENROLLMENT, {
                  clientId: client.id,
                })}
              >
                Enroll in Project
              </ButtonLink>
            </Grid>
          </RootPermissionsFilter>
        </Grid>
      </Card>
    </ClientPermissionsFilter>
  );
};

export default ClientActionsCard;
