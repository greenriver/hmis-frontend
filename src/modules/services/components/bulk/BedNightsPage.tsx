import BulkServicesPage from './BulkServicesPage';
import NotFound from '@/components/pages/NotFound';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import { RecordType } from '@/types/gqlTypes';

// Renders BulkServicePage for BedNight service type
const BedNightsPage = () => {
  const { project } = useProjectDashboardContext();

  const bedNightServiceType = project.serviceTypes.find(
    (s) => s.hudRecordType === RecordType.BedNight
  );

  // project does not support bed nights
  if (!bedNightServiceType) return <NotFound />;

  return (
    <BulkServicesPage
      serviceTypeId={bedNightServiceType.id}
      serviceTypeName='Bed Night'
      title='Bed Nights'
    />
  );
};

export default BedNightsPage;
