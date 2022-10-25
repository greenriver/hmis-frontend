import { Grid, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';

import Breadcrumbs from '../elements/Breadcrumbs';
import Loading from '../elements/Loading';

import { InactiveBanner } from './Project';

import EditRecord from '@/modules/form/components/EditRecord';
import ProjectLayout from '@/modules/inventory/components/ProjectLayout';
import { useProjectCrumbs } from '@/modules/inventory/components/useProjectCrumbs';
import {
  CreateFunderDocument,
  CreateFunderMutation,
  CreateFunderMutationVariables,
  FunderFieldsFragment,
  UpdateFunderDocument,
  UpdateFunderMutation,
  UpdateFunderMutationVariables,
  useGetFunderQuery,
} from '@/types/gqlTypes';

const Funder = ({ create = false }: { create?: boolean }) => {
  const navigate = useNavigate();
  const { projectId, funderId } = useParams() as {
    projectId: string;
    funderId: string; // Not present if create!
  };
  const title = create ? `Add Funder` : `Edit Funder`;
  const [crumbs, crumbsLoading, project] = useProjectCrumbs(title);

  // FIXME why isn't cache working
  const { data, loading, error } = useGetFunderQuery({
    variables: { id: funderId },
    skip: create,
  });

  if (loading || crumbsLoading) return <Loading />;
  if (!crumbs || !project) throw Error('Project not found');
  if (!create && !data?.funder) throw Error('Funder not found');
  if (error) throw error;

  const common = {
    definitionIdentifier: 'funder',
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
              FunderFieldsFragment,
              CreateFunderMutation,
              CreateFunderMutationVariables
            >
              inputVariables={{ projectId }}
              queryDocument={CreateFunderDocument}
              onCompleted={() => navigate(-1)}
              getErrors={(data: CreateFunderMutation) =>
                data?.createFunder?.errors
              }
              submitButtonText='Create Funding Source'
              {...common}
            />
          ) : (
            <EditRecord<
              FunderFieldsFragment,
              UpdateFunderMutation,
              UpdateFunderMutationVariables
            >
              record={data?.funder || undefined}
              queryDocument={UpdateFunderDocument}
              onCompleted={() => navigate(-1)}
              getErrors={(data: UpdateFunderMutation) =>
                data?.updateFunder?.errors
              }
              {...common}
            />
          )}
        </Grid>
      </Grid>
    </ProjectLayout>
  );
};
export default Funder;
