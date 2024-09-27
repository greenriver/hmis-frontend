import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { useProjectDashboardContext } from './ProjectDashboard';
import { ProjectFormTitle } from './ProjectOverview';

import { cache } from '@/app/apolloClient';
import { ProjectDashboardRoutes } from '@/app/routes';
import Loading from '@/components/elements/Loading';
import NotFound from '@/components/pages/NotFound';
import useSafeParams from '@/hooks/useSafeParams';
import DeleteMutationButton from '@/modules/dataFetching/components/DeleteMutationButton';
import EditRecord from '@/modules/form/components/EditRecord';
import {
  DeleteProjectCocDocument,
  DeleteProjectCocMutation,
  DeleteProjectCocMutationVariables,
  ProjectCocFieldsFragment,
  RecordFormRole,
  useGetProjectCocQuery,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

const ProjectCoc = ({ create = false }: { create?: boolean }) => {
  const navigate = useNavigate();
  const { projectId, cocId } = useSafeParams() as {
    projectId: string;
    cocId: string;
  };
  const title = create ? `Add Project CoC` : `Edit Project CoC`;
  const { project } = useProjectDashboardContext();

  const {
    data: { projectCoc } = {},
    loading,
    error,
  } = useGetProjectCocQuery({
    variables: { id: cocId },
    skip: create,
  });

  const onCompleted = useCallback(() => {
    // Force refresh table if we just created a new record
    if (create) {
      cache.evict({ id: `Project:${projectId}`, fieldName: 'projectCocs' });
    }
    navigate(generateSafePath(ProjectDashboardRoutes.COCS, { projectId }));
  }, [navigate, projectId, create]);

  const onSuccessfulDelete = useCallback(() => {
    // Force re-fetch table after deletion
    cache.evict({ id: `Project:${projectId}`, fieldName: 'projectCocs' });
    navigate(generateSafePath(ProjectDashboardRoutes.COCS, { projectId }));
  }, [projectId, navigate]);

  if (!project.access.canEditProjectDetails) return <NotFound />;
  if (loading) return <Loading />;
  if (error) throw error;

  return (
    <>
      <EditRecord<ProjectCocFieldsFragment>
        FormActionProps={
          create ? { submitButtonText: 'Create Project CoC' } : undefined
        }
        onCompleted={onCompleted}
        formRole={RecordFormRole.ProjectCoc}
        inputVariables={{ projectId }}
        record={projectCoc || undefined}
        title={
          !create &&
          projectCoc && (
            <ProjectFormTitle
              title={title}
              project={project}
              actions={
                <DeleteMutationButton<
                  DeleteProjectCocMutation,
                  DeleteProjectCocMutationVariables
                >
                  queryDocument={DeleteProjectCocDocument}
                  variables={{ input: { id: projectCoc.id } }}
                  idPath={'deleteProjectCoc.projectCoc.id'}
                  recordName='Project CoC record'
                  ConfirmationDialogProps={{ confirmText: 'Yes, delete' }}
                  onSuccess={onSuccessfulDelete}
                >
                  Delete Record
                </DeleteMutationButton>
              }
            />
          )
        }
      />
    </>
  );
};
export default ProjectCoc;
