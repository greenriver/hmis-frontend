import { Box } from '@mui/material';
import TitleCard from '@/components/elements/TitleCard';
import NotFound from '@/components/pages/NotFound';
import useEnrollmentDashboardContext from '@/modules/enrollment/hooks/useEnrollmentDashboardContext';
import EnrollmentLocationMap from '@/modules/geolocation/components/EnrollmentLocationMap';
import { clientBriefName } from '@/modules/hmis/hmisUtil';

const EnrollmentLocationMapPage = () => {
  const { enrollment } = useEnrollmentDashboardContext();

  if (!enrollment) return <NotFound />;

  return (
    <TitleCard title='Location Map' headerVariant='border'>
      <Box sx={{ p: 2 }}>
        <EnrollmentLocationMap
          enrollmentId={enrollment.id}
          clientName={clientBriefName(enrollment.client)}
        />
      </Box>
    </TitleCard>
  );
};

export default EnrollmentLocationMapPage;
