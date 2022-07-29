import { Container, Typography } from '@mui/material';

import PageHeader from '../layout/PageHeader';

import DynamicForm from '@/modules/form/components/DynamicForm';
import formData from '@/modules/form/data/intake.json';
import { transformSubmitValues } from '@/modules/form/formUtil';
import { FormDefinition } from '@/modules/form/types';
import ConfiguredApolloProvider from '@/providers/ConfiguredApolloProvider';

const MAPPING_KEY = 'clientMutationInput';

// FIXME workaround for enum issue
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const intakeFormDefinition: FormDefinition = JSON.parse(
  JSON.stringify(formData)
);

const Intake: React.FC = () => {
  const submitHandler = (values: Record<string, any>) => {
    // Transform values into client input query variables
    const variables = transformSubmitValues(
      intakeFormDefinition,
      values,
      MAPPING_KEY
    );
    console.log(JSON.stringify(variables, null, 2));
  };

  return (
    <ConfiguredApolloProvider>
      <PageHeader>
        <Typography variant='h5'>Add New Client</Typography>
      </PageHeader>
      <Container maxWidth='lg' sx={{ pt: 3, pb: 6 }}>
        <DynamicForm
          definition={intakeFormDefinition}
          onSubmit={submitHandler}
          submitButtonText='Create Record'
          discardButtonText='Cancel'
        />
      </Container>
    </ConfiguredApolloProvider>
  );
};

export default Intake;
