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
import { useEffect, useMemo, useState, type FC } from 'react';
import CommonDialog from '@/components/elements/CommonDialog';
import TextInput from '@/components/elements/input/TextInput';
import PageTitle from '@/components/layout/PageTitle';
import NotFound from '@/components/pages/NotFound';
import { useGlobalFeatureFlags } from '@/hooks/useGlobalFeatureFlags';
import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import FormDialogActionContent from '@/modules/form/components/FormDialogActionContent';
import FormSelect from '@/modules/form/components/FormSelect';
import {
  FIXED_WIDTH_X_LARGE,
  MAX_INPUT_AND_LABEL_WIDTH,
} from '@/modules/form/util/formUtil';
import {
  PickListType,
  useBulkVoidCeClientsMutation,
  useGetPickListQuery,
  type PickListOption,
} from '@/types/gqlTypes';

const AdminBulkVoidPage: FC = () => {
  const { globalFeatureFlags } = useGlobalFeatureFlags();
  const [clientIdsInput, setClientIdsInput] = useState('');
  const [selectedProject, setSelectedProject] = useState<PickListOption | null>(
    null
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    data: { pickList: projectOptions = [] } = {},
    loading: projectOptionsLoading,
    error: projectOptionsError,
  } = useGetPickListQuery({
    variables: { pickListType: PickListType.BulkVoidCeProjects },
  });

  // If there is only one project, auto-select it
  useEffect(() => {
    if (projectOptions.length === 1) {
      setSelectedProject(projectOptions[0]);
    }
  }, [projectOptions]);

  const destinationClientIds = useMemo(
    () =>
      clientIdsInput
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean),
    [clientIdsInput]
  );

  const [
    bulkVoidCeClients,
    { error: bulkVoidError, loading: bulkVoidLoading },
  ] = useBulkVoidCeClientsMutation({
    variables: {
      destinationClientIds,
      projectId: selectedProject?.code || '',
    },
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
        {projectOptionsError && (
          <ApolloErrorAlert error={projectOptionsError} inline />
        )}
        <Paper sx={{ p: 3, maxWidth: FIXED_WIDTH_X_LARGE }}>
          <Stack gap={2} alignItems='flex-start'>
            <Typography>
              Enter comma-separated warehouse client IDs to void from
              Coordinated Entry.
            </Typography>
            <FormSelect
              label='Coordinated Entry Project'
              multiple={false}
              value={selectedProject}
              options={projectOptions}
              loading={projectOptionsLoading}
              onChange={(_event, project) => {
                setSelectedProject(project);
                setSuccess(false);
              }}
              textInputProps={{
                helperText: 'Select the CE project to void clients from.',
              }}
              sx={{ width: MAX_INPUT_AND_LABEL_WIDTH }}
            />
            {!projectOptionsLoading && projectOptions.length === 0 && (
              <Alert severity='warning'>
                No open Coordinated Entry projects are available.
              </Alert>
            )}
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
              disabled={
                destinationClientIds.length === 0 ||
                !selectedProject ||
                projectOptionsLoading
              }
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
          <Stack gap={2}>
            <Typography>
              This will start a background job to void{' '}
              {destinationClientIds.length} client
              {destinationClientIds.length === 1 ? '' : 's'} from{' '}
              {selectedProject?.label}.
            </Typography>
            {bulkVoidError && <ApolloErrorAlert error={bulkVoidError} inline />}
          </Stack>
        </DialogContent>
        <DialogActions>
          <FormDialogActionContent
            onDiscard={() => setConfirmOpen(false)}
            onSubmit={() => bulkVoidCeClients()}
            submitLoading={bulkVoidLoading}
            submitButtonText='Start Bulk Void'
            discardButtonText='Cancel'
          />
        </DialogActions>
      </CommonDialog>
    </>
  );
};

export default AdminBulkVoidPage;
