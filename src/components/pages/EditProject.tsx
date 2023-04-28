import { Box } from '@mui/material';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { ProjectFormTitle } from './Project';
import { useProjectDashboardContext } from './ProjectDashboard';

import EditRecord from '@/modules/form/components/EditRecord';
import { cache } from '@/providers/apolloClient';
import { Routes } from '@/routes/routes';
import { FormRole, ProjectAllFieldsFragment } from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const EditProject = () => {
  const navigate = useNavigate();

  const { project } = useProjectDashboardContext();

  const onCompleted = useCallback(
    (updatedProject: ProjectAllFieldsFragment) => {
      const id = updatedProject.id;
      // Force refresh inventory and funder if this project was just
      // closed, since those can be closed as a side effect.
      if (updatedProject.operatingEndDate && !project?.operatingEndDate) {
        cache.evict({ id: `Project:${id}`, fieldName: 'funders' });
        cache.evict({ id: `Project:${id}`, fieldName: 'inventories' });
      }

      navigate(generateSafePath(Routes.PROJECT, { projectId: id }));
    },
    [navigate, project]
  );

  return (
    <EditRecord<ProjectAllFieldsFragment>
      formRole={FormRole.Project}
      record={project}
      onCompleted={onCompleted}
      FormActionProps={{
        onDiscard: generateSafePath(Routes.PROJECT, {
          projectId: project?.id,
        }),
      }}
      title={
        <Box sx={{ mb: 4 }}>
          <ProjectFormTitle
            title={`Edit ${project.projectName}`}
            project={project}
          />
        </Box>
      }
    />
  );
};
export default EditProject;
