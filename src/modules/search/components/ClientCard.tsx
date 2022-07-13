import { Card, Grid } from '@mui/material';

const ClientCard: React.FC<{ client: Client }> = ({ client }) => (
  <Card sx={{ mb: 2 }}>
    <Grid container>
      <Grid item xs={6} sx={{ backgroundColor: 'pink', pl: 1 }}>
        ALERT
      </Grid>
      <Grid item xs={6} sx={{ backgroundColor: 'lightblue', pl: 1 }}>
        Information Notes
      </Grid>
    </Grid>
    <Grid container sx={{ p: 1 }}>
      <Grid item xs={6}>
        {/* FIXME: create component for safe name display */}
        <div>{`${client.preferredName || client.firstName || ''} ${
          client.lastName || ''
        }`}</div>
        <div>{client.dob}</div>
        <div>{client.ssn}</div>
        <div>{client.id}</div>
      </Grid>
      <Grid item xs={6} sx={{ pl: 1 }}>
        Recent Enrollments
      </Grid>
    </Grid>
  </Card>
);

export default ClientCard;
