import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { useProjectDashboardContext } from './ProjectDashboard';
import { ProjectFormTitle } from './ProjectOverview';

import Loading from '@/components/elements/Loading';
import NotFound from '@/components/pages/NotFound';
import useSafeParams from '@/hooks/useSafeParams';
import EditRecord from '@/modules/form/components/EditRecord';
import { parseHmisDateString } from '@/modules/hmis/hmisUtil';
import { cache } from '@/providers/apolloClient';
import { ProjectDashboardRoutes } from '@/routes/routes';
import {
  FormRole,
  InventoryFieldsFragment,
  useGetInventoryQuery,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const Inventory = ({ create = false }: { create?: boolean }) => {
  const navigate = useNavigate();
  const { projectId, inventoryId } = useSafeParams() as {
    projectId: string;
    inventoryId: string; // Not present if create!
  };
  const title = create ? `Add Inventory` : `Edit Inventory`;
  const { project } = useProjectDashboardContext();

  const {
    data: { inventory } = {},
    loading,
    error,
  } = useGetInventoryQuery({
    variables: { id: inventoryId },
    skip: create,
  });

  const onCompleted = useCallback(() => {
    if (create) {
      cache.evict({ id: `Project:${projectId}`, fieldName: 'inventories' });
    }
    navigate(generateSafePath(ProjectDashboardRoutes.INVENTORY, { projectId }));
  }, [navigate, projectId, create]);

  // Local variables to use for form population.
  // These variables names are referenced by the form definition!
  const localConstants = useMemo(() => {
    if (!project) return;
    return {
      projectStartDate: parseHmisDateString(project.operatingStartDate),
      projectEndDate: parseHmisDateString(project.operatingEndDate),
      inventoryId,
    };
  }, [project, inventoryId]);

  if (loading) return <Loading />;
  if (!create && !inventory) return <NotFound />;
  if (error) throw error;

  return (
    <EditRecord<InventoryFieldsFragment>
      FormActionProps={
        create ? { submitButtonText: 'Create Inventory' } : undefined
      }
      onCompleted={onCompleted}
      formRole={FormRole.Inventory}
      inputVariables={{ projectId }}
      record={inventory || undefined}
      localConstants={localConstants}
      pickListArgs={{ projectId }}
      title={
        !create &&
        inventory && <ProjectFormTitle title={title} project={project} />
      }
    />
  );
};
export default Inventory;
