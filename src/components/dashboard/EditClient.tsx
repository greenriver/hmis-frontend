import { Typography } from '@mui/material';
import { useCallback } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';

import { useDashboardClient } from '../pages/ClientDashboard';

import EditRecord from '@/modules/form/components/EditRecord';
import { Routes } from '@/routes/routes';
import {
  ClientFieldsFragment,
  UpdateClientDocument,
  UpdateClientMutation,
  UpdateClientMutationVariables,
} from '@/types/gqlTypes';

const Profile = () => {
  const { client } = useDashboardClient();
  const navigate = useNavigate();
  const onCompleted = useCallback(
    (data: UpdateClientMutation) => {
      const id = data?.updateClient?.client?.id;
      if (id) {
        navigate(generatePath(Routes.CLIENT_DASHBOARD, { clientId: id }));
      }
    },
    [navigate]
  );

  return (
    <EditRecord<
      ClientFieldsFragment,
      UpdateClientMutation,
      UpdateClientMutationVariables
    >
      definitionIdentifier='client'
      record={client}
      localConstants={{
        clientId: client.id,
      }}
      queryDocument={UpdateClientDocument}
      onCompleted={onCompleted}
      getErrors={(data: UpdateClientMutation) => data?.updateClient?.errors}
      submitButtonText='Save Changes'
      title={
        <>
          <Typography variant='h3' sx={{ pt: 0, pb: 4 }}>
            Update Client Details
          </Typography>
        </>
      }
    />
  );
};

export default Profile;
