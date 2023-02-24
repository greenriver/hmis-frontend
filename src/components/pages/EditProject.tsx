import { Stack, Typography } from '@mui/material';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import Loading from '../elements/Loading';

import NotFound from './404';
import { InactiveChip } from './Project';

import EditRecord from '@/modules/form/components/EditRecord';
import ProjectLayout from '@/modules/inventory/components/ProjectLayout';
import { useProjectCrumbs } from '@/modules/inventory/components/useProjectCrumbs';
import { useHasProjectPermissions } from '@/modules/permissions/useHasPermissionsHooks';
import { cache } from '@/providers/apolloClient';
import { Routes } from '@/routes/routes';
import {
  ProjectAllFieldsFragment,
  UpdateProjectDocument,
  UpdateProjectMutation,
  UpdateProjectMutationVariables,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const EditProject = () => {
  const navigate = useNavigate();

  const [crumbs, loading, project] = useProjectCrumbs('Edit Project');
  const canEdit = useHasProjectPermissions(project?.id || '', [
    'canEditProjectDetails',
  ]);

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

        navigate(generateSafePath(Routes.PROJECT, { projectId: id }));
      }
    },
    [navigate, project]
  );

  if (loading) return <Loading />;
  if (!crumbs || !project) throw Error('Project not found');
  if (!canEdit) return <NotFound />;

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
        submitButtonText='Save Changes'
        onDiscard={generateSafePath(Routes.PROJECT, { projectId: project?.id })}
        title={
          <>
            <Stack direction={'row'} spacing={2} sx={{ pb: 4 }}>
              <Typography variant='h3' sx={{ pt: 0, mt: 0 }}>
                Edit {project.projectName}
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
