import { Grid, Typography } from '@mui/material';
import { useCallback } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';

import Breadcrumbs from '../elements/Breadcrumbs';
import Loading from '../elements/Loading';

import EditRecord from '@/modules/form/components/EditRecord';
import formData from '@/modules/form/data/project.json';
import { FormDefinition } from '@/modules/form/types';
import ProjectLayout from '@/modules/inventory/components/ProjectLayout';
import { useProjectCrumbs } from '@/modules/inventory/components/useProjectCrumbs';
import { Routes } from '@/routes/routes';
import {
  ProjectAllFieldsFragment,
  UpdateProjectDocument,
  UpdateProjectMutation,
  UpdateProjectMutationVariables,
} from '@/types/gqlTypes';

export const MAPPING_KEY = 'projectMutationInput';

// FIXME workaround for enum issue
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const PROJECT_FORM: FormDefinition = JSON.parse(
  JSON.stringify(formData)
);

const EditProject = () => {
  const navigate = useNavigate();

  const [crumbs, loading, project] = useProjectCrumbs('Edit');

  const onCompleted = useCallback(
    (data: UpdateProjectMutation) => {
      const id = data?.updateProject?.project?.id;
      if (id) {
        navigate(generatePath(Routes.PROJECT, { projectId: id }));
      }
    },
    [navigate]
  );

  if (loading) return <Loading />;
  if (!crumbs || !project) throw Error('Project not found');

  return (
    <ProjectLayout>
      <Breadcrumbs crumbs={crumbs} />
      <Typography variant='h3' sx={{ mb: 4 }}>
        Edit {project.projectName}
      </Typography>
      <Grid container>
        <Grid item xs={9}>
          <EditRecord<
            ProjectAllFieldsFragment,
            UpdateProjectMutation,
            UpdateProjectMutationVariables
          >
            definition={PROJECT_FORM}
            mappingKey={MAPPING_KEY}
            record={project}
            queryDocument={UpdateProjectDocument}
            onCompleted={onCompleted}
            getErrors={(data: UpdateProjectMutation) =>
              data?.updateProject?.errors
            }
          />
        </Grid>
      </Grid>
    </ProjectLayout>
  );
};
export default EditProject;
