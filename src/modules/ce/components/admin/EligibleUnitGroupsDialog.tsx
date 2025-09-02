import { DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import React from 'react';

import CommonDialog from '@/components/elements/CommonDialog';
import CeClientEligibleUnitGroupsTable from '@/modules/ce/components/admin/CeClientEligibleUnitGroupsTable';

interface Props {
  id: string;
  open: boolean;
  clientName: string;
  onClose: () => void;
}

const EligibleUnitGroupsDialog: React.FC<Props> = ({
  id,
  clientName,
  ...props
}) => {
  return (
    <CommonDialog maxWidth='lg' fullWidth enableBackdropClick {...props}>
      <DialogTitle>Eligible Projects</DialogTitle>
      <DialogContent>
        <Stack my={4} gap={4}>
          <Typography variant='body2'>
            {clientName} is eligible for the following unit groups:
          </Typography>
          <CeClientEligibleUnitGroupsTable id={id} />
        </Stack>
      </DialogContent>
    </CommonDialog>
  );
};

export default EligibleUnitGroupsDialog;
