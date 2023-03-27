import { Stack, Typography } from '@mui/material';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import Loading from '../elements/Loading';

import NotFound from './404';
import { InactiveChip } from './Project';

import EditRecord from '@/modules/form/components/EditRecord';
import ProjectLayout from '@/modules/inventory/components/ProjectLayout';
import { useProjectCrumbs } from '@/modules/inventory/components/useProjectCrumbs';
import { cache } from '@/providers/apolloClient';
import { Routes } from '@/routes/routes';
import { FormRole, ProjectAllFieldsFragment } from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const EditProject = () => {
  const navigate = useNavigate();

  const [crumbs, loading, project] = useProjectCrumbs('Edit Project');

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

  if (loading) return <Loading />;
  if (!crumbs || !project) return <NotFound />;

  return (
    <ProjectLayout crumbs={crumbs}>
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
