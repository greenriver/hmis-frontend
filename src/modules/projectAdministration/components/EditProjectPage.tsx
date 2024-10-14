import { Box } from '@mui/material';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { useProjectDashboardContext } from '../../projects/components/ProjectDashboard';
import { ProjectFormTitle } from '../../projects/components/ProjectOverviewPage';

import DeleteMutationButton from '@/modules/dataFetching/components/DeleteMutationButton';
import EditRecord from '@/modules/form/components/EditRecord';
import { ProjectPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import { cache } from '@/providers/apolloClient';
import { Routes } from '@/routes/routes';
import {
  DeleteProjectDocument,
  DeleteProjectMutation,
  DeleteProjectMutationVariables,
  PickListType,
  ProjectAllFieldsFragment,
  RecordFormRole,
} from '@/types/gqlTypes';
import { evictPickList } from '@/utils/cacheUtil';
import { generateSafePath } from '@/utils/pathEncoding';

const EditProjectPage = () => {
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

  const onSuccessfulDelete = useCallback(() => {
    const organizationId = project.organization.id;
    cache.evict({
      id: `Organization:${organizationId}`,
      fieldName: 'projects',
    });
    evictPickList(PickListType.Project);
    navigate(generateSafePath(Routes.ORGANIZATION, { organizationId }));
  }, [project, navigate]);

  return (
    <EditRecord<ProjectAllFieldsFragment>
      formRole={RecordFormRole.Project}
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
      FormNavigationProps={{
        contentsBelowNavigation: (
          <Box sx={{ mt: 3 }}>
            <ProjectPermissionsFilter
              id={project.id}
              permissions={'canDeleteProject'}
            >
              <DeleteMutationButton<
                DeleteProjectMutation,
                DeleteProjectMutationVariables
              >
                queryDocument={DeleteProjectDocument}
                variables={{ input: { id: project.id } }}
                idPath='deleteProject.project.id'
                recordName='Project'
                onSuccess={onSuccessfulDelete}
                ButtonProps={{ fullWidth: true }}
              >
                Delete Project
              </DeleteMutationButton>
            </ProjectPermissionsFilter>
          </Box>
        ),
      }}
    />
  );
};
export default EditProjectPage;
