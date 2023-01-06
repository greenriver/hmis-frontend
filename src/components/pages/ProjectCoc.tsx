import { Stack, Typography } from '@mui/material';
import { useCallback } from 'react';
import { generatePath, useNavigate, useParams } from 'react-router-dom';

import Loading from '../elements/Loading';

import { InactiveChip } from './Project';

import EditRecord from '@/modules/form/components/EditRecord';
import ProjectLayout from '@/modules/inventory/components/ProjectLayout';
import { useProjectCrumbs } from '@/modules/inventory/components/useProjectCrumbs';
import { cache } from '@/providers/apolloClient';
import { Routes } from '@/routes/routes';
import {
  CreateProjectCocDocument,
  CreateProjectCocMutation,
  CreateProjectCocMutationVariables,
  ProjectCocFieldsFragment,
  UpdateProjectCocDocument,
  UpdateProjectCocMutation,
  UpdateProjectCocMutationVariables,
  useGetProjectCocQuery,
} from '@/types/gqlTypes';

const ProjectCoc = ({ create = false }: { create?: boolean }) => {
  const navigate = useNavigate();
  const { projectId, cocId } = useParams() as {
    projectId: string;
    cocId: string;
  };
  const title = create ? `Add Project CoC` : `Update Project CoC`;
  const [crumbs, crumbsLoading, project] = useProjectCrumbs(title);

  const onCompleted = useCallback(() => {
    // Force refresh table if we just created a new record
    if (create) {
      cache.evict({ id: `Project:${projectId}`, fieldName: 'projectCocs' });
    }
    navigate(generatePath(Routes.PROJECT, { projectId }));
  }, [navigate, projectId, create]);

  const { data, loading, error } = useGetProjectCocQuery({
    variables: { id: cocId },
    skip: create,
  });

  if (loading || crumbsLoading) return <Loading />;
  if (error) throw error;
  if (!crumbs || !project) throw Error('Project not found');

  const common = {
    definitionIdentifier: 'project_coc',
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
          submitButtonText='Create Project CoC'
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
          submitButtonText='Update Project CoC'
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
