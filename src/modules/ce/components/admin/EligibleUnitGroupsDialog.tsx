import { DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import React from 'react';

import CommonDialog from '@/components/elements/CommonDialog';
import CeClientEligibleUnitGroupsTable from '@/modules/ce/components/admin/CeClientEligibleUnitGroupsTable';

interface Props {
  ceClientId: string;
  open: boolean;
  clientName: string;
  onClose: () => void;
}

const EligibleUnitGroupsDialog: React.FC<Props> = ({
  ceClientId,
  clientName,
  ...props
}) => {
  return (
    <CommonDialog maxWidth='lg' fullWidth enableBackdropClick {...props}>
      <DialogTitle>Eligible Projects</DialogTitle>
      <DialogContent>
        <Stack my={2} gap={2}>
          <Typography variant='body2'>
            {clientName} is eligible for the following projects.
          </Typography>
          <CeClientEligibleUnitGroupsTable ceClientId={ceClientId} />
        </Stack>
      </DialogContent>
    </CommonDialog>
  );
};

export default EligibleUnitGroupsDialog;
