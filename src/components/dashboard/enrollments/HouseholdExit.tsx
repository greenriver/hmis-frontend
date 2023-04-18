import { Typography } from '@mui/material';
import { useOutletContext } from 'react-router-dom';

import { DashboardContext } from '@/components/pages/ClientDashboard';
import NotFound from '@/components/pages/NotFound';
import HouseholdAssessments from '@/modules/assessments/components/household/HouseholdAssessments';

const HouseholdExit = () => {
  const { enrollment } = useOutletContext<DashboardContext>();
  if (!enrollment) return <NotFound />;

  return (
    <HouseholdAssessments
      type='EXIT'
      enrollment={enrollment}
      title={
        <Typography variant='body1' fontWeight={600}>
          Household Exit
        </Typography>
      }
    />
  );
};
export default HouseholdExit;
