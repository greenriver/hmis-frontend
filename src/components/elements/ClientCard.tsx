import {
  Alert,
  Box,
  Button,
  Card,
  Grid,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { Fragment } from 'react';
import { generatePath } from 'react-router-dom';

import ButtonLink from './ButtonLink';
import RouterLink from './RouterLink';

import ClickToShow from '@/components/elements/ClickToShow';
import {
  lastUpdated,
  clientName,
  pronouns,
  dob,
  age,
  entryExitRange,
} from '@/modules/hmis/hmisUtil';
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
            <RouterLink
              to={generatePath(DashboardRoutes.VIEW_ENROLLMENT, {
                clientId: client.id,
                enrollmentId: enrollment.id,
              })}
              target={linkTargetBlank ? '_blank' : undefined}
              variant='body2'
            >
              {enrollment.project.projectName}
            </RouterLink>
          </Grid>
          <Grid item xs={6}>
            <Typography variant='body2' sx={{ ml: 1, color: 'text.secondary' }}>
              {entryExitRange(enrollment)}
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
  showEditLink?: boolean;
  linkTargetBlank?: boolean;
}

const ClientCard: React.FC<Props> = ({
  client,
  showNotices = false,
  showEditLink = false,
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
            <Typography variant='h5'>{clientName(client)}</Typography>
            <Typography variant='h5' color='text.secondary'>
              {pronouns(client)}
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
                  <Typography variant='body2'>{dob(client)}</Typography>
                </ClickToShow>
              )}
              {client.ssn && (
                <ClickToShow text='SSN' variant='body2'>
                  <Typography variant='body2'>{client.ssn}</Typography>
                </ClickToShow>
              )}
              {client.dob && (
                <Typography variant='body2'>
                  Current Age: {age(client)}
                </Typography>
              )}
              {showLinkToRecord && (
                <Box sx={{ pt: 1 }}>
                  <ButtonLink
                    data-testid='goToProfileButton'
                    variant='contained'
                    to={`/client/${client.id}`}
                    target={linkTargetBlank ? '_blank' : undefined}
                    color='secondary'
                  >
                    Go to Profile
                  </ButtonLink>
                </Box>
              )}
              {showEditLink && (
                <Box sx={{ pt: 1 }}>
                  <ButtonLink
                    data-testid='editClientButton'
                    variant='contained'
                    to={generatePath(DashboardRoutes.EDIT, {
                      clientId: client.id,
                    })}
                    target={linkTargetBlank ? '_blank' : undefined}
                    color='secondary'
                    size='small'
                  >
                    Edit Client Details
                  </ButtonLink>
                </Box>
              )}
            </Stack>
          </Stack>
          <Typography variant='body2' sx={{ fontStyle: 'italic' }}>
            Last Updated on {lastUpdated(client)}
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
          <ButtonLink
            fullWidth
            variant='outlined'
            color='secondary'
            to={generatePath(DashboardRoutes.NEW_ENROLLMENT, {
              clientId: client.id,
            })}
          >
            Enroll
          </ButtonLink>
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
