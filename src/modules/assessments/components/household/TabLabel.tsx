import { Stack, Typography } from '@mui/material';

import { AssessmentStatus } from './HouseholdAssessments';
import TabIndicator from './TabIndicator';

const TabLabel = ({
  name,
  isHoh,
  assessmentId,
  assessmentInProgress,
}: {
  name: string;
  isHoh: boolean;
  assessmentId?: string;
  assessmentInProgress?: boolean;
}) => {
  let status: AssessmentStatus = 'not-started';
  if (assessmentId && !assessmentInProgress) {
    status = 'submitted';
  } else if (assessmentId) {
    status = 'started';
  }
  return (
    <Stack gap={1}>
      <Typography variant='inherit'>
        {isHoh ? `(HoH) ${name}` : name}
      </Typography>
      <TabIndicator status={status} />
    </Stack>
  );
};

export default TabLabel;
