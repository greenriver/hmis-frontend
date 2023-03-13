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
  const [crumbs, crumbsLoading, project] = useProjectCrumbs(title);

  const { data, loading, error } = useGetInventoryQuery({
    variables: { id: inventoryId },
    skip: create,
  });

  const onCompleted = useCallback(
    (data: InventoryFieldsFragment) => {
      if (create) {
        cache.evict({ id: `Project:${projectId}`, fieldName: 'inventories' });

        navigate(
          generateSafePath(Routes.MANAGE_INVENTORY_BEDS, {
            projectId,
            inventoryId: data.id,
          })
        );
      } else {
        navigate(generateSafePath(Routes.PROJECT, { projectId }));
      }
    },
    [navigate, projectId, create]
  );

  // Local variables to use for form population.
  // These variables names are referenced by the form definition!
  const localConstants = useMemo(() => {
    if (!project) return;
    return {
      projectStartDate: parseHmisDateString(project.operatingStartDate),
      projectEndDate: parseHmisDateString(project.operatingEndDate),
      inventoryId,
      bedInventory: data?.inventory?.bedInventory || 0,
      unitInventory: data?.inventory?.unitInventory || 0,
    };
  }, [project, inventoryId, data]);

  if (loading || crumbsLoading) return <Loading />;
  if (!crumbs || !project) throw Error('Project not found');
  if (!create && !data?.inventory) throw Error('Inventory not found');
  if (error) throw error;

  return (
    <ProjectLayout crumbs={crumbs}>
      <EditRecord<InventoryFieldsFragment>
        FormActionProps={
          create ? { submitButtonText: 'Create Inventory' } : undefined
        }
        onCompleted={onCompleted}
        formRole={FormRole.Inventory}
        inputVariables={{ projectId }}
        record={data?.inventory || undefined}
        title={<ProjectFormTitle title={title} project={project} />}
        localConstants={localConstants}
        pickListRelationId={projectId}
      />
    </ProjectLayout>
  );
};
export default Inventory;
