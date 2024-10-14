import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { useProjectDashboardContext } from './ProjectDashboard';
import { ProjectFormTitle } from './ProjectOverview';
import Loading from '@/components/elements/Loading';
import NotFound from '@/components/pages/NotFound';


import useSafeParams from '@/hooks/useSafeParams';
import DeleteMutationButton from '@/modules/dataFetching/components/DeleteMutationButton';
import EditRecord from '@/modules/form/components/EditRecord';
import { parseHmisDateString } from '@/modules/hmis/hmisUtil';
import { cache } from '@/providers/apolloClient';
import { ProjectDashboardRoutes } from '@/routes/routes';
import {
  DeleteFunderDocument,
  DeleteFunderMutation,
  DeleteFunderMutationVariables,
  FunderFieldsFragment,
  RecordFormRole,
  useGetFunderQuery,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

const Funder = ({ create = false }: { create?: boolean }) => {
  const navigate = useNavigate();
  const { projectId, funderId } = useSafeParams() as {
    projectId: string;
    funderId: string; // Not present if create!
  };
  const title = create ? `Add Funder` : `Edit Funder`;
  const { project } = useProjectDashboardContext();

  const {
    data: { funder } = {},
    loading,
    error,
  } = useGetFunderQuery({
    variables: { id: funderId },
    skip: create,
  });

  const onCompleted = useCallback(() => {
    // Force refresh table if we just created a new record
    if (create) {
      cache.evict({ id: `Project:${projectId}`, fieldName: 'funders' });
    }
    navigate(generateSafePath(ProjectDashboardRoutes.FUNDERS, { projectId }));
  }, [navigate, create, projectId]);

  const onSuccessfulDelete = useCallback(() => {
    cache.evict({ id: `Project:${projectId}`, fieldName: 'funders' });
    navigate(generateSafePath(ProjectDashboardRoutes.FUNDERS, { projectId }));
  }, [projectId, navigate]);

  // Local variables to use for form population.
  // These variables names are referenced by the form definition!
  const localConstants = useMemo(() => {
    if (!project) return;
    return {
      projectStartDate: parseHmisDateString(project.operatingStartDate),
      projectEndDate: parseHmisDateString(project.operatingEndDate),
    };
  }, [project]);

  if (loading) return <Loading />;
  if (!create && !funder) return <NotFound />;
  if (error) throw error;

  return (
    <EditRecord<FunderFieldsFragment>
      FormActionProps={
        create ? { submitButtonText: 'Create Funder' } : undefined
      }
      onCompleted={onCompleted}
      localConstants={localConstants}
      formRole={RecordFormRole.Funder}
      inputVariables={{ projectId }}
      record={funder || undefined}
      title={
        !create &&
        funder && (
          <ProjectFormTitle
            title={title}
            project={project}
            actions={
              <DeleteMutationButton<
                DeleteFunderMutation,
                DeleteFunderMutationVariables
              >
                queryDocument={DeleteFunderDocument}
                variables={{ input: { id: funder.id } }}
                idPath={'deleteFunder.funder.id'}
                recordName='Funder'
                onSuccess={onSuccessfulDelete}
              >
                Delete Record
              </DeleteMutationButton>
            }
          />
        )
      }
    />
  );
};
export default Funder;
