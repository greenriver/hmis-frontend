import { Box, Stack, Typography } from '@mui/material';
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  CONTEXT_HEADER_HEIGHT,
  STICKY_BAR_HEIGHT,
} from '../layout/layoutConstants';
import { useClientDashboardContext } from '../pages/ClientDashboard';

import DeleteClientButton from '@/modules/client/components/DeleteClientButton';
import { localConstantsForClientForm } from '@/modules/client/hooks/useClientFormDialog';
import EditRecord from '@/modules/form/components/EditRecord';
import { RootPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import { cache } from '@/providers/apolloClient';
import { Routes } from '@/routes/routes';
import { ClientFieldsFragment, FormRole } from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const Profile = () => {
  const { client } = useClientDashboardContext();
  const navigate = useNavigate();

  const onCompleted = useCallback(
    (data: ClientFieldsFragment) => {
      cache.evict({ id: `Client:${data.id}` });
      navigate(
        generateSafePath(Routes.CLIENT_DASHBOARD, { clientId: data.id })
      );
    },
    [navigate]
  );

  const localConstants = useMemo(
    () => localConstantsForClientForm(client),
    [client]
  );

  return (
    <EditRecord<ClientFieldsFragment>
      formRole={FormRole.Client}
      record={client}
      localConstants={localConstants}
      onCompleted={onCompleted}
      top={STICKY_BAR_HEIGHT + CONTEXT_HEADER_HEIGHT}
      title={
        <Stack direction='row' justifyContent='space-between'>
          <Typography variant='h3' sx={{ pt: 2, pb: 4 }} flexGrow={1}>
            Update Client Details
          </Typography>
        </Stack>
      }
      FormNavigationProps={{
        contentsBelowNavigation: (
          <Box sx={{ mt: 3 }}>
            <RootPermissionsFilter permissions='canDeleteClients'>
              <DeleteClientButton
                clientId={client.id}
                clientVersion={client.version}
                onSuccess={() =>
                  navigate(generateSafePath(Routes.CLIENT_SEARCH))
                }
              />
            </RootPermissionsFilter>
          </Box>
        ),
      }}
    />
  );
};

export default Profile;
