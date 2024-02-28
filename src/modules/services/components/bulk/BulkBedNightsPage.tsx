import React from 'react';
import BulkServicesPage from './BulkServicesPage';
import { ClientLookupMode } from './ClientLookupForServiceToggle';
import NotFound from '@/components/pages/NotFound';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import { RecordType } from '@/types/gqlTypes';

interface Props {
  lookupMode?: ClientLookupMode;
}
const BulkBedNightsPage: React.FC<Props> = (props) => {
  const { project } = useProjectDashboardContext();
  const bedNightServiceType = project.serviceTypes.find(
    (s) => s.hudRecordType === RecordType.BedNight
  );

  if (!bedNightServiceType) return <NotFound />;

  return (
    <BulkServicesPage
      serviceTypeId={bedNightServiceType.id}
      serviceTypeName='Bed Night'
      title='Bed Nights'
      {...props}
    />
  );
};

export default BulkBedNightsPage;
