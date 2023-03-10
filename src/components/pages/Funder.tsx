import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import Loading from '../elements/Loading';

import { ProjectFormTitle } from './Project';

import useSafeParams from '@/hooks/useSafeParams';
import EditRecord from '@/modules/form/components/EditRecord';
import { parseHmisDateString } from '@/modules/hmis/hmisUtil';
import ProjectLayout from '@/modules/inventory/components/ProjectLayout';
import { useProjectCrumbs } from '@/modules/inventory/components/useProjectCrumbs';
import { cache } from '@/providers/apolloClient';
import { Routes } from '@/routes/routes';
import {
  FormRole,
  FunderFieldsFragment,
  useGetFunderQuery,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const Funder = ({ create = false }: { create?: boolean }) => {
  const navigate = useNavigate();
  const { projectId, funderId } = useSafeParams() as {
    projectId: string;
    funderId: string; // Not present if create!
  };
  const title = create ? `Add Funder` : `Edit Funder`;
  const [crumbs, crumbsLoading, project] = useProjectCrumbs(title);

  const { data, loading, error } = useGetFunderQuery({
    variables: { id: funderId },
    skip: create,
  });

  const onCompleted = useCallback(() => {
    // Force refresh table if we just created a new record
    if (create) {
      cache.evict({ id: `Project:${projectId}`, fieldName: 'funders' });
    }
    navigate(generateSafePath(Routes.PROJECT, { projectId }));
  }, [navigate, create, projectId]);

  // Local variables to use for form population.
  // These variables names are referenced by the form definition!
  const localConstants = useMemo(() => {
    if (!project) return;
    return {
      projectStartDate: parseHmisDateString(project.operatingStartDate),
      projectEndDate: parseHmisDateString(project.operatingEndDate),
    };
  }, [project]);

  if (loading || crumbsLoading) return <Loading />;
  if (!crumbs || !project) throw Error('Project not found');
  if (!create && !data?.funder) throw Error('Funder not found');
  if (error) throw error;

  return (
    <ProjectLayout crumbs={crumbs}>
      <EditRecord<FunderFieldsFragment>
        FormActionProps={
          create ? { submitButtonText: 'Create Funder' } : undefined
        }
        onCompleted={onCompleted}
        localConstants={localConstants}
        formRole={FormRole.Funder}
        inputVariables={{ projectId }}
        record={data?.funder || undefined}
        title={<ProjectFormTitle title={title} project={project} />}
      />
    </ProjectLayout>
  );
};
export default Funder;
