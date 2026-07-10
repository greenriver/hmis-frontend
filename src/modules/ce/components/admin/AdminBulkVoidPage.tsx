import {
  Alert,
  Button,
  DialogActions,
  DialogContent,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import DialogTitle from '@mui/material/DialogTitle';
import { useMemo, useState, type FC } from 'react';
import CommonDialog from '@/components/elements/CommonDialog';
import TextInput from '@/components/elements/input/TextInput';
import PageTitle from '@/components/layout/PageTitle';
import NotFound from '@/components/pages/NotFound';
import { useGlobalFeatureFlags } from '@/hooks/useGlobalFeatureFlags';
import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import FormDialogActionContent from '@/modules/form/components/FormDialogActionContent';
import {
  FIXED_WIDTH_X_LARGE,
  MAX_INPUT_AND_LABEL_WIDTH,
} from '@/modules/form/util/formUtil';
import { useBulkVoidCeClientsMutation } from '@/types/gqlTypes';

const AdminBulkVoidPage: FC = () => {
  const { globalFeatureFlags } = useGlobalFeatureFlags();
  const [clientIdsInput, setClientIdsInput] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [success, setSuccess] = useState(false);

  const destinationClientIds = useMemo(
    () =>
      clientIdsInput
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean),
    [clientIdsInput]
  );

  const [bulkVoidCeClients, { error, loading }] = useBulkVoidCeClientsMutation({
    variables: { destinationClientIds },
    onCompleted: (data) => {
      if (data.bulkVoidCeClients?.success) {
        setConfirmOpen(false);
        setClientIdsInput('');
        setSuccess(true);
      }
    },
  });

  if (!globalFeatureFlags?.bulkVoidEnabled) return <NotFound />;

  return (
    <>
      <PageTitle title='Bulk Void' overlineText='Coordinated Entry' />
      <Stack gap={2}>
        {success && (
          <Alert severity='success' sx={{ maxWidth: FIXED_WIDTH_X_LARGE }}>
            Bulk void job started. Clients will be voided shortly.
          </Alert>
        )}
        {error && <ApolloErrorAlert error={error} inline />}
        <Paper sx={{ p: 3, maxWidth: FIXED_WIDTH_X_LARGE }}>
          <Stack gap={2} alignItems='flex-start'>
            <Typography>
              Enter comma-separated warehouse client IDs to void from
              Coordinated Entry.
            </Typography>
            <TextInput
              label='Warehouse Client IDs'
              value={clientIdsInput}
              onChange={(event) => {
                setClientIdsInput(event.target.value);
                setSuccess(false);
              }}
              placeholder='123, 456, 789'
              multiline
              minRows={4}
              maxWidth={MAX_INPUT_AND_LABEL_WIDTH}
              helperText={`${destinationClientIds.length} client ID${
                destinationClientIds.length === 1 ? '' : 's'
              } parsed`}
            />
            <Button
              variant='contained'
              disabled={destinationClientIds.length === 0}
              onClick={() => setConfirmOpen(true)}
            >
              Bulk Void Clients
            </Button>
          </Stack>
        </Paper>
      </Stack>
      <CommonDialog
        fullWidth
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
      >
        <DialogTitle>Confirm Bulk Void</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography>
            This will start a background job to void{' '}
            {destinationClientIds.length} clients from Coordinated Entry.
          </Typography>
        </DialogContent>
        <DialogActions>
          <FormDialogActionContent
            onDiscard={() => setConfirmOpen(false)}
            onSubmit={() => bulkVoidCeClients()}
            submitLoading={loading}
            submitButtonText='Start Bulk Void'
            discardButtonText='Cancel'
          />
        </DialogActions>
      </CommonDialog>
    </>
  );
};

export default AdminBulkVoidPage;
