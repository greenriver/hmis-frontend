import { Button } from '@mui/material';
import { useState } from 'react';

import ConsumerSummaryReportDialog from './ConsumerSummaryReportDialog';

interface Props {
  referralIdentifier: string;
}

const ConsumerSummaryReportButton: React.FC<Props> = ({
  referralIdentifier,
}) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        fullWidth
        variant='outlined'
        color='secondary'
        onClick={() => setOpen((prev) => !prev)}
      >
        LINK Consumer Summary Report
      </Button>
      <ConsumerSummaryReportDialog
        referralIdentifier={referralIdentifier}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
};

export default ConsumerSummaryReportButton;
