import {
  Alert,
  Box,
  Button,
  Card,
  Grid,
  Link,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { Fragment } from 'react';
import { generatePath, Link as RouterLink } from 'react-router-dom';

import ClickToShow from '@/components/elements/ClickToShow';
import * as HmisUtil from '@/modules/hmis/hmisUtil';
import { DashboardRoutes } from '@/routes/routes';
import {
  ClientFieldsFragment,
  useGetClientEnrollmentsQuery,
} from '@/types/gqlTypes';

const RecentEnrollments = ({
  clientId,
  linkTargetBlank,
}: {
  clientId: string;
  linkTargetBlank?: boolean;
}) => {
  // Fetch recent enrollments
  const {
    data: { client } = {},
    loading,
    error,
  } = useGetClientEnrollmentsQuery({
    variables: { id: clientId },
  });

  if (error) throw error;
  if (loading || !client)
    return <Skeleton variant='rectangular' width={230} height={150} />;

  if (client.enrollments.nodesCount === 0)
    return <Typography>None.</Typography>;

  return (
    <Grid container spacing={0.5}>
      {client.enrollments.nodes.map((enrollment) => (
        <Fragment key={enrollment.id}>
          <Grid item xs={6}>
            <Link
              component={RouterLink}
              to={generatePath(DashboardRoutes.VIEW_ENROLLMENT, {
                clientId: client.id,
                enrollmentId: enrollment.id,
              })}
              target={linkTargetBlank ? '_blank' : undefined}
              variant='body2'
            >
              {enrollment.project.projectName}
            </Link>
          </Grid>
          <Grid item xs={6}>
            <Typography variant='body2' sx={{ ml: 1, color: 'text.secondary' }}>
              {HmisUtil.entryExitRange(enrollment)}
            </Typography>
          </Grid>
        </Fragment>
      ))}
    </Grid>
  );
};

interface Props {
  client: ClientFieldsFragment;
  showNotices?: boolean;
  showLinkToRecord?: boolean;
  linkTargetBlank?: boolean;
}

const ClientCard: React.FC<Props> = ({
  client,
  showNotices = false,
  showLinkToRecord = false,
  linkTargetBlank = false,
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
            <Typography variant='h5'>{HmisUtil.clientName(client)}</Typography>
            <Typography variant='h5' color='text.secondary'>
              {HmisUtil.pronouns(client)}
            </Typography>
          </Stack>
          <Stack spacing={1} direction='row'>
            <Box
              component='img'
              alt='client'
              src='https://dummyimage.com/150x150/e8e8e8/aaa'
              sx={{
                height: 150,
                width: 150,
                mr: 1,
              }}
            />
            <Stack spacing={0.5} sx={{ pr: 1 }}>
              <Typography variant='body2' sx={{ wordBreak: 'break-all' }}>
                ID {client.personalId}
              </Typography>
              {client.dob && (
                <ClickToShow text='Date of Birth' variant='body2'>
                  <Typography variant='body2'>
                    {HmisUtil.dob(client)}
                  </Typography>
                </ClickToShow>
              )}
              {client.ssnSerial && (
                <ClickToShow text='Last 4 Social' variant='body2'>
                  <Typography variant='body2'>{client.ssnSerial}</Typography>
                </ClickToShow>
              )}
              {client.dob && (
                <Typography variant='body2'>
                  Current Age: {HmisUtil.age(client)}
                </Typography>
              )}
              {showLinkToRecord && (
                <Box sx={{ pt: 1 }}>
                  <Button
                    variant='contained'
                    component={RouterLink}
                    to={`/client/${client.id}`}
                    target={linkTargetBlank ? '_blank' : undefined}
                    color='secondary'
                  >
                    Go to Profile
                  </Button>
                </Box>
              )}
            </Stack>
          </Stack>
          <Typography variant='body2' sx={{ fontStyle: 'italic' }}>
            Last Updated on {HmisUtil.lastUpdated(client)}
          </Typography>
        </Stack>
      </Grid>
      <Grid item xs={5}>
        <Typography variant='h6' sx={{ mb: 1 }}>
          Recent Enrollments
        </Typography>
        <RecentEnrollments
          clientId={client.id}
          linkTargetBlank={linkTargetBlank}
        />
      </Grid>
      <Grid item xs={2}>
        <Typography variant='h6' sx={{ mb: 1 }}>
          Actions
        </Typography>
        <Stack spacing={1}>
          <Button
            fullWidth
            variant='outlined'
            color='secondary'
            component={RouterLink}
            to={generatePath(DashboardRoutes.NEW_ENROLLMENT, {
              clientId: client.id,
            })}
          >
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
