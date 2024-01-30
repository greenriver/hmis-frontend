import { Box, DialogContent, DialogProps, DialogTitle } from '@mui/material';
import CommonDialog from '@/components/elements/CommonDialog';
import StaticForm from '@/modules/form/components/StaticForm';
import { clientNameAllParts } from '@/modules/hmis/hmisUtil';
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
  return (
    <CommonDialog maxWidth='sm' fullWidth {...props}>
      <DialogTitle>Create Alert for {clientNameAllParts(client)}</DialogTitle>
      <DialogContent>
        <Box mt={2}>
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
              console.log(data);
            }}
          />
        </Box>
      </DialogContent>
    </CommonDialog>
  );
};
