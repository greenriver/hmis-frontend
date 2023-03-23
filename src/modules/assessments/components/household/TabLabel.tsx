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
    <Stack gap={1} direction='row' display='flex' alignItems='center'>
      <TabIndicator status={status} role={role} />
      <Typography variant='inherit'>
        {isHoh ? `(HoH) ${clientName}` : clientName}
      </Typography>
    </Stack>
  );
};
// add back household button even when all entered
export const SummaryTabLabel = ({
  role,
}: {
  role: FormRole.Intake | FormRole.Exit;
}) => (
  <Stack gap={0.8} direction='row'>
    <ReceiptIcon fontSize='small' />
    <Typography variant='inherit'>
      {role === FormRole.Intake
        ? 'Complete Entry'
        : role === FormRole.Exit
        ? 'Complete Exit'
        : 'Submit Assessments'}
    </Typography>
  </Stack>
);

export default TabLabel;
