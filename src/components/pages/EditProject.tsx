import { Grid, Typography } from '@mui/material';
import { useCallback } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';

import Breadcrumbs from '../elements/Breadcrumbs';
import Loading from '../elements/Loading';

import { InactiveBanner } from './Project';

import EditRecord from '@/modules/form/components/EditRecord';
import { ProjectFormDefinition } from '@/modules/form/data';
import ProjectLayout from '@/modules/inventory/components/ProjectLayout';
import { useProjectCrumbs } from '@/modules/inventory/components/useProjectCrumbs';
import { Routes } from '@/routes/routes';
import {
  ProjectAllFieldsFragment,
  UpdateProjectDocument,
  UpdateProjectMutation,
  UpdateProjectMutationVariables,
} from '@/types/gqlTypes';

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
          <InactiveBanner project={project} />
          <EditRecord<
            ProjectAllFieldsFragment,
            UpdateProjectMutation,
            UpdateProjectMutationVariables
          >
            definition={ProjectFormDefinition}
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
