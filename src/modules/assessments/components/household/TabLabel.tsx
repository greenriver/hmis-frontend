import CompleteIcon from '@mui/icons-material/Send';
import { Stack, Typography } from '@mui/material';

import AssessmentStatusIndicator from '../AssessmentStatusIndicator';
import { HouseholdAssesmentRole, TabDefinition } from './util';

import HohIndicator from '@/modules/hmis/components/HohIndicator';
import { AssessmentRole } from '@/types/gqlTypes';

interface Props {
  definition: TabDefinition;
}
const TabLabel: React.FC<Props> = ({
  definition: { clientName, status, relationshipToHoH },
}) => {
  return (
    <Stack
      gap={0.5}
      sx={({ palette, typography }) => ({
        display: 'flex',
        alignItems: 'center',
        '.Mui-selected &': {
          color: palette.text.primary,
          fontWeight: typography.fontWeightBold,
        },
      })}
    >
      <Typography component='div'>
        <HohIndicator
          relationshipToHoh={relationshipToHoH}
          sx={{ display: 'inline', pr: 0.5 }}
        />
        {clientName}
      </Typography>
      <AssessmentStatusIndicator status={status} size='small' />
    </Stack>
  );
};
// add back household button even when all entered
export const SummaryTabLabel = ({ role }: { role: HouseholdAssesmentRole }) => (
  <Stack gap={0.8} direction='row'>
    <CompleteIcon fontSize='small' />
    <Typography color='inherit' variant='body3'>
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
