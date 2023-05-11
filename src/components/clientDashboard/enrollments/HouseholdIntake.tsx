import { Typography } from '@mui/material';

import { useClientDashboardContext } from '@/components/pages/ClientDashboard';
import NotFound from '@/components/pages/NotFound';
import HouseholdAssessments from '@/modules/assessments/components/household/HouseholdAssessments';

const HouseholdIntake = () => {
  const { enrollment } = useClientDashboardContext();
  if (!enrollment) return <NotFound />;

  return (
    <HouseholdAssessments
      type='ENTRY'
      enrollment={enrollment}
      title={
        <Typography variant='body1' fontWeight={600}>
          Household Intake
        </Typography>
      }
    />
  );
};
export default HouseholdIntake;
