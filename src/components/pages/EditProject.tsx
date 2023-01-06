import { Stack, Typography } from '@mui/material';
import { useCallback } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';

import Loading from '../elements/Loading';

import { InactiveChip } from './Project';

import EditRecord from '@/modules/form/components/EditRecord';
import ProjectLayout from '@/modules/inventory/components/ProjectLayout';
import { useProjectCrumbs } from '@/modules/inventory/components/useProjectCrumbs';
import { cache } from '@/providers/apolloClient';
import { Routes } from '@/routes/routes';
import {
  ProjectAllFieldsFragment,
  UpdateProjectDocument,
  UpdateProjectMutation,
  UpdateProjectMutationVariables,
} from '@/types/gqlTypes';

const EditProject = () => {
  const navigate = useNavigate();

  const [crumbs, loading, project] = useProjectCrumbs('Update Project');

  const onCompleted = useCallback(
    (data: UpdateProjectMutation) => {
      const updatedProject = data?.updateProject?.project;
      if (updatedProject) {
        const id = updatedProject.id;
        // Force refresh inventory and funder if this project was just
        // closed, since those can be closed as a side effect.
        if (updatedProject?.operatingEndDate && !project?.operatingEndDate) {
          cache.evict({ id: `Project:${id}`, fieldName: 'funders' });
          cache.evict({ id: `Project:${id}`, fieldName: 'inventories' });
        }

        navigate(generatePath(Routes.PROJECT, { projectId: id }));
      }
    },
    [navigate, project]
  );

  if (loading) return <Loading />;
  if (!crumbs || !project) throw Error('Project not found');

  return (
    <ProjectLayout crumbs={crumbs}>
      <EditRecord<
        ProjectAllFieldsFragment,
        UpdateProjectMutation,
        UpdateProjectMutationVariables
      >
        definitionIdentifier='project'
        record={project}
        queryDocument={UpdateProjectDocument}
        onCompleted={onCompleted}
        getErrors={(data: UpdateProjectMutation) => data?.updateProject?.errors}
        confirmable
        submitButtonText='Update Project'
        onDiscard={generatePath(Routes.PROJECT, { projectId: project?.id })}
        title={
          <>
            <Stack direction={'row'} spacing={2} sx={{ pb: 4 }}>
              <Typography variant='h3' sx={{ pt: 0, mt: 0 }}>
                Update {project.projectName}
              </Typography>
              <InactiveChip project={project} />
            </Stack>
          </>
        }
      />
    </ProjectLayout>
  );
};
export default EditProject;
