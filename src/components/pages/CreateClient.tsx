import { useMutation } from '@apollo/client';
import { Container, Typography } from '@mui/material';
import { generatePath, useNavigate } from 'react-router-dom';

import PageHeader from '../layout/PageHeader';

import { CREATE_CLIENT } from '@/api/createClient.gql';
import DynamicForm from '@/modules/form/components/DynamicForm';
import formData from '@/modules/form/data/intake.json';
import { transformSubmitValues } from '@/modules/form/formUtil';
import { FormDefinition } from '@/modules/form/types';
import { Routes } from '@/routes/routes';
import { CreateClientPayload } from '@/types/gqlTypes';

const MAPPING_KEY = 'clientMutationInput';

// FIXME workaround for enum issue
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const intakeFormDefinition: FormDefinition = JSON.parse(
  JSON.stringify(formData)
);

const CreateClient: React.FC = () => {
  const navigate = useNavigate();
  const [mutateFunction, { data, loading, error }] = useMutation<{
    createClient: CreateClientPayload;
  }>(CREATE_CLIENT, {
    onCompleted: (data) => {
      if (data?.createClient?.client?.id) {
        navigate(
          generatePath(Routes.CLIENT_DASHBOARD, {
            clientId: data?.createClient?.client?.id,
          })
        );
      }
    },
  });

  // TODO pass validations to DynamicForm
  if (data?.createClient?.errors) {
    console.error('errors', data?.createClient?.errors);
  }
  if (error) {
    console.error(error);
  }

  const submitHandler = (values: Record<string, any>) => {
    // Transform values into client input query variables
    const variables = transformSubmitValues(
      intakeFormDefinition,
      values,
      MAPPING_KEY,
      true
    );
    console.log(JSON.stringify(variables, null, 2));
    void mutateFunction({
      variables: { input: { input: variables, clientMutationId: '123' } },
    });
  };

  return (
    <>
      <PageHeader>
        <Typography variant='h5'>Add New Client</Typography>
      </PageHeader>
      <Container maxWidth='lg' sx={{ pt: 3, pb: 6 }}>
        <DynamicForm
          definition={intakeFormDefinition}
          onSubmit={submitHandler}
          submitButtonText='Create Record'
          discardButtonText='Cancel'
          loading={loading}
        />
      </Container>
    </>
  );
};

export default CreateClient;
