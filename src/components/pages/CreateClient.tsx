import { Box, Container, Typography } from '@mui/material';
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import Breadcrumbs from '../elements/Breadcrumbs';
import { STICKY_BAR_HEIGHT } from '../layout/layoutConstants';

import { localConstantsForClientForm } from '@/modules/client/hooks/useClientFormDialog';
import EditRecord from '@/modules/form/components/EditRecord';
import { Routes } from '@/routes/routes';
import { ClientFieldsFragment, FormRole } from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const CreateClient: React.FC = () => {
  const navigate = useNavigate();
  // const { pathname, state } = useLocation();
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
    { label: 'Search', to: '/' },
    {
      label: 'New Client',
      to: '',
    },
  ];

  return (
    <Container maxWidth='lg' sx={{ pt: 3, pb: 20 }}>
      <EditRecord<ClientFieldsFragment>
        formRole={FormRole.Client}
        onCompleted={onCompleted}
        FormActionProps={{ submitButtonText: 'Create Client' }}
        top={STICKY_BAR_HEIGHT}
        localConstants={localConstants}
        title={
          <>
            <Box sx={{ mb: 2 }}>
              <Breadcrumbs crumbs={crumbs} />
            </Box>
            <Typography variant='h3' sx={{ pt: 0, pb: 3 }}>
              Add New Client
            </Typography>
          </>
        }
      />
    </Container>
  );
};

export default CreateClient;
