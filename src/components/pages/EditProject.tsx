import { Container, Grid, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';

import Breadcrumbs from '../elements/Breadcrumbs';
import PageHeader from '../layout/PageHeader';

import DynamicForm from '@/modules/form/components/DynamicForm';
import formData from '@/modules/form/data/project.json';
import { transformSubmitValues } from '@/modules/form/formUtil';
import { FormDefinition } from '@/modules/form/types';
import { Routes } from '@/routes/routes';

const MAPPING_KEY = 'projectMutationInput';

// FIXME workaround for enum issue
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const intakeFormDefinition: FormDefinition = JSON.parse(
  JSON.stringify(formData)
);

const EditProject = () => {
  const { id } = useParams() as {
    id: string;
  };

  const crumbs = [
    {
      label: 'All Projects',
      to: Routes.ALL_PROJECTS,
    },
    {
      label: 'Organization',
      to: Routes.ORGANIZATION,
    },
    { label: `Project ${id}`, to: Routes.PROJECT },
    { label: `Update`, to: Routes.EDIT_PROJECT },
  ];

  const submitHandler = (values: Record<string, any>) => {
    // Transform values into client input query variables
    const variables = transformSubmitValues(
      intakeFormDefinition,
      values,
      MAPPING_KEY,
      true
    );
    console.log(JSON.stringify(variables, null, 2));
    // void mutateFunction({
    //   variables: { input: { input: variables, clientMutationId: '123' } },
    // });
  };

  return (
    <>
      <PageHeader>
        <Typography variant='h5'>Projects</Typography>
      </PageHeader>
      <Container maxWidth='lg' sx={{ pt: 3, pb: 6 }}>
        <Breadcrumbs crumbs={crumbs} />
        <Grid container>
          <Grid item xs={9}>
            <DynamicForm
              definition={intakeFormDefinition}
              onSubmit={submitHandler}
              submitButtonText='Save Changes'
              discardButtonText='Discard'
              // loading={loading}
            />
            {/* <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant='h6' sx={{ mb: 2 }}>
                Project Details
              </Typography>
            </Paper> */}
          </Grid>
        </Grid>
      </Container>
    </>
  );
};
export default EditProject;
