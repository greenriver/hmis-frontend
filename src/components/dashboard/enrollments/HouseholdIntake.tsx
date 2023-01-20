import { Typography } from '@mui/material';
import { useOutletContext } from 'react-router-dom';

import { DashboardContext } from '@/components/pages/ClientDashboard';
import HouseholdAssessments from '@/modules/assessments/components/HouseholdAssessments';

const HouseholdIntake = () => {
  const { enrollment } = useOutletContext<DashboardContext>();

  if (!enrollment) throw Error('Enrollment missing');

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
