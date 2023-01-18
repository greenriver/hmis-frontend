import { Stack, Typography } from '@mui/material';
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import Loading from '../elements/Loading';

import { InactiveChip } from './Project';

import useSafeParams from '@/hooks/useSafeParams';
import EditRecord from '@/modules/form/components/EditRecord';
import { parseHmisDateString } from '@/modules/hmis/hmisUtil';
import ProjectLayout from '@/modules/inventory/components/ProjectLayout';
import { useProjectCrumbs } from '@/modules/inventory/components/useProjectCrumbs';
import { cache } from '@/providers/apolloClient';
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
import generateSafePath from '@/utils/generateSafePath';

const Funder = ({ create = false }: { create?: boolean }) => {
  const navigate = useNavigate();
  const { projectId, funderId } = useSafeParams() as {
    projectId: string;
    funderId: string; // Not present if create!
  };
  const title = create ? `Add Funder` : `Update Funder`;
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

  const common = {
    definitionIdentifier: 'funder',
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
          FunderFieldsFragment,
          CreateFunderMutation,
          CreateFunderMutationVariables
        >
          inputVariables={{ projectId }}
          queryDocument={CreateFunderDocument}
          onCompleted={onCompleted}
          getErrors={(data: CreateFunderMutation) => data?.createFunder?.errors}
          submitButtonText='Create Funder'
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
          getErrors={(data: UpdateFunderMutation) => data?.updateFunder?.errors}
          submitButtonText='Update Funder'
          localConstants={localConstants}
          {...common}
        />
      )}
    </ProjectLayout>
  );
};
export default Funder;
