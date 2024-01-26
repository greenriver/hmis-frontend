import AddIcon from '@mui/icons-material/Add';
import {
  Box,
  Button,
  DialogContent,
  DialogProps,
  DialogTitle,
} from '@mui/material';
import CommonDialog from '@/components/elements/CommonDialog';

export const CreateClientAlertButton = () => {
  return (
    <Button startIcon={<AddIcon />} variant='outlined'>
      Create Alert
    </Button>
  );
};

export interface ClientAlertDialogProps extends DialogProps {}
const CreateClientAlertDialog: React.FC<ClientAlertDialogProps> = ({
  ...props
}) => {
  return (
    <CommonDialog maxWidth='sm' fullWidth {...props}>
      <DialogTitle>New Client Alert</DialogTitle>
      <DialogContent>
        <Box mt={2}>{/*  TO DO  */}</Box>
      </DialogContent>
    </CommonDialog>
  );
};

export default CreateClientAlertDialog;
