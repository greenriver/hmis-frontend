import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import PersonIcon from '@mui/icons-material/Person';
import {
  Alert,
  Box,
  Card,
  Grid,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { isEmpty, isNil } from 'lodash-es';
import { Fragment, useMemo } from 'react';

import { ClientCardImageElement } from './ClientProfileCard';

import ButtonLink from '@/components/elements/ButtonLink';
import ExternalIdDisplay from '@/components/elements/ExternalIdDisplay';
import RouterLink from '@/components/elements/RouterLink';
import ClientDobAge from '@/modules/hmis/components/ClientDobAge';
import { ClientSafeSsn } from '@/modules/hmis/components/ClientSsn';
import IdDisplay from '@/modules/hmis/components/IdDisplay';
import {
  clientNameWithoutPreferred,
  enrollmentName,
  entryExitRange,
  isRecentEnrollment,
  lastUpdated,
  pronouns,
} from '@/modules/hmis/hmisUtil';
import { useHmisAppSettings } from '@/modules/hmisAppSettings/useHmisAppSettings';
import { ClientPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import { ClientDashboardRoutes } from '@/routes/routes';
import {
  ClientFieldsFragment,
  GetClientEnrollmentsQuery,
  useGetClientEnrollmentsQuery,
  useGetClientImageQuery,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const MAX_RECENT_ENROLLMENTS = 5;

const RecentEnrollments = ({
  recentEnrollments,
  linkTargetBlank,
}: {
  recentEnrollments?: NonNullable<
    GetClientEnrollmentsQuery['client']
  >['enrollments']['nodes'];
  linkTargetBlank?: boolean;
}) => {
  if (
    !recentEnrollments ||
    (recentEnrollments && recentEnrollments.length === 0)
  )
    return <Typography>None.</Typography>;

  return (
    <Grid container spacing={0.5}>
      {recentEnrollments &&
        recentEnrollments.map((enrollment) => (
          <Fragment key={enrollment.id}>
            <Grid item xs={6} lg={4}>
              <RouterLink
                aria-label={enrollmentName(enrollment)}
                to={generateSafePath(ClientDashboardRoutes.VIEW_ENROLLMENT, {
                  clientId: enrollment.client.id,
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
  linkTargetBlank?: boolean;
  hideImage?: boolean;
}

const ClientCard: React.FC<Props> = ({
  client,
  showNotices = false,
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

  const { data, loading: enrollmentsLoading } = useGetClientEnrollmentsQuery({
    variables: { id: client.id },
  });
  const { globalFeatureFlags } = useHmisAppSettings();
  const recentEnrollments = useMemo(
    () =>
      data?.client
        ? data.client.enrollments.nodes
            .filter((enrollment) => isRecentEnrollment(enrollment))
            .slice(0, MAX_RECENT_ENROLLMENTS)
        : undefined,
    [data]
  );

  if (imageLoading || enrollmentsLoading) {
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
        <Grid item xs={5} lg={4}>
          <Stack spacing={1}>
            <RouterLink
              plain
              to={generateSafePath(ClientDashboardRoutes.PROFILE, {
                clientId: client.id,
              })}
            >
              <Stack direction='row' spacing={1}>
                <Typography variant='h5' fontWeight={600}>
                  {primaryName}
                </Typography>
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
                {globalFeatureFlags?.mciId && (
                  <IdDisplay
                    prefix='MCI'
                    value={
                      <ExternalIdDisplay
                        value={client.externalIds.find(
                          (c) => c.label == 'MCI ID'
                        )}
                      />
                    }
                    color='text.primary'
                    withoutEmphasis
                  />
                )}
                <IdDisplay
                  prefix='HMIS'
                  value={client.id}
                  color='text.primary'
                  withoutEmphasis
                />

                {!isNil(client.age) && (
                  <Typography
                    variant='body2'
                    component={Box}
                    sx={{ display: 'flex', gap: 0.5 }}
                  >
                    Age: <ClientDobAge client={client} />
                  </Typography>
                )}
                {client.ssn && (
                  <ClientPermissionsFilter
                    id={client.id}
                    permissions={['canViewFullSsn', 'canViewPartialSsn']}
                  >
                    <Typography
                      variant='body2'
                      component={Box}
                      sx={{ display: 'flex', gap: 0.5 }}
                    >
                      SSN: <ClientSafeSsn client={client} />
                    </Typography>
                  </ClientPermissionsFilter>
                )}
              </Stack>
            </Stack>
            <Typography variant='body2' sx={{ fontStyle: 'italic' }}>
              Last Updated on {lastUpdated(client)}
            </Typography>
          </Stack>
        </Grid>
        <ClientPermissionsFilter
          permissions={['canViewEnrollmentDetails']}
          id={client.id}
        >
          <Grid item xs={5} lg={6}>
            <Typography variant='h6' sx={{ mb: 1 }}>
              Recent Enrollments
            </Typography>
            <RecentEnrollments
              recentEnrollments={recentEnrollments}
              linkTargetBlank={linkTargetBlank}
            />
          </Grid>
        </ClientPermissionsFilter>
        <Grid item xs={2}>
          <Typography variant='h6' sx={{ mb: 1 }}>
            Actions
          </Typography>
          <Stack spacing={1}>
            <ButtonLink
              data-testid='goToProfileButton'
              to={generateSafePath(ClientDashboardRoutes.PROFILE, {
                clientId: client.id,
              })}
              target={linkTargetBlank ? '_blank' : undefined}
              Icon={PersonIcon}
              leftAlign
            >
              Client Profile
            </ButtonLink>
            <ButtonLink
              fullWidth
              data-testid='enrollButton'
              to={generateSafePath(ClientDashboardRoutes.NEW_ENROLLMENT, {
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
