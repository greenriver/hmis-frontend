import { Stack, Typography } from '@mui/material';
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DeleteClientButton from '@/modules/client/components/DeleteClientButton';
import useClientDashboardContext from '@/modules/client/hooks/useClientDashboardContext';

import { localConstantsForClientForm } from '@/modules/client/hooks/useClientFormDialog';
import EditRecord from '@/modules/form/components/EditRecord';
import { cache } from '@/providers/apolloClient';
import { Routes } from '@/routes/routes';
import { ClientFieldsFragment, RecordFormRole } from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

const EditClientPage = () => {
  const { client } = useClientDashboardContext();
  const navigate = useNavigate();

  const onCompleted = useCallback(
    (data: ClientFieldsFragment) => {
      cache.evict({ id: `Client:${data.id}` });
      navigate(
        generateSafePath(Routes.CLIENT_DASHBOARD, { clientId: data.id })
      );
    },
    [navigate]
  );

  const localConstants = useMemo(
    () => localConstantsForClientForm(client),
    [client]
  );

  return (
    <EditRecord<ClientFieldsFragment>
      formRole={RecordFormRole.Client}
      record={client}
      localConstants={localConstants}
      onCompleted={onCompleted}
      title={
        <Stack direction='row' justifyContent='space-between'>
          <Typography
            component='h1'
            variant='h3'
            sx={{ pt: 2, pb: 4 }}
            flexGrow={1}
          >
            Update Client Details
          </Typography>
        </Stack>
      }
      FormNavigationProps={{
        contentsBelowNavigation: client.access.canDeleteClient && (
          <DeleteClientButton
            clientId={client.id}
            clientLockVersion={client.lockVersion}
            onSuccess={() => navigate(generateSafePath(Routes.CLIENT_SEARCH))}
          />
        ),
      }}
    />
  );
};

export default EditClientPage;
