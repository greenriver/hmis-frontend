import { Stack, Typography } from '@mui/material';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import Loading from '../elements/Loading';

import useSafeParams from '@/hooks/useSafeParams';
import EditRecord from '@/modules/form/components/EditRecord';
// import ProjectLayout from '@/modules/inventory/components/ProjectLayout';
// import { useProjectCrumbs } from '@/modules/inventory/components/useProjectCrumbs';
import { cache } from '@/providers/apolloClient';
import { DashboardRoutes } from '@/routes/routes';
import {
  AddServiceToEnrollmentDocument,
  AddServiceToEnrollmentMutation,
  AddServiceToEnrollmentMutationVariables,
  ServiceFieldsFragment,
  UpdateServiceDocument,
  UpdateServiceMutation,
  UpdateServiceMutationVariables,
  useGetServiceQuery,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const Service = ({ create = false }: { create?: boolean }) => {
  const navigate = useNavigate();
  const { clientId, enrollmentId, serviceId } = useSafeParams() as {
    enrollmentId: string;
    serviceId: string;
    clientId: string;
  };
  const title = create ? `Add Service` : `Edit Service`;
  // const [crumbs, crumbsLoading, enrollment] = useProjectCrumbs(title);

  const onCompleted = useCallback(() => {
    // Force refresh table if we just created a new record
    if (create) {
      cache.evict({ id: `Enrollment:${enrollmentId}`, fieldName: 'services' });
    }
    navigate(
      generateSafePath(DashboardRoutes.VIEW_ENROLLMENT, {
        enrollmentId,
        clientId,
      })
    );
  }, [navigate, enrollmentId, clientId, create]);

  const { data, loading, error } = useGetServiceQuery({
    variables: { id: serviceId },
    skip: create,
  });

  if (loading) return <Loading />;
  // if (crumbsLoading) return <Loading />
  if (error) throw error;
  if (!create && !loading && !data?.service) throw Error('Service not found');

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
          ServiceFieldsFragment,
          AddServiceToEnrollmentMutation,
          AddServiceToEnrollmentMutationVariables
        >
          inputVariables={{ enrollmentId }}
          queryDocument={AddServiceToEnrollmentDocument}
          onCompleted={onCompleted}
          getErrors={(data: AddServiceToEnrollmentMutation) =>
            data?.createService?.errors
          }
          submitButtonText='Add Service'
          {...common}
        />
      ) : (
        <EditRecord<
          ServiceFieldsFragment,
          UpdateServiceMutation,
          UpdateServiceMutationVariables
        >
          record={data?.service || undefined}
          queryDocument={UpdateServiceDocument}
          onCompleted={onCompleted}
          getErrors={(data: UpdateServiceMutation) =>
            data?.updateService?.errors
          }
          submitButtonText='Save Changes'
          {...common}
        />
      )}
    </>
  );
};
export default Service;
