import { Grid, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';

import Breadcrumbs from '../elements/Breadcrumbs';
import Loading from '../elements/Loading';

import { InactiveBanner } from './Project';

import EditRecord from '@/modules/form/components/EditRecord';
import { InventoryFormDefinition } from '@/modules/form/data';
import ProjectLayout from '@/modules/inventory/components/ProjectLayout';
import { useProjectCrumbs } from '@/modules/inventory/components/useProjectCrumbs';
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

  // FIXME why isn't cache working
  const { data, loading, error } = useGetInventoryQuery({
    variables: { id: inventoryId },
    skip: create,
  });

  if (loading || crumbsLoading) return <Loading />;
  if (!crumbs || !project) throw Error('Project not found');
  if (!create && !data?.inventory) throw Error('Inventory not found');
  if (error) throw error;

  const common = {
    definition: InventoryFormDefinition,
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
              onCompleted={() => navigate(-1)}
              getErrors={(data: CreateInventoryMutation) =>
                data?.createInventory?.errors
              }
              submitButtonText='Create Funding Source'
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
              onCompleted={() => navigate(-1)}
              getErrors={(data: UpdateInventoryMutation) =>
                data?.updateInventory?.errors
              }
              {...common}
            />
          )}
        </Grid>
      </Grid>
    </ProjectLayout>
  );
};
export default Inventory;
