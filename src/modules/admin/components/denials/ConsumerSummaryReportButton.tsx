import { Button } from '@mui/material';
import { useState } from 'react';

import ConsumerSummaryReportDialog from './ConsumerSummaryReportDialog';

interface Props {
  clientId: string;
}

const ConsumerSummaryReportButton: React.FC<Props> = ({ clientId }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        fullWidth
        variant='outlined'
        color='secondary'
        onClick={() => setOpen((prev) => !prev)}
      >
        Consumer Summary Report
      </Button>
      <ConsumerSummaryReportDialog
        clientId={clientId}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
};

export default ConsumerSummaryReportButton;
