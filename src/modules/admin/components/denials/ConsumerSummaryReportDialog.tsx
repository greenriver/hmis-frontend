import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {
  Button,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';

import CommonDialog from '@/components/elements/CommonDialog';
import DatePicker from '@/components/elements/input/DatePicker';
import { fetchConsumerSummaryReportUrl } from '@/modules/projects/api';

export interface ConsumerSummaryReportDialogProps extends DialogProps {
  clientId: string;
}

const ConsumerSummaryReportDialog: React.FC<
  ConsumerSummaryReportDialogProps
> = ({ clientId, ...props }) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  return (
    <CommonDialog {...props}>
      <DialogTitle>Consumer Summary Report&emsp;</DialogTitle>
      <DialogContent>
        <Stack gap={2} mt={2}>
          <Typography>
            Select date range{' '}
            <Typography
              color='textSecondary'
              variant='inherit'
              component='span'
            >
              (optional)
            </Typography>
          </Typography>
          <DatePicker
            label='Start Date'
            value={startDate}
            onChange={setStartDate}
          />
          <DatePicker label='End Date' value={endDate} onChange={setEndDate} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          fullWidth
          variant='outlined'
          color='secondary'
          target='_blank'
          href={fetchConsumerSummaryReportUrl({
            clientId,
            startDate,
            endDate,
          })}
          onClick={(e) => props.onClose && props.onClose(e, 'escapeKeyDown')}
          endIcon={<OpenInNewIcon />}
        >
          View Consumer Summary Report
        </Button>
      </DialogActions>
    </CommonDialog>
  );
};

export default ConsumerSummaryReportDialog;
