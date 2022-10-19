import { Grid, Typography } from '@mui/material';
import { useCallback } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';

import Breadcrumbs from '../elements/Breadcrumbs';
import Loading from '../elements/Loading';

import { MAPPING_KEY, PROJECT_FORM } from './EditProject';
import { InactiveBanner } from './Project';

import EditRecord from '@/modules/form/components/EditRecord';
import ProjectLayout from '@/modules/inventory/components/ProjectLayout';
import { useProjectCrumbs } from '@/modules/inventory/components/useProjectCrumbs';
import { Routes } from '@/routes/routes';
import {
  InventoryFieldsFragment,
  UpdateInventoryDocument,
  UpdateInventoryMutation,
  UpdateInventoryMutationVariables,
} from '@/types/gqlTypes';

const Inventory = ({ create = false }: { create?: boolean }) => {
  const navigate = useNavigate();

  const title = create ? 'Add Inventory' : 'Edit Inventory';
  const [crumbs, loading, project] = useProjectCrumbs(title);

  const onCompleted = useCallback(
    (data: UpdateInventoryMutation) => {
      const id = data?.updateInventory?.inventory?.id;
      if (id) {
        navigate(generatePath(Routes.PROJECT, { projectId: id }));
      }
    },
    [navigate]
  );

  if (loading) return <Loading />;
  if (!crumbs || !project) throw Error('Project not found');

  return (
    <ProjectLayout>
      <Breadcrumbs crumbs={crumbs} />
      <Typography variant='h3' sx={{ mb: 4 }}>
        {title}
      </Typography>
      <Grid container>
        <Grid item xs={9}>
          <InactiveBanner project={project} />
          <EditRecord<
            InventoryFieldsFragment,
            UpdateInventoryMutation,
            UpdateInventoryMutationVariables
          >
            definition={PROJECT_FORM}
            mappingKey={MAPPING_KEY}
            // record={project}
            queryDocument={UpdateInventoryDocument}
            onCompleted={onCompleted}
            getErrors={(data: UpdateInventoryMutation) =>
              data?.updateInventory?.errors
            }
          />
        </Grid>
      </Grid>
    </ProjectLayout>
  );
};
export default Inventory;
