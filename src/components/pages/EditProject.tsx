import { Grid, Typography } from '@mui/material';
import { useCallback } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';

import Breadcrumbs from '../elements/Breadcrumbs';
import Loading from '../elements/Loading';

import { InactiveBanner } from './Project';

import EditRecord from '@/modules/form/components/EditRecord';
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
      const updatedProject = data?.updateProject?.project;
      if (updatedProject?.id) {
        // Force refresh inventory and funder if this project was just
        // closed, since those can be closed as a side effect.
        const state =
          updatedProject?.operatingEndDate && !project?.operatingEndDate
            ? { refetchInventory: true, refetchFunder: true }
            : undefined;

        navigate(
          generatePath(Routes.PROJECT, { projectId: updatedProject?.id }),
          { state }
        );
      }
    },
    [navigate, project]
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
            definitionIdentifier='project'
            record={project}
            queryDocument={UpdateProjectDocument}
            onCompleted={onCompleted}
            getErrors={(data: UpdateProjectMutation) =>
              data?.updateProject?.errors
            }
            confirmable
          />
        </Grid>
      </Grid>
    </ProjectLayout>
  );
};
export default EditProject;
