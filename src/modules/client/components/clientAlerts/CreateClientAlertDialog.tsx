import AddIcon from '@mui/icons-material/Add';
import {
  Box,
  Button,
  DialogContent,
  DialogProps,
  DialogTitle,
} from '@mui/material';
import { useState } from 'react';
import CommonDialog from '@/components/elements/CommonDialog';
// import StaticForm from '@/modules/form/components/StaticForm';
// import {
//   CreateClientAlertMutation,
//   CreateClientAlertMutationVariables,
//   MutationCreateClientAlertArgs,
//   StaticFormRole,
// } from '@/types/gqlTypes';

interface ClientAlertDialogProps extends DialogProps {}
const CreateClientAlertDialog: React.FC<ClientAlertDialogProps> = ({
  ...props
}) => {
  // todo @martha = fill in NAME
  // todo @martha - add reminder
  return (
    <CommonDialog maxWidth='sm' fullWidth {...props}>
      <DialogTitle>Create Alert for NAME</DialogTitle>
      <DialogContent>
        <Box mt={2}>
          {/*<StaticForm<CreateClientAlertMutation, CreateClientAlertMutationVariables>*/}
          {/*  role={StaticFormRole.ClientAlert}*/}
          {/*  mutationDocument={CreateClientAlertDocument}*/}
          {/*  getVariables={(values) => ({input: values})}*/}
          {/*  getErrors={(data) => data.errors || []}*/}
          {/*  onCompleted={(data) => {*/}
          {/*    console.log('todo @martha - what to do on completion?')*/}
          {/*  }}/>*/}
        </Box>
      </DialogContent>
    </CommonDialog>
  );
};

export const CreateClientAlertButton = () => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <>
      <Button
        startIcon={<AddIcon />}
        variant='outlined'
        onClick={() => setOpen(true)}
      >
        Create Alert
      </Button>
      <CreateClientAlertDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
};
