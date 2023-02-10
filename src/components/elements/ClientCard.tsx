import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {
  Alert,
  Box,
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
import IdDisplay from '@/modules/hmis/components/IdDisplay';
import {
  clientNameWithoutPreferred,
  enrollmentName,
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

const MAX_RECENT_ENROLLMENTS = 5;

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
        ? client.enrollments.nodes
            .filter((enrollment) => isRecentEnrollment(enrollment))
            .slice(0, MAX_RECENT_ENROLLMENTS)
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
                aria-label={enrollmentName(enrollment)}
                to={generateSafePath(DashboardRoutes.VIEW_ENROLLMENT, {
                  clientId: client.id,
                  enrollmentId: enrollment.id,
                })}
                target={linkTargetBlank ? '_blank' : undefined}
                variant='body2'
              >
                {enrollmentName(enrollment)}
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
  showEditLink?: boolean;
  linkTargetBlank?: boolean;
  hideImage?: boolean;
}

const ClientCard: React.FC<Props> = ({
  client,
  showNotices = false,
  showEditLink = false,
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
  if (imageLoading) {
    return (
      <Skeleton
        variant='rectangular'
        sx={{
          height: 180,
          width: '100%',
          mb: 3,
          borderRadius: 1,
        }}
      />
    );
  }

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
            <RouterLink
              plain
              to={generateSafePath(DashboardRoutes.PROFILE, {
                clientId: client.id,
              })}
            >
              <Stack direction='row' spacing={1}>
                <Typography variant='h5'>{primaryName}</Typography>
                {!isEmpty(client.pronouns) && (
                  <Typography variant='h5' color='text.secondary'>
                    ({pronouns(client)})
                  </Typography>
                )}
              </Stack>
            </RouterLink>
            <Stack spacing={3} direction='row'>
              {!hideImage && clientImageData?.image && (
                <ClientCardImageElement size={150} client={clientImageData} />
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
                <IdDisplay
                  id={client.id}
                  color='text.primary'
                  withoutEmphasis
                />
                <ClientDobAge client={client} />
                <ClientSsn client={client} />
                {/* {showLinkToRecord && (
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
                )} */}
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
                      aria-label='Edit Client Details'
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
              data-testid='goToProfileButton'
              to={generateSafePath(DashboardRoutes.PROFILE, {
                clientId: client.id,
              })}
              target={linkTargetBlank ? '_blank' : undefined}
              Icon={OpenInNewIcon}
              leftAlign
            >
              Client Profile
            </ButtonLink>
            <ButtonLink
              fullWidth
              data-testid='enrollButton'
              to={generateSafePath(DashboardRoutes.NEW_ENROLLMENT, {
                clientId: client.id,
              })}
              Icon={LibraryAddIcon}
              leftAlign
            >
              Enroll
            </ButtonLink>
            {/* <Button fullWidth variant='outlined' color='error'>
              Exit
            </Button>
            <Button variant='outlined' color='secondary'>
              Case Notes
            </Button>
            <Button variant='outlined' color='secondary'>
              Add Service
            </Button> */}
          </Stack>
        </Grid>
      </Grid>
    </Card>
  );
};

export default ClientCard;
