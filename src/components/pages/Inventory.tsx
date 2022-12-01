import { Grid, Typography } from '@mui/material';
import { useCallback, useMemo } from 'react';
import { generatePath, useNavigate, useParams } from 'react-router-dom';

import Breadcrumbs from '../elements/Breadcrumbs';
import Loading from '../elements/Loading';

import { InactiveBanner } from './Project';

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
  const title = create ? `Add Inventory` : `Edit Inventory`;
  const [crumbs, crumbsLoading, project] = useProjectCrumbs(title);

  const { data, loading, error } = useGetInventoryQuery({
    variables: { id: inventoryId },
    skip: create,
  });

  const onCompleted = useCallback(() => {
    navigate(generatePath(Routes.PROJECT, { projectId }));
  }, [navigate, projectId]);

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
  if (!create && !data?.inventory) throw Error('Inventory not found');
  if (error) throw error;

  const common = {
    definitionIdentifier: 'inventory',
  };
  return (
    <ProjectLayout>
      <Breadcrumbs crumbs={crumbs} />
      <Typography variant='h3' sx={{ mb: 4 }}>
        {title}
      </Typography>
      <Grid container>
        <Grid item xs={9}>
          <InactiveBanner project={project} />
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
              localConstants={localConstants}
              {...common}
            />
          )}
        </Grid>
      </Grid>
    </ProjectLayout>
  );
};
export default Inventory;
