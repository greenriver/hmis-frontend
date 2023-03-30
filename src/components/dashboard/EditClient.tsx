import { Typography } from '@mui/material';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  CONTEXT_HEADER_HEIGHT,
  STICKY_BAR_HEIGHT,
} from '../layout/layoutConstants';
import { useDashboardClient } from '../pages/ClientDashboard';

import EditRecord from '@/modules/form/components/EditRecord';
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
        <>
          <Typography variant='h3' sx={{ pt: 0, pb: 4 }}>
            Edit Client Details
          </Typography>
        </>
      }
    />
  );
};

export default Profile;
