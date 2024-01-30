import { Box, DialogContent, DialogProps, DialogTitle } from '@mui/material';
import CommonDialog from '@/components/elements/CommonDialog';
import StaticForm from '@/modules/form/components/StaticForm';
import {
  ClientAlertInput,
  CreateClientAlertDocument,
  CreateClientAlertMutation,
  CreateClientAlertMutationVariables,
  StaticFormRole,
} from '@/types/gqlTypes';

interface ClientAlertDialogProps extends DialogProps {
  clientId: string;
}
export const CreateClientAlertDialog: React.FC<ClientAlertDialogProps> = ({
  clientId,
  ...props
}) => {
  return (
    <CommonDialog maxWidth='sm' fullWidth {...props}>
      <DialogTitle>Create Alert for NAME</DialogTitle>
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
                  clientId: clientId,
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
