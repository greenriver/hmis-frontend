import { Stack, Typography } from '@mui/material';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import Loading from '../elements/Loading';

import NotFound from './NotFound';

import useSafeParams from '@/hooks/useSafeParams';
import EditRecord from '@/modules/form/components/EditRecord';
import { cache } from '@/providers/apolloClient';
import { ClientDashboardRoutes } from '@/routes/routes';
import {
  FormRole,
  ServiceFieldsFragment,
  useGetServiceQuery,
} from '@/types/gqlTypes';
import generateSafePath, { withHash } from '@/utils/generateSafePath';

const Service = ({ create = false }: { create?: boolean }) => {
  const navigate = useNavigate();
  const { clientId, enrollmentId, serviceId } = useSafeParams() as {
    enrollmentId: string;
    serviceId: string;
    clientId: string;
  };
  const title = create ? `Add Service` : `Edit Service`;

  const onCompleted = useCallback(() => {
    // Force refresh table if we just created a new record
    if (create) {
      cache.evict({ id: `Enrollment:${enrollmentId}`, fieldName: 'services' });
    }
    navigate(
      withHash(
        generateSafePath(ClientDashboardRoutes.VIEW_ENROLLMENT, {
          enrollmentId,
          clientId,
        }),
        'services'
      )
    );
  }, [navigate, enrollmentId, clientId, create]);

  const { data, loading, error } = useGetServiceQuery({
    variables: { id: serviceId },
    skip: create,
  });

  if (loading) return <Loading />;
  // if (crumbsLoading) return <Loading />
  if (error) throw error;
  if (!create && !loading && !data?.service) return <NotFound />;

  return (
    <EditRecord<ServiceFieldsFragment>
      formRole={FormRole.Service}
      inputVariables={{ enrollmentId }}
      onCompleted={onCompleted}
      record={data?.service || undefined}
      FormActionProps={create ? { submitButtonText: 'Add Service' } : undefined}
      title={
        <Stack direction={'row'} spacing={2}>
          <Typography variant='h3' sx={{ pt: 0, mt: 0 }}>
            {title}
          </Typography>
        </Stack>
      }
    />
  );
};
export default Service;
