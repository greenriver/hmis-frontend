import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import Loading from '../elements/Loading';

import NotFound from './404';
import { ProjectFormTitle } from './Project';

import useSafeParams from '@/hooks/useSafeParams';
import EditRecord from '@/modules/form/components/EditRecord';
import ProjectLayout from '@/modules/inventory/components/ProjectLayout';
import { useProjectCrumbs } from '@/modules/inventory/components/useProjectCrumbs';
import { cache } from '@/providers/apolloClient';
import { Routes } from '@/routes/routes';
import {
  FormRole,
  ProjectCocFieldsFragment,
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
  if (!crumbs || !project) return <NotFound />;
  if (error) throw error;

  return (
    <ProjectLayout crumbs={crumbs}>
      <EditRecord<ProjectCocFieldsFragment>
        FormActionProps={
          create ? { submitButtonText: 'Create Project CoC' } : undefined
        }
        onCompleted={onCompleted}
        formRole={FormRole.ProjectCoc}
        inputVariables={{ projectId }}
        record={data?.projectCoc || undefined}
        title={<ProjectFormTitle title={title} project={project} />}
      />
    </ProjectLayout>
  );
};
export default ProjectCoc;
