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
import { isEmpty } from 'lodash-es';
import { Fragment, useMemo } from 'react';

import ButtonLink from './ButtonLink';
import { ClientCardImageElement } from './ClientProfileCard';
import RouterLink from './RouterLink';

import ClientDobAge from '@/modules/hmis/components/ClientDobAge';
import ClientSsn from '@/modules/hmis/components/ClientSsn';
import {
  clientNameWithoutPreferred,
  entryExitRange,
  isRecentEnrollment,
  lastUpdated,
  pronouns,
} from '@/modules/hmis/hmisUtil';
import { DashboardRoutes } from '@/routes/routes';
import {
  ClientFieldsFragment,
  useGetClientEnrollmentsQuery,
  useGetClientImageQuery,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const RecentEnrollments = ({
  clientId,
  linkTargetBlank,
}: {
  clientId: string;
  linkTargetBlank?: boolean;
}) => {
  const {
    data: { client } = {},
    loading,
    error,
  } = useGetClientEnrollmentsQuery({
    variables: { id: clientId },
  });

  const recentEnrollments = useMemo(
    () =>
      client
        ? client.enrollments.nodes.filter((enrollment) =>
            isRecentEnrollment(enrollment)
          )
        : undefined,
    [client]
  );

  if (error) throw error;
  if (loading || !client)
    return <Skeleton variant='rectangular' width={230} height={150} />;

  if (recentEnrollments && recentEnrollments.length === 0)
    return <Typography>None.</Typography>;

  return (
    <Grid container spacing={0.5}>
      {recentEnrollments &&
        recentEnrollments.map((enrollment) => (
          <Fragment key={enrollment.id}>
            <Grid item xs={6}>
              <RouterLink
                to={generateSafePath(DashboardRoutes.VIEW_ENROLLMENT, {
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
              <Typography
                variant='body2'
                sx={{ ml: 1, color: 'text.secondary' }}
              >
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
  hideImage?: boolean;
}

const ClientCard: React.FC<Props> = ({
  client,
  showNotices = false,
  showEditLink = false,
  showLinkToRecord = false,
  linkTargetBlank = false,
  hideImage = false,
}) => {
  const {
    data: { client: clientImageData } = {},
    loading: imageLoading = false,
  } = useGetClientImageQuery({
    variables: { id: client.id },
    skip: hideImage,
  });
  const primaryName =
    client.preferredName || clientNameWithoutPreferred(client);
  const secondaryName = client.preferredName
    ? clientNameWithoutPreferred(client)
    : null;

  return (
    <Card sx={{ mb: 2, p: 2 }}>
      {showNotices && (
        <Grid container spacing={4} justifyContent='space-between'>
          <Grid item xs={4}>
            <Alert severity='error'>
              An immediate action needs to be taken
            </Alert>
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
              <Typography variant='h5'>{primaryName}</Typography>
              {!isEmpty(client.pronouns) && (
                <Typography variant='h5' color='text.secondary'>
                  ({pronouns(client)})
                </Typography>
              )}
            </Stack>
            <Stack spacing={1} direction='row'>
              {hideImage ? null : imageLoading ? (
                <Skeleton
                  variant='rectangular'
                  sx={{
                    height: 150,
                    width: 150,
                    mr: 1,
                  }}
                />
              ) : (
                <ClientCardImageElement
                  size={150}
                  client={clientImageData || undefined}
                />
              )}

              <Stack spacing={0.5} sx={{ pr: 1 }}>
                {secondaryName && (
                  <Typography
                    variant='body1'
                    color='text.secondary'
                    fontStyle='italic'
                  >
                    {secondaryName}
                  </Typography>
                )}
                <Typography variant='body2' sx={{ wordBreak: 'break-all' }}>
                  ID {client.personalId}
                </Typography>
                <ClientDobAge client={client} />
                <ClientSsn client={client} />
                {showLinkToRecord && (
                  <Box sx={{ pt: 1 }}>
                    <ButtonLink
                      data-testid='goToProfileButton'
                      variant='contained'
                      to={generateSafePath(DashboardRoutes.PROFILE, {
                        clientId: client.id,
                      })}
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
                      to={generateSafePath(DashboardRoutes.EDIT, {
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
              data-testid='enrollButton'
              to={generateSafePath(DashboardRoutes.NEW_ENROLLMENT, {
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
};

export default ClientCard;
