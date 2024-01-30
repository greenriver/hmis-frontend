import AddIcon from '@mui/icons-material/Add';
import { Button } from '@mui/material';
import { useState } from 'react';
import { CreateClientAlertDialog } from '@/modules/client/components/clientAlerts/CreateClientAlertDialog';

export interface CreateClientAlertButtonProps {
  clientId: string;
}
const CreateClientAlertButton: React.FC<CreateClientAlertButtonProps> = ({
  clientId,
}) => {
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
      <CreateClientAlertDialog
        open={open}
        onClose={() => setOpen(false)}
        clientId={clientId}
      />
    </>
  );
};

export default CreateClientAlertButton;
