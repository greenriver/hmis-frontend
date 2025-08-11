import { Box, DialogContent, DialogTitle } from '@mui/material';
import React from 'react';

import CommonDialog from '@/components/elements/CommonDialog';
import CeClientEligibleUnitGroupsTable from '@/modules/ce/components/admin/CeClientEligibleUnitGroupsTable';

interface Props {
  id: string;
  open: boolean;
  onClose: () => void;
}

const ConsolidatedWaitlistDialog: React.FC<Props> = ({ id, ...props }) => {
  return (
    <CommonDialog maxWidth='lg' fullWidth enableBackdropClick {...props}>
      <DialogTitle>what waitlists is this client on?</DialogTitle>
      <DialogContent>
        <Box my={4}>
          <CeClientEligibleUnitGroupsTable id={id} />
        </Box>
      </DialogContent>
    </CommonDialog>
  );
};

export default ConsolidatedWaitlistDialog;
