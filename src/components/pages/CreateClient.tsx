import { Typography } from '@mui/material';
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import BasicBreadcrumbPageLayout from '../layout/BasicBreadcrumbPageLayout';
import { STICKY_BAR_HEIGHT } from '../layout/layoutConstants';

import { localConstantsForClientForm } from '@/modules/client/hooks/useClientFormDialog';
import EditRecord from '@/modules/form/components/EditRecord';
import { Routes } from '@/routes/routes';
import { ClientFieldsFragment, FormRole } from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

const CreateClient: React.FC = () => {
  const navigate = useNavigate();
  const onCompleted = useCallback(
    (data: ClientFieldsFragment) => {
      navigate(
        generateSafePath(Routes.CLIENT_DASHBOARD, { clientId: data.id })
      );
    },
    [navigate]
  );

  const localConstants = useMemo(() => localConstantsForClientForm(), []);

  const crumbs = [
    // { label: state?.prevPathName || 'Search', to: state?.prevPath || '/' },
    { label: 'Client Search', to: '/' },
    {
      label: 'New Client',
      to: '',
    },
  ];

  return (
    <BasicBreadcrumbPageLayout crumbs={crumbs} maxWidth='xl'>
      <EditRecord<ClientFieldsFragment>
        formRole={FormRole.Client}
        onCompleted={onCompleted}
        FormActionProps={{ submitButtonText: 'Create Client' }}
        top={STICKY_BAR_HEIGHT}
        localConstants={localConstants}
        title={
          <>
            <Typography variant='h3' sx={{ mt: 2, mb: 3 }}>
              Add New Client
            </Typography>
          </>
        }
      />
    </BasicBreadcrumbPageLayout>
  );
};

export default CreateClient;
