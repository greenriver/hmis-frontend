import { Stack, Typography } from '@mui/material';
// import { useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';

// import Loading from '../elements/Loading';

import useSafeParams from '@/hooks/useSafeParams';
import EditRecord from '@/modules/form/components/EditRecord';
// import ProjectLayout from '@/modules/inventory/components/ProjectLayout';
// import { useProjectCrumbs } from '@/modules/inventory/components/useProjectCrumbs';
// import { cache } from '@/providers/apolloClient';
// import { Routes } from '@/routes/routes';
import {
  CreateProjectCocDocument,
  CreateProjectCocMutation,
  CreateProjectCocMutationVariables,
  ProjectCocFieldsFragment,
  UpdateProjectCocDocument,
  UpdateProjectCocMutation,
  UpdateProjectCocMutationVariables,
  // useGetProjectCocQuery,
} from '@/types/gqlTypes';
// import generateSafePath from '@/utils/generateSafePath';

const Service = ({ create = false }: { create?: boolean }) => {
  // const navigate = useNavigate();
  const {
    enrollmentId,
    // serviceId,
  } = useSafeParams() as {
    enrollmentId: string;
    serviceId: string;
  };
  const title = create ? `Add Service` : `Edit Service`;
  // const [crumbs, crumbsLoading, enrollment] = useProjectCrumbs(title);

  // const onCompleted = useCallback(() => {
  //   // Force refresh table if we just created a new record
  //   if (create) {
  //     cache.evict({ id: `Project:${projectId}`, fieldName: 'projectCocs' });
  //   }
  //   navigate(generateSafePath(Routes.PROJECT, { projectId }));
  // }, [navigate, projectId, create]);

  // const { data, loading, error } = useGetProjectCocQuery({
  //   variables: { id: cocId },
  //   skip: create,
  // });

  // if (loading || crumbsLoading) return <Loading />;
  // if (crumbsLoading) return <Loading />
  // if (error) throw error;
  // if (!crumbs || !enrollment) throw Error('Enrollment not found');

  const common = {
    definitionIdentifier: 'service',
    title: (
      <Stack direction={'row'} spacing={2}>
        <Typography variant='h3' sx={{ pt: 0, mt: 0 }}>
          {title}
        </Typography>
      </Stack>
    ),
  };
  return (
    <>
      {create ? (
        <EditRecord<
          ProjectCocFieldsFragment,
          CreateProjectCocMutation,
          CreateProjectCocMutationVariables
        >
          inputVariables={{ enrollmentId }}
          queryDocument={CreateProjectCocDocument}
          // onCompleted={onCompleted}
          // getErrors={(data: CreateProjectCocMutation) =>
          //   data?.createProjectCoc?.errors
          // }
          onCompleted={() => {}}
          getErrors={() => undefined}
          submitButtonText='Add Service'
          {...common}
        />
      ) : (
        <EditRecord<
          ProjectCocFieldsFragment,
          UpdateProjectCocMutation,
          UpdateProjectCocMutationVariables
        >
          // record={data?.projectCoc || undefined}
          queryDocument={UpdateProjectCocDocument}
          // onCompleted={onCompleted}
          // getErrors={(data: UpdateProjectCocMutation) =>
          //   data?.updateProjectCoc?.errors
          // }
          onCompleted={() => {}}
          getErrors={() => undefined}
          submitButtonText='Save Changes'
          {...common}
        />
      )}
    </>
  );
};
export default Service;
