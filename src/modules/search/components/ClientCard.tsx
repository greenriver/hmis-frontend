import { Button, Card, Grid, Link, Stack, Typography } from '@mui/material';
import { format } from 'date-fns';
import { Link as RouterLink } from 'react-router-dom';

import ClickToShow from '@/components/elements/ClickToShow';
import { Client } from '@/types/gqlTypes';

const displayName = (client: Client) => {
  if (!client.preferredName && !client.firstName && !client.lastName) {
    return 'Name Unknown';
  }
  const first = client.preferredName || client.firstName;
  return [first, client.lastName].join(' ');
};

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
        <Stack spacing={1}>
          {/* FIXME: create component for safe name display */}
          <Typography variant='h6'>{displayName(client)}</Typography>
          <Stack spacing={1} direction='row'>
            <img alt='client' src='https://via.placeholder.com/100' />
            <Stack spacing={0.5}>
              <div>
                <ClickToShow text='Show DOB'>{client.dob}</ClickToShow>
              </div>
              <div>
                <ClickToShow text='Show SSN'>{client.ssnSerial}</ClickToShow>
              </div>
              <Button
                variant='outlined'
                component={RouterLink}
                to={`/client/${client.id}`}
                target='_blank'
              >
                Go to Record
              </Button>
            </Stack>
          </Stack>
          <Typography>{client.id}</Typography>
          <Typography variant='caption' sx={{ fontStyle: 'italic' }}>
            Last Updated on {format(new Date(), 'MM/dd/yyyy')} by XXXX
          </Typography>
        </Stack>
      </Grid>
      <Grid item xs={6} sx={{ pl: 1 }}>
        <Grid container>
          <Grid item xs={8}>
            <Typography sx={{ mb: 1 }}>Recent Enrollments</Typography>
            {!client.enrollments && <Typography>None found.</Typography>}
            {client.enrollments && (
              <Stack>
                {client.enrollments.map((enrollment) => (
                  <Stack direction='row' key={enrollment.id}>
                    <Link
                      component={RouterLink}
                      to={`/client/${client.id}/enrollment/${enrollment.id}`}
                      target='_blank'
                    >
                      {enrollment.project?.projectName}
                    </Link>
                    <Typography sx={{ ml: 1 }}>
                      {enrollment.entryDate} - {enrollment.exitDate || 'active'}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            )}
          </Grid>

          <Grid item xs={4}>
            <Stack spacing={1}>
              <Stack spacing={1} direction='row' justifyContent='space-between'>
                <Button fullWidth variant='outlined'>
                  Enroll
                </Button>
                <Button fullWidth variant='outlined' color='error'>
                  Exit
                </Button>
              </Stack>
              <Button variant='outlined'>Case Notes</Button>
              <Button variant='outlined'>Add Service</Button>
            </Stack>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  </Card>
);

export default ClientCard;
