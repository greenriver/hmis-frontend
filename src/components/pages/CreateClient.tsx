import { Container, Grid, Typography } from '@mui/material';
import { useCallback } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';

import PageHeader from '../layout/PageHeader';

import EditRecord from '@/modules/form/components/EditRecord';
import formData from '@/modules/form/data/client.json';
import { FormDefinition } from '@/modules/form/types';
import { Routes } from '@/routes/routes';
import {
  ClientFieldsFragment,
  CreateClientDocument,
  CreateClientMutation,
  CreateClientMutationVariables,
} from '@/types/gqlTypes';

const MAPPING_KEY = 'clientMutationInput';

// FIXME workaround for enum issue
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const CLIENT_FORM: FormDefinition = JSON.parse(JSON.stringify(formData));

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
    <>
      <PageHeader>
        <Typography variant='h5'>Add New Client</Typography>
      </PageHeader>
      <Container maxWidth='lg' sx={{ pt: 3, pb: 20 }}>
        <Grid container>
          <Grid item xs={8}>
            <EditRecord<
              ClientFieldsFragment,
              CreateClientMutation,
              CreateClientMutationVariables
            >
              definition={CLIENT_FORM}
              mappingKey={MAPPING_KEY}
              // record={client}
              queryDocument={CreateClientDocument}
              onCompleted={onCompleted}
              getErrors={(data: CreateClientMutation) =>
                data?.createClient?.errors
              }
              submitButtonText='Create Client'
            />
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default CreateClient;
