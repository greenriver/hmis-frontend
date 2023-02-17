import ReceiptIcon from '@mui/icons-material/Receipt';
import { Stack, Typography } from '@mui/material';

import TabIndicator from './TabIndicator';
import { TabDefinition } from './util';

const TabLabel = ({
  definition: { clientName, isHoh, status },
}: {
  definition: TabDefinition;
}) => {
  return (
    <Stack gap={1}>
      <Typography variant='inherit'>
        {isHoh ? `(HoH) ${clientName}` : clientName}
      </Typography>
      <TabIndicator status={status} />
    </Stack>
  );
};

export const SummaryTabLabel = () => (
  <Stack gap={0.8} direction='row'>
    <ReceiptIcon fontSize='small' />
    <Typography variant='inherit'>Summary</Typography>
  </Stack>
);

export default TabLabel;
