import { Stack, Typography } from '@mui/material';
import { useCallback, useMemo } from 'react';
import { generatePath, useNavigate, useParams } from 'react-router-dom';

import Breadcrumbs from '../elements/Breadcrumbs';
import Loading from '../elements/Loading';

import { InactiveChip } from './Project';

import EditRecord from '@/modules/form/components/EditRecord';
import { parseHmisDateString } from '@/modules/hmis/hmisUtil';
import ProjectLayout from '@/modules/inventory/components/ProjectLayout';
import { useProjectCrumbs } from '@/modules/inventory/components/useProjectCrumbs';
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
    navigate(generatePath(Routes.PROJECT, { projectId }), {
      state: { refetchInventory: create ? true : false },
    });
  }, [navigate, projectId, create]);

  // Local variables to use for form population.
  // These variables names are referenced by the form definition!
  const localConstants = useMemo(() => {
    if (!project) return;
    return {
      projectStartDate: parseHmisDateString(project.operatingStartDate),
      projectEndDate: parseHmisDateString(project.operatingEndDate),
      inventoryId: inventoryId,
    };
  }, [project, inventoryId]);

  if (loading || crumbsLoading) return <Loading />;
  if (!crumbs || !project) throw Error('Project not found');
  if (!create && !data?.inventory) throw Error('Inventory not found');
  if (error) throw error;

  const common = {
    definitionIdentifier: 'inventory',
    projectId,
    title: (
      <>
        <Breadcrumbs crumbs={crumbs} />
        <Stack direction={'row'} spacing={2}>
          <Typography variant='h3' sx={{ pt: 0, mt: 0 }}>
            {title}
          </Typography>
          <InactiveChip project={project} />
        </Stack>
      </>
    ),
  };
  return (
    <ProjectLayout>
      {create ? (
        <EditRecord<
          InventoryFieldsFragment,
          CreateInventoryMutation,
          CreateInventoryMutationVariables
        >
          inputVariables={{ projectId }}
          queryDocument={CreateInventoryDocument}
          onCompleted={onCompleted}
          getErrors={(data: CreateInventoryMutation) =>
            data?.createInventory?.errors
          }
          submitButtonText='Create Inventory'
          localConstants={localConstants}
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
          {...common}
        />
      )}
    </ProjectLayout>
  );
};
export default Inventory;
