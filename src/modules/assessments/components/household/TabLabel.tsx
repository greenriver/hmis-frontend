import ReceiptIcon from '@mui/icons-material/Receipt';
import { Stack, Typography } from '@mui/material';

import TabIndicator from './TabIndicator';
import { HouseholdAssesmentRole, TabDefinition } from './util';

import { AssessmentRole } from '@/types/gqlTypes';

const TabLabel = ({
  definition: { clientName, isHoh, status },
  role,
}: {
  definition: TabDefinition;
  role: HouseholdAssesmentRole;
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
export const SummaryTabLabel = ({ role }: { role: HouseholdAssesmentRole }) => (
  <Stack gap={0.8} direction='row'>
    <ReceiptIcon fontSize='small' />
    <Typography variant='inherit'>
      {role === AssessmentRole.Intake
        ? 'Complete Intake'
        : role === AssessmentRole.Exit
        ? 'Complete Exit'
        : role === AssessmentRole.Annual
        ? 'Complete Annual'
        : 'Submit Assessments'}
    </Typography>
  </Stack>
);

export default TabLabel;
