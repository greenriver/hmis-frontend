import { Grid, Typography } from '@mui/material';
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
    <>
      <Typography variant='h3' sx={{ mb: 4 }}>
        Edit Client Details
      </Typography>
      <Grid container>
        <Grid item xs={9}>
          <EditRecord<
            ClientFieldsFragment,
            UpdateClientMutation,
            UpdateClientMutationVariables
          >
            definitionIdentifier='client'
            record={client}
            queryDocument={UpdateClientDocument}
            onCompleted={onCompleted}
            getErrors={(data: UpdateClientMutation) =>
              data?.updateClient?.errors
            }
            submitButtonText='Save Changes'
            // horizontal
          />
        </Grid>
      </Grid>
    </>
  );
};

export default Profile;
