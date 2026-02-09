import PersonIcon from '@mui/icons-material/Person';
import { Grid, Skeleton, Stack, Typography } from '@mui/material';
import { isEmpty, isNil } from 'lodash-es';
import { Fragment, useMemo } from 'react';

import { ContextualClientDobAge } from '../providers/ClientSsnDobVisibility';

import ClientCardImageElement from './ClientCardImageElement';
import ButtonLink from '@/components/elements/ButtonLink';
import { CommonLabeledTextBlock } from '@/components/elements/CommonLabeledTextBlock';
import { LabeledExternalIdDisplay } from '@/components/elements/ExternalIdDisplay';
import RouterLink from '@/components/elements/RouterLink';
import { useGlobalFeatureFlags } from '@/hooks/useGlobalFeatureFlags';
import {
  clientNameAllParts,
  entryExitRange,
  getClientImageAltText,
  isRecentEnrollment,
  lastUpdatedBy,
  pronouns,
} from '@/modules/hmis/hmisUtil';
import {
  ClientDashboardRoutes,
  EnrollmentDashboardRoutes,
} from '@/routes/routes';
import {
  ClientSearchResultFieldsFragment,
  ExternalIdentifierType,
  GetClientEnrollmentsQuery,
  useGetClientEnrollmentsQuery,
  useGetClientImageQuery,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

const MAX_RECENT_ENROLLMENTS = 5;

const RecentEnrollments = ({
  clientId,
  recentEnrollments,
}: {
  clientId: string;
  recentEnrollments: NonNullable<
    GetClientEnrollmentsQuery['client']
  >['enrollments']['nodes'];
}) => {
  return (
    <Grid container spacing={0.5}>
      {recentEnrollments.map((enrollment) => (
        <Fragment key={enrollment.id}>
          <Grid item xs={6} lg={4}>
            {enrollment.access.canViewEnrollmentDetails ? (
              <RouterLink
                aria-label={enrollment.projectName}
                to={generateSafePath(
                  EnrollmentDashboardRoutes.ENROLLMENT_OVERVIEW,
                  {
                    clientId,
                    enrollmentId: enrollment.id,
                  }
                )}
              >
                {enrollment.projectName}
              </RouterLink>
            ) : (
              enrollment.projectName
            )}
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
  client: ClientSearchResultFieldsFragment;
  linkTargetBlank?: boolean;
  hideImage?: boolean;
}

const ClientSearchResultCard: React.FC<Props> = ({
  client,
  linkTargetBlank = false,
  hideImage = false,
}) => {
  const clientName = clientNameAllParts(client);
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
  const { globalFeatureFlags } = useGlobalFeatureFlags();
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
          borderRadius: 1,
        }}
      />
    );
  }

  return (
    <Grid container sx={{ p: 1 }} data-testid='clientSearchResultCard'>
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
                {clientName}
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
              <ClientCardImageElement
                size={150}
                client={clientImageData}
                alt={getClientImageAltText(clientName)}
              />
            )}
            <Stack gap={1} sx={{ pr: 1 }}>
              {globalFeatureFlags?.mciIdEnabled && (
                <LabeledExternalIdDisplay
                  type={ExternalIdentifierType.MciId}
                  externalIds={client.externalIds}
                  label={'MCI ID:'}
                  gap={0.5}
                />
              )}
              <CommonLabeledTextBlock title='HMIS ID:' horizontal>
                {client.id}
              </CommonLabeledTextBlock>
              {!isNil(client.age) && (
                <CommonLabeledTextBlock
                  title={client.dob ? 'DOB (Age):' : 'Age:'}
                  horizontal
                >
                  <ContextualClientDobAge client={client} />
                </CommonLabeledTextBlock>
              )}
            </Stack>
          </Stack>
          {client.dateUpdated && (
            <Typography variant='body2' sx={{ fontStyle: 'italic' }}>
              Last Updated on{' '}
              {lastUpdatedBy({ dateUpdated: client.dateUpdated })}
            </Typography>
          )}
        </Stack>
      </Grid>

      <Grid item xs={5} lg={6}>
        {recentEnrollments && recentEnrollments?.length > 0 && (
          <>
            <Typography variant='h6' sx={{ mb: 1 }}>
              Recent Enrollments
            </Typography>
            <RecentEnrollments
              recentEnrollments={recentEnrollments}
              clientId={client.id}
            />
          </>
        )}
      </Grid>
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
            View Client
          </ButtonLink>
        </Stack>
      </Grid>
    </Grid>
  );
};

export default ClientSearchResultCard;
