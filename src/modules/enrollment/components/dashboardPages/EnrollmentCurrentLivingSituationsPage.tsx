import { Box } from '@mui/system';

import TitleCard from '@/components/elements/TitleCard';
import { useEnrollmentDashboardContext } from '@/components/pages/EnrollmentDashboard';
import NotFound from '@/components/pages/NotFound';

const EnrollmentCurrentLivingSituationsPage = () => {
  const { enrollment } = useEnrollmentDashboardContext();
  const enrollmentId = enrollment?.id;
  const clientId = enrollment?.client.id;

  if (!enrollment || !enrollmentId || !clientId) return <NotFound />;

  return (
    <TitleCard title='Current Living Situations' headerVariant='border'>
      <Box p={3}>None</Box>
    </TitleCard>
  );
};

export default EnrollmentCurrentLivingSituationsPage;
