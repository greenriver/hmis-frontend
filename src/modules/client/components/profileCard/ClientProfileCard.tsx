import PersonIcon from '@mui/icons-material/Person';
import { Box, Card, Grid, Skeleton, Stack, Typography } from '@mui/material';
import { useCallback } from 'react';

import { useNavigate } from 'react-router-dom';
import ClientProfileCardAccordion from './ClientProfileCardAccordion';
import ClientProfileCardImage from './ClientProfileCardImage';
import ClientProfileCardTextTable from './ClientProfileCardTextTable';
import NotCollectedText from '@/components/elements/NotCollectedText';
import { useIsMobile } from '@/hooks/useIsMobile';
import ClientForceRefetchButton from '@/modules/client/components/ClientForceRefetchButton';
import ClientDobAge from '@/modules/hmis/components/ClientDobAge';
import { ClientSafeSsn } from '@/modules/hmis/components/ClientSsn';
import {
  clientNameAllParts,
  lastUpdatedBy,
  pronouns,
} from '@/modules/hmis/hmisUtil';
import { ClientPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import { ClientDashboardRoutes } from '@/routes/routes';
import { ClientFieldsFragment, useGetClientImageQuery } from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

interface Props {
  client: ClientFieldsFragment;
}

/**
 * Profile card displayed on the Client Dashboard Overview, with:
 * - Image
 * - Client Name
 * - Action to Edit
 * - Accordions with IDs, Demographics, and Contact Information
 */
const ClientProfileCard: React.FC<Props> = ({ client }) => {
  const {
    data: { client: clientImageData } = {},
    loading: imageLoading = false,
  } = useGetClientImageQuery({
    variables: { id: client.id },
  });

  const canViewClientPhoto = client.access.canViewClientPhoto;
  const canViewSsn =
    client.access.canViewFullSsn || client.access.canViewPartialSsn;

  const size = 175;
  const clientName = clientNameAllParts(client);

  const navigate = useNavigate();
  const handleOpenClientForm = useCallback(() => {
    navigate(
      generateSafePath(ClientDashboardRoutes.EDIT, { clientId: client.id })
    );
  }, [navigate, client.id]);

  const isTiny = useIsMobile('sm');

  return (
    <Box>
      <Card
        sx={{
          p: 2,
          borderBottomRightRadius: 0,
          borderBottomLeftRadius: 0,
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography component='h1' variant='h4'>
              {clientName}
            </Typography>
          </Grid>
          <Grid
            item
            xs={12}
            sx={{
              display: 'flex',
              gap: 2,
              flexDirection: isTiny ? 'column' : 'row',
            }}
          >
            {canViewClientPhoto &&
              (imageLoading ? (
                <Skeleton
                  variant='rectangular'
                  sx={{
                    height: size,
                    width: size,
                  }}
                />
              ) : (
                <ClientProfileCardImage
                  size={size}
                  client={clientImageData || undefined}
                  clientName={clientName}
                />
              ))}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <ClientProfileCardTextTable
                content={{
                  ...(pronouns(client)
                    ? { Pronouns: pronouns(client) }
                    : undefined),
                  [client.dob ? 'DOB' : 'Age']: (
                    <ClientDobAge
                      client={client}
                      noValue={<NotCollectedText />}
                    />
                  ),
                  ...(canViewSsn
                    ? {
                        SSN: <ClientSafeSsn client={client} />,
                      }
                    : {}),
                }}
              />
              <Stack sx={{ flexGrow: 1, maxWidth: '300px' }} gap={1} mt={2}>
                <ClientPermissionsFilter
                  id={client.id}
                  permissions='canEditClient'
                >
                  <ClientForceRefetchButton
                    clientId={client.id}
                    onClick={handleOpenClientForm}
                    data-testid='editClientButton'
                    startIcon={<PersonIcon />}
                    variant='outlined'
                    color='primary'
                    fullWidth
                  >
                    Update Client Details
                  </ClientForceRefetchButton>
                </ClientPermissionsFilter>
                {client.dateUpdated && (
                  <Typography
                    variant='body2'
                    sx={{ fontStyle: 'italic', mt: 1 }}
                  >
                    Last Updated on{' '}
                    {lastUpdatedBy({
                      dateUpdated: client.dateUpdated,
                      user: client.user,
                    })}
                    .
                  </Typography>
                )}
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Card>
      <Box sx={{ mt: '-1px' }}>
        <ClientProfileCardAccordion client={client} />
      </Box>
    </Box>
  );
};

export default ClientProfileCard;
