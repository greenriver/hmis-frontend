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

  const { data, loading, error } = useGetFunderQuery({
    variables: { id: funderId },
    skip: create,
  });

  const onCompleted = useCallback(() => {
    navigate(generatePath(Routes.PROJECT, { projectId }), {
      state: { refetchFunder: create ? true : false },
    });
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
              onCompleted={onCompleted}
              getErrors={(data: CreateFunderMutation) =>
                data?.createFunder?.errors
              }
              submitButtonText='Create Funding Source'
              localConstants={localConstants}
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
              onCompleted={onCompleted}
              getErrors={(data: UpdateFunderMutation) =>
                data?.updateFunder?.errors
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
export default Funder;
