import { Stack, Typography } from '@mui/material';

import { TabDefinition } from './HouseholdAssessments';
import TabIndicator from './TabIndicator';

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

export default TabLabel;
