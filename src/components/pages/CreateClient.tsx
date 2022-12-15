import { Container, Typography } from '@mui/material';
import { useCallback } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';

import EditRecord from '@/modules/form/components/EditRecord';
import { Routes } from '@/routes/routes';
import {
  ClientFieldsFragment,
  CreateClientDocument,
  CreateClientMutation,
  CreateClientMutationVariables,
} from '@/types/gqlTypes';

const CreateClient: React.FC = () => {
  const navigate = useNavigate();

  const onCompleted = useCallback(
    (data: CreateClientMutation) => {
      const id = data?.createClient?.client?.id;
      if (id) {
        navigate(generatePath(Routes.CLIENT_DASHBOARD, { clientId: id }));
      }
    },
    [navigate]
  );

  return (
    <Container maxWidth='lg' sx={{ pt: 3, pb: 20 }}>
      <EditRecord<
        ClientFieldsFragment,
        CreateClientMutation,
        CreateClientMutationVariables
      >
        definitionIdentifier='client'
        queryDocument={CreateClientDocument}
        onCompleted={onCompleted}
        getErrors={(data: CreateClientMutation) => data?.createClient?.errors}
        submitButtonText='Create Client'
        title={
          <Typography variant='h3' sx={{ pt: 2, pb: 4 }}>
            Add New Client
          </Typography>
        }
      />
    </Container>
  );
};

export default CreateClient;
