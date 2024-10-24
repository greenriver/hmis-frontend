import AddIcon from '@mui/icons-material/Add';
import { Button } from '@mui/material';
import * as React from 'react';
import { useState } from 'react';
import ServiceTypeDialog from './ServiceTypeDialog';

const NewServiceTypeButton = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Button
        startIcon={<AddIcon />}
        variant='outlined'
        onClick={() => setDialogOpen(true)}
      >
        New Service Type
      </Button>
      <ServiceTypeDialog
        dialogOpen={dialogOpen}
        closeDialog={() => setDialogOpen(false)}
      />
    </>
  );
};

export default NewServiceTypeButton;
