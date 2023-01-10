import { Stack, Typography } from '@mui/material';
import { useCallback, useMemo } from 'react';
import { generatePath, useNavigate, useParams } from 'react-router-dom';

import Loading from '../elements/Loading';

import { InactiveChip } from './Project';

import EditRecord from '@/modules/form/components/EditRecord';
import { parseHmisDateString } from '@/modules/hmis/hmisUtil';
import ProjectLayout from '@/modules/inventory/components/ProjectLayout';
import { useProjectCrumbs } from '@/modules/inventory/components/useProjectCrumbs';
import { cache } from '@/providers/apolloClient';
import { Routes } from '@/routes/routes';
import {
  CreateInventoryDocument,
  CreateInventoryMutation,
  CreateInventoryMutationVariables,
  InventoryFieldsFragment,
  UpdateInventoryDocument,
  UpdateInventoryMutation,
  UpdateInventoryMutationVariables,
  useGetInventoryQuery,
} from '@/types/gqlTypes';

const Inventory = ({ create = false }: { create?: boolean }) => {
  const navigate = useNavigate();
  const { projectId, inventoryId } = useParams() as {
    projectId: string;
    inventoryId: string; // Not present if create!
  };
  const title = create ? `Add Inventory` : `Update Inventory`;
  const [crumbs, crumbsLoading, project] = useProjectCrumbs(title);

  const { data, loading, error } = useGetInventoryQuery({
    variables: { id: inventoryId },
    skip: create,
  });

  const onCompleted = useCallback(() => {
    // Force refresh table if we just created a new record
    if (create) {
      cache.evict({ id: `Project:${projectId}`, fieldName: 'inventories' });
      // TODO navigate to bed/unit management
    }
    navigate(generatePath(Routes.PROJECT, { projectId }));
  }, [navigate, projectId, create]);

  // Local variables to use for form population.
  // These variables names are referenced by the form definition!
  const localConstants = useMemo(() => {
    if (!project) return;
    return {
      projectStartDate: parseHmisDateString(project.operatingStartDate),
      projectEndDate: parseHmisDateString(project.operatingEndDate),
      // inventoryId: inventoryId,
    };
  }, [project]);

  if (loading || crumbsLoading) return <Loading />;
  if (!crumbs || !project) throw Error('Project not found');
  if (!create && !data?.inventory) throw Error('Inventory not found');
  if (error) throw error;

  const common = {
    definitionIdentifier: 'inventory',
    projectId,
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
          InventoryFieldsFragment,
          CreateInventoryMutation,
          CreateInventoryMutationVariables
        >
          inputVariables={{ projectId, unitInventory: 0, bedInventory: 0 }}
          queryDocument={CreateInventoryDocument}
          onCompleted={onCompleted}
          getErrors={(data: CreateInventoryMutation) =>
            data?.createInventory?.errors
          }
          submitButtonText='Create Inventory'
          localConstants={localConstants}
          pickListRelationId={projectId}
          {...common}
        />
      ) : (
        <EditRecord<
          InventoryFieldsFragment,
          UpdateInventoryMutation,
          UpdateInventoryMutationVariables
        >
          record={data?.inventory || undefined}
          queryDocument={UpdateInventoryDocument}
          onCompleted={onCompleted}
          getErrors={(data: UpdateInventoryMutation) =>
            data?.updateInventory?.errors
          }
          submitButtonText='Update Inventory'
          localConstants={localConstants}
          pickListRelationId={projectId}
          {...common}
        />
      )}
    </ProjectLayout>
  );
};
export default Inventory;
