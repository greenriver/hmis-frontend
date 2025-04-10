import { Box, DialogContent, DialogTitle } from '@mui/material';
import React from 'react';
import CommonDialog, { CommonDialogProps } from '../CommonDialog';
import Wayfinder, {
  WayfinderProps,
} from '@/components/elements/navigation/Wayfinder';

type Props = WayfinderProps &
  Pick<CommonDialogProps, 'open' | 'onClose'> & {
    title: string;
  };

const WayfindingDialog: React.FC<Props> = ({
  open,
  onClose,
  title,
  ...rest
}) => {
  return (
    <CommonDialog open={open} onClose={onClose} fullWidth maxWidth='md'>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box my={2}>
          <Wayfinder {...rest} />
        </Box>
      </DialogContent>
    </CommonDialog>
  );
};

export default WayfindingDialog;
