import AddIcon from '@mui/icons-material/Add';
import { Button } from '@mui/material';
import { useState } from 'react';
import { CreateClientAlertDialog } from '@/modules/client/components/clientAlerts/CreateClientAlertDialog';
import { ClientWithAlertFieldsFragment } from '@/types/gqlTypes';

export interface CreateClientAlertButtonProps {
  client: ClientWithAlertFieldsFragment;
}
const CreateClientAlertButton: React.FC<CreateClientAlertButtonProps> = ({
  client,
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
        client={client}
      />
    </>
  );
};

export default CreateClientAlertButton;
