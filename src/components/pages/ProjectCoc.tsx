import { Stack, Typography } from '@mui/material';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import Loading from '../elements/Loading';

import { InactiveChip } from './Project';

import useSafeParams from '@/hooks/useSafeParams';
import EditRecord from '@/modules/form/components/EditRecord';
import ProjectLayout from '@/modules/inventory/components/ProjectLayout';
import { useProjectCrumbs } from '@/modules/inventory/components/useProjectCrumbs';
import { cache } from '@/providers/apolloClient';
import { Routes } from '@/routes/routes';
import {
  CreateProjectCocDocument,
  CreateProjectCocMutation,
  CreateProjectCocMutationVariables,
  FormRole,
  ProjectCocFieldsFragment,
  UpdateProjectCocDocument,
  UpdateProjectCocMutation,
  UpdateProjectCocMutationVariables,
  useGetProjectCocQuery,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const ProjectCoc = ({ create = false }: { create?: boolean }) => {
  const navigate = useNavigate();
  const { projectId, cocId } = useSafeParams() as {
    projectId: string;
    cocId: string;
  };
  const title = create ? `Add Project CoC` : `Edit Project CoC`;
  const [crumbs, crumbsLoading, project] = useProjectCrumbs(title);

  const onCompleted = useCallback(() => {
    // Force refresh table if we just created a new record
    if (create) {
      cache.evict({ id: `Project:${projectId}`, fieldName: 'projectCocs' });
    }
    navigate(generateSafePath(Routes.PROJECT, { projectId }));
  }, [navigate, projectId, create]);

  const { data, loading, error } = useGetProjectCocQuery({
    variables: { id: cocId },
    skip: create,
  });

  if (loading || crumbsLoading) return <Loading />;
  if (error) throw error;
  if (!crumbs || !project) throw Error('Project not found');

  const common = {
    formRole: FormRole.ProjectCoc,
    title: (
      <Stack direction={'row'} spacing={2}>
        <Typography variant='h3' sx={{ pt: 0, mt: 0 }}>
          {title}
        </Typography>
        <InactiveChip project={project} />
      </Stack>
    ),
  };
  return (
    <ProjectLayout crumbs={crumbs}>
      {create ? (
        <EditRecord<
          ProjectCocFieldsFragment,
          CreateProjectCocMutation,
          CreateProjectCocMutationVariables
        >
          inputVariables={{ projectId }}
          queryDocument={CreateProjectCocDocument}
          onCompleted={onCompleted}
          getErrors={(data: CreateProjectCocMutation) =>
            data?.createProjectCoc?.errors
          }
          FormActionProps={{ submitButtonText: 'Project CoC' }}
          {...common}
        />
      ) : (
        <EditRecord<
          ProjectCocFieldsFragment,
          UpdateProjectCocMutation,
          UpdateProjectCocMutationVariables
        >
          record={data?.projectCoc || undefined}
          queryDocument={UpdateProjectCocDocument}
          onCompleted={onCompleted}
          getErrors={(data: UpdateProjectCocMutation) =>
            data?.updateProjectCoc?.errors
          }
          {...common}
        />
      )}
    </ProjectLayout>
  );
};
export default ProjectCoc;
