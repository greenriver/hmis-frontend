import {
  Alert,
  Button,
  Card,
  Grid,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import ClickToShow from '@/components/elements/ClickToShow';
import * as HmisUtil from '@/modules/hmis/hmisUtil';
import { Client } from '@/types/gqlTypes';

interface Props {
  client: Client;
  showNotices?: boolean;
  showLinkToRecord?: boolean;
}

const ClientCard: React.FC<Props> = ({
  client,
  showNotices = false,
  showLinkToRecord = false,
}) => (
  <Card sx={{ mb: 2, p: 2 }}>
    {showNotices && (
      <Grid container spacing={4} justifyContent='space-between'>
        <Grid item xs={4}>
          <Alert severity='error'>An immediate action needs to be taken</Alert>
        </Grid>
        <Grid item xs={4}>
          <Alert severity='info'>Information notes</Alert>
        </Grid>
      </Grid>
    )}
    <Grid container sx={{ p: 1 }}>
      <Grid item xs={5}>
        <Stack spacing={1}>
          <Stack direction='row' spacing={1}>
            <Typography variant='h6'>{HmisUtil.name(client)}</Typography>
            <Typography variant='h6' color='text.secondary'>
              {HmisUtil.pronouns(client)}
            </Typography>
          </Stack>
          <Stack spacing={1} direction='row'>
            <img alt='client' src='https://via.placeholder.com/150' />
            <Stack spacing={0.5}>
              <Typography>ID {client.personalId}</Typography>
              {client.dob && (
                <ClickToShow text='Date of Birth'>
                  <Typography>{HmisUtil.dob(client)}</Typography>
                </ClickToShow>
              )}
              {client.ssnSerial && (
                <ClickToShow text='Last 4 Social'>
                  <Typography>{client.ssnSerial}</Typography>
                </ClickToShow>
              )}
              {client.dob && (
                <Typography>Current Age: {HmisUtil.age(client)}</Typography>
              )}
              {showLinkToRecord && (
                <Button
                  variant='contained'
                  component={RouterLink}
                  to={`/client/${client.id}`}
                  target='_blank'
                  color='secondary'
                >
                  Go to Record
                </Button>
              )}
            </Stack>
          </Stack>
          <Typography variant='body2' sx={{ fontStyle: 'italic' }}>
            Last Updated on {HmisUtil.lastUpdated(client)}
          </Typography>
        </Stack>
      </Grid>
      <Grid item xs={5} sx={{ pt: 3 }}>
        <Typography
          variant='body2'
          sx={{ mb: 1, color: 'text.secondary', textTransform: 'uppercase' }}
        >
          Recent Enrollments
        </Typography>
        {!client.enrollments && <Typography>None found.</Typography>}
        {client.enrollments && (
          <Grid container spacing={0.5}>
            {client.enrollments.map((enrollment) => (
              <>
                <Grid item xs={4}>
                  <Link
                    component={RouterLink}
                    to={`/client/${client.id}/enrollment/${enrollment.id}`}
                    target='_blank'
                    variant='body2'
                  >
                    {enrollment.project.projectName}
                  </Link>
                </Grid>
                <Grid item xs={8}>
                  <Typography
                    variant='body2'
                    sx={{ ml: 1, color: 'text.secondary' }}
                  >
                    {HmisUtil.entryExitRange(enrollment)}
                  </Typography>
                </Grid>
              </>
            ))}
          </Grid>
        )}
      </Grid>
      <Grid item xs={2} sx={{ pt: 3 }}>
        <Stack spacing={1}>
          <Button fullWidth variant='outlined' color='secondary'>
            Enroll
          </Button>
          <Button fullWidth variant='outlined' color='error'>
            Exit
          </Button>
          <Button variant='outlined' color='secondary'>
            Case Notes
          </Button>
          <Button variant='outlined' color='secondary'>
            Add Service
          </Button>
        </Stack>
      </Grid>
    </Grid>
  </Card>
);

export default ClientCard;
