import {
  Alert,
  Box,
  DialogContent,
  DialogProps,
  DialogTitle,
} from '@mui/material';
import CommonDialog from '@/components/elements/CommonDialog';
import StaticForm from '@/modules/form/components/StaticForm';
import { clientBriefName } from '@/modules/hmis/hmisUtil';
import {
  ClientAlertInput,
  ClientWithAlertFieldsFragment,
  CreateClientAlertDocument,
  CreateClientAlertMutation,
  CreateClientAlertMutationVariables,
  StaticFormRole,
} from '@/types/gqlTypes';

interface ClientAlertDialogProps extends DialogProps {
  client: ClientWithAlertFieldsFragment;
}
export const CreateClientAlertDialog: React.FC<ClientAlertDialogProps> = ({
  client,
  ...props
}) => {
  const clientName = clientBriefName(client);

  return (
    <CommonDialog maxWidth='sm' fullWidth {...props}>
      <DialogTitle>Create Alert for {clientName}</DialogTitle>
      <DialogContent>
        <Box mt={2}>
          <Alert sx={{ mb: 2 }} severity='info'>
            Reminder: All staff who can view {clientName} will be able to see
            this alert
          </Alert>
          <StaticForm<
            CreateClientAlertMutation,
            CreateClientAlertMutationVariables
          >
            role={StaticFormRole.ClientAlert}
            mutationDocument={CreateClientAlertDocument}
            getVariables={(values) => {
              return {
                input: {
                  clientId: client.id,
                  ...values,
                } as ClientAlertInput,
              };
            }}
            getErrors={(data) => data.createClientAlert?.errors || []}
            onCompleted={(data) => {
              if (!data?.createClientAlert?.errors?.length && props.onClose)
                props.onClose({}, 'escapeKeyDown');
            }}
          />
        </Box>
      </DialogContent>
    </CommonDialog>
  );
};
