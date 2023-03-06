import ReceiptIcon from '@mui/icons-material/Receipt';
import { Stack, Typography } from '@mui/material';

import TabIndicator from './TabIndicator';
import { TabDefinition } from './util';

import { FormRole } from '@/types/gqlTypes';

const TabLabel = ({
  definition: { clientName, isHoh, status },
  role,
}: {
  definition: TabDefinition;
  role: FormRole.Intake | FormRole.Exit;
}) => {
  return (
    <Stack gap={1}>
      <Typography variant='inherit'>
        {isHoh ? `(HoH) ${clientName}` : clientName}
      </Typography>
      <TabIndicator status={status} role={role} />
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
