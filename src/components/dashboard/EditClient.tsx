import { Stack, Typography } from '@mui/material';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  CONTEXT_HEADER_HEIGHT,
  STICKY_BAR_HEIGHT,
} from '../layout/layoutConstants';
import { useDashboardClient } from '../pages/ClientDashboard';

import DeleteClientButton from '@/modules/client/components/DeleteClientButton';
import EditRecord from '@/modules/form/components/EditRecord';
import { RootPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import { Routes } from '@/routes/routes';
import {
  ClientFieldsFragment,
  FormRole,
  useGetClientPermissionsQuery,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const Profile = () => {
  const { client } = useDashboardClient();
  const navigate = useNavigate();
  const { data, loading } = useGetClientPermissionsQuery({
    variables: { id: client.id },
  });

  const { canViewDob, canViewFullSsn } = data?.client?.access || {};

  const onCompleted = useCallback(
    (data: ClientFieldsFragment) => {
      navigate(
        generateSafePath(Routes.CLIENT_DASHBOARD, { clientId: data.id })
      );
    },
    [navigate]
  );

  if (loading) return null;

  return (
    <EditRecord<ClientFieldsFragment>
      formRole={FormRole.Client}
      record={client}
      localConstants={{
        clientId: client.id,
        canViewFullSsn,
        canViewDob,
      }}
      onCompleted={onCompleted}
      top={STICKY_BAR_HEIGHT + CONTEXT_HEADER_HEIGHT}
      title={
        <Stack direction='row' justifyContent='space-between'>
          <Typography variant='h3' sx={{ pt: 0, pb: 4 }} flexGrow={1}>
            Edit Client Details
          </Typography>
          <div>
            <RootPermissionsFilter permissions='canDeleteClients'>
              <DeleteClientButton
                clientId={client.id}
                variant='text'
                onSuccess={() =>
                  navigate(generateSafePath(Routes.CLIENT_SEARCH))
                }
              />
            </RootPermissionsFilter>
          </div>
        </Stack>
      }
    />
  );
};

export default Profile;
