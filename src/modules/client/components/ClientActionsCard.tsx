import { Button, Card, Grid, Typography } from '@mui/material';

import ButtonLink from '@/components/elements/ButtonLink';
import { DashboardRoutes } from '@/routes/routes';
import { ClientFieldsFragment } from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

interface Props {
  client: ClientFieldsFragment;
}

const ClientActionsCard: React.FC<Props> = ({ client }) => {
  return (
    <Card sx={{ mb: 2, p: 2 }}>
      <Typography sx={{ mb: 1.5 }}>Quick Actions</Typography>
      <Grid container spacing={1}>
        <Grid item xs={12} sm={6}>
          <ButtonLink
            fullWidth
            variant='outlined'
            data-testid='enrollButton'
            to={generateSafePath(DashboardRoutes.NEW_ENROLLMENT, {
              clientId: client.id,
            })}
          >
            Enroll
          </ButtonLink>
        </Grid>
        {/* <Grid item xs={12} sm={6}>
          <Button fullWidth variant='outlined' color='error'>
            Exit
          </Button>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Button fullWidth variant='outlined'>
            Case Notes
          </Button>
        </Grid> */}
        <Grid item xs={12} sm={6}>
          <Button fullWidth variant='outlined'>
            Add Service
          </Button>
        </Grid>
      </Grid>
    </Card>
  );
};

export default ClientActionsCard;
