import { Container, Grid, Typography } from '@mui/material';
import { useMemo } from 'react';
import { generatePath, useNavigate, useParams } from 'react-router-dom';

import Breadcrumbs from '../elements/Breadcrumbs';
import Loading from '../elements/Loading';
import PageHeader from '../layout/PageHeader';

import DynamicForm from '@/modules/form/components/DynamicForm';
import formData from '@/modules/form/data/project.json';
import {
  createInitialValues,
  transformSubmitValues,
} from '@/modules/form/formUtil';
import { FormDefinition } from '@/modules/form/types';
import { useProjectCrumbs } from '@/modules/inventory/components/useProjectCrumbs';
import { Routes } from '@/routes/routes';
import { useUpdateProjectMutation } from '@/types/gqlTypes';

const MAPPING_KEY = 'projectMutationInput';

// FIXME workaround for enum issue
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const formDefinition: FormDefinition = JSON.parse(JSON.stringify(formData));

const EditProject = () => {
  const navigate = useNavigate();
  const { projectId } = useParams() as {
    projectId: string;
  };

  const [crumbs, loading, project] = useProjectCrumbs('Update');

  const [mutateFunction, { loading: saveLoading, error: saveError }] =
    useUpdateProjectMutation({
      onCompleted: (data) => {
        if (data?.updateProject?.project?.id) {
          navigate(
            generatePath(Routes.PROJECT, {
              projectId: data?.updateProject?.project?.id,
            })
          );
        }
      },
    });

  const initialValues = useMemo(() => {
    if (!project) return;
    return createInitialValues(formDefinition, project, MAPPING_KEY);
  }, [project]);

  const submitHandler = (values: Record<string, any>) => {
    console.log(values);
    // Transform values into client input query variables
    const variables = transformSubmitValues(
      formDefinition,
      values,
      MAPPING_KEY,
      true
    );
    console.log(JSON.stringify(variables, null, 2));

    void mutateFunction({
      variables: {
        input: { id: projectId, input: variables, clientMutationId: '123' },
      },
    });
  };

  if (loading) return <Loading />;
  if (!crumbs || !project) throw Error('Project not found');
  if (saveError) throw saveError;

  return (
    <>
      <PageHeader>
        <Typography variant='h4'>Projects</Typography>
      </PageHeader>
      <Container maxWidth='lg' sx={{ pt: 3, pb: 6 }}>
        <Breadcrumbs crumbs={crumbs} />
        <Grid container>
          <Grid item xs={9}>
            <DynamicForm
              definition={formDefinition}
              onSubmit={submitHandler}
              submitButtonText='Save Changes'
              discardButtonText='Discard'
              initialValues={initialValues}
              loading={saveLoading}
            />
          </Grid>
        </Grid>
      </Container>
    </>
  );
};
export default EditProject;
