import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { useProjectDashboardContext } from './ProjectDashboard';
import { ProjectFormTitle } from './ProjectOverview';

import Loading from '@/components/elements/Loading';
import useSafeParams from '@/hooks/useSafeParams';
import EditRecord from '@/modules/form/components/EditRecord';
import { cache } from '@/providers/apolloClient';
import { ProjectDashboardRoutes } from '@/routes/routes';
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
  const { project } = useProjectDashboardContext();

  const onCompleted = useCallback(() => {
    // Force refresh table if we just created a new record
    if (create) {
      cache.evict({ id: `Project:${projectId}`, fieldName: 'projectCocs' });
    }
    navigate(generateSafePath(ProjectDashboardRoutes.COCS, { projectId }));
  }, [navigate, projectId, create]);

  const { data, loading, error } = useGetProjectCocQuery({
    variables: { id: cocId },
    skip: create,
  });

  if (loading) return <Loading />;
  if (error) throw error;

  return (
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
  );
};
export default ProjectCoc;
